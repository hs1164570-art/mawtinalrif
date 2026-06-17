/**
 * =====================================================================
 * app/sitemap.ts — Dynamic XML Sitemap
 * مؤسسة موطن الريف للتجارة — الرياض
 *
 * URL Structure (مطابق لما في المتصفح):
 *
 *   الصفحة الرئيسية     → /
 *   صفحة من نحن         → /about
 *   قسم رئيسي           → /products/collections/{slug}
 *   قسم فرعي            → /products/{parent-slug}/{child-slug}
 *   صفحة منتج           → /products/{product-slug}
 *
 * ✅ URLs صح 100%       → مطابقة لبنية الـ [...slug] route
 * ✅ أقسام رئيسية       → /products/collections/{slug}
 * ✅ أقسام فرعية        → /products/{parent}/{child}
 * ✅ منتجات             → /products/{slug}  (inStock فقط)
 * ✅ lastModified        → من Prisma لـ Google Freshness signals
 * ✅ Priority محسوبة     → 1.0 → 0.9 → 0.8 → 0.7
 * ✅ ISR ساعة            → يتجدد تلقائياً بدون re-build
 * =====================================================================
 */

import type { MetadataRoute } from "next";
import prisma from "@/lib/db";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://mawtinalriyf.com";

// ─── ISR: يجدد الـ sitemap كل ساعة تلقائياً ─────────────────────────────────
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ── Fetch Products — inStock فقط ─────────────────────────────────────────
  const products = await prisma.product.findMany({
    where: { inStock: true },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });

  // ── Fetch Categories مع parent slug لبناء الـ URL الصحيح ─────────────────
  const categories = await prisma.category.findMany({
    select: {
      slug: true,
      updatedAt: true,
      parent: {
        select: { slug: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  // ── فصل الأقسام الرئيسية عن الفرعية ─────────────────────────────────────
  const rootCategories = categories.filter((c) => c.parent === null);
  const subCategories = categories.filter((c) => c.parent !== null);

  // ─── 1. Static Pages ──────────────────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  // ─── 2. Root Category Pages → /products/collections/{slug} ───────────────
  // مطابق للـ URL اللي ظهر في الصورة الأولى:
  // localhost:3000/products/collections/decorations
  const rootCategoryPages: MetadataRoute.Sitemap = rootCategories.map(
    (cat) => ({
      url: `${BASE_URL}/products/collections/${cat.slug}`,
      lastModified: cat.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    }),
  );

  // ─── 3. Sub Category Pages → /products/{parent-slug}/{child-slug} ─────────
  // مطابق للـ URL اللي ظهر في الصورة الثانية:
  // localhost:3000/products/dining-room/coffee-tables
  const subCategoryPages: MetadataRoute.Sitemap = subCategories
    .filter((cat) => cat.parent !== null)
    .map((cat) => ({
      url: `${BASE_URL}/products/${cat.parent!.slug}/${cat.slug}`,
      lastModified: cat.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

  // ─── 4. Product Pages → /products/{slug} ─────────────────────────────────
  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${BASE_URL}/products/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: "daily" as const,
    priority: 0.9,
  }));

  // ─── Merge: ترتيب الأولوية مهم لـ Google ─────────────────────────────────
  return [
    ...staticPages, // / و /about
    ...rootCategoryPages, // /products/collections/{slug}
    ...subCategoryPages, // /products/{parent}/{child}
    ...productPages, // /products/{slug}
  ];
}
