"use server";

// ✅ هذا الفايل Server Action wrapper للـ Dashboard.tsx (client component)
// page.tsx يستخدم dataCore.ts مباشرة بدون "use server"

import { fetchDashboardData as _fetchDashboardData } from "./dataCore";

// Re-export الـ types كلها من dataCore
export type {
  TF,
  DayValue,
  FinanceSeries,
  FinanceSlice,
  OrderKPI,
  StatusDistItem,
  OrdersSlice,
  LeaderboardItem,
  ProductsSlice,
  ViewsSlice,
  RecentOrder,
  RecentUser,
  CommentStat,
  CommentsSlice,
  DashboardData,
} from "./dataCore";

// ✅ Server Action — الكلاينت (Dashboard.tsx) ينادي عليها
export async function fetchDashboardData(
  tf = "30d" as import("./dataCore").TF,
) {
  return _fetchDashboardData(tf);
}
