// ─── lib/blog/utils.ts ───────────────────────────────────────────────────────
// Pure utility functions — no Prisma, no Next.js, fully testable in isolation.

import type { TocItem } from "./types";

// ─── Slugify (Arabic-safe) ────────────────────────────────────────────────────

/**
 * Converts Arabic or Latin text into a URL/anchor-safe slug.
 * Arabic characters are preserved (no transliteration), spaces → hyphens,
 * punctuation stripped.
 */
export function slugifyHeading(text: string): string {
  return (
    text
      .trim()
      .toLowerCase()
      // Collapse whitespace → hyphen
      .replace(/[\s\u00a0]+/g, "-")
      // Keep Arabic Unicode block (U+0600–U+06FF), Latin word chars, digits, hyphens
      .replace(/[^\w\u0600-\u06FF-]/g, "")
      // Collapse multiple hyphens
      .replace(/-+/g, "-")
      // Trim leading/trailing hyphens
      .replace(/^-+|-+$/g, "") || "heading"
  );
}

// ─── Heading ID injection ─────────────────────────────────────────────────────

/**
 * Adds `id` attributes to every <h2> and <h3> in a sanitized HTML string.
 * Already-IDed headings are left untouched.
 * Duplicate text slugs get a numeric suffix (-2, -3, …).
 *
 * Run this AFTER sanitize-html, BEFORE dangerouslySetInnerHTML.
 */
export function addHeadingIds(html: string): string {
  const usedIds = new Set<string>();

  return html.replace(
    /<(h[23])([^>]*)>([\s\S]*?)<\/\1>/gi,
    (_, tag: string, attrs: string, inner: string) => {
      // If tag already has an id, leave it untouched
      if (/\bid\s*=/i.test(attrs)) {
        return `<${tag}${attrs}>${inner}</${tag}>`;
      }

      // Strip inner HTML tags to get plain text, then slugify
      const plainText = inner.replace(/<[^>]+>/g, "").trim();
      let id = slugifyHeading(plainText);

      // Deduplicate within the document
      if (usedIds.has(id)) {
        let counter = 2;
        while (usedIds.has(`${id}-${counter}`)) counter++;
        id = `${id}-${counter}`;
      }
      usedIds.add(id);

      return `<${tag}${attrs} id="${id}">${inner}</${tag}>`;
    },
  );
}

// ─── ToC extraction ───────────────────────────────────────────────────────────

/**
 * Extracts h2/h3 headings (with their `id`) from processed HTML.
 * Must be called AFTER addHeadingIds() so IDs are present.
 */
export function extractToc(html: string): TocItem[] {
  const items: TocItem[] = [];
  const regex = /<h([23])[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/gi;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(html)) !== null) {
    const [, levelStr, id, inner] = match;
    const text = inner.replace(/<[^>]+>/g, "").trim();
    if (text) {
      items.push({
        id,
        text,
        level: parseInt(levelStr, 10) as 2 | 3,
      });
    }
  }

  return items;
}

// ─── External link hardening ──────────────────────────────────────────────────

/**
 * Adds `target="_blank" rel="noopener noreferrer"` to external links.
 * Internal links (starting with /) are left as-is for dofollow SEO value.
 *
 * @param html - Sanitized HTML from DB
 * @param siteUrl - e.g. "https://mawtan-alreef.com"
 */
export function hardenExternalLinks(html: string, siteUrl: string): string {
  const domain = new URL(siteUrl).hostname;

  return html.replace(
    /<a([^>]*)\bhref="([^"]*)"([^>]*)>/gi,
    (_, pre, href, post) => {
      // Skip internal links (relative or same-domain)
      if (
        href.startsWith("/") ||
        href.startsWith("#") ||
        href.includes(domain)
      ) {
        return `<a${pre} href="${href}"${post}>`;
      }

      // External: add target + rel only if not already present
      const hasTarget = /\btarget=/i.test(pre + post);
      const hasRel = /\brel=/i.test(pre + post);

      const targetAttr = hasTarget ? "" : ' target="_blank"';
      const relAttr = hasRel ? "" : ' rel="noopener noreferrer"';

      return `<a${pre} href="${href}"${post}${targetAttr}${relAttr}>`;
    },
  );
}

// ─── Full content processing pipeline ────────────────────────────────────────

/**
 * One-stop pipeline for raw `contentHtml` from the DB:
 *   1. Add anchor IDs to h2/h3 for ToC linking
 *   2. Harden external links (noopener + noreferrer, keep internals dofollow)
 *
 * Note: internal product links are NOT injected here — the content already
 * arrives from the DB with links the admin added manually in the Tiptap
 * editor while writing the post. No automated keyword-matching needed.
 *
 * Returns `{ html, toc }`.
 * The returned `html` is safe for dangerouslySetInnerHTML (already sanitized at write time).
 */
export function processPostContent(
  rawHtml: string,
  siteUrl: string,
): { html: string; toc: TocItem[] } {
  const withIds = addHeadingIds(rawHtml);
  const html = hardenExternalLinks(withIds, siteUrl);
  const toc = extractToc(withIds);

  return { html, toc };
}

// ─── Reading time ─────────────────────────────────────────────────────────────

/**
 * Calculates reading time in minutes from plain text word count.
 * Falls back to DB-stored `readingTime` when available (preferred).
 * Average Arabic/bilingual reading speed: ~200 wpm.
 */
export function calcReadingTime(html: string, wpm = 200): number {
  const text = html.replace(/<[^>]+>/g, " ");
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / wpm));
}

/**
 * Formats a reading time (minutes) into Arabic display text.
 * e.g.  1 → "دقيقة واحدة"
 *       5 → "5 دقائق"
 */
export function formatReadingTime(minutes: number): string {
  if (minutes === 1) return "دقيقة واحدة للقراءة";
  if (minutes === 2) return "دقيقتان للقراءة";
  if (minutes <= 10) return `${minutes} دقائق للقراءة`;
  return `${minutes} دقيقة للقراءة`;
}

// ─── Date formatting (Arabic) ─────────────────────────────────────────────────

const AR_DATE_FORMATTER = new Intl.DateTimeFormat("ar-SA", {
  year: "numeric",
  month: "long",
  day: "numeric",
  calendar: "gregory", // Gregorian calendar in Arabic script
});

export function formatDateAr(date: Date | string): string {
  return AR_DATE_FORMATTER.format(new Date(date));
}

/** ISO 8601 — used inside JSON-LD and <time datetime=""> attributes. */
export function formatDateIso(date: Date | string): string {
  return new Date(date).toISOString();
}

// ─── Excerpt generation ───────────────────────────────────────────────────────

/**
 * Strips HTML and returns a plain-text excerpt.
 * Use the DB `excerpt` field first; only call this as a fallback.
 */
export function generateExcerpt(html: string, maxChars = 160): string {
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length <= maxChars ?
      text
    : `${text.slice(0, maxChars).trimEnd()}…`;
}

// ─── OG image URL builder ─────────────────────────────────────────────────────

/**
 * Adds Cloudinary f_auto,q_auto transformations if not already present.
 * Expects a full Cloudinary URL.
 */
export function optimizeCloudinaryUrl(url: string, width = 1200): string {
  if (!url.includes("cloudinary.com")) return url;

  // Insert transformation before /upload/
  if (url.includes("/upload/") && !url.includes("f_auto")) {
    return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width}/`);
  }
  return url;
}
