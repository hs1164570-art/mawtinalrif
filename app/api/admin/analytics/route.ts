import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { analyticsQuerySchema } from "../../utils/analyticsSchema";
import { auth } from "@/auth";

const formatDate = (date: Date) => {
  return date.toLocaleDateString("en-CA"); // YYYY-MM-DD
};

export const GET = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    const validationResult = analyticsQuerySchema.safeParse(queryParams);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: "Invalid query parameters",
          errors: validationResult.error.errors,
        },
        { status: 400 },
      );
    }

    // البيانات المعتمدة الآن جاهزة للاستخدام بأمان
    const validatedData = validationResult.data;
    const { type, timeframe, from, to } = validatedData;

    let startDate = new Date();
    let endDate = new Date();

    // 1. تحديد الفترة الحالية
    switch (timeframe) {
      case "7days":
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "30days":
        startDate.setDate(startDate.getDate() - 30);
        break;
      case "90days":
        startDate.setDate(startDate.getDate() - 90);
        break;
      case "thisYear":
        startDate = new Date(startDate.getFullYear(), 0, 1);
        break;
      case "custom":
        startDate = new Date(from as string);
        endDate = new Date(to as string);
        break;
    }
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    // 2. تحديد الفترة السابقة
    const durationInMs = endDate.getTime() - startDate.getTime();
    const previousStartDate = new Date(startDate.getTime() - durationInMs);
    const previousEndDate = new Date(startDate.getTime());

    // 3. جلب البيانات من قاعدة البيانات
    const [currentPeriodData, previousPeriodData] = await Promise.all([
      prisma.chartAnalyticsByday.findMany({
        where: {
          chartAnalyticsByMonth: { chartAnalytics: { nameAnalytics: type } },
          createdAt: { gte: startDate, lte: endDate },
        },
        select: { totalAnalytics: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.chartAnalyticsByday.aggregate({
        _sum: { totalAnalytics: true },
        where: {
          chartAnalyticsByMonth: { chartAnalytics: { nameAnalytics: type } },
          createdAt: { gte: previousStartDate, lt: previousEndDate },
        },
      }),
    ]);

    const analyticsMap = new Map(
      currentPeriodData.map((item) => [
        formatDate(item.createdAt),
        item.totalAnalytics,
      ]),
    );

    // 4. ملء الفجوات (Filling gaps)
    const formattedData = [];
    let currentTotal = 0;

    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      const dateString = formatDate(d);
      const value = analyticsMap.get(dateString) || 0;
      currentTotal += value;

      formattedData.push({
        date: dateString,
        value: value,
      });
    }

    // 5. حساب نسبة التغير
    const previousTotal = previousPeriodData._sum.totalAnalytics || 0;
    let percentageChange = 0;

    if (previousTotal === 0) {
      percentageChange = currentTotal > 0 ? 100 : 0;
    } else {
      percentageChange = ((currentTotal - previousTotal) / previousTotal) * 100;
    }

    // 6. إرسال الرد بنجاح
    return NextResponse.json({
      success: true,
      data: formattedData,
      meta: {
        type,
        timeframe,
        total: currentTotal,
        percentageChange: parseFloat(percentageChange.toFixed(2)),
        trend: percentageChange >= 0 ? "up" : "down",
      },
    });
  } catch (error) {
    console.error("❌ Analytics API Error:", error);
    return NextResponse.json(
      { message: "Failed to fetch analytics" },
      { status: 500 },
    );
  }
};
