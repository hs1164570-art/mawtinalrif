// app/api/orders/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// Step 1: Validate cart + coupon → create PayPal order → cache in Redis
// Returns paypalOrderId to the client so they complete payment
// ─────────────────────────────────────────────────────────────────────────────

import { userGuard } from "@/lib/Guards";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import redisClient from "@/lib/redisClient";
import { createPayPalOrder } from "@/lib/paypal";

// ── Validation schema ─────────────────────────────────────────────────────────
const orderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().cuid(),
        quantity: z.number().int().min(1).max(50),
      }),
    )
    .min(1)
    .max(20),
  coupon: z.string().trim().max(50).optional(),
  phoneNumber: z.string().regex(/^\+?[0-9]{7,15}$/, "Invalid phone number"),
  country: z.string().min(2).max(100),
  region: z.string().min(2).max(100),
  street: z.string().max(200).optional(),
});

export type OrderInput = z.infer<typeof orderSchema>;

const PENDING_TTL = 30 * 60; // 30 min in seconds

/**
 * POST /api/orders
 */
export const POST = userGuard(
  orderSchema,
  async (_req: NextRequest, userId: string, data: OrderInput) => {
    console.log(`\n=== [START CREATE ORDER] For User: ${userId} ===`);
    const startTime = Date.now();

    // ── 1. Return existing pending order if user already has one ─────────────
    let cached;
    try {
      console.log(
        `[DEBUG 1] Checking if user already has a pending order in Redis...`,
      );
      cached = await redisClient.get(`pending_order:${userId}`);
      console.log(
        `[DEBUG 1 SUCCESS] Redis dynamic get finished in ${Date.now() - startTime}ms`,
      );
    } catch (redisGetErr: any) {
      console.error(
        `[REDIS ERROR] Failed to GET pending order from Redis:`,
        redisGetErr.message,
      );
      // بنكمل عادي ومبنوقعش الأبلكيشن لو الكاش بس فيه مشكلة بالفحص
    }

    if (cached) {
      console.log(
        `[DEBUG 1 INFO] Found active pending order cache. Preventing double-submit.`,
      );
      const prev = JSON.parse(cached);
      return NextResponse.json(
        { paypalOrderId: prev.paypalOrderId, totalPrice: prev.totalPrice },
        { status: 200 },
      );
    }

    // ── 2. Deduplicate productIds ────────────────────────────────────────────
    const uniqueIds = [...new Set(data.items.map((i) => i.productId))];
    if (uniqueIds.length !== data.items.length) {
      console.warn(`[WARN] Duplicate products detected in user payload.`);
      return NextResponse.json(
        { message: "Duplicate products in order" },
        { status: 400 },
      );
    }

    // ── 3. Fetch products in ONE query ───────────────────────────────────────
    let products;
    const dbProductsStart = Date.now();
    try {
      console.log(
        `[DEBUG 3] Fetching product details from Prisma for ${uniqueIds.length} unique items...`,
      );
      products = await prisma.product.findMany({
        where: { id: { in: uniqueIds } },
        select: {
          id: true,
          price: true,
          costPrice: true,
          inStock: true,
          countStock: true,
        },
      });
      console.log(
        `[DEBUG 3 SUCCESS] Prisma query completed in ${Date.now() - dbProductsStart}ms`,
      );
    } catch (dbErr: any) {
      console.error(`[PRISMA ERROR] Failed to fetch products:`, dbErr.message);
      return NextResponse.json(
        { message: "Database connection failure." },
        { status: 500 },
      );
    }

    if (products.length !== uniqueIds.length) {
      console.warn(`[WARN] Some products requested were not found in DB.`);
      return NextResponse.json(
        { message: "One or more products not found" },
        { status: 404 },
      );
    }

    const productMap = new Map(products.map((p) => [p.id, p]));

    // ── 4. Validate stock for every item ────────────────────────────────────
    for (const item of data.items) {
      const p = productMap.get(item.productId)!;
      if (!p.inStock || p.countStock < item.quantity) {
        console.warn(
          `[STOCK WARN] Product ${item.productId} insufficient stock. Available: ${p.countStock}, Requested: ${item.quantity}`,
        );
        return NextResponse.json(
          { message: "A product in your cart is out of stock" },
          { status: 400 },
        );
      }
    }

    // ── 5. Calculate totals ──────────────────────────────────────────────────
    let totalPrice = data.items.reduce(
      (acc, item) =>
        acc + productMap.get(item.productId)!.price * item.quantity,
      0,
    );
    const totalCostPrice = data.items.reduce(
      (acc, item) =>
        acc + productMap.get(item.productId)!.costPrice * item.quantity,
      0,
    );

    // ── 6. Validate & apply coupon ───────────────────────────────────────────
    type AppliedCoupon = {
      code: string;
      discount: number;
      isPercentage: boolean;
    };
    let appliedCoupon: AppliedCoupon | null = null;

    if (data.coupon) {
      const dbCouponStart = Date.now();
      try {
        console.log(
          `[DEBUG 6] Coupon provided (${data.coupon}). Fetching verification data from DB...`,
        );
        const coupon = await prisma.coupon.findUnique({
          where: { code: data.coupon },
          select: {
            code: true,
            discount: true,
            isPercentage: true,
            expiryDate: true,
            usageLimit: true,
            usedCount: true,
            active: true,
          },
        });
        console.log(
          `[DEBUG 6 SUCCESS] Coupon verified from DB in ${Date.now() - dbCouponStart}ms`,
        );

        if (!coupon) {
          console.warn(
            `[COUPON WARN] Coupon code ${data.coupon} does not exist.`,
          );
          return NextResponse.json(
            { message: "Invalid coupon code" },
            { status: 400 },
          );
        }

        if (!coupon.active) {
          console.warn(`[COUPON WARN] Coupon code ${data.coupon} is inactive.`);
          return NextResponse.json(
            { message: "This coupon is no longer active" },
            { status: 400 },
          );
        }

        if (new Date() > coupon.expiryDate) {
          console.warn(`[COUPON WARN] Coupon code ${data.coupon} has expired.`);
          return NextResponse.json(
            { message: "This coupon has expired" },
            { status: 400 },
          );
        }

        if (coupon.usedCount >= coupon.usageLimit) {
          console.warn(
            `[COUPON WARN] Coupon code ${data.coupon} global limit reached.`,
          );
          return NextResponse.json(
            { message: "This coupon has reached its limit" },
            { status: 400 },
          );
        }

        // Per-user check
        console.log(
          `[DEBUG 6a] Checking if user ${userId} previously used coupon ${coupon.code}...`,
        );
        const alreadyUsed = await prisma.userCoupon.findUnique({
          where: { userId_couponCode: { userId, couponCode: coupon.code } },
        });

        if (alreadyUsed) {
          console.warn(
            `[COUPON WARN] User ${userId} already redeemed coupon ${coupon.code}.`,
          );
          return NextResponse.json(
            { message: "You have already used this coupon" },
            { status: 400 },
          );
        }

        // Apply discount correctly
        if (coupon.isPercentage) {
          totalPrice = Math.max(
            0,
            Math.round(totalPrice * (1 - coupon.discount / 100)),
          );
        } else {
          totalPrice = Math.max(0, totalPrice - coupon.discount);
        }

        appliedCoupon = {
          code: coupon.code,
          discount: coupon.discount,
          isPercentage: coupon.isPercentage,
        };
        console.log(
          `[DEBUG 6 INFO] Coupon successfully applied. New total price: ${totalPrice}`,
        );
      } catch (couponErr: any) {
        console.error(
          `[COUPON ERROR] Critical block failure during validation:`,
          couponErr.message,
        );
        return NextResponse.json(
          { message: "Error processing coupon." },
          { status: 500 },
        );
      }
    }

    // ── 7. Create PayPal order ───────────────────────────────────────────────
    let paypalOrder;
    const paypalStart = Date.now();
    try {
      console.log(
        `[DEBUG 7] Initiating external API call to PayPal. Amount: ${totalPrice} USD...`,
      );
      paypalOrder = await createPayPalOrder(
        totalPrice,
        "USD",
        `${userId}-${Date.now()}`, // idempotency key
      );
      console.log(
        `[DEBUG 7 SUCCESS] PayPal order created successfully ID: ${paypalOrder.id} in ${Date.now() - paypalStart}ms`,
      );
    } catch (err: any) {
      console.error(
        `[PAYPAL CRITICAL ERROR] Failed to instantiate order contract with PayPal:`,
        err.message || err,
      );
      return NextResponse.json(
        { message: "PayPal API error. Please try again later." },
        { status: 502 },
      );
    }

    // ── 8. Cache validated order in Redis (30 min) ───────────────────────────
    const pendingPayload = {
      paypalOrderId: paypalOrder.id,
      userId,
      items: data.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: productMap.get(item.productId)!.price,
        costPrice: productMap.get(item.productId)!.costPrice,
      })),
      totalPrice,
      totalCostPrice,
      coupon: appliedCoupon,
      phoneNumber: data.phoneNumber,
      country: data.country,
      region: data.region,
      street: data.street ?? null,
    };

    const redisCacheStart = Date.now();
    try {
      console.log(
        `[DEBUG 8] Saving payload to Redis with key: pending_order:${userId}...`,
      );
      await redisClient.setEx(
        `pending_order:${userId}`,
        PENDING_TTL,
        JSON.stringify(pendingPayload),
      );
      console.log(
        `[DEBUG 8 SUCCESS] Token cached securely in Redis in ${Date.now() - redisCacheStart}ms`,
      );
    } catch (redisSetErr: any) {
      console.error(
        `[REDIS CRITICAL ERROR] Failed to setEx security token payload:`,
        redisSetErr.message,
      );
      return NextResponse.json(
        { message: "Order tracking engine error (Redis)." },
        { status: 500 },
      );
    }

    console.log(
      `=== [END CREATE ORDER SUCCESS] Request Processed in: ${Date.now() - startTime}ms ===\n`,
    );
    return NextResponse.json(
      { paypalOrderId: paypalOrder.id, totalPrice },
      { status: 200 },
    );
  },
);
