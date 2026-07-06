// ─── خريطة تحويل الحروف العربية إلى لاتينية ───────────────────────────────────
const ARABIC_TO_LATIN: Record<string, string> = {
  ا: "a", أ: "a", إ: "i", آ: "a", ء: "",
  ب: "b", ت: "t", ث: "th",
  ج: "j", ح: "h", خ: "kh",
  د: "d", ذ: "th",
  ر: "r", ز: "z",
  س: "s", ش: "sh",
  ص: "s", ض: "d",
  ط: "t", ظ: "z",
  ع: "a", غ: "gh",
  ف: "f", ق: "q",
  ك: "k", ل: "l",
  م: "m", ن: "n",
  ه: "h", ة: "a",
  و: "w", ؤ: "w",
  ي: "y", ئ: "y", ى: "a",
};

const DIACRITICS_REGEX = /[\u064B-\u065F\u0670\u06D6-\u06ED]/g;

function transliterate(text: string): string {
  return text
    .replace(DIACRITICS_REGEX, "")
    .split("")
    .map((char) => ARABIC_TO_LATIN[char] ?? char)
    .join("");
}

export function slugify(title: string): string {
  return (
    transliterate(title)
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, " ")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80) || "post"
  );
}

// ─── إضافة لاحقة عند تضارب السلَج (التحقق من التفرد يتم في طبقة DB) ───────────
export function appendSlugSuffix(baseSlug: string, attempt: number): string {
  if (attempt <= 1) return baseSlug;
  return `${baseSlug}-${attempt}`;
}
