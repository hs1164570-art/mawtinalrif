import prisma from "@/lib/db";
import { AnalyticType } from "@prisma/client";
import { getDetailsOfTodays } from "../../utils/getDetailsOfToday";

export const checkCurrentMonth = async (parentId: string) => {
  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const month = await prisma.chartAnalyticsByMonth.upsert({
    where: {
      chartAnalyticsId_createdAt: {
        chartAnalyticsId: parentId,
        createdAt: startOfThisMonth,
      },
    },
    update: {},
    create: {
      chartAnalyticsId: parentId,
      totalAnalytics: 0,
      createdAt: startOfThisMonth,
    },
  });

  return month;
};

// 1. عد المستخدمين الجدد
export const getNewUsersCount = async (): Promise<number> => {
  const { startOfToday, endOfToday } = getDetailsOfTodays();
  return await prisma.user.count({
    where: { createdAt: { gte: startOfToday, lt: endOfToday } },
  });
};

// 2. عد الطلبات الجديدة
export const getNewOrdersCount = async (): Promise<number> => {
  const { startOfToday, endOfToday } = getDetailsOfTodays();
  return await prisma.order.count({
    where: { createdAt: { gte: startOfToday, lt: endOfToday } },
  });
};

// 3. إجمالي الإيرادات
export const getTotalRevenue = async (): Promise<number> => {
  const { startOfToday, endOfToday } = getDetailsOfTodays();
  const result = await prisma.order.aggregate({
    _sum: { totalPrice: true },
    where: { createdAt: { gte: startOfToday, lt: endOfToday } },
  });
  return result._sum.totalPrice || 0;
};

// 4. صافي الأرباح
export const getTotalNet_Profit = async (): Promise<number> => {
  const { startOfToday, endOfToday } = getDetailsOfTodays();
  const result = await prisma.order.aggregate({
    _sum: { totalPrice: true, totalCostPrice: true },
    where: {
      createdAt: { gte: startOfToday, lt: endOfToday },
      status: "DELIVERED",
    },
  });
  const NET_PROFIT =
    (result._sum.totalPrice || 0) - (result._sum.totalCostPrice || 0);
  return NET_PROFIT;
};

// تهيئة الأنواع الأبوية إذا لم تكن موجودة
export async function initialParentTemporary() {
  const types = Object.values(AnalyticType);
  for (const type of types) {
    await prisma.chartAnalytics.upsert({
      where: { nameAnalytics: type },
      update: {},
      create: { nameAnalytics: type },
    });
  }
}
