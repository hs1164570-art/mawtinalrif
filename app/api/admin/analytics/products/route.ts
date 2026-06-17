import prisma from "@/lib/db";
import redisClient from "@/lib/redisClient";
import { NextResponse } from "next/server";

import {
  DailyTrendItem,
  RedisLeaderboardItem,
} from "../../../utils/analtycsPRoductSchema";
import { ProductAnalyticsByDay } from "@prisma/client";

// دالة الفورمات لتحويل داتا الريديس لشكل نظيف
const formatRedisData = (
  rawArray: { value: string; score: number }[],
): RedisLeaderboardItem[] => {
  return rawArray.map((item) => ({
    slug: item.value,
    totalScore: Math.floor(item.score),
  }));
};

export const GET = async () => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 1. جلب التوب 10 الأساسيين من الريديس وداتا الـ 30 يوم من الداتابيز بالتوازي
    const [
      dailyDbData,
      rawAllTimeInCart,
      rawAllTimePurchased,
      rawAllTimeViews,
    ] = await Promise.all([
      prisma.productAnalyticsByDay.findMany({
        where: {
          createdAt: { gte: thirtyDaysAgo },
        },
        orderBy: { createdAt: "asc" },
      }),

      (async () => {
        try {
          return await redisClient.zRangeWithScores(
            "stats:most_carted_products",
            0,
            9,
            { REV: true },
          );
        } catch (error) {
          console.error("Redis Error (InCart):", error);
          return [];
        }
      })(),

      (async () => {
        try {
          return await redisClient.zRangeWithScores(
            "stats:most_purchased_products",
            0,
            9,
            { REV: true },
          );
        } catch (error) {
          console.error("Redis Error (InOrder):", error);
          return [];
        }
      })(),

      (async () => {
        try {
          return await redisClient.zRangeWithScores(
            "stats:most_viewed_products",
            0,
            9,
            { REV: true },
          );
        } catch (error) {
          console.error("Redis Error (Views):", error);
          return [];
        }
      })(),
    ]);

    const allTimeTopCart = formatRedisData(rawAllTimeInCart);
    const allTimeTopPurchased = formatRedisData(rawAllTimePurchased);
    const allTimeTopViews = formatRedisData(rawAllTimeViews);

    // 2. معالجة الـ Daily Trends من الـ DB لفرز المشاهدات والسلات والمبيعات يوم بيوم
    const dailyMap: Record<string, DailyTrendItem & { view: number }> = {};

    dailyDbData.forEach((record: ProductAnalyticsByDay) => {
      const localDate = new Date(record.createdAt);
      const dateKey = `${localDate.getFullYear()}-${String(localDate.getMonth() + 1).padStart(2, "0")}-${String(localDate.getDate()).padStart(2, "0")}`;

      if (!dailyMap[dateKey]) {
        dailyMap[dateKey] = { date: dateKey, cart: 0, purchase: 0, view: 0 };
      }

      if (record.type === "CART") {
        dailyMap[dateKey].cart += record.count;
      } else if (record.type === "PURCHASE") {
        dailyMap[dateKey].purchase += record.count;
      } else if (record.type === "VIEW") {
        dailyMap[dateKey].view += record.count;
      }
    });

    const dailyTrends = Object.values(dailyMap);

    // 3. 🛠️ استخراج الـ Slugs الفريدة المنافسة في التوب 5 لعرضها بالشارت المجمع
    const uniqueSlugs = new Set([
      ...allTimeTopPurchased.slice(0, 5).map((i) => i.slug),
      ...allTimeTopCart.slice(0, 5).map((i) => i.slug),
      ...allTimeTopViews.slice(0, 5).map((i) => i.slug),
    ]);

    // 4. 🐳 تطبيق فكرتك العبقرية: استعلام مستهدف بالاسم (ZSCORE) لكل منتج فريد لمنع الأصفار المضللة
    const groupedBarChartData = await Promise.all(
      Array.from(uniqueSlugs).map(async (slug) => {
        const [salesScore, cartScore, viewsScore] = await Promise.all([
          redisClient.zScore("stats:most_purchased_products", slug),
          redisClient.zScore("stats:most_carted_products", slug),
          redisClient.zScore("stats:most_viewed_products", slug),
        ]);

        return {
          name: slug,
          sales: salesScore ? Math.floor(salesScore) : 0,
          cart: cartScore ? Math.floor(cartScore) : 0,
          views: viewsScore ? Math.floor(viewsScore) : 0,
        };
      }),
    );

    // 5. الـ Response النهائي المتفصل على مقاس كروت وشارتات صفحة المنتجات
    return NextResponse.json({
      success: true,
      data: {
        // الـ 3 كروت العلوية (KPIs)
        kpis: {
          topSeller: allTimeTopPurchased[0] || null,
          topCarted: allTimeTopCart[0] || null,
          topViewed: allTimeTopViews[0] || null,
        },
        // الـ 3 شارتات المنفصلة (التوب 10 كاملين لكل تصنيف)
        individualCharts: {
          topSales: allTimeTopPurchased,
          topCart: allTimeTopCart,
          topViews: allTimeTopViews,
        },
        // داتا الشارت المجمع خرسانة مسلحة ودقيقة 100%
        groupedBarChartData,
        // منحنيات النمو اليومي للشارتات الزمنية
        dailyTrends,
      },
    });
  } catch (error) {
    console.error("🚨 Products Analytics API Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
};
