/**
 * lib/sanitize-html.ts
 * ─────────────────────────────────────────────────────────────────────────
 * طبقة تطهير موحّدة (Isomorphic) لمحتوى الـ Rich Text الخاص بوصف المنتج.
 *
 * نفس الملف يعمل في:
 *  1) الـ Client Component (RichTextEditor) قبل إرسال البيانات للسيرفر.
 *  2) الـ Zod Schema على السيرفر (utils/productSchema.ts) كطبقة دفاع ثانية
 *     مستقلة تمامًا عن الفرونت إند.
 *  3) صفحة عرض المنتج (ProductInfo) وقت الـ render — طبقة دفاع ثالثة،
 *     حتى لو البيانات المخزّنة قديمة أو جت من مصدر تاني.
 *
 * "isomorphic-dompurify" يكتشف البيئة تلقائيًا: يستخدم DOM الحقيقي في
 * المتصفح، ويستخدم jsdom تحت الغطاء في بيئة Node (السيرفر).
 *
 * ⚠️ ملحوظة: مفيش دعم للجداول (<table>) أو الصور (<img>) — تم استثناؤهم
 * عمدًا من الـ allow-list لأنهم مش features مفعّلة في المحرر، وتقليل
 * الـ allow-list بيقلل مساحة الخطر (attack surface) بدون أي سبب لتوسيعها.
 * ─────────────────────────────────────────────────────────────────────────
 */

import DOMPurify from "isomorphic-dompurify";

// ─── 1) الوسوم والخصائص المسموح بها فقط ──────────────────────────────────
// أي وسم/خاصية غير موجودة هنا تُحذف تلقائيًا من DOMPurify.
const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "strike",
  "span",
  "mark",
  "sub",
  "sup",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "ul",
  "ol",
  "li",
  "blockquote",
  "pre",
  "code",
  "hr",
  "a",
];

const ALLOWED_ATTR = ["style", "href", "target", "rel", "dir"];

// ─── 2) قائمة بيضاء صارمة لخصائص الـ inline style ────────────────────────
// بدل ما نسيب DOMPurify يحاول يفهم الـ CSS (غير مضمون 100% تحت jsdom)،
// بنعمل فلترة يدوية لكل خاصية وقيمتها بـ Regex محدد — ده اللي بيمنع حاجات
// زي: style="background:url(javascript:alert(1))" أو behavior:url(...).
const COLOR_VALUE =
  /^#[0-9a-fA-F]{3,8}$|^rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)$|^rgba\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*(0|1|0?\.\d+)\s*\)$/;

const ALLOWED_STYLE_PROPS: Record<string, RegExp> = {
  color: COLOR_VALUE,
  "background-color": COLOR_VALUE,
  // يسمح بقيمة ثابتة (20px) أو بصيغة clamp() متجاوبة (للموبايل/الديسكتوب) —
  // كل رقم جوه clamp() لازم يكون رقم + وحدة معروفة بس، مفيش أي حرف زيادة مسموح.
  "font-size":
    /^(\d{1,3}(\.\d+)?(px|em|rem|pt)|clamp\(\s*\d{1,3}(\.\d+)?(px|vw|vh|em|rem|%)\s*,\s*\d{1,3}(\.\d+)?(px|vw|vh|em|rem|%)\s*,\s*\d{1,3}(\.\d+)?(px|vw|vh|em|rem|%)\s*\))$/,
  "font-family": /^[a-zA-Z0-9\u0600-\u06FF\s,'"-]{1,120}$/, // يدعم أسماء خطوط عربية كمان
  "font-weight": /^(normal|bold|[1-9]00)$/,
  "font-style": /^(normal|italic)$/,
  "text-decoration": /^(none|underline|line-through|underline line-through)$/,
  "text-align": /^(left|right|center|justify)$/,
  "line-height": /^\d{1,2}(\.\d+)?$/,
};

const DANGEROUS_VALUE = /url\(|expression\(|javascript:|@import|behavior:/i;

function sanitizeStyleAttribute(styleStr: string): string {
  return styleStr
    .split(";")
    .map((rule) => rule.trim())
    .filter(Boolean)
    .reduce<string[]>((safeRules, rule) => {
      const sepIndex = rule.indexOf(":");
      if (sepIndex === -1) return safeRules;

      const prop = rule.slice(0, sepIndex).trim().toLowerCase();
      const value = rule.slice(sepIndex + 1).trim();
      const pattern = ALLOWED_STYLE_PROPS[prop];

      if (pattern && pattern.test(value) && !DANGEROUS_VALUE.test(value)) {
        safeRules.push(`${prop}: ${value}`);
      }
      return safeRules;
    }, [])
    .join("; ");
}

// ─── 3) تسجيل الـ Hooks مرة واحدة فقط لكل عملية (process) ────────────────
let hooksRegistered = false;

function registerSanitizerHooks() {
  if (hooksRegistered) return;

  DOMPurify.addHook("afterSanitizeAttributes", (node) => {
    const el = node as unknown as Element;

    // تنظيف خاصية style حسب القائمة البيضاء أعلاه
    if (el.hasAttribute?.("style")) {
      const cleanedStyle = sanitizeStyleAttribute(el.getAttribute("style") || "");
      if (cleanedStyle) {
        el.setAttribute("style", cleanedStyle);
      } else {
        el.removeAttribute("style");
      }
    }

    // أي رابط <a> لازم يفتح في تاب جديد وبدون noopener/referrer leakage
    if (el.tagName === "A") {
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener noreferrer nofollow ugc");
    }
  });

  hooksRegistered = true;
}

/**
 * تطهير كود HTML الناتج من محرر Tiptap قبل تخزينه أو عرضه.
 * استخدمها في:
 *  - الـ Client قبل ما تبعت البيانات (onChange/onSubmit)
 *  - الـ Zod transform على السيرفر (دفاع مستقل ثاني)
 *  - صفحة العرض العامة قبل dangerouslySetInnerHTML (دفاع ثالث)
 */
export function sanitizeDescriptionHtml(dirty: string | null | undefined): string {
  if (!dirty || typeof dirty !== "string") return "";

  registerSanitizerHooks();

  const clean = DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    // يمنع أي بروتوكول غريب في href (يسمح فقط بـ http/https/mailto)
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i,
  });

  return typeof clean === "string" ? clean.trim() : String(clean).trim();
}

/**
 * تحويل HTML لنص عادي (بدون أي وسوم) — مفيد لـ:
 *  - حساب الطول الحقيقي للنص المعروض (عشان تقرر "عرض المزيد" صح)
 *  - تمرير نص نظيف لـ Web Share API / meta description / ShareButton
 */
export function stripHtmlToPlainText(html: string | null | undefined): string {
  if (!html || typeof html !== "string") return "";
  const textOnly = DOMPurify.sanitize(html, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
  return textOnly.replace(/\s+/g, " ").trim();
}

/** حد أقصى منطقي لطول HTML المخزّن — يطابق الحد في productSchema */
export const DESCRIPTION_MAX_LENGTH = 50_000;
