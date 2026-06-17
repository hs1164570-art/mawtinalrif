import { queryOptions } from "@tanstack/react-query";
import type { FinanceData, ProductsData, OrdersData } from "../_shared/types";
import {
  STALE_TIME_ANALYTICS,
  STALE_TIME_PRODUCTS,
} from "../_shared/constants";

type FilterKey = {
  tf: string;
  from: string;
  to: string;
  pf: string;
  pt: string;
};

// ─── Finance ──────────────────────────────────────────────────────────────────
export const financeQueryOptions = (key: FilterKey) =>
  queryOptions({
    queryKey: ["analytics", "finance", key] as const,
    queryFn: async ({ signal }) => {
      const p = new URLSearchParams(key as Record<string, string>);
      const res = await fetch(`/api/admin/analytics/finance?${p}`, { signal });
      if (!res.ok) throw new Error("finance fetch failed");
      const json = await res.json();
      return json.data as FinanceData;
    },
    staleTime: STALE_TIME_ANALYTICS,
  });

// ─── Products ─────────────────────────────────────────────────────────────────
export const productsQueryOptions = (key: FilterKey) =>
  queryOptions({
    queryKey: ["analytics", "products", key] as const,
    queryFn: async ({ signal }) => {
      const p = new URLSearchParams(key as Record<string, string>);
      const res = await fetch(`/api/admin/analytics/products?${p}`, { signal });
      if (!res.ok) throw new Error("products fetch failed");
      const json = await res.json();
      return json.data as ProductsData;
    },
    staleTime: STALE_TIME_PRODUCTS,
  });

// ─── Orders ───────────────────────────────────────────────────────────────────
export const ordersQueryOptions = (key: FilterKey) =>
  queryOptions({
    queryKey: ["analytics", "orders", key] as const,
    queryFn: async ({ signal }) => {
      const p = new URLSearchParams(key as Record<string, string>);
      const res = await fetch(`/api/admin/analytics/orders?${p}`, { signal });
      if (!res.ok) throw new Error("orders fetch failed");
      const json = await res.json();
      return json.data as OrdersData;
    },
    staleTime: STALE_TIME_ANALYTICS,
  });
