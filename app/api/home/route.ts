// api/home

import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { HOME_SUPER_TAG } from "@/lib/constants";

export async function GET() {
  const startTime = Date.now();

  try {
    const dbCategories = await prisma.category.findMany({
      where: { parentId: null },
      select: {
        id: true,
        name: true,
        slug: true,
        image: true,
        children: {
          select: {
            products: {
              where: {
                inStock: true,
                countStock: { gt: 0 },
              },
              select: {
                name: true,
                slug: true,
                image: true,
                gallery: true,
                price: true,
                discount: true,
                rating: true,
                countStock: true,
                createdAt: true,
                _count: {
                  select: { comments: true },
                },
              },
              orderBy: { createdAt: "desc" },
              take: 8, // كافية جداً لتجميع العينة
            },
          },
        },
      },
    });

    // تجميع كل المنتجات المستوفية للشروط في مصفوفة واحدة (Global Pool) عشان الـ Fallback
    const allValidProducts = dbCategories.flatMap((mainCat) =>
      mainCat.children.flatMap((subCat) => subCat.products),
    );

    // ── Product Sections ───────────────────────────────────
    const desiredCounts = [4, 5, 7, 8];

    const productSections = dbCategories.map((cat, index) => {
      const countNeeded = desiredCounts[index % desiredCounts.length];

      // تجميع المنتجات الخاصة بالقسم الحالي
      let originalProducts = cat.children.flatMap((sub) => sub.products);

      // هنا الأمان الفعلي (Fallback Logic): لو فيه عجز، كمل من الـ Pool العام
      if (
        originalProducts.length < countNeeded &&
        allValidProducts.length > 0
      ) {
        const extraProducts = allValidProducts
          .filter((p) => !originalProducts.some((fp) => fp.slug === p.slug)) // منع التكرار
          .slice(0, countNeeded - originalProducts.length);

        originalProducts = [...originalProducts, ...extraProducts];
      } else {
        // لو كتير قصهم على قد المطلوب بالظبط
        originalProducts = originalProducts.slice(0, countNeeded);
      }

      return {
        categoryName: cat.name,
        categorySlug: cat.slug,
        products: originalProducts,
      };
    });

    // ── Hero Section ───────────────────────────────────────
    const heroSection = [
      ...dbCategories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        image: cat.image,
      })),
      {
        id: "custom-order-id",
        name: "تفصيل حسب الطلب",
        slug: "custom-made",
        image:
          "https://bwmvrztnbjayktocsdvc.supabase.co/storage/v1/object/public/Protofolio/order.jpeg",
      },
    ];

    return new NextResponse(
      JSON.stringify({
        success: true,
        executionTime: `${Date.now() - startTime}ms`,
        data: { heroSection, productSections },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          // 1. تفعيل الكاش على السيرفر لـ Next.js
          "Cache-Control": "s-maxage=31536000, stale-while-revalidate",
        },
        // 2. ربط الـ API بالتاغ الموحد عشان يتضرب مع كاش السيرفر
        next: {
          tags: [HOME_SUPER_TAG],
        },
      } as any, // حطيت as any هنا احتياطاً لأن Typescript ساعات بيرخم مع الـ next property جوه الـ NextResponse العادي
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("Home API Error:", msg);
    return NextResponse.json(
      { success: false, error: "حدث خطأ في السيرفر" },
      { status: 500 },
    );
  }
}
