// lib/query-client.ts
// Shared QueryClient factory used by both the server (prefetchQuery/dehydrate)
// and the client provider, so caching/staleTime behavior stays consistent
// across the app (DRY, single config source).

import { QueryClient } from "@tanstack/react-query";
// 1. التعديل الصح هنا: بما إنها default export بنسميها getClient علطول بدون أقواس وبدون as
import getClient from "@/lib/getQueryClient";

let browserQueryClient: QueryClient | undefined;

/** Returns a fresh client on the server, a singleton in the browser. */
export function getQueryClient() {
  const isServer = typeof window === "undefined";

  // 2. إذا كنا على السيرفر، بنادي الدالة اللي جاية من الـ cache(react) علطول
  if (isServer) {
    return getClient();
  }

  // 3. إذا كنا في المتصفح، بنعمل الـ Singleton المضمون بتاعنا
  if (!browserQueryClient) {
    browserQueryClient = getClient();
  }
  return browserQueryClient;
}

export const QUERY_KEYS = {
  users: (range: { startDate: string; endDate: string }) =>
    ["analytics", "users", range] as const,
  sessions: (range: { startDate: string; endDate: string }) =>
    ["analytics", "sessions", range] as const,
  campaigns: (range: { startDate: string; endDate: string }) =>
    ["analytics", "campaigns", range] as const,
  pages: (range: { startDate: string; endDate: string }) =>
    ["analytics", "pages", range] as const,
  tech: (range: { startDate: string; endDate: string }) =>
    ["analytics", "tech", range] as const,
  realtime: () => ["analytics", "realtime"] as const,
};
