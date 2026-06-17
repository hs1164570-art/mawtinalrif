// ❌ NO "use server" — هذا الفايل للسيرفر فقط (page.tsx prefetch)
// Dashboard.tsx يستخدم AllData.ts مش الفايل ده

import prisma from "@/lib/db";
import redisClient from "@/lib/redisClient";

// ══════════════════════════════════════════════════════════════════════════════
// TYPES — exported so Dashboard.tsx and AllData.ts can import them
// ══════════════════════════════════════════════════════════════════════════════

export type TF = "7d" | "30d" | "90d" | "year";

export interface DayValue {
  date: string;
  value: number;
}

export interface FinanceSeries {
  data: DayValue[];
  total: number;
  prevTotal: number;
  percentageChange: number;
  trend: "up" | "down";
  sparkline: number[];
}

export interface FinanceSlice {
  revenue: FinanceSeries;
  profit: FinanceSeries;
  combined: { date: string; revenue: number; profit: number }[];
  profitMargin: number;
  prevProfitMargin: number;
  costs: number;
}

export interface OrderKPI {
  current: number;
  prev: number;
  trend: "up" | "down" | "flat";
  pct: number;
}

export interface StatusDistItem {
  name: string;
  value: number;
  color: string;
}

export interface OrdersSlice {
  kpis: {
    total: OrderKPI;
    pending: number;
    processing: number;
    done: OrderKPI;
    cancelled: number;
  };
  flowByDay: { date: string; count: number }[];
  statusDistribution: StatusDistItem[];
}

export interface LeaderboardItem {
  slug: string;
  totalScore: number;
}

export interface ProductsSlice {
  kpis: {
    topSeller: LeaderboardItem | null;
    topCarted: LeaderboardItem | null;
    topViewed: LeaderboardItem | null;
  };
  groupedBarChartData: {
    name: string;
    sales: number;
    cart: number;
    views: number;
  }[];
  dailyTrends: { date: string; cart: number; purchase: number; view: number }[];
}

export interface ViewsSlice {
  total: number;
  distribution: { name: string; value: number }[];
}

export interface RecentOrder {
  id: string;
  user: { name: string | null; email: string | null };
  totalPrice: number;
  status: string;
  createdAt: string;
}

export interface RecentUser {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  country: string;
  createdAt: string;
}

export interface CommentStat {
  rating: number;
  count: number;
  percentage: number;
}

export interface CommentsSlice {
  totalComments: number;
  averageRating: number;
  stats: CommentStat[];
}

export interface KSAVisitsSlice {
  total: number;
  distribution: { name: string; value: number }[];
}
export interface DashboardData {
  finance: FinanceSlice;
  orders: OrdersSlice;
  products: ProductsSlice;
  views: ViewsSlice;
  recentOrders: RecentOrder[];
  recentUsers: RecentUser[];
  comments: CommentsSlice;
  KSAviews: KSAVisitsSlice;
}

// ══════════════════════════════════════════════════════════════════════════════
// INTERNAL HELPERS
// ══════════════════════════════════════════════════════════════════════════════

const STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: "انتظار الدفع",
  PROCESSING: "قيد التجهيز",
  SHIPPED: "تم الشحن",
  DELIVERED: "تم التسليم",
  CANCELLED: "ملغي",
  REFUNDED: "مسترجع",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING_PAYMENT: "#7A9BBF",
  PROCESSING: "#B89A5A",
  SHIPPED: "#6B4C3B",
  DELIVERED: "#6A9E7F",
  CANCELLED: "#C4614A",
  REFUNDED: "#A89585",
};

function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-CA");
}

function buildRange(tf: TF): {
  start: Date;
  end: Date;
  prevStart: Date;
  prevEnd: Date;
} {
  const now = new Date();
  const end = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999,
  );
  let start = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0,
    0,
  );

  switch (tf) {
    case "7d":
      start.setDate(start.getDate() - 6);
      break;
    case "30d":
      start.setDate(start.getDate() - 29);
      break;
    case "90d":
      start.setDate(start.getDate() - 89);
      break;
    case "year":
      start = new Date(now.getFullYear(), 0, 1);
      break;
  }

  const dMs = end.getTime() - start.getTime();
  const prevEnd = new Date(start.getTime() - 1);
  const prevStart = new Date(start.getTime() - dMs);

  return { start, end, prevStart, prevEnd };
}

function fillGaps(
  raw: { createdAt: Date; totalAnalytics: number }[],
  start: Date,
  end: Date,
): DayValue[] {
  const map = new Map(
    raw.map((r) => [fmtDate(r.createdAt), Number(r.totalAnalytics)]),
  );
  const result: DayValue[] = [];
  for (const d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const key = fmtDate(d);
    result.push({ date: key, value: map.get(key) ?? 0 });
  }
  return result;
}

function pct(curr: number, prev: number): number {
  if (prev === 0) return curr > 0 ? 100 : 0;
  return parseFloat((((curr - prev) / prev) * 100).toFixed(2));
}

function toSparkline(data: DayValue[], n = 7): number[] {
  return data.slice(-n).map((d) => d.value);
}

async function safeRedis<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.error("Redis error:", err);
    return fallback;
  }
}

function fmtLeaderboard(
  raw: { value: string; score: number }[],
): LeaderboardItem[] {
  return raw.map((item) => ({
    slug: item.value,
    totalScore: Math.floor(item.score),
  }));
}

// ══════════════════════════════════════════════════════════════════════════════
// INDIVIDUAL FETCHERS
// ══════════════════════════════════════════════════════════════════════════════

async function getFinance(tf: TF): Promise<FinanceSlice> {
  const { start, end, prevStart, prevEnd } = buildRange(tf);

  const [revCurrent, revPrev, profitCurrent, profitPrev] = await Promise.all([
    prisma.chartAnalyticsByday.findMany({
      where: {
        chartAnalyticsByMonth: { chartAnalytics: { nameAnalytics: "REVENUE" } },
        createdAt: { gte: start, lte: end },
      },
      select: { totalAnalytics: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.chartAnalyticsByday.aggregate({
      _sum: { totalAnalytics: true },
      where: {
        chartAnalyticsByMonth: { chartAnalytics: { nameAnalytics: "REVENUE" } },
        createdAt: { gte: prevStart, lte: prevEnd },
      },
    }),
    prisma.chartAnalyticsByday.findMany({
      where: {
        chartAnalyticsByMonth: {
          chartAnalytics: { nameAnalytics: "NET_PROFIT" },
        },
        createdAt: { gte: start, lte: end },
      },
      select: { totalAnalytics: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.chartAnalyticsByday.aggregate({
      _sum: { totalAnalytics: true },
      where: {
        chartAnalyticsByMonth: {
          chartAnalytics: { nameAnalytics: "NET_PROFIT" },
        },
        createdAt: { gte: prevStart, lte: prevEnd },
      },
    }),
  ]);

  const revData = fillGaps(
    revCurrent.map((r) => ({
      createdAt: r.createdAt,
      totalAnalytics: Number(r.totalAnalytics),
    })),
    start,
    end,
  );
  const profitData = fillGaps(
    profitCurrent.map((r) => ({
      createdAt: r.createdAt,
      totalAnalytics: Number(r.totalAnalytics),
    })),
    start,
    end,
  );

  const revTotal = revData.reduce((s, d) => s + d.value, 0);
  const profitTotal = profitData.reduce((s, d) => s + d.value, 0);
  const prevRevTot = Number(revPrev._sum.totalAnalytics ?? 0);
  const prevProfitTot = Number(profitPrev._sum.totalAnalytics ?? 0);

  const revPct = pct(revTotal, prevRevTot);
  const profitPct = pct(profitTotal, prevProfitTot);

  const combined = revData.map((r, i) => ({
    date: r.date,
    revenue: r.value,
    profit: profitData[i]?.value ?? 0,
  }));

  const costs = Math.max(0, revTotal - profitTotal);
  const profitMargin =
    revTotal > 0 ? parseFloat(((profitTotal / revTotal) * 100).toFixed(2)) : 0;
  const prevMargin =
    prevRevTot > 0 ?
      parseFloat(((prevProfitTot / prevRevTot) * 100).toFixed(2))
    : 0;

  return {
    revenue: {
      data: revData,
      total: revTotal,
      prevTotal: prevRevTot,
      percentageChange: revPct,
      trend: revPct >= 0 ? "up" : "down",
      sparkline: toSparkline(revData),
    },
    profit: {
      data: profitData,
      total: profitTotal,
      prevTotal: prevProfitTot,
      percentageChange: profitPct,
      trend: profitPct >= 0 ? "up" : "down",
      sparkline: toSparkline(profitData),
    },
    combined,
    profitMargin,
    prevProfitMargin: prevMargin,
    costs,
  };
}

async function getOrders(tf: TF): Promise<OrdersSlice> {
  const { start, end, prevStart, prevEnd } = buildRange(tf);

  const [totalCurrent, totalPrev, statusCounts, ordersByDay, donePrev] =
    await Promise.all([
      prisma.order.count({ where: { createdAt: { gte: start, lte: end } } }),
      prisma.order.count({
        where: { createdAt: { gte: prevStart, lte: prevEnd } },
      }),
      prisma.order.groupBy({
        by: ["status"],
        _count: { id: true },
        where: { createdAt: { gte: start, lte: end } },
      }),
      prisma.order.findMany({
        where: { createdAt: { gte: start, lte: end } },
        select: { createdAt: true, status: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.order.count({
        where: {
          status: "DELIVERED",
          createdAt: { gte: prevStart, lte: prevEnd },
        },
      }),
    ]);

  const flowMap = new Map<string, number>();
  for (const o of ordersByDay) {
    const key = fmtDate(o.createdAt);
    flowMap.set(key, (flowMap.get(key) ?? 0) + 1);
  }
  const flowByDay: { date: string; count: number }[] = [];
  for (const d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const key = fmtDate(d);
    flowByDay.push({ date: key, count: flowMap.get(key) ?? 0 });
  }

  const getStatusCount = (s: string) =>
    statusCounts.find((sc) => sc.status === s)?._count.id ?? 0;

  const done = getStatusCount("DELIVERED");
  const cancelled = getStatusCount("CANCELLED");
  const pending = getStatusCount("PENDING_PAYMENT");
  const processing = getStatusCount("PROCESSING") + getStatusCount("SHIPPED");
  const totalPct = pct(totalCurrent, totalPrev);

  const statusDistribution: StatusDistItem[] = statusCounts.map((s) => ({
    name: STATUS_LABELS[s.status] ?? s.status,
    value: s._count.id,
    color: STATUS_COLORS[s.status] ?? "#A89585",
  }));

  return {
    kpis: {
      total: {
        current: totalCurrent,
        prev: totalPrev,
        trend: totalPct >= 0 ? "up" : "down",
        pct: totalPct,
      },
      pending,
      processing,
      done: {
        current: done,
        prev: donePrev,
        trend: done >= donePrev ? "up" : "down",
        pct: pct(done, donePrev),
      },
      cancelled,
    },
    flowByDay,
    statusDistribution,
  };
}

async function getProducts(): Promise<ProductsSlice> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [dailyDbData, rawSales, rawCart, rawViews] = await Promise.all([
    prisma.productAnalyticsByDay.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      orderBy: { createdAt: "asc" },
    }),
    safeRedis(
      () =>
        redisClient.zRangeWithScores("stats:most_purchased_products", 0, 9, {
          REV: true,
        }),
      [],
    ),
    safeRedis(
      () =>
        redisClient.zRangeWithScores("stats:most_carted_products", 0, 9, {
          REV: true,
        }),
      [],
    ),
    safeRedis(
      () =>
        redisClient.zRangeWithScores("stats:most_viewed_products", 0, 9, {
          REV: true,
        }),
      [],
    ),
  ]);

  const topSales = fmtLeaderboard(rawSales);
  const topCart = fmtLeaderboard(rawCart);
  const topViews = fmtLeaderboard(rawViews);

  const dailyMap: Record<
    string,
    { date: string; cart: number; purchase: number; view: number }
  > = {};
  for (const record of dailyDbData) {
    const d = record.createdAt;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    if (!dailyMap[key])
      dailyMap[key] = { date: key, cart: 0, purchase: 0, view: 0 };
    if (record.type === "CART") dailyMap[key].cart += record.count;
    if (record.type === "PURCHASE") dailyMap[key].purchase += record.count;
    if (record.type === "VIEW") dailyMap[key].view += record.count;
  }

  const uniqueSlugs = new Set([
    ...topSales.slice(0, 5).map((i) => i.slug),
    ...topCart.slice(0, 5).map((i) => i.slug),
    ...topViews.slice(0, 5).map((i) => i.slug),
  ]);

  const groupedBarChartData = await Promise.all(
    Array.from(uniqueSlugs).map(async (slug) => {
      const [salesScore, cartScore, viewsScore] = await Promise.all([
        safeRedis(
          () => redisClient.zScore("stats:most_purchased_products", slug),
          null,
        ),
        safeRedis(
          () => redisClient.zScore("stats:most_carted_products", slug),
          null,
        ),
        safeRedis(
          () => redisClient.zScore("stats:most_viewed_products", slug),
          null,
        ),
      ]);
      return {
        name: slug,
        sales: salesScore ? Math.floor(salesScore) : 0,
        cart: cartScore ? Math.floor(cartScore) : 0,
        views: viewsScore ? Math.floor(viewsScore) : 0,
      };
    }),
  );

  return {
    kpis: {
      topSeller: topSales[0] ?? null,
      topCarted: topCart[0] ?? null,
      topViewed: topViews[0] ?? null,
    },
    groupedBarChartData,
    dailyTrends: Object.values(dailyMap),
  };
}

export async function getViews(): Promise<ViewsSlice> {
  try {
    const [homeRaw, productRaw, aboutRaw] = await Promise.all([
      redisClient.get("stats:generecViews:homepage"),
      redisClient.get("stats:generecViews:productpage"),
      redisClient.get("stats:generecViews:aboutpage"),
    ]);

    const home = homeRaw ? parseInt(homeRaw, 10) : 0;
    const product = productRaw ? parseInt(productRaw, 10) : 0;
    const about = aboutRaw ? parseInt(aboutRaw, 10) : 0;

    return {
      total: home + product + about,
      distribution: [
        { name: "Home Page", value: home },
        { name: "Product Page", value: product },
        { name: "About Page", value: about },
      ],
    };
  } catch (error) {
    console.error("Failed to fetch views from Redis:", error);

    return {
      total: 0,
      distribution: [
        { name: "Home Page", value: 0 },
        { name: "Product Page", value: 0 },
        { name: "About Page", value: 0 },
      ],
    };
  }
}

async function getRecentOrders(): Promise<RecentOrder[]> {
  const rows = await prisma.order.findMany({
    take: 8,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      totalPrice: true,
      status: true,
      createdAt: true,
      user: { select: { name: true, email: true } },
    },
  });
  return rows.map((o) => ({
    id: o.id,
    user: o.user,
    totalPrice: o.totalPrice,
    status: o.status,
    createdAt: o.createdAt.toISOString(),
  }));
}

async function getRecentUsers(): Promise<RecentUser[]> {
  const rows = await prisma.user.findMany({
    take: 8,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      country: true,
      createdAt: true,
    },
  });
  return rows.map((u) => ({ ...u, createdAt: u.createdAt.toISOString() }));
}

async function getComments(): Promise<CommentsSlice> {
  const rows = await prisma.comment.groupBy({
    by: ["rating"],
    _count: { id: true },
    orderBy: { rating: "asc" },
  });
  const totalComments = rows.reduce((s, r) => s + r._count.id, 0);
  const weightedSum = rows.reduce((s, r) => s + r.rating * r._count.id, 0);
  const averageRating =
    totalComments > 0 ?
      parseFloat((weightedSum / totalComments).toFixed(2))
    : 0;
  const stats: CommentStat[] = rows.map((r) => ({
    rating: r.rating,
    count: r._count.id,
    percentage:
      totalComments > 0 ?
        parseFloat(((r._count.id / totalComments) * 100).toFixed(1))
      : 0,
  }));
  return { totalComments, averageRating, stats };
}
async function getKSAvisits(): Promise<KSAVisitsSlice> {
  try {
    const rawData = await safeRedis(
      () =>
        redisClient.zRangeWithScores("KSA:leaderBord", 0, 14, {
          REV: true,
        }),
      [],
    );

    let total = 0;
    const distribution = rawData.map((item) => {
      const score = Math.floor(item.score);
      total += score; // حساب إجمالي زيارات المملكة بالكامل من الداتا المسترجعة

      return {
        name: item.value, // اسم المدينة المعقم (مثل Riyadh, Jeddah)
        value: score, // عدد الزيارات
      };
    });

    return {
      total,
      distribution,
    };
  } catch (error) {
    console.error("Failed to fetch KSA visits from Redis:", error);
    return {
      total: 0,
      distribution: [],
    };
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN FUNCTION — بدون "use server" عشان page.tsx يقدر ينادي عليها
// ══════════════════════════════════════════════════════════════════════════════

export async function fetchDashboardData(
  tf: TF = "30d",
): Promise<DashboardData> {
  const [
    finance,
    orders,
    products,
    views,
    recentOrders,
    recentUsers,
    comments,
    KSAviews,
  ] = await Promise.all([
    getFinance(tf),
    getOrders(tf),
    getProducts(),
    getViews(),
    getRecentOrders(),
    getRecentUsers(),
    getComments(),
    getKSAvisits(),
  ]);

  return {
    finance,
    orders,
    products,
    views,
    recentOrders,
    recentUsers,
    comments,
    KSAviews,
  };
}
