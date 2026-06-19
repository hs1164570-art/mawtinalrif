import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { adminGuard } from "@/lib/Guards";
import {
  CreateProductSchema,
  UpdateProductSchema,
  DeleteProductSchema,
} from "../../utils/productSchema";
import redisClient from "@/lib/redisClient";
import { revalidatePath, revalidateTag } from "next/cache";
import z from "zod";

const GetSchema = z.object({
  search: z.string().optional(),
  categoryId: z.string().optional(),
  sort: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).default(10),
});

export const GET = adminGuard(
  GetSchema, // لو الـ Guard بيجبرك على Schema، مرر زود schema بسيط أو احذفه إذا كان التحقق يدوياً
  async (request: NextRequest) => {
    try {
      const sp = request.nextUrl.searchParams;

      // 1. استخراج محددات الفلترة والبحث من الـ URL (مطابقة تماماً للـ الفرونت إند و nuqs)
      const search = sp.get("q") || ""; // كلمة البحث في اسم المنتج
      const categorySlug = sp.get("cat") || ""; // الـ slug الخاص بالفئة المحددة
      const sort = sp.get("sort") || "newest"; // الترتيب (الأحدث، الأسعار...)
      const page = Math.max(1, Number(sp.get("page")) || 1);
      const limit = Math.max(1, Number(sp.get("limit")) || 12); // افتراضي 12 ليطابق الـ limit في الفرونت إند
      const skip = (page - 1) * limit;

      // 2. بناء كائن الشروط (Where Clause) الديناميكي
      const whereClause: any = {};

      // أ) البحث بالاسم (يدعم العربي والإنجليزي)
      if (search) {
        whereClause.name = {
          contains: search,
          mode: "insensitive",
        };
      }

      // ب) فلترة الفئات عن طريق الـ slug
      // ملحوظة: بما أن الفرونت إند يرسل slug، نبحث داخلياً في علاقة الفئة
      if (categorySlug && categorySlug !== "all") {
        whereClause.category = {
          slug: categorySlug,
        };
        // ملاحظة: لو كنت تخزن الـ slugs في جدول الـ subCategory، استبدلها بـ:
        // whereClause.subCategory = { slug: categorySlug };
      }

      // 3. تحديد طريقة الترتيب
      let orderBy: any = { createdAt: "desc" }; // الافتراضي: الأحدث
      if (sort === "oldest") {
        orderBy = { createdAt: "asc" };
      } else if (sort === "price-asc") {
        orderBy = { price: "asc" };
      } else if (sort === "price-desc") {
        orderBy = { price: "desc" };
      } else if (sort === "stock-low") {
        orderBy = { countStock: "asc" }; // ترتيب الأدمن لرؤية النواقص أولاً
      }

      // 4. جلب البيانات من قاعدة البيانات (Products + Total Count) بالتوازي
      const [products, totalProducts] = await prisma.$transaction([
        prisma.product.findMany({
          where: whereClause,
          orderBy: orderBy,
          skip: skip,
          take: limit,
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        }),
        prisma.product.count({ where: whereClause }),
      ]);

      // 5. حسابات الـ Pagination عشان الفرونت إند
      const totalPages = Math.ceil(totalProducts / limit);

      return NextResponse.json(
        {
          success: true,
          products,
          // الفرونت إند يتوقع كائن meta يحتوي على البيانات التالية ليعرض الإجمالي والصفحات
          meta: {
            totalCount: totalProducts,
            totalPages,
            currentPage: page,
            limit,
          },
        },
        {},
      );
    } catch (error) {
      console.error("[ADMIN_PRODUCTS_GET_ERR]", error);
      return NextResponse.json(
        { message: "فشل في جلب البيانات من السيرفر" },
        { status: 500 },
      );
    }
  },
);
// ─────────────────────────────────────────────────────────────
// 3. POST: إنشاء منتج جديد (Admin Only)
// ─────────────────────────────────────────────────────────────

export const POST = adminGuard(
  CreateProductSchema,
  async (_req, _userId, data) => {
    try {
      const existing = await prisma.product.findUnique({
        where: { slug: data.slug },
        select: { id: true },
      });

      if (existing) {
        return NextResponse.json(
          { message: "Slug already in use." },
          { status: 409 },
        );
      }

      const categoryExists = await prisma.category.findUnique({
        where: { id: data.subCategoryId },
      });

      if (!categoryExists) {
        return NextResponse.json(
          { message: "Category not found." },
          { status: 404 },
        );
      }

      const product = await prisma.product.create({ data });
      revalidatePath(`/`);
      revalidateTag("products");
      revalidateTag(`summary`);
      try {
        redisClient
          .hIncrBy("stats:total:allStats", "totalProducts", 1)
          .catch((err) => console.error("Redis Incr Error:", err));
      } catch (e) {
        console.error("Redis incre totalproducts err Error:", e);
      }
      return NextResponse.json(
        { message: "Product created", product },
        { status: 201 },
      );
    } catch (error) {
      return NextResponse.json({ message: "Internal error" }, { status: 500 });
    }
  },
);

// ─────────────────────────────────────────────────────────────
// 4. PATCH: تعديل منتج موجود (Admin Only)
// ─────────────────────────────────────────────────────────────
export const PATCH = adminGuard(
  UpdateProductSchema,
  async (_req, _userId, data) => {
    try {
      const { id, ...updateData } = data;

      // التأكد أن المنتج موجود
      const existingProduct = await prisma.product.findUnique({
        where: { id },
        select: {
          slug: true,
        },
      });

      if (!existingProduct) {
        return NextResponse.json(
          { message: "Product not found" },
          { status: 404 },
        );
      }

      // لو السلج اتغير، نتأكد إنه مش مستخدم
      if (updateData.slug && updateData.slug !== existingProduct.slug) {
        const slugExists = await prisma.product.findUnique({
          where: { slug: updateData.slug },
        });
        if (slugExists) {
          return NextResponse.json(
            { message: "New slug already in use" },
            { status: 409 },
          );
        }
      }

      const updated = await prisma.product.update({
        where: { id },
        data: updateData,
      });
      revalidatePath(`/`);
      revalidateTag("products");
      revalidateTag(`product-${existingProduct.slug}`);
      revalidateTag(`summary`);

      return NextResponse.json(
        { message: "Product updated", product: updated },
        { status: 200 },
      );
    } catch (error) {
      return NextResponse.json({ message: "Update failed" }, { status: 500 });
    }
  },
);

// ─────────────────────────────────────────────────────────────
// 5. DELETE: حذف منتج (Admin Only)
// ─────────────────────────────────────────────────────────────
export const DELETE = adminGuard(
  DeleteProductSchema,
  async (_req, _userId, data) => {
    try {
      const existingProduct = await prisma.product.findUnique({
        where: { id: data.id },
        select: { slug: true },
      });

      if (!existingProduct) {
        return NextResponse.json(
          { message: "Product not found" },
          { status: 404 },
        );
      }

      await prisma.product.delete({
        where: { id: data.id },
      });

      revalidatePath(`/`);
      revalidateTag("products");
      revalidateTag(`summary`);

      // try {
      //   // حطينا await هنا عشان تضمن استقرار العملية
      //   await redisClient.hIncrBy("stats:total:allStats", "totalProducts", -1);
      // } catch (err) {
      //   console.error("Redis Incr Error:", err);
      // }

      return NextResponse.json(
        { message: "Product deleted successfully" },
        { status: 200 },
      );
    } catch (error) {
      console.error("❌ Database Delete Error:", error);
      return NextResponse.json({ message: "Delete failed" }, { status: 500 });
    }
  },
);
