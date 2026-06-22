"use client";

/**
 * components/admin/products/editor/RichTextEditor.tsx
 * ─────────────────────────────────────────────────────────────────────────
 * محرر نصوص غني (Rich Text) لحقل "وصف المنتج"، مبني على Tiptap.
 * يصدّر دايمًا HTML نقي بخصائص style مضمّنة (inline) — مفيش أي كلاس
 * Tailwind بيتولّد داخل الناتج، علشان ميحصلش مشكلة Purging في الـ
 * production build، وعلشان الـ CSP بتاع الموقع (`style-src 'self'
 * 'unsafe-inline'`) يقدر يتعامل معاه بأمان.
 *
 * كل خروجة من المحرر بتعدّي على sanitizeDescriptionHtml قبل ما توصل
 * للفورم — وده غير الطبقة التانية المستقلة اللي موجودة في الـ Zod schema
 * على السيرفر (دفاع من طبقتين Defense-in-Depth ضد Stored XSS).
 *
 * ملحوظة: لا جداول ولا صور هنا عمدًا (مش مطلوبين).
 *
 * ملحوظة تانية: الـ Bubble Menu (القائمة اللي تظهر عند تحديد نص) مبنية
 * يدويًا هنا، من غير استيراد BubbleMenu من @tiptap/react — لتجنّب مشاكل
 * الاستيراد. الفكرة: نتابع onSelectionUpdate، ولو فيه تحديد حقيقي نحسب
 * مكانه على الشاشة بـ editor.view.coordsAtPos() ونعرض div ثابت فوقه.
 *
 * ملحوظة تالتة (تحديث الباليتة): كل الألوان بقت بتتسحب من CSS variables
 * الموجودة في globals.css (الباليتة الرمادية المحايدة + السيان/الأحمر)
 * بدل القيم الذهبية الثابتة القديمة، عشان يفضل المحرر متسق مع باقي الموقع
 * أوتوماتيك لو الباليتة اتغيرت تاني.
 *
 * ملحوظة رابعة (Responsive): كل الـ popovers (اللون / التظليل / الرابط /
 * الخط / الحجم / نوع الفقرة) بقت بتتفتح بـ position: fixed محسوبة من
 * مكان الزرار (trigger) نفسه على الشاشة — مش نسبة لأبوها المباشر جوه
 * التولبار زي الأول. usePopoverPosition بقت بتعمل clamp أفقي *ورأسي*
 * مع بعض: لو مفيش مساحة كفاية تحت الزرار (موبايل / كيبورد فاتح) بتفتح
 * فوقه تلقائيًا بدل ما تتقطع من تحت. ده بالظبط اللي كان ناقص قبل كده
 * وعامل مشكلة popover الرابط: كان بيتصحح أفقيًا بس، مش رأسيًا، فلو
 * الزرار طلع في صف متاخر بعد الـ wrap، البوبوفر (اللي طوله أكبر شوية
 * بسبب الـ input + الأزرار) كان بيتقطع من تحت الشاشة.
 *
 * ملحوظة خامسة: لون النص المخصص بقى شغال بـ react-colorful
 * (HexColorPicker + HexColorInput — المكتبة كانت موجودة في الباكدج
 * بالفعل من غير ما تتستخدم) بدل input[type=color] الأصلي، عشان شكله
 * يبقى متسق على كل المتصفحات والموبايل (input[type=color] الأصلي كان
 * بيفتح UI نظام التشغيل نفسه، شكله مختلف من جهاز لجهاز ومش قابل
 * للتصميم/الريسبونسف فعليًا). اللون بيتطبّق Live على التحديد لحظيًا
 * أثناء السحب على الـ picker أو الكتابة في خانة الـ hex، زي بالظبط ما
 * كان قبل كده بس بشكل أنضف.
 *
 * ملحوظة سادسة: زرار "قائمة مهام" كان موجود في التولبار من غير ما يبقى
 * فيه TaskList / TaskItem متسجلين فعليًا في extensions الـ useEditor —
 * يعني الزرار كان موجود بصريًا بس مش بيعمل حاجة فعليًا (toggleTaskList
 * مش موجود أصلًا من غير الـ extension). اتضافوا دلوقتي من
 * @tiptap/extension-list، وهو الباكدج الموحّد الجديد في Tiptap v3 اللي
 * بيجمع TaskList/TaskItem (والباكدجات القديمة المنفصلة بقت deprecated
 * لصالحه).
 *
 * ملحوظة سابعة (إصلاح نطّة البوبوفر أثناء السحب على عجلة الألوان):
 * applyColor الأصلية كانت بتعمل editor.chain().focus().setColor(hex).run()
 * في كل استدعاء — ومُشكلة .focus() إنها كانت بتتنادى بشكل متلاحق ومستمر
 * مع كل حركة سحب على HexColorPicker وكل حرف يتكتب في HexColorInput،
 * فكانت بترجّع الفوكس للـ contenteditable نفسه في كل مرة (وعلى الموبايل
 * بتفتح الكيبورد / تعمل scrollIntoView)، فالـ viewport كان بيتغيّر
 * تحت رجلين البوبوفر المحسوب بـ position: fixed، فيظهر وكأنه "بينزل
 * تحت" لوحده أثناء السحب. الحل: applyColorLive (تحت) بتطبّق اللون من
 * غير ما تنادي .focus() خالص — تطبيق اللون لحظي زي الأول بالظبط لأن
 * الـ selection بتاع Tiptap محفوظ جوّه حتى من غير DOM focus فعلي، لكن
 * من غير أي إزعاج بصري للبوبوفر. applyColor الأصلية (بالـ focus) فضلت
 * مستخدمة بس في السواتش الجاهزة، لأن دي بتقفل البوبوفر على طول بعد
 * الاختيار فمفيش فرصة لمشكلة النطّة أصلًا.
 *
 * ملحوظة ثامنة (السبب الجذري الحقيقي وراء "كل زرار بيرمي الكيرسور آخر
 * سطر حتى لو في تحديد" — مش مشكلة زرار بعينه، مشكلة في المعمارية):
 * المكوّن ده "Controlled" — كل تعديل (onUpdate) بينادي onChange اللي
 * بيحدّث الـ value في الفورم بتاع الأب، والـ value ده بيرجع تاني
 * كـ prop للمكوّن. الـ useEffect اللي بيزامن value مع المحرر كان بيقارن
 * value (اللي طالع من sanitizeDescriptionHtml) بـ editor.getHTML()
 * (الـ HTML الخام *قبل* التطهير) — والاتنين دول عمليًا مش هيتطابقوا
 * حرفيًا أبدًا، لأن sanitizeDescriptionHtml بتغيّر شكل الـ HTML شوية
 * (ترتيب الخصائص، تطبيع المسافات/الـ whitespace، إلخ)، حتى لو المحتوى
 * الفعلي زي بعضه تمامًا. يعني الشرط `value !== current` كان True في كل
 * مرة، فكان بينفّذ `editor.commands.setContent(...)` بعد *كل* ضغطة زرار
 * في التولبار (بولد، مائل، محاذاة، قائمة، أي حاجة) — وSetContent
 * بيستبدل المستند بالكامل ويصفّر التحديد، فالكيرسور كان بيترمي آخر
 * المستند تلقائيًا في كل مرة، حتى لو كان فيه تحديد نص في النص قبلها.
 * الحل: ref اسمه isInternalUpdate بيتعلّم True جوه onUpdate قبل ما ننادي
 * onChange، والـ useEffect بيشوفه فيتجاهل المزامنة دي ويرجّعه False —
 * يعني setContent بقى بيتنفذ بس لما value تتغيّر فعليًا من *برّا* المحرر
 * (مثلاً فتح منتج تاني للتعديل، أو إعادة ضبط الفورم)، مش بعد كل تعديل
 * داخلي. ده اللي كان بيسبب برضه نطّة popover اللون اللي اتصلحت قبل كده
 * بشكل أعمق: كل سحب على عجلة الألوان كان بيعمل setContent ضمنيًا وده
 * كان بيعمل reflow بسيط في الصفحة بيزحزح مكان الزرار عن مكان البوبوفر
 * المحسوب مسبقًا.
 * ─────────────────────────────────────────────────────────────────────────
 */

import {
  forwardRef,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import FontFamily from "@tiptap/extension-font-family";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import Typography from "@tiptap/extension-typography";
import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight";
// TaskList / TaskItem: الباكدج الموحّد الجديد بتاع Tiptap v3 (راجع
// ملحوظة سادسة فوق) — كانوا ناقصين خالص وده اللي كان مكسّر زرار
// "قائمة مهام" في التولبار.
import { TaskList, TaskItem } from "@tiptap/extension-list";
import { createLowlight, common } from "lowlight";
import { HexColorPicker, HexColorInput } from "react-colorful";
import {
  Bold,
  Italic,
  UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  Pilcrow,
  List,
  ListOrdered,
  ListTodo,
  Quote,
  Code2,
  Minus,
  Link2,
  Unlink,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Undo2,
  Redo2,
  Palette,
  Highlighter,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Eraser,
  ChevronDown,
  Check,
} from "lucide-react";
import { FontSize } from "./font-size-extension";
import styles from "./RichTextEditor.module.css";
import {
  DESCRIPTION_MAX_LENGTH,
  sanitizeDescriptionHtml,
} from "@/utils/sanitize-html";

const lowlight = createLowlight(common);

// ─── الباليتات (متسقة مع متغيرات التصميم: رمادي محايد + سيان/أحمر) ───────
// كل لون هنا له اسم عربي واضح بيتعرض كـ title على الزرار (مطلوب منك).
const TEXT_COLORS = [
  { hex: "#1a1a1a", name: "أسود" },
  { hex: "#495057", name: "رمادي داكن" },
  { hex: "#868e96", name: "رمادي" },
  { hex: "#408fb4", name: "سيان" },
  { hex: "#2c9bca", name: "سيان فاتح" },
  { hex: "#e03131", name: "أحمر" },
  { hex: "#2563EB", name: "أزرق" },
  { hex: "#7C3AED", name: "بنفسجي" },
  { hex: "#2f9e44", name: "أخضر" },
  { hex: "#ffffff", name: "أبيض" },
];

const HIGHLIGHT_COLORS = [
  { hex: "#FDE68A", name: "أصفر" },
  { hex: "#BFDBFE", name: "أزرق فاتح" },
  { hex: "#BBF7D0", name: "أخضر فاتح" },
  { hex: "#FBCFE8", name: "وردي" },
  { hex: "rgba(64,143,180,0.18)", name: "سيان فاتح" },
  { hex: "rgba(224,49,49,0.16)", name: "أحمر فاتح" },
];

const FONT_FAMILIES = [
  { label: "افتراضي", value: "" },
  { label: "Cairo", value: "Cairo, sans-serif" },
  { label: "Tajawal", value: "Tajawal, sans-serif" },
  { label: "Almarai", value: "Almarai, sans-serif" },
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Tahoma", value: "Tahoma, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Courier New", value: "'Courier New', monospace" },
];

// كل حجم هنا clamp(الحد الأدنى, نسبة من عرض الشاشة, الحد الأقصى) — بيصغر تلقائيًا
// على شاشات الموبايل ويكبر على الديسكتوب، من غير أي media queries يدوية.
const FONT_SIZES = [
  { label: "صغير", value: "clamp(12px, 1.5vw, 14px)" },
  { label: "عادي", value: "clamp(14px, 1.8vw, 16px)" },
  { label: "متوسط", value: "clamp(16px, 2.2vw, 18px)" },
  { label: "كبير", value: "clamp(18px, 2.6vw, 22px)" },
  { label: "كبير جدًا", value: "clamp(20px, 3.2vw, 26px)" },
  { label: "عنوان فرعي", value: "clamp(22px, 4vw, 30px)" },
  { label: "عنوان كبير", value: "clamp(26px, 5vw, 36px)" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────
function normalizeUrl(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (/^(https?:|mailto:)/i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function useClickOutside(
  ref: React.RefObject<HTMLElement | null>,
  onOutside: () => void,
) {
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onOutside();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, onOutside]);
}

/**
 * بيحسب مكان أي popover (قائمة منسدلة عائمة) بـ position: fixed نسبة
 * للشاشة كلها، بناءً على مكان الزرار (trigger) اللي فتحها فعليًا —
 * مش نسبة لأبوها المباشر جوه التولبار. بيعمل clamp أفقي (يمين/شمال)
 * *ورأسي* (فوق/تحت) مع بعض، فلو مفيش مساحة كفاية تحت الزرار بيفتحها
 * فوقه تلقائيًا بدل ما تتقطع من تحت الشاشة — ده اللي كان ناقص وعامل
 * مشكلة popover الرابط على الموبايل تحديدًا.
 */
function usePopoverPosition(
  triggerRef: RefObject<HTMLElement | null>,
  isOpen: boolean,
) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const HIDDEN_STYLE: React.CSSProperties = {
    position: "fixed",
    top: -9999,
    left: -9999,
    visibility: "hidden",
  };
  const [style, setStyle] = useState<React.CSSProperties>(HIDDEN_STYLE);

  useLayoutEffect(() => {
    if (!isOpen || !triggerRef.current || !popoverRef.current) {
      setStyle(HIDDEN_STYLE);
      return;
    }

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const popoverRect = popoverRef.current.getBoundingClientRect();
    const MARGIN = 8;
    const GAP = 6;

    // أفقيًا: نحاذي حافة البوبوفر اليمين مع حافة الزرار اليمين (مناسب
    // لتخطيط RTL)، ولو هيخرج برّه حدود الشاشة نزقّه لجوه بـ MARGIN
    let left = triggerRect.right - popoverRect.width;
    left = Math.min(
      Math.max(left, MARGIN),
      window.innerWidth - popoverRect.width - MARGIN,
    );

    // رأسيًا: افتراضيًا تحت الزرار، ولو مفيش مساحة كفاية تحت (موبايل،
    // كيبورد فاتح، الزرار في صف واطي بعد الـ wrap... إلخ) تفتح فوق
    // الزرار بدل ما تتقطع
    let top = triggerRect.bottom + GAP;
    const fitsBelow = top + popoverRect.height <= window.innerHeight - MARGIN;
    if (!fitsBelow) {
      const above = triggerRect.top - GAP - popoverRect.height;
      top =
        above >= MARGIN ? above : (
          Math.max(MARGIN, window.innerHeight - popoverRect.height - MARGIN)
        );
    }

    setStyle({
      position: "fixed",
      top,
      left,
      visibility: "visible",
      background: "aliceblue",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, triggerRef]);

  return { ref: popoverRef, style };
}

// ─── أزرار التولبار ───────────────────────────────────────────────────────
const ToolbarButton = forwardRef<
  HTMLButtonElement,
  {
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
    title: string;
    children: ReactNode;
  }
>(function ToolbarButton({ onClick, active, disabled, title, children }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      aria-pressed={active}
      className="w-[30px] h-[30px] shrink-0 rounded-[7px] flex items-center justify-center cursor-pointer transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
      style={{
        background: active ? "var(--cyan)" : "transparent",
        color: active ? "var(--text-inv)" : "var(--text-1)",
        border: "1.5px solid transparent",
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.background = "var(--bg)";
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.background = "transparent";
      }}
    >
      {children}
    </button>
  );
});

function ToolbarDivider() {
  return (
    <div
      className="w-[1.5px] h-[20px] mx-0.5 shrink-0 hidden sm:block"
      style={{ background: "var(--border-md)" }}
    />
  );
}

// ─── مكان عرض الـ Bubble Menu ────────────────────────────────────────────
interface BubblePosition {
  top: number;
  left: number;
}

// ─── المكوّن الرئيسي ──────────────────────────────────────────────────────
interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "اكتب وصفًا جذابًا للمنتج…",
  maxLength = DESCRIPTION_MAX_LENGTH,
  disabled = false,
}: RichTextEditorProps) {
  const [openPopover, setOpenPopover] = useState<
    "color" | "highlight" | "link" | "font" | "size" | "heading" | null
  >(null);
  const [linkUrl, setLinkUrl] = useState("");
  // لون مؤقت بيتغيّر لحظيًا مع تحريك picker الألوان (Live Preview)
  const [liveColor, setLiveColor] = useState<string | null>(null);

  // مكان قائمة التحديد العائمة (Bubble Menu) — null يعني مخفية حاليًا
  const [bubbleMenu, setBubbleMenu] = useState<BubblePosition | null>(null);

  const popoverRef = useRef<HTMLDivElement>(null);
  useClickOutside(popoverRef, () => setOpenPopover(null));

  // true لو آخر تغيير في value طالع من جوه المحرر نفسه (أي زرار في
  // التولبار، كتابة، إلخ) — راجع ملحوظة ثامنة فوق الملف. بنستخدمه عشان
  // نمنع useEffect المزامنة من عمل setContent بعد كل تعديل داخلي، لأن
  // setContent بيصفّر التحديد ويرمي الكيرسور آخر المستند.
  const isInternalUpdate = useRef(false);

  // ref لكل زرار (trigger) بيفتح popover — usePopoverPosition بتستخدمه
  // عشان تحسب مكان الـ popover نسبة للزرار نفسه على الشاشة (مش نسبة
  // لمكانه جوه التولبار)، وتعمل له clamp أفقي ورأسي عشان متخرجش برّه
  // حدود الشاشة (responsive fix)
  const colorTriggerRef = useRef<HTMLButtonElement>(null);
  const highlightTriggerRef = useRef<HTMLButtonElement>(null);
  const linkTriggerRef = useRef<HTMLButtonElement>(null);
  const headingTriggerRef = useRef<HTMLButtonElement>(null);
  const fontTriggerRef = useRef<HTMLButtonElement>(null);
  const sizeTriggerRef = useRef<HTMLButtonElement>(null);

  const colorPos = usePopoverPosition(colorTriggerRef, openPopover === "color");
  const highlightPos = usePopoverPosition(
    highlightTriggerRef,
    openPopover === "highlight",
  );
  const linkPos = usePopoverPosition(linkTriggerRef, openPopover === "link");
  const fontPos = usePopoverPosition(fontTriggerRef, openPopover === "font");
  const sizePos = usePopoverPosition(sizeTriggerRef, openPopover === "size");
  const headingPos = usePopoverPosition(
    headingTriggerRef,
    openPopover === "heading",
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
        codeBlock: false, // هنستخدم CodeBlockLowlight بدالها (تلوين الكود)
      }),
      // قائمة المهام (Checkbox list) — كانت ناقصة، راجع ملحوظة سادسة
      // فوق. nested:true يسمح بقوائم مهام متداخلة جوه بعض.
      TaskList,
      TaskItem.configure({ nested: true }),
      Underline,
      TextStyle,
      Color,
      FontFamily,
      FontSize,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Subscript,
      Superscript,
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          rel: "noopener noreferrer nofollow ugc",
          target: "_blank",
        },
      }),
      Placeholder.configure({ placeholder }),
      CharacterCount.configure({ limit: maxLength }),
      // بتحوّل تلقائيًا: علامات تنصيص "ذكية"، -- لشرطة طويلة –،
      // ... لعلامة حذف واحدة …، وهكذا. مفيدة جدًا لوصف منتج احترافي.
      Typography,
      // كتلة كود بتلوين Syntax (highlight.js classes)، مفيد لو حد
      // كتب SKU / كود مقاس بصيغة منسقة جوه الوصف.
      CodeBlockLowlight.configure({ lowlight }),
    ],
    content: value || "",
    editable: !disabled,
    onUpdate: ({ editor }) => {
      const rawHtml = editor.isEmpty ? "" : editor.getHTML();
      // نعلّم إن التغيير ده طالع من جوه المحرر نفسه قبل ما ننادي onChange،
      // عشان useEffect المزامنة تحت يتجاهل الـ round-trip ده ويسيب
      // التحديد الحالي زي ما هو (راجع ملحوظة ثامنة فوق الملف).
      isInternalUpdate.current = true;
      onChange(sanitizeDescriptionHtml(rawHtml));
    },
    // بديل يدوي لـ BubbleMenu: كل ما التحديد يتغيّر، نحسب هل فيه نص متحدد
    // فعليًا (selection.empty === false)، ولو كذلك نحسب مكانه بالظبط على
    // الشاشة من خلال coordsAtPos، ونحط القائمة فوقه بـ position: fixed.
    onSelectionUpdate: ({ editor }) => {
      const { state, view } = editor;
      const { selection } = state;

      if (selection.empty) {
        setBubbleMenu(null);
        return;
      }

      const start = view.coordsAtPos(selection.from);
      const end = view.coordsAtPos(selection.to);

      const top = Math.min(start.top, end.top);
      const centerLeft = (start.left + end.left) / 2;

      const BUBBLE_WIDTH = 150;
      const MARGIN = 8;
      const clampedLeft = Math.min(
        Math.max(centerLeft, BUBBLE_WIDTH / 2 + MARGIN),
        window.innerWidth - BUBBLE_WIDTH / 2 - MARGIN,
      );

      setBubbleMenu({ top: top - 52, left: clampedLeft });
    },
    // لما المحرر يفقد الفوكس فعليًا (مش بسبب الضغط على القائمة نفسها —
    // ده متحقق بفضل preventDefault على onMouseDown في القائمة تحت)، نخفيها.
    onBlur: () => setBubbleMenu(null),
    editorProps: {
      attributes: {
        dir: "rtl",
        class: styles.content,
        spellcheck: "true",
      },
    },
    immediatelyRender: false,
  });

  // مزامنة القيمة لما تتغيّر من برّا (مثلاً فتح المنتج للتعديل / إعادة الفورم)
  useEffect(() => {
    if (!editor) return;

    // لو التغيير ده جاي أصلًا من جوه المحرر (ضغطة أي زرار في التولبار،
    // كتابة...) — متعملش setContent تاني. إحنا أصلًا اللي بعتنا الـ HTML
    // ده لفوق في onUpdate، فمفيش داعي نرجّعه تاني للمحرر. كان ده بالظبط
    // سبب مشكلة "كل زرار بيرمي الكيرسور آخر سطر حتى لو في تحديد": كل
    // ضغطة (بولد/مائل/محاذاة/أي حاجة) كانت بتعمل onUpdate → onChange →
    // الفورم بيرجّع نفس الـ value تاني كـ prop → الـ effect ده كان
    // بيقارن value (الناتج من sanitizeDescriptionHtml) بـ
    // editor.getHTML() (الـ HTML الخام قبل التطهير) — والاتنين تقريبًا
    // محصلش يتطابقوا حرفيًا أبدًا لأن sanitizeDescriptionHtml بتغيّر شكل
    // الـ HTML شوية (ترتيب خصائص، تطبيع مسافات...)، فالشرط كان دايمًا
    // True وبيعمل setContent على طول → وده بيصفّر التحديد ويحط الكيرسور
    // آخر المستند تلقائيًا في كل مرة.
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }

    const current = editor.isEmpty ? "" : editor.getHTML();
    if ((value || "") !== current) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  if (!editor) return null;

  const charCount = editor.storage.characterCount.characters();
  const isNearLimit = maxLength ? charCount > maxLength * 0.9 : false;
  const currentColor = editor.getAttributes("textStyle").color || "#1a1a1a";

  /**
   * بيطبّق اللون فورًا على التحديد الحالي (لو في تحديد) أو على ما هيتكتب
   * بعد كده. ده اللي بيخلي "اختيار اللون = تغيير النص في نفس الوقت"
   * زي ما طلبت بالظبط — مفيش خطوة تانية ولا تأكيد، اللون بيتطبّق على طول.
   * مستخدمة هنا بس مع السواتش الجاهزة، لأن اختيار سواتش بيقفل البوبوفر
   * على طول بعدها، فاسترجاع الفوكس بـ .focus() آمن (مفيش سحب مستمر بعده).
   */
  function applyColor(hex: string) {
    editor!.chain().focus().setColor(hex).run();
  }

  /**
   * نفس applyColor بالظبط في الأثر، لكن من غير ما تنادي .focus() خالص.
   * دي المستخدمة مع التفاعل *المستمر*: السحب على عجلة الألوان
   * (HexColorPicker.onChange) والكتابة في خانة الـ hex
   * (HexColorInput.onChange) — اللي بيتنادوا مرات كتير متلاحقة في
   * الثانية الواحدة. استدعاء .focus() في كل مرة كان بيرجّع الفوكس
   * للمحرر نفسه، وعلى الموبايل ده بيفتح الكيبورد / يعمل scrollIntoView،
   * فالـ viewport بيتغيّر وموضع البوبوفر (المحسوب بـ position: fixed)
   * بيتزحزح معاه ويبان وكأنه "بينزل تحت" لوحده أثناء السحب. التحديد
   * (selection) بتاع Tiptap بيفضل محفوظ جوّه حتى من غير DOM focus
   * فعلي، فاللون بيتلوّن لحظيًا برضه بالظبط زي الأول، بس من غير أي
   * إزعاج بصري للبوبوفر.
   */
  function applyColorLive(hex: string) {
    editor!.chain().setColor(hex).run();
  }

  return (
    <div
      className="rounded-[10px] overflow-hidden w-full max-w-full"
      style={{
        border: "1.5px solid var(--border-md)",
        background: "var(--surface)",
      }}
    >
      {/* ── Toolbar ───────────────────────────────────────────────────── */}
      <div
        className="flex flex-wrap items-center gap-0.5 p-1.5 relative"
        style={{
          background: "var(--bg)",
          borderBottom: "1.5px solid var(--border-md)",
        }}
        ref={popoverRef}
      >
        {/* History */}
        <ToolbarButton
          title="تراجع (Ctrl+Z)"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo2 size={15} />
        </ToolbarButton>
        <ToolbarButton
          title="إعادة (Ctrl+Y)"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <Redo2 size={15} />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Block type dropdown */}
        <div className="relative">
          <button
            ref={headingTriggerRef}
            type="button"
            title="نوع الفقرة أو العنوان"
            onClick={() =>
              setOpenPopover(openPopover === "heading" ? null : "heading")
            }
            className="h-[30px] px-2 rounded-[7px] flex items-center gap-1 text-[0.78rem] font-medium cursor-pointer whitespace-nowrap"
            style={{
              color: "var(--text-1)",
              border: "1.5px solid var(--border-md)",
              background: "var(--surface)",
            }}
          >
            {editor.isActive("heading", { level: 1 }) ?
              "عنوان 1"
            : editor.isActive("heading", { level: 2 }) ?
              "عنوان 2"
            : editor.isActive("heading", { level: 3 }) ?
              "عنوان 3"
            : editor.isActive("blockquote") ?
              "اقتباس"
            : editor.isActive("codeBlock") ?
              "كود"
            : "نص عادي"}
            <ChevronDown size={12} />
          </button>
          {openPopover === "heading" && (
            <div
              ref={headingPos.ref}
              style={headingPos.style}
              className="z-20 w-[160px] max-w-[80vw] rounded-[10px] p-1.5 flex flex-col gap-0.5"
              data-popover-surface
            >
              {[
                {
                  label: "نص عادي",
                  icon: <Pilcrow size={14} />,
                  action: () => editor.chain().focus().setParagraph().run(),
                },
                {
                  label: "عنوان 1",
                  icon: <Heading1 size={14} />,
                  action: () =>
                    editor.chain().focus().toggleHeading({ level: 1 }).run(),
                },
                {
                  label: "عنوان 2",
                  icon: <Heading2 size={14} />,
                  action: () =>
                    editor.chain().focus().toggleHeading({ level: 2 }).run(),
                },
                {
                  label: "عنوان 3",
                  icon: <Heading3 size={14} />,
                  action: () =>
                    editor.chain().focus().toggleHeading({ level: 3 }).run(),
                },
                {
                  label: "اقتباس",
                  icon: <Quote size={14} />,
                  action: () => editor.chain().focus().toggleBlockquote().run(),
                },
                {
                  label: "كود",
                  icon: <Code2 size={14} />,
                  action: () => editor.chain().focus().toggleCodeBlock().run(),
                },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  title={item.label}
                  onClick={() => {
                    item.action();
                    setOpenPopover(null);
                  }}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-[7px] text-[0.8rem] cursor-pointer text-right"
                  style={{ color: "var(--text-1)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--bg)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <ToolbarDivider />

        {/* Marks */}
        <ToolbarButton
          title="غامق (Ctrl+B)"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold size={15} />
        </ToolbarButton>
        <ToolbarButton
          title="مائل (Ctrl+I)"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic size={15} />
        </ToolbarButton>
        <ToolbarButton
          title="تحته خط (Ctrl+U)"
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon size={15} />
        </ToolbarButton>
        <ToolbarButton
          title="يتوسطه خط"
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough size={15} />
        </ToolbarButton>
        <ToolbarButton
          title="منخفض (Subscript)"
          active={editor.isActive("subscript")}
          onClick={() => editor.chain().focus().toggleSubscript().run()}
        >
          <SubscriptIcon size={15} />
        </ToolbarButton>
        <ToolbarButton
          title="مرتفع (Superscript)"
          active={editor.isActive("superscript")}
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
        >
          <SuperscriptIcon size={15} />
        </ToolbarButton>

        <ToolbarDivider />

        {/* ── Text color: نسخة محسّنة بـ react-colorful ──────────────────
            - الزرار نفسه بيعرض اللون الحالي للتحديد (مش آخر لون استخدمته).
            - اختيار أي سواتش بيطبّق اللون فورًا على التحديد (live).
            - HexColorPicker بيدّي معاينة حية أثناء السحب نفسه (onChange
              بيتفعل باستمرار وإحنا بنطبّقه على طول)، وHexColorInput بيدّي
              إمكانية كتابة كود اللون يدويًا. */}
        <div className="relative">
          <ToolbarButton
            ref={colorTriggerRef}
            title="لون النص"
            onClick={() => {
              setLiveColor(currentColor);
              setOpenPopover(openPopover === "color" ? null : "color");
            }}
          >
            <span className="flex flex-col items-center gap-0">
              <Palette size={15} />
              <span
                className="w-[16px] h-[3px] rounded-full block mt-0.5"
                style={{
                  background: currentColor,
                  boxShadow: "0 0 0 1px var(--border-md)",
                }}
              />
            </span>
          </ToolbarButton>
          {openPopover === "color" && (
            <div
              ref={colorPos.ref}
              style={colorPos.style}
              className="z-20 w-[220px] max-w-[88vw] rounded-[10px] p-3"
              data-popover-surface
            >
              <p
                className="text-[0.72rem] mb-2 font-medium"
                style={{ color: "var(--text-3)" }}
              >
                لون النص
              </p>
              <div className="grid grid-cols-5 gap-2 mb-3">
                {TEXT_COLORS.map((c) => {
                  const isActive =
                    currentColor.toLowerCase() === c.hex.toLowerCase();
                  return (
                    <button
                      key={c.hex}
                      type="button"
                      title={c.name}
                      aria-label={`تطبيق لون ${c.name}`}
                      onClick={() => {
                        applyColor(c.hex);
                        setLiveColor(c.hex);
                      }}
                      className="relative w-[26px] h-[26px] rounded-full cursor-pointer flex items-center justify-center transition-transform hover:scale-110"
                      style={{
                        background: c.hex,
                        border:
                          isActive ?
                            "2px solid var(--cyan-bright)"
                          : "1.5px solid var(--border-md)",
                        boxShadow:
                          isActive ? "0 0 0 2px var(--surface)" : undefined,
                      }}
                    >
                      {isActive && (
                        <Check
                          size={13}
                          color={c.hex === "#ffffff" ? "#1a1a1a" : "#fff"}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* picker حر مع Live preview أثناء السحب نفسه — applyColorLive
                  من غير .focus() عشان منعملش jump للبوبوفر أثناء السحب
                  (راجع ملحوظة سابعة فوق الملف) */}
              <p
                className="text-[0.72rem] mb-1.5 font-medium"
                style={{ color: "var(--text-3)" }}
              >
                لون مخصص
              </p>
              <div
                className="custom-color-picker mb-2"
                role="group"
                aria-label="منتقي لون مخصص"
              >
                <HexColorPicker
                  color={liveColor || currentColor}
                  onChange={(hex) => {
                    setLiveColor(hex);
                    applyColorLive(hex);
                  }}
                  style={{ width: "100%", height: 130 }}
                />
              </div>

              <label
                title="كتابة كود اللون يدويًا (Hex)"
                className="flex items-center gap-2 rounded-[8px] p-1.5"
                style={{ border: "1.5px solid var(--border-md)" }}
              >
                <span
                  className="w-[20px] h-[20px] rounded-full shrink-0"
                  style={{
                    background: liveColor || currentColor,
                    border: "1.5px solid var(--border-md)",
                  }}
                />
                <span
                  className="text-[0.72rem] shrink-0"
                  style={{ color: "var(--text-3)" }}
                >
                  #
                </span>
                <HexColorInput
                  color={liveColor || currentColor}
                  onChange={(hex) => {
                    setLiveColor(hex);
                    applyColorLive(hex);
                  }}
                  title="كود اللون (Hex) — مثال: 1a1a1a"
                  aria-label="كتابة كود اللون Hex"
                  className="flex-1 text-[0.78rem] ltr outline-none bg-transparent"
                  style={{ color: "var(--text-1)" }}
                />
              </label>

              <button
                type="button"
                title="إزالة لون النص والرجوع للون الافتراضي"
                onClick={() => {
                  editor.chain().focus().unsetColor().run();
                  setOpenPopover(null);
                }}
                className="w-full mt-2 text-[0.75rem] py-1.5 rounded-[6px] cursor-pointer"
                style={{ color: "var(--text-3)" }}
              >
                إزالة اللون
              </button>
            </div>
          )}
        </div>

        {/* Highlight */}
        <div className="relative">
          <ToolbarButton
            ref={highlightTriggerRef}
            title="تظليل النص"
            active={editor.isActive("highlight")}
            onClick={() =>
              setOpenPopover(openPopover === "highlight" ? null : "highlight")
            }
          >
            <Highlighter size={15} />
          </ToolbarButton>
          {openPopover === "highlight" && (
            <div
              ref={highlightPos.ref}
              style={highlightPos.style}
              className="z-20 w-[180px] max-w-[85vw] rounded-[10px] p-2.5"
              data-popover-surface
            >
              <div className="grid grid-cols-3 gap-1.5 mb-2">
                {HIGHLIGHT_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    title={c.name}
                    aria-label={`تظليل بلون ${c.name}`}
                    onClick={() => {
                      editor
                        .chain()
                        .focus()
                        .toggleHighlight({ color: c.hex })
                        .run();
                      setOpenPopover(null);
                    }}
                    className="w-[30px] h-[30px] rounded-[7px] cursor-pointer transition-transform hover:scale-105"
                    style={{
                      background: c.hex,
                      border: "1.5px solid var(--border-md)",
                    }}
                  />
                ))}
              </div>
              <button
                type="button"
                title="إزالة التظليل"
                onClick={() => {
                  editor.chain().focus().unsetHighlight().run();
                  setOpenPopover(null);
                }}
                className="w-full text-[0.75rem] py-1 rounded-[6px] cursor-pointer"
                style={{ color: "var(--text-3)" }}
              >
                إزالة التظليل
              </button>
            </div>
          )}
        </div>

        <ToolbarDivider />

        {/* Font family */}
        <div className="relative">
          <button
            ref={fontTriggerRef}
            type="button"
            title="نوع الخط"
            onClick={() =>
              setOpenPopover(openPopover === "font" ? null : "font")
            }
            className="h-[30px] px-2 rounded-[7px] flex items-center gap-1 text-[0.78rem] cursor-pointer whitespace-nowrap"
            style={{
              color: "var(--text-1)",
              border: "1.5px solid var(--border-md)",
              background: "var(--surface)",
            }}
          >
            الخط <ChevronDown size={12} />
          </button>
          {openPopover === "font" && (
            <div
              ref={fontPos.ref}
              style={fontPos.style}
              className="z-20 w-[170px] max-w-[85vw] rounded-[10px] p-1.5 max-h-[220px] overflow-y-auto"
              data-popover-surface
            >
              {FONT_FAMILIES.map((f) => (
                <button
                  key={f.label}
                  type="button"
                  title={f.label}
                  onClick={() => {
                    if (f.value)
                      editor.chain().focus().setFontFamily(f.value).run();
                    else editor.chain().focus().unsetFontFamily().run();
                    setOpenPopover(null);
                  }}
                  className="w-full text-right px-2 py-1.5 rounded-[6px] text-[0.8rem] cursor-pointer"
                  style={{
                    color: "var(--text-1)",
                    fontFamily: f.value || "inherit",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--bg)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Font size */}
        <div className="relative">
          <button
            ref={sizeTriggerRef}
            type="button"
            title="حجم الخط"
            onClick={() =>
              setOpenPopover(openPopover === "size" ? null : "size")
            }
            className="h-[30px] px-2 rounded-[7px] flex items-center gap-1 text-[0.78rem] cursor-pointer whitespace-nowrap"
            style={{
              color: "var(--text-1)",
              border: "1.5px solid var(--border-md)",
              background: "var(--surface)",
            }}
          >
            الحجم <ChevronDown size={12} />
          </button>
          {openPopover === "size" && (
            <div
              ref={sizePos.ref}
              style={sizePos.style}
              className="z-20 w-[150px] max-w-[85vw] rounded-[10px] p-1.5 max-h-[220px] overflow-y-auto"
              data-popover-surface
            >
              <button
                type="button"
                title="حجم الخط الافتراضي"
                onClick={() => {
                  editor.chain().focus().unsetFontSize().run();
                  setOpenPopover(null);
                }}
                className="w-full text-right px-2 py-1.5 rounded-[6px] text-[0.78rem] cursor-pointer"
                style={{ color: "var(--text-3)" }}
              >
                افتراضي
              </button>
              {FONT_SIZES.map((f) => (
                <button
                  key={f.label}
                  type="button"
                  title={f.label}
                  onClick={() => {
                    editor.chain().focus().setFontSize(f.value).run();
                    setOpenPopover(null);
                  }}
                  className="w-full text-right px-2 py-1.5 rounded-[6px] text-[0.8rem] cursor-pointer"
                  style={{ color: "var(--text-1)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--bg)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <ToolbarDivider />

        {/* Lists */}
        <ToolbarButton
          title="قائمة نقطية"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List size={15} />
        </ToolbarButton>
        <ToolbarButton
          title="قائمة مرقّمة"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered size={15} />
        </ToolbarButton>
        <ToolbarButton
          title="قائمة مهام"
          active={editor.isActive("taskList")}
          onClick={() => editor.chain().focus().toggleTaskList().run()}
        >
          <ListTodo size={15} />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Align */}
        <ToolbarButton
          title="محاذاة لليمين"
          active={editor.isActive({ textAlign: "right" })}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          <AlignRight size={15} />
        </ToolbarButton>
        <ToolbarButton
          title="محاذاة للوسط"
          active={editor.isActive({ textAlign: "center" })}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          <AlignCenter size={15} />
        </ToolbarButton>
        <ToolbarButton
          title="محاذاة لليسار"
          active={editor.isActive({ textAlign: "left" })}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        >
          <AlignLeft size={15} />
        </ToolbarButton>
        <ToolbarButton
          title="محاذاة ممتدة"
          active={editor.isActive({ textAlign: "justify" })}
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
        >
          <AlignJustify size={15} />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Link */}
        <div className="relative">
          <ToolbarButton
            ref={linkTriggerRef}
            title="إضافة رابط (Ctrl+K)"
            active={editor.isActive("link")}
            onClick={() => {
              setLinkUrl(editor.getAttributes("link").href || "");
              setOpenPopover(openPopover === "link" ? null : "link");
            }}
          >
            <Link2 size={15} />
          </ToolbarButton>
          {openPopover === "link" && (
            <div
              ref={linkPos.ref}
              style={linkPos.style}
              className="z-20 w-[230px] max-w-[90vw] rounded-[10px] p-2.5"
              data-popover-surface
            >
              <input
                type="text"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const url = normalizeUrl(linkUrl);
                    if (url) {
                      editor
                        .chain()
                        .focus()
                        .extendMarkRange("link")
                        .setLink({ href: url })
                        .run();
                    }
                    setOpenPopover(null);
                  }
                }}
                placeholder="https://example.com"
                title="رابط الـ URL"
                className="w-full px-2.5 py-2 rounded-[7px] text-[0.8rem] ltr mb-2 outline-none"
                style={{
                  border: "1.5px solid var(--border-md)",
                  color: "var(--text-1)",
                }}
              />
              <div className="flex gap-1.5">
                <button
                  type="button"
                  title="تطبيق الرابط"
                  onClick={() => {
                    const url = normalizeUrl(linkUrl);
                    if (url) {
                      editor
                        .chain()
                        .focus()
                        .extendMarkRange("link")
                        .setLink({ href: url })
                        .run();
                    }
                    setOpenPopover(null);
                  }}
                  className="flex-1 py-1.5 rounded-[7px] text-[0.8rem] font-medium cursor-pointer"
                  style={{
                    background: "var(--cyan)",
                    color: "var(--text-inv)",
                  }}
                >
                  تطبيق
                </button>
                <button
                  type="button"
                  onClick={() => {
                    editor
                      .chain()
                      .focus()
                      .extendMarkRange("link")
                      .unsetLink()
                      .run();
                    setLinkUrl("");
                    setOpenPopover(null);
                  }}
                  className="px-2.5 py-1.5 rounded-[7px] text-[0.8rem] cursor-pointer"
                  style={{
                    border: "1.5px solid var(--border-md)",
                    color: "var(--red)",
                  }}
                  title="إزالة الرابط"
                >
                  <Unlink size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* HR */}
        <ToolbarButton
          title="خط فاصل"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <Minus size={15} />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Clear formatting */}
        <ToolbarButton
          title="إزالة كل التنسيقات"
          onClick={() =>
            editor.chain().focus().clearNodes().unsetAllMarks().run()
          }
        >
          <Eraser size={15} />
        </ToolbarButton>
      </div>

      {/* ── Bubble menu يدوي: تظهر فوق التحديد مباشرة عند تحديد نص ───────── */}
      {bubbleMenu && (
        <div
          // مهم جدًا: من غير preventDefault هنا، أي كليك على زرار جوه
          // القائمة هيفصل التحديد (blur) قبل ما onClick يتنفذ، فالقائمة
          // تقفل من نفسها قبل ما الأمر يتطبّق.
          onMouseDown={(e) => e.preventDefault()}
          className="fixed z-30 flex items-center gap-0.5 p-1 rounded-[9px]"
          style={{
            top: bubbleMenu.top,
            left: Math.min(
              Math.max(bubbleMenu.left, 80),
              typeof window !== "undefined" ?
                window.innerWidth - 80
              : bubbleMenu.left,
            ),
            transform: "translateX(-50%)",
            background: "var(--gold-mid)",
            boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
          }}
        >
          {[
            {
              icon: <Bold size={14} />,
              title: "غامق",
              active: editor.isActive("bold"),
              action: () => editor.chain().focus().toggleBold().run(),
            },
            {
              icon: <Italic size={14} />,
              title: "مائل",
              active: editor.isActive("italic"),
              action: () => editor.chain().focus().toggleItalic().run(),
            },
            {
              icon: <UnderlineIcon size={14} />,
              title: "تحته خط",
              active: editor.isActive("underline"),
              action: () => editor.chain().focus().toggleUnderline().run(),
            },
            {
              icon: <Link2 size={14} />,
              title: "رابط",
              active: editor.isActive("link"),
              action: () => {
                setLinkUrl(editor.getAttributes("link").href || "");
                setOpenPopover("link");
              },
            },
          ].map((item, i) => (
            <button
              key={i}
              type="button"
              title={item.title}
              onClick={item.action}
              className="w-[26px] h-[26px] rounded-[6px] flex items-center justify-center cursor-pointer"
              style={{
                background: item.active ? "var(--cyan)" : "transparent",
                color: "var(--text-inv)",
              }}
            >
              {item.icon}
            </button>
          ))}
        </div>
      )}

      {/* ── Editor content ───────────────────────────────────────────────── */}
      <EditorContent editor={editor} />

      {/* ── Footer: character count ─────────────────────────────────────── */}
      <div
        className="flex justify-end px-3 py-1.5 text-[0.72rem]"
        style={{
          borderTop: "1.5px solid var(--border-md)",
          background: "var(--bg)",
          color: isNearLimit ? "var(--red)" : "var(--text-3)",
        }}
      >
        {charCount.toLocaleString("en-US")}
        {maxLength ? ` / ${maxLength.toLocaleString("en-US")}` : ""}
      </div>
    </div>
  );
}
