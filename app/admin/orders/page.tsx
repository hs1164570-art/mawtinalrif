import type { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import getQueryClient from "@/lib/getQueryClient";
import { OrdersClient } from "./_components/OrdersClient";

export const metadata: Metadata = { title: "الطلبات" };

interface OrdersPageProps {
  searchParams: Promise<{
    page?: string;
    status?: string;
    searchQuery?: string;
    searchType?: string;
  }>;
}

async function fetchOrders(params: Record<string, string>) {
  const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const sp = new URLSearchParams(params);
  const res = await fetch(`${BASE}/api/admin/orders?${sp}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch orders");
  return res.json();
}

async function fetchOrderStats() {
  const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const res = await fetch(`${BASE}/api/admin/orders/stats`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch order stats");
  return res.json();
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const sp = await searchParams;
  const params: Record<string, string> = {
    pageNumber: sp.page ?? "1",
    ...(sp.status && { status: sp.status }),
    ...(sp.searchQuery && { searchQuery: sp.searchQuery }),
    ...(sp.searchType && { searchType: sp.searchType }),
  };

  const queryClient = getQueryClient();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["admin-orders", params],
      queryFn: () => fetchOrders(params),
    }),
    queryClient.prefetchQuery({
      queryKey: ["admin-order-stats"],
      queryFn: fetchOrderStats,
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <OrdersClient initialParams={params} />
    </HydrationBoundary>
  );
}
