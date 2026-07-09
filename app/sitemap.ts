/**
 * =====================================================================
 * app/sitemap.ts — Dynamic XML Sitemap
 * مؤسسة موطن الريف للتجارة — الرياض
 *
 * ملف واحد بسيط — بدون generateSitemaps()
 * السبب: generateSitemaps() مع string IDs بيعمل 404 في Production
 * 900 منتج + 500 مقال = ~1500 URL — ملف واحد مثالي (حد Google: 50,000)
 *
 * ── الصفحات المشمولة ──────────────────────────────────────────────────
 *   Static pages       → / + /about + /contact + legal pages
 *   Product categories → /products/collections/{slug}
 *   Product sub cats   → /products/{parent}/{child}
 *   Products           → /products/{slug} (inStock فقط)
 *   Blog listing       → /blog
 *   Blog posts         → /blog/{slug} (PUBLISHED فقط)
 *   Blog categories    → /blog/category/{slug}
 *   Blog tags          → /blog/tag/{slug}
 * =====================================================================
 */

import type { MetadataRoute } from "next";
import prisma from "@/lib/db";
import {
  getAllPublishedSlugs,
  getAllCategorySlugs,
  getAllTagSlugs,
} from "@/lib/blog/queries";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://mawtinalriyf.com";
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = Date.now();

  // ── Parallel fetch — أقل latency ──────────────────────────────────────────
  const [products, allCategories, blogPosts, blogCategories, blogTags] =
    await Promise.all([
      prisma.product.findMany({
        where: { inStock: true },
        select: { slug: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.category.findMany({
        select: {
          slug: true,
          updatedAt: true,
          parent: { select: { slug: true } },
        },
      }),
      getAllPublishedSlugs(),
      getAllCategorySlugs(),
      getAllTagSlugs(),
    ]);

  const rootCats = allCategories.filter((c) => !c.parent);
  const subCats = allCategories.filter((c) => c.parent);

  // ── 1. Static Pages ───────────────────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
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
  ];

  // ── 2. Product Root Categories ────────────────────────────────────────────
  const rootCategoryPages: MetadataRoute.Sitemap = rootCats.map((c) => ({
    url: `${BASE_URL}/products/collections/${c.slug}`,
    lastModified: c.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  // ── 3. Product Sub Categories ─────────────────────────────────────────────
  const subCategoryPages: MetadataRoute.Sitemap = subCats
    .filter((c) => c.parent !== null)
    .map((c) => ({
      url: `${BASE_URL}/products/${c.parent!.slug}/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

  // ── 4. Products ───────────────────────────────────────────────────────────
  const productPages: MetadataRoute.Sitemap = products.map((p) => {
    const isRecent = now - new Date(p.updatedAt).getTime() < THIRTY_DAYS_MS;
    return {
      url: `${BASE_URL}/products/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: isRecent ? ("weekly" as const) : ("monthly" as const),
      priority: 0.9,
    };
  });

  // ── 5. Blog Posts ─────────────────────────────────────────────────────────
  const blogPostPages: MetadataRoute.Sitemap = blogPosts.map(
    (p: { slug: string; updatedAt: Date | string }) => {
      const isRecent = now - new Date(p.updatedAt).getTime() < THIRTY_DAYS_MS;
      return {
        url: `${BASE_URL}/blog/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: isRecent ? ("weekly" as const) : ("monthly" as const),
        priority: 0.9,
      };
    },
  );

  // ── 6. Blog Categories ────────────────────────────────────────────────────
  const blogCategoryPages: MetadataRoute.Sitemap = blogCategories.map(
    (c: { slug: string; updatedAt: Date | string }) => ({
      url: `${BASE_URL}/blog/category/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }),
  );

  // ── 7. Blog Tags ──────────────────────────────────────────────────────────
  const blogTagPages: MetadataRoute.Sitemap = blogTags.map(
    (t: { slug: string; createdAt: Date | string }) => ({
      url: `${BASE_URL}/blog/tag/${t.slug}`,
      lastModified: t.createdAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }),
  );

  // ── Merge ─────────────────────────────────────────────────────────────────
  return [
    ...staticPages,
    ...rootCategoryPages,
    ...subCategoryPages,
    ...productPages,
    ...blogPostPages,
    ...blogCategoryPages,
    ...blogTagPages,
  ];
}
