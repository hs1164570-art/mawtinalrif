import { NextResponse } from "next/server";
import { z } from "zod";
import { adminGuard } from "@/lib/Guards";
import prisma from "@/lib/db";
import {
  revalidateBlogPost,
  revalidateDeletedPost,
} from "@/lib/blog/revalidate";

// ─── Helper ───────────────────────────────────────────────────────────────────
async function getPostRevalidationData(ids: string[]) {
  return prisma.blogPost.findMany({
    where: { id: { in: ids } },
    select: {
      slug: true,
      categoryId: true,
      tags: { select: { slug: true } },
      category: { select: { slug: true } },
    },
  });
}

// ─── PATCH: bulk status change ────────────────────────────────────────────────
const bulkSchema = z.object({
  ids: z.array(z.string()).min(1, "اختر مقالًا واحدًا على الأقل"),
  status: z.enum(["DRAFT", "PUBLISHED", "SCHEDULED", "ARCHIVED"]),
});

export const PATCH = adminGuard(bulkSchema, async (_req, userId, data) => {
  try {
    // جلب بيانات الـ slugs قبل التحديث عشان نعمل revalidate الصح
    const posts = await getPostRevalidationData(data.ids);

    await prisma.$transaction([
      prisma.blogPost.updateMany({
        where: { id: { in: data.ids } },
        data: {
          status: data.status,
          publishedAt: data.status === "PUBLISHED" ? new Date() : undefined,
        },
      }),
      prisma.postActivityLog.createMany({
        data: data.ids.map((postId) => ({
          postId,
          action: "STATUS_CHANGED" as const,
          userId,
          metadata: { newStatus: data.status },
        })),
      }),
    ]);

    // ─── Revalidate ISR cache for every affected post ──────────────────────
    for (const post of posts) {
      revalidateBlogPost({
        slug: post.slug,
        categorySlug: post.category?.slug ?? null,
        tagSlugs: post.tags.map((t) => t.slug),
      });
    }

    return NextResponse.json({ success: true, count: data.ids.length });
  } catch (err) {
    console.error("[PATCH /posts/bulk]", err);
    return NextResponse.json(
      { message: "فشل تحديث المقالات" },
      { status: 500 },
    );
  }
});

// ─── DELETE: bulk delete ──────────────────────────────────────────────────────
// ─── DELETE: bulk delete ──────────────────────────────────────────────────────
// ─── DELETE: bulk delete ──────────────────────────────────────────────────────
const bulkDeleteSchema = z.object({
  ids: z.string().min(1, "اختر مقالًا واحدًا على الأقل"),
});

export const DELETE = adminGuard(
  bulkDeleteSchema,
  async (_req, _userId, data) => {
    try {
      const ids = data.ids.split(",").filter(Boolean);

      // جلب بيانات الـ slugs قبل الحذف — بعد الحذف مش هنلاقيهم في DB
      const posts = await getPostRevalidationData(ids);

      const result = await prisma.blogPost.deleteMany({
        where: { id: { in: ids } },
      });

      // ─── Revalidate ISR cache for every deleted post ───────────────────────
      for (const post of posts) {
        revalidateDeletedPost({
          slug: post.slug,
          categorySlug: post.category?.slug ?? null,
          tagSlugs: post.tags.map((t) => t.slug),
        });
      }

      return NextResponse.json({ success: true, count: result.count });
    } catch (err) {
      console.error("[DELETE /posts/bulk]", err);
      return NextResponse.json(
        { message: "فشل حذف المقالات" },
        { status: 500 },
      );
    }
  },
);
