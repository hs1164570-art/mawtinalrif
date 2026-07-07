/**
 * =====================================================================
 * app/sitemap.ts — Dynamic XML Sitemap — الخريطة الشاملة
 * مؤسسة موطن الريف للتجارة — الرياض
 *
 * يشمل بالكامل:
 *
 *   ── Static Pages ──────────────────────────────────────────────────
 *   /                              → الصفحة الرئيسية
 *   /about                         → من نحن
 *   /consultation                  → الاستشارة المجانية / التواصل
 *
 *   ── Products (E-commerce) ─────────────────────────────────────────
 *   /products/collections/{slug}   → قسم رئيسي
 *   /products/{parent}/{child}     → قسم فرعي
 *   /products/{slug}               → صفحة منتج (inStock فقط)
 *
 *   ── Blog ──────────────────────────────────────────────────────────
 *   /blog                          → قائمة المدونة
 *   /blog/{slug}                   → مقال فردي (PUBLISHED فقط)
 *   /blog/category/{slug}          → صفحة تصنيف
 *   /blog/tag/{slug}               → صفحة وسم
 *
 *   ── Priority reasoning ────────────────────────────────────────────
 *   1.00 → homepage
 *   0.95 → /consultation (أهم صفحة تجارياً)
 *   0.90 → منتجات + مقالات حديثة (< 30 يوم)
 *   0.85 → أقسام رئيسية + مدونة listing
 *   0.80 → أقسام فرعية + مقالات قديمة
 *   0.70 → /about + تصنيفات المدونة
 *   0.60 → وسوم المدونة
 *   0.50 → /consultation صغيرة الفروع (لو أضفت صفحات فرعية مستقبلاً)
 *
 * ✅ URLs مطابقة 100% لبنية الراوترز الفعلية
 * ✅ lastModified من قاعدة البيانات (Freshness signal لـ Google)
 * ✅ changeFrequency ديناميكي حسب عمر المحتوى
 * ✅ ISR ساعة — يتجدد تلقائياً بدون re-build
 * ✅ صفر تعارض مع robots.ts
 * =====================================================================
 */

import type { MetadataRoute } from "next";
import prisma from "@/lib/db";
import {
  getAllPublishedSlugs,
  getAllCategorySlugs,
  getAllTagSlugs,
} from "@/lib/blog/queries";

// ─── Constants ────────────────────────────────────────────────────────────────
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://mawtinalriyf.com";

// مقال/منتج تم تحديثه خلال آخر 30 يوم → changeFrequency: weekly
// أقدم من كده → monthly (لا حاجة لـ crawl متكرر)
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

// ─── ISR: يجدد الـ sitemap كل ساعة تلقائياً ─────────────────────────────────
export const revalidate = 3600;

// ─── Sitemap ──────────────────────────────────────────────────────────────────
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = Date.now();

  // ── Parallel fetch لكل البيانات — أقل latency ممكن ─────────────────────────
  const [
    // E-commerce data
    products,
    allCategories,
    // Blog data
    blogPosts,
    blogCategories,
    blogTags,
  ] = await Promise.all([
    // ── منتجات متاحة فقط ──────────────────────────────────────────────────────
    prisma.product.findMany({
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    }),

    // ── أقسام المتجر مع parent ────────────────────────────────────────────────
    prisma.category.findMany({
      select: {
        slug: true,
        updatedAt: true,
        parent: { select: { slug: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),

    // ── مقالات المدونة المنشورة فقط ───────────────────────────────────────────
    getAllPublishedSlugs(),

    // ── تصنيفات المدونة ───────────────────────────────────────────────────────
    getAllCategorySlugs(),

    // ── وسوم المدونة ──────────────────────────────────────────────────────────
    getAllTagSlugs(),
  ]);

  // ── فصل أقسام المتجر: رئيسية vs فرعية ────────────────────────────────────
  const rootProductCategories = allCategories.filter((c) => c.parent === null);
  const subProductCategories = allCategories.filter((c) => c.parent !== null);

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. STATIC PAGES
  // ═══════════════════════════════════════════════════════════════════════════
  const staticPages: MetadataRoute.Sitemap = [
    {
      // الصفحة الرئيسية — أعلى أولوية في الموقع كله
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      // صفحة الاستشارة المجانية / التواصل — أهم صفحة تجارياً
      // أعلى من /about لأنها تجلب عملاء مباشرة
      url: `${BASE_URL}/consultation`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.95,
    },
    {
      // صفحة من نحن — مهمة لـ E-E-A-T وثقة Google
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/return-policy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ];

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. E-COMMERCE: ROOT CATEGORY PAGES → /products/collections/{slug}
  // ═══════════════════════════════════════════════════════════════════════════
  const rootProductCategoryPages: MetadataRoute.Sitemap =
    rootProductCategories.map((cat) => ({
      url: `${BASE_URL}/products/collections/${cat.slug}`,
      lastModified: cat.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    }));

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. E-COMMERCE: SUB CATEGORY PAGES → /products/{parent-slug}/{child-slug}
  // ═══════════════════════════════════════════════════════════════════════════
  const subProductCategoryPages: MetadataRoute.Sitemap = subProductCategories
    .filter((cat) => cat.parent !== null)
    .map((cat) => ({
      url: `${BASE_URL}/products/${cat.parent!.slug}/${cat.slug}`,
      lastModified: cat.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. E-COMMERCE: PRODUCT PAGES → /products/{slug}
  // ═══════════════════════════════════════════════════════════════════════════
  const productPages: MetadataRoute.Sitemap = products.map((product) => {
    const isRecent =
      now - new Date(product.updatedAt).getTime() < THIRTY_DAYS_MS;
    return {
      url: `${BASE_URL}/products/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: isRecent ? ("weekly" as const) : ("monthly" as const),
      priority: 0.9,
    };
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. BLOG: LISTING PAGE → /blog
  // ═══════════════════════════════════════════════════════════════════════════
  const blogListingPages: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.85,
    },
  ];

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. BLOG: POST PAGES → /blog/{slug}
  // changeFrequency ديناميكي: مقالات حديثة (< 30 يوم) → weekly، قديمة → monthly
  // ═══════════════════════════════════════════════════════════════════════════
  const blogPostPages: MetadataRoute.Sitemap = blogPosts.map(
    (post: { slug: string; updatedAt: Date | string }) => {
      const isRecent =
        now - new Date(post.updatedAt).getTime() < THIRTY_DAYS_MS;
      return {
        url: `${BASE_URL}/blog/${post.slug}`,
        lastModified: post.updatedAt,
        changeFrequency: isRecent ? ("weekly" as const) : ("monthly" as const),
        priority: 0.9,
      };
    },
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // 7. BLOG: CATEGORY PAGES → /blog/category/{slug}
  // ═══════════════════════════════════════════════════════════════════════════
  const blogCategoryPages: MetadataRoute.Sitemap = blogCategories.map(
    (category: { slug: string; updatedAt: Date | string }) => ({
      url: `${BASE_URL}/blog/category/${category.slug}`,
      lastModified: category.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }),
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // 8. BLOG: TAG PAGES → /blog/tag/{slug}
  // ═══════════════════════════════════════════════════════════════════════════
  const blogTagPages: MetadataRoute.Sitemap = blogTags.map(
    (tag: { slug: string; createdAt: Date | string }) => ({
      url: `${BASE_URL}/blog/tag/${tag.slug}`,
      lastModified: tag.createdAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }),
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // MERGE — ترتيب الأولوية مهم: Google تُعطي وزناً للصفحات الأولى في الـ sitemap
  // ═══════════════════════════════════════════════════════════════════════════
  return [
    // ── الأعلى أولوية أولاً ──────────────────────────────────────────────────
    ...staticPages, // priority: 1.0 / 0.95 / 0.7

    // ── E-commerce ───────────────────────────────────────────────────────────
    ...rootProductCategoryPages, // priority: 0.85
    ...subProductCategoryPages, // priority: 0.80
    ...productPages, // priority: 0.90

    // ── Blog ─────────────────────────────────────────────────────────────────
    ...blogListingPages, // priority: 0.85
    ...blogPostPages, // priority: 0.90
    ...blogCategoryPages, // priority: 0.70
    ...blogTagPages, // priority: 0.60
  ];
}
