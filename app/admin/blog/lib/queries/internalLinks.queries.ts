import prisma from "@/lib/db";
// ⚠️ عدّل المسار أعلاه لو عميل Prisma بتاعك مُصدَّر من ملف مختلف (مثل @/lib/db)

export interface InternalLinkCandidate {
  title: string;
  url: string;
  type: "post" | "category";
}

// ─── روابط من مقالات المدونة المنشورة فعليًا ──────────────────────────────────
export async function getBlogInternalLinkCandidates(
  excludePostId?: string,
  limit = 12,
): Promise<InternalLinkCandidate[]> {
  const posts = await prisma.blogPost.findMany({
    where: {
      status: "PUBLISHED",
      ...(excludePostId ? { id: { not: excludePostId } } : {}),
    },
    select: { title: true, slug: true },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });

  return posts.map((p) => ({
    title: p.title,
    url: `/blog/${p.slug}`,
    type: "post" as const,
  }));
}

// ─── روابط لتصنيفات المدونة (fallback لو المقالات قليلة) ──────────────────────
export async function getBlogCategoryLinkCandidates(
  limit = 8,
): Promise<InternalLinkCandidate[]> {
  const categories = await prisma.blogCategory.findMany({
    select: { name: true, slug: true },
    take: limit,
  });

  return categories.map((c) => ({
    title: c.name,
    url: `/blog/category/${c.slug}`,
    type: "category" as const,
  }));
}

// ─── نقطة تجميع واحدة تستخدمها AI actions ─────────────────────────────────────
// ملاحظة: لو عايز تربط لصفحات منتجات/فئات المتجر نفسه (مش المدونة)، زوّد هنا
// استدعاء مشابه لموديل Product بتاعك، مثلاً:
//   const products = await prisma.product.findMany({ select: { name: true, slug: true }, take: 10 });
//   candidates.push(...products.map(p => ({ title: p.name, url: `/products/${p.slug}`, type: "product" })));
export async function getInternalLinkCandidates(
  excludePostId?: string,
): Promise<InternalLinkCandidate[]> {
  const [posts, categories] = await Promise.all([
    getBlogInternalLinkCandidates(excludePostId),
    getBlogCategoryLinkCandidates(),
  ]);
  return [...posts, ...categories];
}
