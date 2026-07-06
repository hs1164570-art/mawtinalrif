export interface SeoScoreInput {
  title: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  contentHtml?: string | null;
  coverImage?: string | null;
  excerpt?: string | null;
  keywords?: string[];
}

export interface SeoScoreCheck {
  label: string;
  points: number;
  max: number;
  passed: boolean;
}

export interface SeoScoreResult {
  score: number;
  checks: SeoScoreCheck[];
}

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function countWords(html: string): number {
  const text = stripTags(html);
  return text ? text.split(" ").filter(Boolean).length : 0;
}

function countTagOccurrences(html: string, tag: string): number {
  const regex = new RegExp(`<${tag}[\\s>]`, "gi");
  return (html.match(regex) ?? []).length;
}

function countInternalLinks(html: string): number {
  // روابط تبدأ بـ "/" فقط (داخلية) — نستبعد "//" (روابط بروتوكول مطلق)
  const matches = html.match(/href=["']\/(?!\/)[^"']*["']/gi) ?? [];
  return matches.length;
}

export function calculateSeoScore(input: SeoScoreInput): SeoScoreResult {
  const html = input.contentHtml ?? "";
  const wordCount = countWords(html);
  const internalLinks = countInternalLinks(html);
  const h2Count = countTagOccurrences(html, "h2");
  const titleLength = input.title?.length ?? 0;
  const keywordInTitle =
    !!input.keywords?.length &&
    input.keywords.some((k) => input.title.toLowerCase().includes(k.toLowerCase()));

  const wordCountPoints = wordCount >= 800 ? 15 : wordCount >= 400 ? 7 : 0;
  const internalLinksPoints =
    internalLinks >= 3 ? 15 : internalLinks === 2 ? 12 : internalLinks === 1 ? 6 : 0;

  const checks: SeoScoreCheck[] = [
    {
      label: "طول العنوان مناسب (30-65 حرف)",
      max: 10,
      points: titleLength >= 30 && titleLength <= 65 ? 10 : 0,
      passed: titleLength >= 30 && titleLength <= 65,
    },
    {
      label: "وصف Meta بطول مناسب (120-165 حرف)",
      max: 15,
      points:
        !!input.metaDescription &&
        input.metaDescription.length >= 120 &&
        input.metaDescription.length <= 165
          ? 15
          : 0,
      passed:
        !!input.metaDescription &&
        input.metaDescription.length >= 120 &&
        input.metaDescription.length <= 165,
    },
    {
      label: "عنوان Meta موجود (40-65 حرف)",
      max: 10,
      points:
        !!input.metaTitle && input.metaTitle.length >= 40 && input.metaTitle.length <= 65
          ? 10
          : 0,
      passed:
        !!input.metaTitle && input.metaTitle.length >= 40 && input.metaTitle.length <= 65,
    },
    {
      label: "صورة غلاف موجودة",
      max: 10,
      points: input.coverImage ? 10 : 0,
      passed: !!input.coverImage,
    },
    {
      label: "عدد الكلمات كافٍ (800+ مثالي، 400 حد أدنى)",
      max: 15,
      points: wordCountPoints,
      passed: wordCount >= 800,
    },
    {
      label: "بنية عناوين فرعية واضحة (3+ H2)",
      max: 10,
      points: h2Count >= 3 ? 10 : h2Count >= 1 ? 5 : 0,
      passed: h2Count >= 3,
    },
    {
      label: "روابط داخلية كافية (2-3+ رابط)",
      max: 15,
      points: internalLinksPoints,
      passed: internalLinks >= 2,
    },
    {
      label: "الكلمة المفتاحية ضمن العنوان",
      max: 10,
      points: keywordInTitle ? 10 : 0,
      passed: keywordInTitle,
    },
    {
      label: "مقتطف (excerpt) موجود",
      max: 5,
      points: input.excerpt ? 5 : 0,
      passed: !!input.excerpt,
    },
  ];

  return { score: Math.min(100, checks.reduce((s, c) => s + c.points, 0)), checks };
}

export function getSeoScoreLabel(score: number): { label: string; colorVar: string } {
  if (score >= 80) return { label: "ممتاز", colorVar: "--gold" };
  if (score >= 60) return { label: "جيد", colorVar: "--cyan" };
  if (score >= 40) return { label: "يحتاج تحسين", colorVar: "--cyan-bright" };
  return { label: "ضعيف", colorVar: "--red" };
}
