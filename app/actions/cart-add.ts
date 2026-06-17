"use server";

import { auth } from "@/auth";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function addToCartDB(
  productId: string,
  quantity: number = 1,
): Promise<{ success: boolean; cartId?: string; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    // Check stock availability
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { countStock: true, inStock: true },
    });

    if (!product?.inStock) return { success: false, error: "المنتج غير متوفر" };

    // Check if already in cart → upsert
    const existing = await prisma.cart.findFirst({
      where: { userId: session.user.id, productId },
    });

    if (existing) {
      const newQty = Math.min(existing.quantity + quantity, product.countStock);
      const updated = await prisma.cart.update({
        where: { id: existing.id },
        data: { quantity: newQty },
      });
      revalidatePath("/cart");
      return { success: true, cartId: updated.id };
    }

    const cartItem = await prisma.cart.create({
      data: {
        userId: session.user.id,
        productId,
        quantity: Math.min(quantity, product.countStock),
      },
    });

    revalidatePath("/cart");
    return { success: true, cartId: cartItem.id };
  } catch (e) {
    console.error("[ADD_TO_CART]", e);
    return { success: false, error: "فشل إضافة المنتج" };
  }
}
