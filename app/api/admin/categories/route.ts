import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/db";
import { adminGuard } from "@/lib/Guards";
import {
  CategoryFormSchema,
  CategoryFormValues,
  UpdateCategorySchema,
  DeleteCategorySchema,
} from "../../utils/categoriesSchema"; // تأكد من المسار
import { revalidateTag } from "next/cache";
import z from "zod";

/**
 * @method POST
 * @description add category and subCategories
 * @route /api/categories
 * @access private (only Admin)
 * */

// ------------------------------------------------------------------
// 1. POST: Add Category / SubCategories
// ------------------------------------------------------------------
type CreateNewData = Extract<CategoryFormValues, { mode: "CREATE_NEW" }>;
type AddExistingData = Extract<CategoryFormValues, { mode: "ADD_TO_EXISTING" }>;

export const POST = adminGuard(
  CategoryFormSchema,
  async (request, userId, data) => {
    try {
      if (data.mode === "CREATE_NEW") {
        await CreatNewCtg(data as CreateNewData); // استخدام as بيحل مشكلة الـ TS تماماً
      } else if (data.mode === "ADD_TO_EXISTING") {
        await AddToExisting(data as AddExistingData);
      }
      revalidateTag(`nav_ctg`);
      return NextResponse.json(
        { message: "Category structure created successfully" },
        { status: 201 },
      );
    } catch (error) {
      console.error("DB_ERROR:", error);
      return NextResponse.json(
        { message: "Failed to create category. Database error." },
        { status: 500 },
      );
    }
  },
);

const CreatNewCtg = async (data: CreateNewData) => {
  await prisma.$transaction(async (tx) => {
    const newCtg = await tx.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        image: data.image,
      },
    });

    if (data.children && data.children.length > 0) {
      await tx.category.createMany({
        data: data.children.map((el) => ({
          name: el.name,
          slug: el.slug,
          parentId: newCtg.id,
        })),
      });
    }
  });
};

const AddToExisting = async (data: AddExistingData) => {
  await prisma.category.createMany({
    data: data.children.map((el) => ({
      name: el.name,
      slug: el.slug,
      parentId: data.parentId,
    })),
  });
};

/**
 * @method PATCH
 * @description Update category and subCategories
 * @route /api/categories
 * @access private (only Admin)
 * */

// ------------------------------------------------------------------
// 2. PATCH: Update Category (Root or Sub)
// ------------------------------------------------------------------
export const PATCH = adminGuard(
  UpdateCategorySchema,
  async (request, userId, data) => {
    try {
      if (data.image) {
        await prisma.category.update({
          where: { id: data.id },
          data: {
            name: data.name,
            slug: data.slug,
            image: data.image,
            parentId: data.parentId,
          },
        });
      }
      revalidateTag(`nav_ctg`);

      return NextResponse.json(
        { message: "Category updated successfully" },
        { status: 200 },
      );
    } catch (error) {
      console.error("DB_ERROR:", error);
      return NextResponse.json(
        { message: "Failed to update category. Database error." },
        { status: 500 },
      );
    }
  },
);

/**
 * @method DELETE
 * @description DELETE category or subCategories
 * @route /api/categories
 * @access private (only Admin)
 * */

export const DELETE = adminGuard(
  DeleteCategorySchema,
  async (request, userId, data) => {
    try {
      // الـ cascade في الداتابيز هيمسح الأقسام الفرعية أوتوماتيك لو مسحت الأب
      await prisma.category.delete({
        where: { id: data.id },
      });

      revalidateTag(`nav_ctg`);

      return NextResponse.json(
        { message: "Category deleted successfully" },
        { status: 200 },
      );
    } catch (error) {
      console.error("DB_ERROR:", error);
      return NextResponse.json(
        { message: "Failed to delete category. Database error." },
        { status: 500 },
      );
    }
  },
);
