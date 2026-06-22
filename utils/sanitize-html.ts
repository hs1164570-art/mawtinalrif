/**
 * lib/sanitize-html.ts
 * ─────────────────────────────────────────────────────────────────────────
 * طبقة تطهير موحّدة (Isomorphic) لمحتوى الـ Rich Text الخاص بوصف المنتج.
 *
 * ⚠️ بعد المشكلة اللي حصلت مع isomorphic-dompurify (jsdom → html-encoding-sniffer
 * → @exodus/bytes ESM-only crash)، تم الاستبدال بمكتبة "sanitize-html" اللي
 * مش معتمدة على jsdom أو أي DOM حقيقي — بتشتغل بـ parser خفيف (htmlparser2)
 * وشغالة بنفس الشكل في المتصفح والسيرفر بدون أي اختلاف بيئة.
 *
 * نفس الملف يعمل في:
 *  1) الـ Client Component (RichTextEditor) قبل إرسال البيانات للسيرفر.
 *  2) الـ Zod Schema على السيرفر (utils/productSchema.ts) كطبقة دفاع ثانية.
 *  3) صفحة عرض المنتج (ProductInfo) وقت الـ render — طبقة دفاع ثالثة.
 *ص
 * ⚠️ ملحوظة: مفيش دعم للجداول (<table>) أو الصور (<img>) — مستثناة عمدًا.
 * ─────────────────────────────────────────────────────────────────────────
 */

import sanitizeHtmlLib, { type IOptions } from "sanitize-html";

// ─── 1) الوسوم المسموح بها فقط ────────────────────────────────────────────
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

// ─── 2) قائمة بيضاء صارمة لخصائص الـ inline style ────────────────────────
const COLOR_VALUE =
  /^#[0-9a-fA-F]{3,8}$|^rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)$|^rgba\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*(0|1|0?\.\d+)\s*\)$/;

const ALLOWED_STYLE_PROPS: Record<string, RegExp> = {
  color: COLOR_VALUE,
  "background-color": COLOR_VALUE,
  "font-size":
    /^(\d{1,3}(\.\d+)?(px|em|rem|pt)|clamp\(\s*\d{1,3}(\.\d+)?(px|vw|vh|em|rem|%)\s*,\s*\d{1,3}(\.\d+)?(px|vw|vh|em|rem|%)\s*,\s*\d{1,3}(\.\d+)?(px|vw|vh|em|rem|%)\s*\))$/,
  "font-family": /^[a-zA-Z0-9\u0600-\u06FF\s,'"-]{1,120}$/,
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

// ─── 3) خيارات sanitize-html المشتركة ─────────────────────────────────────
const baseOptions: IOptions = {
  allowedTags: ALLOWED_TAGS,
  allowedAttributes: {
    "*": ["style", "dir"],
    a: ["href", "target", "rel"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  allowProtocolRelative: false,
  transformTags: {
    // أي رابط <a> لازم يفتح في تاب جديد وبدون noopener/referrer leakage
    a: (tagName, attribs) => ({
      tagName: "a",
      attribs: {
        ...attribs,
        target: "_blank",
        rel: "noopener noreferrer nofollow ugc",
      },
    }),
  },
};

/**
 * تطهير كود HTML الناتج من محرر Tiptap قبل تخزينه أو عرضه.
 * استخدمها في:
 *  - الـ Client قبل ما تبعت البيانات (onChange/onSubmit)
 *  - الـ Zod transform على السيرفر (دفاع مستقل ثاني)
 *  - صفحة العرض العامة قبل dangerouslySetInnerHTML (دفاع ثالث)
 */
export function sanitizeDescriptionHtml(
  dirty: string | null | undefined,
): string {
  if (!dirty || typeof dirty !== "string") return "";

  const clean = sanitizeHtmlLib(dirty, baseOptions);

  // فلترة الـ style بالقائمة البيضاء اليدوية بعد التطهير الأساسي
  const styleFiltered = clean.replace(
    /style="([^"]*)"/g,
    (_match, styleValue: string) => {
      const cleanedStyle = sanitizeStyleAttribute(styleValue);
      return cleanedStyle ? `style="${cleanedStyle}"` : "";
    },
  );

  return styleFiltered.trim();
}

/**
 * تحويل HTML لنص عادي (بدون أي وسوم) — مفيد لـ:
 *  - حساب الطول الحقيقي للنص المعروض
 *  - تمرير نص نظيف لـ Web Share API / meta description / ShareButton
 */
export function stripHtmlToPlainText(html: string | null | undefined): string {
  if (!html || typeof html !== "string") return "";
  const textOnly = sanitizeHtmlLib(html, {
    allowedTags: [],
    allowedAttributes: {},
  });
  return textOnly.replace(/\s+/g, " ").trim();
}

/** حد أقصى منطقي لطول HTML المخزّن — يطابق الحد في productSchema */
export const DESCRIPTION_MAX_LENGTH = 50_000;
