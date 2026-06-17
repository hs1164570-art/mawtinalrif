import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/db";

/**
 * @method GET
 * @description GET user profile
 * @route /api/users/profile
 * @access private (only Admin and user)
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const userProfile = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        // ── User Info ──────────────────────────────
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        status: true,
        country: true, // ✅ موجود في Schema وممكن يفيد في صفحة Profile
        createdAt: true, // ✅ تاريخ انضمام المستخدم

        // ── Cart (أحدث 4 منتجات فقط للعرض السريع) ─
        cart: {
          take: 4,
          orderBy: { createdAt: "desc" }, // ✅ أحدث المضافين أولاً
          select: {
            id: true,
            quantity: true,
            // ❌ size  → مش موجود في Schema خالص
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                discount: true, // ✅ محتاجه لحساب السعر بعد الخصم
                image: true,
                slug: true,
                inStock: true, // ✅ مهم تعرف لو المنتج نفد
                countStock: true, // ✅ عشان تعرض "باقي X قطع"
                // ❌ gallery → مش محتاجها في الـ preview
              },
            },
          },
        },

        // ── Orders (أحدث 3 أوردرات) ────────────────
        order: {
          take: 3,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            totalPrice: true, // ✅ الاسم الصح من Schema (مش totalAmount)
            status: true, // ✅ OrderStatus enum
            paymentMethod: true, // ✅ مفيد تعرضه في الـ UI
            createdAt: true,
            // ✅ عدد المنتجات في الأوردر بدون جلب كل التفاصيل
            orderItems: {
              select: {
                quantity: true,
                price: true, // ✅ السعر وقت الشراء
                product: {
                  select: {
                    name: true,
                    image: true,
                    slug: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!userProfile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(userProfile, { status: 200 });
  } catch (error) {
    console.error("[PROFILE_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
