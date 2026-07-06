// ─── lib/blog/config.ts ───────────────────────────────────────────────────────
// إعدادات ثابتة + بنّائي الـ Cache Tags وروابط الصفحات العامة للمدونة.
// كل القيم هنا مصدر واحد للحقيقة (Single Source of Truth) تستخدمه طبقتي
// queries.ts و revalidate.ts، فأي تغيير في شكل الروابط أو الـ tags يتم هنا فقط.

export const BLOG_CONFIG = {
  postsPerPage: 12,
} as const;

// ─── Hash قصير وثابت الطول لأي سترينج ─────────────────────────────────────────
// Next.js عنده حد أقصى 256 حرف لأي cache tag. لو استخدمنا الـ slug العربي
// مباشرة (خصوصًا التاجات الطويلة زي جُمل الـ keywords)، بعد أي encoding
// بيتعدى الحد ده بسهولة وبيطلع warning ويتجاهل الـ tag خالص.
// الحل: بدل ما نحط الـ slug/name زي ما هو، نعمله hash قصير وثابت (16 حرف hex)
// بستخدم FNV-1a (خفيف وسريع وشغال في أي runtime، من غير ما نستورد "crypto").
function hashPart(input: string): string {
  let h1 = 0xdeadbeef ^ input.length;
  let h2 = 0x41c6ce57 ^ input.length;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 =
    Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
    Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 =
    Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
    Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (
    (h1 >>> 0).toString(16).padStart(8, "0") +
    (h2 >>> 0).toString(16).padStart(8, "0")
  );
}

// ─── Cache Tags ───────────────────────────────────────────────────────────────
// Tags ثابتة (مستوى عام) + دوال بنّاءة (مستوى تفصيلي لكل slug/page).
// كل الدوال اللي بتاخد slug (بيجي من الداتابيز وممكن يبقى طويل بالعربي)
// بتعمل hash للـ slug قبل ما تبنيه، عشان نضمن إن الـ tag دايمًا قصير
// وثابت الطول بغض النظر عن طول الـ slug الأصلي.
export const CACHE_TAGS = {
  POSTS: "blog:posts",
  CATEGORIES: "blog:categories",
  TAGS: "blog:tags",

  post: (slug: string) => `blog:post:${hashPart(slug)}`,
  postsPage: (page: number) => `blog:posts:page:${page}`,

  category: (slug: string) => `blog:category:${hashPart(slug)}`,
  categoryPage: (slug: string, page: number) =>
    `blog:category:${hashPart(slug)}:page:${page}`,

  tag: (slug: string) => `blog:tag:${hashPart(slug)}`,
  tagPage: (slug: string, page: number) =>
    `blog:tag:${hashPart(slug)}:page:${page}`,
} as const;

// ─── Public Routes ────────────────────────────────────────────────────────────
// مطابقة تمامًا لبنية الفرونت المتفق عليها:
//   /blog                    → الرئيسية
//   /blog/[slug]              → المقال
//   /blog/category/[slug]     → تصنيف
//   /blog/tag/[slug]          → وسم
export const BLOG_PATHS = {
  listing: "/blog",
  post: (slug: string) => `/blog/${slug}`,
  category: (slug: string) => `/blog/category/${slug}`,
  tag: (slug: string) => `/blog/tag/${slug}`,
  sitemap: "/sitemap.xml",
} as const;
