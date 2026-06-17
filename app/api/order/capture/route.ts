// app/api/orders/capture/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// Step 2: User approved payment on PayPal → we capture → write to DB atomically
// ─────────────────────────────────────────────────────────────────────────────

import { userGuard } from "@/lib/Guards";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import redisClient from "@/lib/redisClient";
import { capturePayPalOrder } from "@/lib/paypal";

const captureSchema = z.object({
  paypalOrderId: z.string().min(1).max(100),
});

type PendingItem = {
  productId: string;
  quantity: number;
  price: number;
  costPrice: number;
};

type PendingOrder = {
  paypalOrderId: string;
  userId: string;
  items: PendingItem[];
  totalPrice: number;
  totalCostPrice: number;
  coupon: { code: string; discount: number; isPercentage: boolean } | null;
  phoneNumber: string;
  country: string;
  region: string;
  street: string | null;
};

/**
 * POST /api/orders/capture
 */
export const POST = userGuard(
  captureSchema,
  async (
    _req: NextRequest,
    userId: string,
    data: { paypalOrderId: string },
  ) => {
    console.log(`\n=== [START CAPTURE] For User: ${userId} ===`);
    const startTime = Date.now();

    // ── 1. Load & verify pending order from Redis ────────────────────────────
    let raw;
    try {
      console.log(`[DEBUG 1] Attempting to fetch pending order from Redis...`);
      raw = await redisClient.get(`pending_order:${userId}`);
      console.log(
        `[DEBUG 1 SUCCESS] Redis dynamic get completed in ${Date.now() - startTime}ms`,
      );
    } catch (redisErr: any) {
      console.error(
        `[REDIS CRITICAL ERROR] Failed to fetch key from Redis:`,
        redisErr.message,
      );
      return NextResponse.json(
        { message: "Database connection issue (Redis)." },
        { status: 500 },
      );
    }

    if (!raw) {
      console.warn(
        `[WARN] No pending order found in Redis for user: ${userId}`,
      );
      return NextResponse.json(
        { message: "Order session expired. Please start your order again." },
        { status: 400 },
      );
    }

    const pending: PendingOrder = JSON.parse(raw);

    if (pending.paypalOrderId !== data.paypalOrderId) {
      console.warn(
        `[WARN] Anti-tamper triggered. Request ID (${data.paypalOrderId}) mismatch with Redis ID (${pending.paypalOrderId})`,
      );
      return NextResponse.json({ message: "Order mismatch" }, { status: 400 });
    }

    // ── 2. Capture payment on PayPal ────────────────────────────────────────
    const paypalStart = Date.now();
    try {
      console.log(
        `[DEBUG 2] Contacting PayPal API to capture order: ${data.paypalOrderId}...`,
      );
      await capturePayPalOrder(data.paypalOrderId);
      console.log(
        `[DEBUG 2 SUCCESS] PayPal capture approved in ${Date.now() - paypalStart}ms`,
      );
    } catch (err: any) {
      console.error(`[PAYPAL ERROR] Capture failed or cancelled:`, err.message);
      return NextResponse.json(
        { message: "Payment was not completed. Please try again." },
        { status: 402 },
      );
    }

    // ── 3. Atomic DB transaction ─────────────────────────────────────────────
    let order;
    const dbTransactionStart = Date.now();
    try {
      console.log(`[DEBUG 3] Starting Prisma $transaction...`);

      order = await prisma.$transaction(async (tx) => {
        const productIds = pending.items.map((i) => i.productId);

        // 3a. Re-check stock inside the transaction
        console.log(
          `[DEBUG 3a] Inside Transaction: Fetching fresh stock for products...`,
        );
        const freshProducts = await tx.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true, inStock: true, countStock: true },
        });

        for (const item of pending.items) {
          const p = freshProducts.find((fp) => fp.id === item.productId);
          if (!p || !p.inStock || p.countStock < item.quantity) {
            console.warn(
              `[STOCK INSUFFICIENT] Product ${item.productId} out of stock. Count: ${p?.countStock}, Requested: ${item.quantity}`,
            );
            throw new Error("STOCK_CHANGED");
          }
        }

        // 3b. Create order
        console.log(`[DEBUG 3b] Inside Transaction: Creating order record...`);
        const newOrder = await tx.order.create({
          data: {
            userId,
            totalPrice: pending.totalPrice,
            totalCostPrice: pending.totalCostPrice,
            phoneNumber: pending.phoneNumber,
            country: pending.country,
            region: pending.region,
            street: pending.street,
            coupon: pending.coupon?.code ?? null,
            paymentMethod: "PAYPAL",
            paypalOrderId: pending.paypalOrderId,
            status: "PROCESSING",
            orderItems: {
              createMany: {
                data: pending.items.map((item) => ({
                  productId: item.productId,
                  quantity: item.quantity,
                  price: item.price,
                })),
              },
            },
          },
        });

        // 3c. Decrement stock atomically (The Suspicious Part)
        console.log(
          `[DEBUG 3c] Inside Transaction: Triggering Promise.all for stock decrement...`,
        );

        // سنحتفظ بالـ Promise.all كما هي لترى بنفسك إن كانت ستعلق هنا أم لا
        await Promise.all(
          pending.items.map((item) => {
            console.log(
              `[DEBUG 3c - SUB] Dispatching update query for product: ${item.productId}`,
            );
            return tx.product.update({
              where: { id: item.productId },
              data: { countStock: { decrement: item.quantity } },
            });
          }),
        );
        console.log(
          `[DEBUG 3c SUCCESS] All decrement updates resolved within Promise.all`,
        );

        // 3d. Mark coupon as used
        if (pending.coupon) {
          console.log(
            `[DEBUG 3d] Inside Transaction: Updating coupon codes...`,
          );
          await tx.coupon.update({
            where: { code: pending.coupon.code },
            data: { usedCount: { increment: 1 } },
          });
          await tx.userCoupon.create({
            data: { userId, couponCode: pending.coupon.code },
          });
        }

        return newOrder;
      });

      console.log(
        `[DEBUG 3 SUCCESS] Prisma $transaction committed successfully in ${Date.now() - dbTransactionStart}ms`,
      );
    } catch (err: any) {
      console.error(
        `[DB TRANSACTION FAILED] Error caught during $transaction execution:`,
        err.message || err,
      );

      if (err.message === "STOCK_CHANGED") {
        return NextResponse.json(
          {
            message:
              "Some items just went out of stock. Please review your cart.",
          },
          { status: 409 },
        );
      }

      console.error(
        "[CRITICAL CRASH] Payment captured but DB write failed entirely:",
        {
          userId,
          paypalOrderId: data.paypalOrderId,
          error: err,
        },
      );
      return NextResponse.json(
        {
          message:
            "Payment received but order save failed. Support has been notified.",
        },
        { status: 500 },
      );
    }

    // ── 4. Cleanup Redis ─────────────────────────────────────────────────────
    try {
      console.log(
        `[DEBUG 4] Attempting to delete pending order key from Redis...`,
      );
      await redisClient.del(`pending_order:${userId}`);
      console.log(`[DEBUG 4 SUCCESS] Redis key deleted.`);
    } catch (redisDelErr: any) {
      console.error(
        `[REDIS WARN] Failed to delete session key after order creation:`,
        redisDelErr.message,
      );
    }

    // ── 5. Update leaderboard in background ──────────────────────────────────
    console.log(`[DEBUG 5] Dispatching background leaderboard update...`);
    updateLeaderboard(pending.items).catch((e) =>
      console.error("[LEADERBOARD BACKGROUND ERROR]", e),
    );

    console.log(
      `=== [END CAPTURE SUCCESS] Total Request Time: ${Date.now() - startTime}ms ===\n`,
    );
    return NextResponse.json(
      { message: "Order placed successfully", orderId: order.id },
      { status: 201 },
    );
  },
);

// ── Redis leaderboard helper ──────────────────
async function updateLeaderboard(items: PendingItem[]) {
  try {
    const products = await prisma.product.findMany({
      where: { id: { in: items.map((i) => i.productId) } },
      select: { id: true, slug: true },
    });
    const slugMap = new Map(products.map((p) => [p.id, p.slug]));

    await Promise.all(
      items.map((item) => {
        const slug = slugMap.get(item.productId);
        if (slug) {
          console.log(
            `[BACKGROUND LEADERBOARD] Incrementing score for slug: ${slug}`,
          );
          return redisClient.zIncrBy(
            "stats:most_purchased_products",
            item.quantity,
            slug,
          );
        }
      }),
    );
    console.log(
      `[BACKGROUND LEADERBOARD SUCCESS] Leaderboard updated completely.`,
    );
  } catch (err: any) {
    console.error(
      `[BACKGROUND LEADERBOARD CRASH] Failed updating leaderboard structure:`,
      err.message,
    );
  }
}
