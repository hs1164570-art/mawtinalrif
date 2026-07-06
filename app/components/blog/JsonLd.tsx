// ─── components/blog/JsonLd.tsx ──────────────────────────────────────────────
// Pure Server Components — each renders a <script type="application/ld+json">.
// XSS-safe: all < > & are Unicode-escaped before injection.
// Place these anywhere in the page tree (body is fine for JSON-LD).

import { SITE_CONFIG } from "@/utils/blog/config";
import type { BreadcrumbItem } from "@/utils/blog/types";

// ─── Serialization (XSS-safe) ─────────────────────────────────────────────────

function safeJson(data: object): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/'/g, "\\u0027");
}

function JsonLdScript({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: safeJson(data) }}
    />
  );
}

// ─── 1. Organization — embed in root layout once ─────────────────────────────

export function OrganizationJsonLd() {
  return (
    <JsonLdScript
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": `${SITE_CONFIG.url}/#organization`,
        name: SITE_CONFIG.name,
        alternateName: SITE_CONFIG.nameEn,
        url: SITE_CONFIG.url,
        logo: {
          "@type": "ImageObject",
          url: SITE_CONFIG.logoUrl,
          width: 200,
          height: 60,
        },
        inLanguage: "ar",
        areaServed: {
          "@type": "Country",
          name: "Saudi Arabia",
        },
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer service",
          availableLanguage: "Arabic",
        },
      }}
    />
  );
}

// ─── 2. WebSite — embed in root layout once ───────────────────────────────────

export function WebSiteJsonLd() {
  return (
    <JsonLdScript
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": `${SITE_CONFIG.url}/#website`,
        name: SITE_CONFIG.name,
        url: SITE_CONFIG.url,
        inLanguage: "ar",
        publisher: {
          "@id": `${SITE_CONFIG.url}/#organization`,
        },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${SITE_CONFIG.url}/search?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      }}
    />
  );
}

// ─── 3. BreadcrumbList ────────────────────────────────────────────────────────

interface BreadcrumbJsonLdProps {
  /** Full list including Home. Built by the Breadcrumbs component. */
  items: BreadcrumbItem[];
}

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  return (
    <JsonLdScript
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.label,
          ...(item.href ? { item: `${SITE_CONFIG.url}${item.href}` } : {}),
        })),
      }}
    />
  );
}

// ─── 4. BlogPosting — single post page ───────────────────────────────────────

export interface BlogPostingJsonLdProps {
  headline: string;
  description: string;
  url: string;
  imageUrl?: string;
  datePublished: string; // ISO 8601
  dateModified: string; // ISO 8601
  authorName: string;
  authorImage?: string;
  keywords?: string[];
}

export function BlogPostingJsonLd({
  headline,
  description,
  url,
  imageUrl,
  datePublished,
  dateModified,
  authorName,
  authorImage,
  keywords = [],
}: BlogPostingJsonLdProps) {
  return (
    <JsonLdScript
      data={{
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "@id": url,
        headline,
        description,
        url,
        inLanguage: "ar",
        ...(imageUrl && {
          image: {
            "@type": "ImageObject",
            url: imageUrl,
            width: 1200,
            height: 630,
          },
        }),
        datePublished,
        dateModified,
        author: {
          "@type": "Person",
          name: authorName,
          ...(authorImage ? { image: authorImage } : {}),
        },
        publisher: {
          "@type": "Organization",
          "@id": `${SITE_CONFIG.url}/#organization`,
          name: SITE_CONFIG.name,
          logo: {
            "@type": "ImageObject",
            url: SITE_CONFIG.logoUrl,
          },
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": url,
        },
        ...(keywords.length > 0 && {
          keywords: keywords.join(", "),
        }),
      }}
    />
  );
}

// ─── 5. CollectionPage — listing / category / tag pages ───────────────────────

export interface CollectionPageJsonLdProps {
  name: string;
  description?: string;
  url: string;
  posts: Array<{
    title: string;
    url: string;
    imageUrl?: string;
  }>;
}

export function CollectionPageJsonLd({
  name,
  description,
  url,
  posts,
}: CollectionPageJsonLdProps) {
  return (
    <JsonLdScript
      data={{
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "@id": url,
        name,
        ...(description && { description }),
        url,
        inLanguage: "ar",
        publisher: {
          "@id": `${SITE_CONFIG.url}/#organization`,
        },
        hasPart: posts.map((post) => ({
          "@type": "BlogPosting",
          headline: post.title,
          url: post.url,
          ...(post.imageUrl && { image: post.imageUrl }),
        })),
      }}
    />
  );
}

// ─── 6. ItemList — for paginated listing pages ────────────────────────────────

export interface ItemListJsonLdProps {
  name: string;
  url: string;
  posts: Array<{ title: string; url: string }>;
}

export function ItemListJsonLd({ name, url, posts }: ItemListJsonLdProps) {
  return (
    <JsonLdScript
      data={{
        "@context": "https://schema.org",
        "@type": "ItemList",
        name,
        url,
        itemListElement: posts.map((post, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: post.title,
          url: post.url,
        })),
      }}
    />
  );
}
