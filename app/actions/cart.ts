"use server";

import { auth } from "@/auth";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { CartItemFromDB } from "@/utils/index";

// ─── if user login  transform from localStorage ─────────────────────────────────────────────────────────────────────

export async function mergeCartAction(
  localItems: { productId: string; quantity: number }[],
) {
  // 1. التحقق من أن المستخدم مسجل دخول بالفعل وجلسته صالحة
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const userId = session.user.id;

    // 2. بنلف على كل منتج العميل ضافه وهو زائر
    for (const item of localItems) {
      // 🎯 الخطوة البديلة: بنبحث عن وجود المنتج للمستخدم بـ findFirst العادي بناءً على الـ indexes المتاحة
      const existingCartItem = await prisma.cart.findFirst({
        where: {
          userId: userId,
          productId: item.productId,
        },
      });

      if (existingCartItem) {
        // 🔄 الحالة الأولى: المنتج موجود بالفعل، بنحدثه بناءً على الـ id الأساسي بتاعه
        await prisma.cart.update({
          where: {
            id: existingCartItem.id, // استخدام الـ Primary Key العادي
          },
          data: {
            quantity: existingCartItem.quantity + item.quantity, // جمع الكمية القديمة مع الجديدة
          },
        });
      } else {
        // 🆕 الحالة الثانية: المنتج مش موجود، بنعمله Create عادي جداً
        await prisma.cart.create({
          data: {
            userId,
            productId: item.productId,
            quantity: item.quantity,
          },
        });
      }
    }

    // 3. تحديث الكاش
    revalidatePath("/cart");

    return { success: true };
  } catch (error) {
    console.error(
      "CRITICAL: Merge Cart Server Action Error (No Unique Key):",
      error,
    );
    return { success: false, error: "Failed to merge your cart items" };
  }
}
// ─── Read ─────────────────────────────────────────────────────────────────────
export async function getCartFromDB(): Promise<CartItemFromDB[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  return prisma.cart.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      quantity: true,
      productId: true,
      product: {
        select: {
          id: true,
          name: true,
          price: true,
          discount: true,
          image: true,
          slug: true,
          inStock: true,
          countStock: true,
        },
      },
    },
  });
}

// ─── Create / Update (Add To Cart) ───────────────────────────────────────────
export async function addToCartDB(
  productId: string,
  qty: number = 1,
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    // 1. التأكد من أن المنتج موجود ومتوفر في المخزون
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { inStock: true, countStock: true },
    });

    if (!product || !product.inStock) {
      return { success: false, error: "المنتج غير متوفر حالياً" };
    }

    // 2. التحقق مما إذا كان المنتج موجود مسبقاً في سلة المستخدم
    const existingCartItem = await prisma.cart.findFirst({
      where: {
        userId: session.user.id,
        productId: productId,
      },
    });

    let result;

    if (existingCartItem) {
      // حساب الكمية الجديدة المطلوبة
      const newQty = existingCartItem.quantity + qty;

      // التأكد من عدم تخطي الكمية المتاحة في المخزون (لو السيرفر محددها)
      if (product.countStock !== null && newQty > product.countStock) {
        return {
          success: false,
          error: "عذراً، لقد تخطيت الكمية المتاحة في المخزون",
        };
      }

      // تحديث الكمية للمنتج الحالي
      result = await prisma.cart.update({
        where: { id: existingCartItem.id },
        data: { quantity: newQty },
        include: { product: true },
      });
    } else {
      // التأكد من أن الكمية المطلوبة ابتداءً لا تتخطى المخزون
      if (product.countStock !== null && qty > product.countStock) {
        return {
          success: false,
          error: "الكمية المطلوبة غير متوفرة في المخزون",
        };
      }

      // إضافة منتج جديد تماماً للسلة
      result = await prisma.cart.create({
        data: {
          userId: session.user.id,
          productId: productId,
          quantity: qty,
        },
        include: { product: true },
      });
    }

    revalidatePath("/cart");
    return { success: true, data: result };
  } catch (e) {
    console.error("[ADD_TO_CART_DB]", e);
    return { success: false, error: "فشلت إضافة المنتج إلى السلة" };
  }
}

// ─── Update quantity ──────────────────────────────────────────────────────────
export async function updateCartItemQuantity(
  cartId: string,
  newQty: number,
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    if (newQty <= 0) {
      await prisma.cart.delete({
        where: { id: cartId, userId: session.user.id },
      });
    } else {
      await prisma.cart.update({
        where: { id: cartId, userId: session.user.id },
        data: { quantity: newQty },
      });
    }

    revalidatePath("/cart");
    return { success: true };
  } catch (e) {
    console.error("[UPDATE_CART_QTY]", e);
    return { success: false, error: "Failed to update quantity" };
  }
}

// ─── Remove single item ───────────────────────────────────────────────────────
export async function removeCartItem(
  cartId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    await prisma.cart.delete({
      where: { id: cartId, userId: session.user.id },
    });

    revalidatePath("/cart");
    return { success: true };
  } catch (e) {
    console.error("[REMOVE_CART_ITEM]", e);
    return { success: false, error: "Failed to remove item" };
  }
}

// ─── Clear entire cart ────────────────────────────────────────────────────────
export async function clearCartDB(): Promise<{ success: boolean }> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false };

    await prisma.cart.deleteMany({ where: { userId: session.user.id } });
    revalidatePath("/cart");
    return { success: true };
  } catch (e) {
    console.error("[CLEAR_CART]", e);
    return { success: false };
  }
}

// ─── Validate coupon ──────────────────────────────────────────────────────────
export async function validateCoupon(code: string): Promise<{
  valid: boolean;
  discount?: number;
  isPercentage?: boolean;
  error?: string;
}> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { valid: false, error: "Unauthorized" };

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) return { valid: false, error: "Invalid coupon code" };
    if (!coupon.active)
      return { valid: false, error: "Coupon is no longer active" };
    if (new Date() > coupon.expiryDate)
      return { valid: false, error: "Coupon has expired" };
    if (coupon.usedCount >= coupon.usageLimit)
      return { valid: false, error: "Coupon usage limit reached" };

    // Check if user already used this coupon
    const alreadyUsed = await prisma.userCoupon.findUnique({
      where: {
        userId_couponCode: {
          userId: session.user.id,
          couponCode: code.toUpperCase(),
        },
      },
    });
    if (alreadyUsed)
      return { valid: false, error: "You've already used this coupon" };

    return {
      valid: true,
      discount: coupon.discount,
      isPercentage: coupon.isPercentage,
    };
  } catch (e) {
    console.error("[VALIDATE_COUPON]", e);
    return { valid: false, error: "Something went wrong" };
  }
}
