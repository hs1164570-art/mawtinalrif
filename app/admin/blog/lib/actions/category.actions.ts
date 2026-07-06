"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/db";
import { slugify, appendSlugSuffix } from "../../utils/slugify";
import {
  revalidateCategoryMeta,
  revalidateTagMeta,
} from "@/lib/blog/revalidate";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

async function uniqueCategorySlug(base: string, excludeId?: string) {
  let attempt = 1;
  let candidate = base;
  while (
    await prisma.blogCategory.findFirst({
      where: {
        slug: candidate,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    })
  ) {
    attempt += 1;
    candidate = appendSlugSuffix(base, attempt);
  }
  return candidate;
}

async function uniqueTagSlug(base: string, excludeId?: string) {
  let attempt = 1;
  let candidate = base;
  while (
    await prisma.blogTag.findFirst({
      where: {
        slug: candidate,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    })
  ) {
    attempt += 1;
    candidate = appendSlugSuffix(base, attempt);
  }
  return candidate;
}

// ─── Categories ───────────────────────────────────────────────────────────────

const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "اسم التصنيف مطلوب").max(100),
  description: z.string().max(500).optional(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "لون غير صالح")
    .default("#408fb4"),
});

export async function upsertCategory(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success)
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة",
    };
  const { id, name, description, color } = parsed.data;

  try {
    if (id) {
      // جلب الـ slug القديم قبل التحديث عشان نعمل revalidate عليه لو اتغيّر
      const before = await prisma.blogCategory.findUnique({
        where: { id },
        select: { slug: true },
      });
      const updated = await prisma.blogCategory.update({
        where: { id },
        data: { name, description, color },
      });

      // الاسم تغيّر لكن الـ slug مش بيتغيّر في الـ upsert — بس نعمل revalidate للسلامة
      revalidateCategoryMeta(updated.slug);
      if (before && before.slug !== updated.slug) {
        revalidateCategoryMeta(before.slug);
      }
      revalidatePath("/admin/blog/categories");
      return { success: true, data: { id: updated.id } };
    }

    const slug = await uniqueCategorySlug(slugify(name));
    const created = await prisma.blogCategory.create({
      data: { name, slug, description, color },
    });

    // تصنيف جديد — الـ listing page (الـ pills) لازم يتحدث
    revalidateCategoryMeta(created.slug);
    revalidatePath("/admin/blog/categories");
    return { success: true, data: { id: created.id } };
  } catch (err) {
    console.error("[upsertCategory]", err);
    return { success: false, error: "فشل حفظ التصنيف" };
  }
}

export async function deleteCategory(
  id: string,
): Promise<ActionResult<{ id: string }>> {
  try {
    const count = await prisma.blogPost.count({ where: { categoryId: id } });
    if (count > 0) {
      return {
        success: false,
        error: `لا يمكن حذف التصنيف — مرتبط بـ ${count} مقال. أزل الربط أولًا.`,
      };
    }

    const cat = await prisma.blogCategory.findUnique({
      where: { id },
      select: { slug: true },
    });
    await prisma.blogCategory.delete({ where: { id } });

    if (cat) revalidateCategoryMeta(cat.slug);
    revalidatePath("/admin/blog/categories");
    return { success: true, data: { id } };
  } catch (err) {
    console.error("[deleteCategory]", err);
    return { success: false, error: "فشل حذف التصنيف" };
  }
}

// ─── Tags ───────────────────────────────────────────────────────────────────

const tagSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "اسم الوسم مطلوب").max(60),
});

export async function upsertTag(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = tagSchema.safeParse(input);
  if (!parsed.success)
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة",
    };
  const { id, name } = parsed.data;

  try {
    if (id) {
      const before = await prisma.blogTag.findUnique({
        where: { id },
        select: { slug: true },
      });
      const updated = await prisma.blogTag.update({
        where: { id },
        data: { name },
      });

      revalidateTagMeta(updated.slug);
      if (before && before.slug !== updated.slug) {
        revalidateTagMeta(before.slug);
      }
      revalidatePath("/admin/blog/tags");
      return { success: true, data: { id: updated.id } };
    }

    const slug = await uniqueTagSlug(slugify(name));
    const created = await prisma.blogTag.create({ data: { name, slug } });

    revalidateTagMeta(created.slug);
    revalidatePath("/admin/blog/tags");
    return { success: true, data: { id: created.id } };
  } catch (err) {
    console.error("[upsertTag]", err);
    return { success: false, error: "فشل حفظ الوسم" };
  }
}

export async function deleteTag(
  id: string,
): Promise<ActionResult<{ id: string }>> {
  try {
    const tag = await prisma.blogTag.findUnique({
      where: { id },
      select: { slug: true },
    });
    await prisma.blogTag.delete({ where: { id } });

    if (tag) revalidateTagMeta(tag.slug);
    revalidatePath("/admin/blog/tags");
    return { success: true, data: { id } };
  } catch (err) {
    console.error("[deleteTag]", err);
    return { success: false, error: "فشل حذف الوسم" };
  }
}
