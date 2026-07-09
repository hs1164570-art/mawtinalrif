/**
 * =====================================================================
 * app/sitemap.ts — Dynamic Sitemap Index (مقسّم بـ content type)
 * مؤسسة موطن الريف للتجارة — الرياض
 *
 * ── لماذا generateSitemaps() بدل ملف واحد؟ ───────────────────────────
 * • Next.js يولد sitemap index تلقائياً في /sitemap.xml يشير لكل ملف
 * • كل ملف منفصل في Search Console = تتبع أخطاء سهل لكل content type
 * • Pagination تلقائي: لو المنتجات وصلت 5000+ كل batch يتحول لملف مستقل
 * • حد أمان 500 URL لكل ملف (Google يسمح 50,000 لكن 500 = crawl أسرع)
 *
 * ── تقسيمية الملفات المولّدة ──────────────────────────────────────────
 *   /sitemap.xml              → sitemap index (تلقائي من Next.js)
 *   /sitemap/static.xml       → static pages + أقسام + blog categories + tags
 *   /sitemap/products-0.xml   → أول 500 منتج
 *   /sitemap/products-1.xml   → المنتجات 501-1000 (لو وصلت)
 *   /sitemap/blog-0.xml       → أول 500 مقال
 *   /sitemap/blog-1.xml       → المقالات 501-1000 (لو وصلت)
 *
 * ── Priority reasoning ────────────────────────────────────────────────
 *   1.00 → homepage
 *   0.95 → /contact
 *   0.90 → منتجات + مقالات حديثة (< 30 يوم)
 *   0.85 → أقسام رئيسية + /blog listing
 *   0.80 → أقسام فرعية + مقالات قديمة
 *   0.70 → /about + تصنيفات المدونة
 *   0.60 → وسوم المدونة
 *   0.50 → legal pages (terms, privacy, return-policy)
 *
 * ✅ URLs مطابقة 100% للراوترز الفعلية
 * ✅ lastModified من DB (Freshness signal لـ Google)
 * ✅ changeFrequency ديناميكي حسب عمر المحتوى
 * ✅ يتمدد تلقائياً مع نمو المحتوى بدون أي تعديل
 * ✅ ISR ساعة — يتجدد بدون re-build
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

// حد أمان: 500 URL لكل ملف sitemap
// Google يسمح 50,000 لكن 500 = crawl budget أفضل وتتبع أسهل في Search Console
const ITEMS_PER_SITEMAP = 500;

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export const revalidate = 3600;

// ─── generateSitemaps — يحدد كم ملف sitemap نحتاج ────────────────────────────
// Next.js يقرأ الدالة دي ويولد sitemap index تلقائياً في /sitemap.xml
// ويولد /sitemap/{id}.xml لكل id هنا
export async function generateSitemaps() {
  // نجيب الأعداد فقط (count أسرع بكتير من جلب كل البيانات)
  const [productCount, blogPostCount] = await Promise.all([
    prisma.product.count({ where: { inStock: true } }),
    getAllPublishedSlugs().then((s) => s.length),
  ]);

  const productSitemapCount = Math.max(
    1,
    Math.ceil(productCount / ITEMS_PER_SITEMAP),
  );
  const blogSitemapCount = Math.max(
    1,
    Math.ceil(blogPostCount / ITEMS_PER_SITEMAP),
  );

  return [
    // ملف الـ static pages + categories + tags — دايماً موجود
    { id: "static" },

    // ملفات المنتجات: products-0, products-1, ...
    ...Array.from({ length: productSitemapCount }, (_, i) => ({
      id: `products-${i}`,
    })),

    // ملفات مقالات المدونة: blog-0, blog-1, ...
    ...Array.from({ length: blogSitemapCount }, (_, i) => ({
      id: `blog-${i}`,
    })),
  ];
}

// ─── Default Export — بيولّد كل ملف sitemap بناءً على الـ id ─────────────────
export default async function sitemap({
  id,
}: {
  id: string;
}): Promise<MetadataRoute.Sitemap> {
  const now = Date.now();

  // ═══════════════════════════════════════════════════════════════════════════
  // static — الصفحات الثابتة + أقسام المتجر + تصنيفات المدونة + الوسوم
  // ═══════════════════════════════════════════════════════════════════════════
  if (id === "static") {
    const [allProductCategories, blogCategories, blogTags] = await Promise.all([
      prisma.category.findMany({
        select: {
          slug: true,
          updatedAt: true,
          parent: { select: { slug: true } },
        },
        orderBy: { updatedAt: "desc" },
      }),
      getAllCategorySlugs(),
      getAllTagSlugs(),
    ]);

    const rootCats = allProductCategories.filter((c) => !c.parent);
    const subCats = allProductCategories.filter((c) => c.parent);

    return [
      // ── Static Pages ──────────────────────────────────────────────────────
      {
        url: BASE_URL,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1.0,
      },
      {
        url: `${BASE_URL}/contact`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.95,
      },
      {
        url: `${BASE_URL}/about`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      },
      {
        url: `${BASE_URL}/blog`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.85,
      },
      // Legal pages — أقل أولوية، نادراً تتغير
      {
        url: `${BASE_URL}/return-policy`,
        lastModified: new Date("2026-07-07"),
        changeFrequency: "yearly",
        priority: 0.5,
      },
      {
        url: `${BASE_URL}/terms`,
        lastModified: new Date("2026-07-07"),
        changeFrequency: "yearly",
        priority: 0.5,
      },
      {
        url: `${BASE_URL}/privacy-policy`,
        lastModified: new Date("2026-07-07"),
        changeFrequency: "yearly",
        priority: 0.5,
      },

      // ── Product Root Categories → /products/collections/{slug} ───────────
      ...rootCats.map((c) => ({
        url: `${BASE_URL}/products/collections/${c.slug}`,
        lastModified: c.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.85,
      })),

      // ── Product Sub Categories → /products/{parent}/{child} ──────────────
      ...subCats
        .filter((c) => c.parent !== null)
        .map((c) => ({
          url: `${BASE_URL}/products/${c.parent!.slug}/${c.slug}`,
          lastModified: c.updatedAt,
          changeFrequency: "weekly" as const,
          priority: 0.8,
        })),

      // ── Blog Category Pages → /blog/category/{slug} ───────────────────────
      ...blogCategories.map(
        (c: { slug: string; updatedAt: Date | string }) => ({
          url: `${BASE_URL}/blog/category/${c.slug}`,
          lastModified: c.updatedAt,
          changeFrequency: "weekly" as const,
          priority: 0.7,
        }),
      ),

      // ── Blog Tag Pages → /blog/tag/{slug} ────────────────────────────────
      ...blogTags.map((t: { slug: string; createdAt: Date | string }) => ({
        url: `${BASE_URL}/blog/tag/${t.slug}`,
        lastModified: t.createdAt,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
    ];
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // products-{page} — منتجات مقسّمة: 500 منتج لكل ملف
  // ═══════════════════════════════════════════════════════════════════════════
  if (id.startsWith("products-")) {
    const page = parseInt(id.split("-")[1], 10);

    const products = await prisma.product.findMany({
      where: { inStock: true },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      skip: page * ITEMS_PER_SITEMAP,
      take: ITEMS_PER_SITEMAP,
    });

    return products.map((p) => {
      const isRecent = now - new Date(p.updatedAt).getTime() < THIRTY_DAYS_MS;
      return {
        url: `${BASE_URL}/products/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: isRecent ? ("weekly" as const) : ("monthly" as const),
        priority: 0.9,
      };
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // blog-{page} — مقالات مقسّمة: 500 مقال لكل ملف
  // ═══════════════════════════════════════════════════════════════════════════
  if (id.startsWith("blog-")) {
    const page = parseInt(id.split("-")[1], 10);

    // getAllPublishedSlugs بترجع updatedAt مع كل مقال
    const allPosts = await getAllPublishedSlugs();
    const pagePosts = allPosts.slice(
      page * ITEMS_PER_SITEMAP,
      (page + 1) * ITEMS_PER_SITEMAP,
    );

    return pagePosts.map((p: { slug: string; updatedAt: Date | string }) => {
      const isRecent = now - new Date(p.updatedAt).getTime() < THIRTY_DAYS_MS;
      return {
        url: `${BASE_URL}/blog/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: isRecent ? ("weekly" as const) : ("monthly" as const),
        priority: 0.9,
      };
    });
  }

  // fallback — مش المفروض يوصل هنا
  return [];
}
