import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";
import { adminGuard } from "@/lib/Guards";
import prisma from "@/lib/db";
import { getPostById } from "@/app/admin/blog/lib/queries/post.queries";
import { slugify, appendSlugSuffix } from "@/app/admin/blog/utils/slugify";
import {
  calculateReadingTime,
  countWords,
} from "@/app/admin/blog/utils/readingTime";
import { calculateSeoScore } from "@/app/admin/blog/utils/seoScore";
import { validatePostForPublish } from "@/app/admin/blog/utils/validatePost";
import {
  revalidateBlogPost,
  revalidateDeletedPost,
} from "@/lib/blog/revalidate";

function extractId(request: NextRequest): string {
  const segments = request.nextUrl.pathname.split("/").filter(Boolean);
  return segments[segments.length - 1];
}

async function getCategorySlugById(
  categoryId: string | null | undefined,
): Promise<string | null> {
  if (!categoryId) return null;
  const cat = await prisma.blogCategory.findUnique({
    where: { id: categoryId },
    select: { slug: true },
  });
  return cat?.slug ?? null;
}

// ─── GET ────────────────────────────────────────────────────────────────────
export const GET = adminGuard(z.object({}), async (request) => {
  const id = extractId(request);
  const post = await getPostById(id);
  if (!post)
    return NextResponse.json({ message: "المقال غير موجود" }, { status: 404 });
  return NextResponse.json({ post });
});

// ─── PATCH ──────────────────────────────────────────────────────────────────
const patchSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().optional(),
  content: z.any().optional(),
  contentHtml: z.string().optional(),
  excerpt: z.string().optional(),
  coverImage: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "SCHEDULED", "ARCHIVED"]).optional(),
  scheduledFor: z.string().nullable().optional(),
  categoryId: z.string().nullable().optional(),
  tagIds: z.array(z.string()).optional(),
});

export const PATCH = adminGuard(patchSchema, async (request, userId, data) => {
  const id = extractId(request);

  const existing = await prisma.blogPost.findUnique({
    where: { id },
    select: {
      status: true,
      slug: true,
      categoryId: true,
      tags: { select: { slug: true } },
    },
  });
  if (!existing)
    return NextResponse.json({ message: "المقال غير موجود" }, { status: 404 });

  const html = data.contentHtml ?? "";

  if (data.status === "PUBLISHED") {
    const errors = validatePostForPublish({
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
      coverImage: data.coverImage,
      wordCount: countWords(html),
    });
    if (errors.length > 0) {
      return NextResponse.json({ message: errors[0] }, { status: 400 });
    }
  }

  let finalSlug = existing.slug;
  if (data.slug && data.slug !== existing.slug) {
    const base = slugify(data.slug);
    let attempt = 1;
    finalSlug = base;
    while (
      await prisma.blogPost.findFirst({
        where: { slug: finalSlug, id: { not: id } },
        select: { id: true },
      })
    ) {
      attempt += 1;
      finalSlug = appendSlugSuffix(base, attempt);
    }
  }

  const seoScore = calculateSeoScore({
    title: data.title ?? "",
    metaTitle: data.metaTitle,
    metaDescription: data.metaDescription,
    contentHtml: html,
    coverImage: data.coverImage,
    excerpt: data.excerpt,
    keywords: data.keywords,
  }).score;

  const oldCategorySlug = await getCategorySlugById(existing.categoryId);
  const newCategorySlug = await getCategorySlugById(data.categoryId);
  const oldTagSlugs = existing.tags.map((t) => t.slug);
  const newTagSlugs =
    data.tagIds ?
      (
        await prisma.blogTag.findMany({
          where: { id: { in: data.tagIds } },
          select: { slug: true },
        })
      ).map((t) => t.slug)
    : [];

  try {
    const updated = await prisma.blogPost.update({
      where: { id },
      data: {
        title: data.title,
        slug: finalSlug,
        content: data.content,
        contentHtml: data.contentHtml,
        excerpt: data.excerpt,
        coverImage: data.coverImage,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        keywords: data.keywords,
        status: data.status,
        scheduledFor:
          data.scheduledFor === undefined ? undefined
          : data.scheduledFor ? new Date(data.scheduledFor)
          : null,
        publishedAt:
          data.status === "PUBLISHED" && existing.status !== "PUBLISHED" ?
            new Date()
          : undefined,
        categoryId: data.categoryId,
        readingTime:
          data.contentHtml !== undefined ?
            calculateReadingTime(html)
          : undefined,
        seoScore,
        tags:
          data.tagIds ?
            { set: data.tagIds.map((tid) => ({ id: tid })) }
          : undefined,
        activityLogs: {
          create: {
            action:
              data.status && data.status !== existing.status ?
                "STATUS_CHANGED"
              : "UPDATED",
            userId,
            metadata:
              data.status ?
                { previousStatus: existing.status, newStatus: data.status }
              : undefined,
          },
        },
      },
    });

    // ─── Revalidate ISR cache ─────────────────────────────────────────────────
    revalidateBlogPost({
      slug: finalSlug,
      previousSlug: existing.slug !== finalSlug ? existing.slug : undefined,
      categorySlug: newCategorySlug ?? oldCategorySlug,
      tagSlugs: [...new Set([...oldTagSlugs, ...newTagSlugs])],
    });

    return NextResponse.json({ post: updated });
  } catch (err) {
    console.error("[PATCH /posts/:id]", err);
    return NextResponse.json({ message: "فشل تحديث المقال" }, { status: 500 });
  }
});

// ─── DELETE ─────────────────────────────────────────────────────────────────
export const DELETE = adminGuard(z.object({}), async (request, _userId) => {
  const id = extractId(request);
  try {
    // جلب بيانات الـ post قبل الحذف عشان نعمل revalidate بعده بالـ slugs الصح
    const post = await prisma.blogPost.findUnique({
      where: { id },
      select: {
        slug: true,
        categoryId: true,
        tags: { select: { slug: true } },
      },
    });

    await prisma.blogPost.delete({ where: { id } });

    if (post) {
      const categorySlug = await getCategorySlugById(post.categoryId);
      revalidateDeletedPost({
        slug: post.slug,
        categorySlug,
        tagSlugs: post.tags.map((t) => t.slug),
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /posts/:id]", err);
    return NextResponse.json({ message: "فشل حذف المقال" }, { status: 500 });
  }
});
