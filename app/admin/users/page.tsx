import type { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import getQueryClient from "@/lib/getQueryClient";
import { UsersClient } from "./_components/UsersClient";

export const metadata: Metadata = { title: "المستخدمون" };

interface UsersPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    role?: string;
    status?: string;
  }>;
}

// تنظيف الـ URL وفصل منطق الـ Fetch
async function fetchUsers(params: URLSearchParams) {
  const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const res = await fetch(
    `${BASE}/api/admin/users/details?${params.toString()}`,
    {
      cache: "no-store",
    },
  );
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

async function fetchUserStats() {
  const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const res = await fetch(`${BASE}/api/admin/users/stats`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch user stats");
  return res.json();
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const sp = await searchParams;

  // تجهيز الـ Params بشكل نضيف ومباشر للـ API والـ Query Key
  const queryParams = {
    usersNumber: sp.page ?? "1",
    ...(sp.search && { search: sp.search }),
    ...(sp.role && { role: sp.role }),
    ...(sp.status && { status: sp.status }),
  };

  // تحويلها لـ URLSearchParams عشان الـ fetch
  const searchString = new URLSearchParams(queryParams);

  const queryClient = getQueryClient();

  // عمل الـ Prefetch على السيرفر بالتوازي لتوفير الوقت
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["admin-users", queryParams],
      queryFn: () => fetchUsers(searchString),
    }),
    queryClient.prefetchQuery({
      queryKey: ["admin-user-stats"],
      queryFn: fetchUserStats,
    }),
  ]);

  return (
    // حقن البيانات جوه الكلاينت (Hydration)
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UsersClient initialParams={queryParams} />
    </HydrationBoundary>
  );
}
