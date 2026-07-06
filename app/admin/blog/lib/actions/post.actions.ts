"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import type { JSONContent } from "@tiptap/core";
import prisma from "@/lib/db";
import { auth } from "@/auth";

import { calculateReadingTime, countWords } from "../../utils/readingTime";
import { excerptFromContent } from "../../utils/excerptFromContent";
import { calculateSeoScore } from "../../utils/seoScore";
import { validatePostForPublish } from "../../utils/validatePost";
import { slugify, appendSlugSuffix } from "../../utils/slugify";
import { revalidateBlogPost } from "@/lib/blog/revalidate";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

async function getCurrentAdminUserId(): Promise<string> {
  const session = await auth();
  const userId = session?.user?.id;
  const role = session?.user?.role;
  if (!session || !userId || role !== "ADMIN") {
    throw new Error("غير مصرح لك بهذا الإجراء — يجب تسجيل الدخول كأدمن.");
  }
  return userId;
}

async function ensureUniqueSlug(
  baseSlug: string,
  excludeId?: string,
): Promise<string> {
  let attempt = 1;
  let candidate = baseSlug;
  while (true) {
    const existing = await prisma.blogPost.findFirst({
      where: {
        slug: candidate,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true },
    });
    if (!existing) return candidate;
    attempt += 1;
    candidate = appendSlugSuffix(baseSlug, attempt);
  }
}

async function getTagSlugsByIds(tagIds: string[]): Promise<string[]> {
  if (!tagIds.length) return [];
  const tags = await prisma.blogTag.findMany({
    where: { id: { in: tagIds } },
    select: { slug: true },
  });
  return tags.map((t) => t.slug);
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

// ════════════════════════════════════════════════════════════════════════════
// Autosave — DRAFT only, no public cache revalidation needed
// ════════════════════════════════════════════════════════════════════════════

const autosaveSchema = z.object({
  id: z.string().nullable().optional(),
  title: z.string().default(""),
  content: z.any().optional(),
  contentHtml: z.string().optional(),
  excerpt: z.string().optional(),
  coverImage: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  keywords: z.array(z.string()).default([]),
  status: z.enum(["DRAFT", "SCHEDULED", "ARCHIVED"]).optional(),
  scheduledFor: z.string().nullable().optional(),
  categoryId: z.string().nullable().optional(),
  tagIds: z.array(z.string()).default([]),
});

export async function autosaveDraft(
  input: unknown,
): Promise<ActionResult<{ id: string; seoScore: number }>> {
  const parsed = autosaveSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة",
    };
  }

  try {
    const authorId = await getCurrentAdminUserId();
    const { id, tagIds, ...rest } = parsed.data;
    const html = rest.contentHtml ?? "";
    const safeTitle = rest.title.trim() || "بلا عنوان";
    const excerpt = rest.excerpt || excerptFromContent(html);
    const seoScore = calculateSeoScore({
      title: safeTitle,
      metaTitle: rest.metaTitle,
      metaDescription: rest.metaDescription,
      contentHtml: html,
      coverImage: rest.coverImage,
      excerpt,
      keywords: rest.keywords,
    }).score;

    if (id) {
      const updated = await prisma.blogPost.update({
        where: { id },
        data: {
          title: safeTitle,
          content: rest.content ?? undefined,
          contentHtml: html || undefined,
          excerpt,
          coverImage: rest.coverImage,
          metaTitle: rest.metaTitle,
          metaDescription: rest.metaDescription,
          keywords: rest.keywords,
          status: rest.status,
          scheduledFor:
            rest.scheduledFor ? new Date(rest.scheduledFor)
            : rest.scheduledFor === null ? null
            : undefined,
          categoryId: rest.categoryId,
          readingTime: calculateReadingTime(html),
          seoScore,
          tags: { set: tagIds.map((tid) => ({ id: tid })) },
        },
      });
      return { success: true, data: { id: updated.id, seoScore } };
    }

    const uniqueSlug = await ensureUniqueSlug(slugify(safeTitle));
    const created = await prisma.blogPost.create({
      data: {
        title: safeTitle,
        slug: uniqueSlug,
        content: rest.content ?? { type: "doc", content: [] },
        contentHtml: html || null,
        excerpt,
        coverImage: rest.coverImage,
        metaTitle: rest.metaTitle,
        metaDescription: rest.metaDescription,
        keywords: rest.keywords,
        status: "DRAFT",
        categoryId: rest.categoryId,
        readingTime: calculateReadingTime(html),
        seoScore,
        authorId,
        tags:
          tagIds.length ?
            { connect: tagIds.map((tid) => ({ id: tid })) }
          : undefined,
        activityLogs: { create: { action: "CREATED", userId: authorId } },
      },
    });
    return { success: true, data: { id: created.id, seoScore } };
  } catch (err) {
    console.error("[autosaveDraft]", err);
    return {
      success: false,
      error:
        err instanceof Error && err.message.includes("غير مصرح") ?
          err.message
        : "فشل الحفظ التلقائي",
    };
  }
}

// ════════════════════════════════════════════════════════════════════════════
// savePost — full publish/update with ISR cache revalidation
// ════════════════════════════════════════════════════════════════════════════

const savePostSchema = z.object({
  id: z.string().nullable().optional(),
  title: z.string().min(1, "العنوان مطلوب"),
  slug: z.string().min(1, "الرابط مطلوب"),
  content: z.any(),
  contentHtml: z.string().optional(),
  excerpt: z.string().optional(),
  coverImage: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  keywords: z.array(z.string()).default([]),
  status: z.enum(["DRAFT", "PUBLISHED", "SCHEDULED", "ARCHIVED"]),
  scheduledFor: z.string().nullable().optional(),
  categoryId: z.string().nullable().optional(),
  tagIds: z.array(z.string()).default([]),
});

export async function savePost(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = savePostSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة",
    };
  }
  const data = parsed.data;
  const html = data.contentHtml ?? "";

  if (data.status === "PUBLISHED") {
    const errors = validatePostForPublish({
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
      coverImage: data.coverImage,
      wordCount: countWords(html),
    });
    if (errors.length > 0) return { success: false, error: errors[0] };
  }

  try {
    const authorId = await getCurrentAdminUserId();
    const excerpt = data.excerpt || excerptFromContent(html);
    const seoScore = calculateSeoScore({
      title: data.title,
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
      contentHtml: html,
      coverImage: data.coverImage,
      excerpt,
      keywords: data.keywords,
    }).score;
    const readingTime = calculateReadingTime(html);
    const isPublishing = data.status === "PUBLISHED";
    const tagSlugs = await getTagSlugsByIds(data.tagIds);
    const newCategorySlug = await getCategorySlugById(data.categoryId);

    if (data.id) {
      const before = await prisma.blogPost.findUnique({
        where: { id: data.id },
        select: {
          status: true,
          slug: true,
          categoryId: true,
          tags: { select: { slug: true } },
        },
      });

      const finalSlug =
        before && before.slug !== data.slug ?
          await ensureUniqueSlug(slugify(data.slug), data.id)
        : data.slug;

      const oldCategorySlug = await getCategorySlugById(before?.categoryId);
      const oldTagSlugs = before?.tags.map((t) => t.slug) ?? [];

      const updated = await prisma.blogPost.update({
        where: { id: data.id },
        data: {
          title: data.title,
          slug: finalSlug,
          content: data.content,
          contentHtml: html,
          excerpt,
          coverImage: data.coverImage,
          metaTitle: data.metaTitle,
          metaDescription: data.metaDescription,
          keywords: data.keywords,
          status: data.status,
          scheduledFor: data.scheduledFor ? new Date(data.scheduledFor) : null,
          publishedAt:
            isPublishing && before?.status !== "PUBLISHED" ?
              new Date()
            : undefined,
          categoryId: data.categoryId,
          readingTime,
          seoScore,
          tags: { set: data.tagIds.map((tid) => ({ id: tid })) },
          activityLogs: {
            create: {
              action:
                before?.status !== data.status ? "STATUS_CHANGED" : "UPDATED",
              userId: authorId,
              metadata: {
                previousStatus: before?.status,
                newStatus: data.status,
              },
            },
          },
        },
      });

      // ─── Revalidate ISR cache ─────────────────────────────────────────────
      revalidateBlogPost({
        slug: finalSlug,
        previousSlug: before?.slug !== finalSlug ? before?.slug : undefined,
        categorySlug: newCategorySlug ?? oldCategorySlug,
        tagSlugs: [...new Set([...oldTagSlugs, ...tagSlugs])],
      });

      revalidatePath("/admin/blog");
      return { success: true, data: { id: updated.id } };
    }

    // ─── Create new post ──────────────────────────────────────────────────────
    const uniqueSlug = await ensureUniqueSlug(slugify(data.slug || data.title));

    const created = await prisma.blogPost.create({
      data: {
        title: data.title,
        slug: uniqueSlug,
        content: data.content,
        contentHtml: html,
        excerpt,
        coverImage: data.coverImage,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        keywords: data.keywords,
        status: data.status,
        scheduledFor: data.scheduledFor ? new Date(data.scheduledFor) : null,
        publishedAt: isPublishing ? new Date() : null,
        categoryId: data.categoryId,
        readingTime,
        seoScore,
        authorId,
        tags:
          data.tagIds.length ?
            { connect: data.tagIds.map((tid) => ({ id: tid })) }
          : undefined,
        activityLogs: {
          create: {
            action: isPublishing ? "PUBLISHED" : "CREATED",
            userId: authorId,
          },
        },
      },
    });

    if (isPublishing) {
      revalidateBlogPost({
        slug: uniqueSlug,
        categorySlug: newCategorySlug,
        tagSlugs,
      });
    }

    revalidatePath("/admin/blog");
    return { success: true, data: { id: created.id } };
  } catch (err) {
    console.error("[savePost]", err);
    return {
      success: false,
      error:
        err instanceof Error && err.message.includes("غير مصرح") ?
          err.message
        : "فشل حفظ المقال",
    };
  }
}

// ════════════════════════════════════════════════════════════════════════════
// getPostForEditing
// ════════════════════════════════════════════════════════════════════════════

export interface PostEditData {
  id: string;
  title: string;
  slug: string;
  content: JSONContent;
  contentHtml: string;
  excerpt: string;
  coverImage: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  status: string;
  scheduledFor: string | null;
  categoryId: string | null;
  tagIds: string[];
}

export async function getPostForEditing(
  id: string,
): Promise<ActionResult<PostEditData>> {
  try {
    await getCurrentAdminUserId();
    const post = await prisma.blogPost.findUnique({
      where: { id },
      include: { tags: { select: { id: true } } },
    });
    if (!post) return { success: false, error: "المقال غير موجود" };

    return {
      success: true,
      data: {
        id: post.id,
        title: post.title,
        slug: post.slug,
        content: post.content as JSONContent,
        contentHtml: post.contentHtml ?? "",
        excerpt: post.excerpt ?? "",
        coverImage: post.coverImage ?? "",
        metaTitle: post.metaTitle ?? "",
        metaDescription: post.metaDescription ?? "",
        keywords: post.keywords,
        status: post.status,
        scheduledFor: post.scheduledFor?.toISOString() ?? null,
        categoryId: post.categoryId,
        tagIds: post.tags.map((t) => t.id),
      },
    };
  } catch (err) {
    console.error("[getPostForEditing]", err);
    return {
      success: false,
      error:
        err instanceof Error && err.message.includes("غير مصرح") ?
          err.message
        : "فشل تحميل المقال",
    };
  }
}
