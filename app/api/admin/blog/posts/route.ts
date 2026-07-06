import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";
import { adminGuard } from "@/lib/Guards";
// ⚠️ بدّل المسار أعلاه لمكان ملف Guards.ts الفعلي عندك

import prisma from "@/lib/db";
import { getPosts } from "@/app/admin/blog/lib/queries/post.queries";
import { slugify, appendSlugSuffix } from "@/app/admin/blog/utils/slugify";
import { calculateReadingTime } from "@/app/admin/blog/utils/readingTime";
import { calculateSeoScore } from "@/app/admin/blog/utils/seoScore";

// ─── GET: قائمة مقالات مُرقّمة ─────────────────────────────────────────────────
const listSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "SCHEDULED", "ARCHIVED"]).optional(),
  categoryId: z.string().optional(),
  sortBy: z
    .enum(["createdAt", "publishedAt", "title", "viewCount", "seoScore"])
    .default("createdAt"),
  sortDir: z.enum(["asc", "desc"]).default("desc"),
});

export const GET = adminGuard(listSchema, async (_req, _userId, data) => {
  try {
    const result = await getPosts(data as any);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[GET /posts]", err);
    return NextResponse.json(
      { message: "فشل تحميل المقالات" },
      { status: 500 },
    );
  }
});

// ─── POST: إنشاء مقال جديد ─────────────────────────────────────────────────────
const createSchema = z.object({
  title: z.string().min(1, "العنوان مطلوب"),
  slug: z.string().optional(),
  content: z.any(),
  contentHtml: z.string().optional(),
  excerpt: z.string().optional(),
  coverImage: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  keywords: z.array(z.string()).default([]),
  status: z
    .enum(["DRAFT", "PUBLISHED", "SCHEDULED", "ARCHIVED"])
    .default("DRAFT"),
  categoryId: z.string().nullable().optional(),
  tagIds: z.array(z.string()).default([]),
});

export const POST = adminGuard(createSchema, async (_req, userId, data) => {
  try {
    const html = data.contentHtml ?? "";
    const baseSlug = slugify(data.slug || data.title);

    let attempt = 1;
    let finalSlug = baseSlug;
    while (
      await prisma.blogPost.findUnique({
        where: { slug: finalSlug },
        select: { id: true },
      })
    ) {
      attempt += 1;
      finalSlug = appendSlugSuffix(baseSlug, attempt);
    }

    const seoScore = calculateSeoScore({
      title: data.title,
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
      contentHtml: html,
      coverImage: data.coverImage,
      excerpt: data.excerpt,
      keywords: data.keywords,
    }).score;

    const post = await prisma.blogPost.create({
      data: {
        title: data.title,
        slug: finalSlug,
        content: data.content,
        contentHtml: html,
        excerpt: data.excerpt,
        coverImage: data.coverImage,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        keywords: data.keywords,
        status: data.status,
        publishedAt: data.status === "PUBLISHED" ? new Date() : null,
        categoryId: data.categoryId,
        readingTime: calculateReadingTime(html),
        seoScore,
        authorId: userId,
        tags:
          data.tagIds?.length ?
            { connect: data.tagIds.map((id) => ({ id })) }
          : undefined,
        activityLogs: { create: { action: "CREATED", userId } },
      },
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (err) {
    console.error("[POST /posts]", err);
    return NextResponse.json({ message: "فشل إنشاء المقال" }, { status: 500 });
  }
});
