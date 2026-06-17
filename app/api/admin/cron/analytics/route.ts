import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import {
  checkCurrentMonth,
  getNewUsersCount,
  getNewOrdersCount,
  getTotalRevenue,
  getTotalNet_Profit,
  initialParentTemporary,
} from "../../jobs/analytics-handlers";
import { getDetailsOfTodays } from "@/app/api/utils/getDetailsOfToday";

export const GET = async (request: NextRequest) => {
  try {
    const authHeader = request.headers.get("authorization");
    if (
      process.env.NODE_ENV === "production" &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await initialParentTemporary();

    const { startOfToday } = getDetailsOfTodays();

    const allAnalytics = await prisma.chartAnalytics.findMany({
      select: { id: true, nameAnalytics: true },
    });

    // رسم خريطة الـ Handlers بالـ Types المقابلة لها
    const analyticsHandlers: Record<string, () => Promise<number>> = {
      USERS: getNewUsersCount,
      ORDERS: getNewOrdersCount,
      REVENUE: getTotalRevenue,
      NET_PROFIT: getTotalNet_Profit,
    };

    for (const analyticsType of allAnalytics) {
      const currentHandler = analyticsHandlers[analyticsType.nameAnalytics];
      if (!currentHandler) continue;

      // أ- جلب سجل الشهر الحالي أو إنشائه
      const monthRecord = await checkCurrentMonth(analyticsType.id);

      // ب- حساب القيمة الفعلية اللحظية لليوم من الجداول الأصلية
      const currentTotalValue = await currentHandler();

      // ج- تحديث أو إنشاء سجل اليوم الحالي (Overwrite الحقيقة المطلقة)
      await prisma.chartAnalyticsByday.upsert({
        where: {
          chartAnalyticsByMonthId_createdAt: {
            chartAnalyticsByMonthId: monthRecord.id,
            createdAt: startOfToday,
          },
        },
        update: { totalAnalytics: currentTotalValue },
        create: {
          chartAnalyticsByMonthId: monthRecord.id,
          totalAnalytics: currentTotalValue,
          createdAt: startOfToday,
        },
      });

      // د- فكرتك الذكية: إعادة تجميع الشهر كاملاً لضمان عدم حدوث تكرار أرقام الـ increment
      const monthlySumResult = await prisma.chartAnalyticsByday.aggregate({
        _sum: { totalAnalytics: true },
        where: { chartAnalyticsByMonthId: monthRecord.id },
      });

      const totalMonthAmount = monthlySumResult._sum.totalAnalytics || 0;

      // هـ- تحديث إجمالي الشهر النهائي بشكل دقيق ومطلق
      await prisma.chartAnalyticsByMonth.update({
        where: { id: monthRecord.id },
        data: { totalAnalytics: totalMonthAmount },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Analytics updated successfully",
    });
  } catch (error) {
    console.error("🚨 Critical error in analytics cron job:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
};
