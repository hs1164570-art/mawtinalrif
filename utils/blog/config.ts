// ─── lib/blog/config.ts ──────────────────────────────────────────────────────
// Central config for all public blog pages — site identity, ISR cache tags,
// pagination, and SEO defaults. Import from here, never hardcode strings.

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? "https://mawtan-alreef.com";

export const SITE_CONFIG = {
  name: "موطن الريف",
  nameEn: "Mawtan Al-Reef",
  url: BASE_URL,
  logoUrl: `${BASE_URL}/images/logo.png`,
  defaultOgImage: `${BASE_URL}/images/og-default.jpg`,
  locale: "ar_SA",
  language: "ar",
  dir: "rtl" as const,
  twitterHandle: "@a_riffoundation",
  description: "أثاث فاخر يعكس عراقة الريف السعودي وأصالة الذوق العربي",
} as const;

export const BLOG_CONFIG = {
  title: "مدونة موطن الريف",
  titleSuffix: " | موطن الريف",
  description:
    "مقالات في عالم الأثاث الفاخر والديكور الداخلي وإلهامات تصميمية أصيلة",
  basePath: "/blog",
  postsPerPage: 9,
} as const;

// ─── ISR Cache Tags ───────────────────────────────────────────────────────────
// Granular tags enable surgical revalidation from admin Server Actions.
// See Phase 6 for exact revalidation wiring.
//
// Tag hierarchy:
//   'blog:posts'                 → invalidates ALL listing pages
//   'blog:post:{slug}'           → invalidates ONE post + its related-posts appearances
//   'blog:category:{slug}'       → invalidates ONE category listing
//   'blog:tag:{slug}'            → invalidates ONE tag listing
//   'blog:posts:page:{n}'        → invalidates ONE paginated page (posts listing)

export const CACHE_TAGS = {
  // ── Collection tags ──
  POSTS: "blog:posts",
  CATEGORIES: "blog:categories",
  TAGS: "blog:tags",

  // ── Per-entity tags ──
  post: (slug: string) => `blog:post:${slug}`,
  category: (slug: string) => `blog:category:${slug}`,
  tag: (slug: string) => `blog:tag:${slug}`,

  // ── Paginated page tags ──
  postsPage: (page: number) => `blog:posts:page:${page}`,
  categoryPage: (slug: string, page: number) =>
    `blog:category:${slug}:page:${page}`,
  tagPage: (slug: string, page: number) => `blog:tag:${slug}:page:${page}`,
} as const;

// ─── Paths for revalidatePath ─────────────────────────────────────────────────
// Used in Phase 6 admin Server Actions alongside revalidateTag.
export const BLOG_PATHS = {
  listing: "/blog",
  post: (slug: string) => `/blog/${slug}`,
  category: (slug: string) => `/blog/category/${slug}`,
  tag: (slug: string) => `/blog/tag/${slug}`,
  sitemap: "/sitemap.xml",
} as const;
