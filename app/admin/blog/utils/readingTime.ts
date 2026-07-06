import sanitizeHtml from "sanitize-html";

const ARABIC_WORDS_PER_MINUTE = 200;

function stripTags(html: string): string {
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} });
}

export function calculateReadingTime(html: string): number {
  const words = countWords(html);
  return Math.max(1, Math.ceil(words / ARABIC_WORDS_PER_MINUTE));
}

export function countWords(html: string): number {
  const text = stripTags(html).trim();
  return text ? text.split(/\s+/).filter(Boolean).length : 0;
}
