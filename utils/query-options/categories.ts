import { queryOptions } from "@tanstack/react-query";
import type { RootCategory } from "../category";

export const categoriesQueryOptions = queryOptions({
  queryKey: ["categories"] as const,
  queryFn: async (): Promise<RootCategory[]> => {
    const res = await fetch("/api/categories");
    if (!res.ok) throw new Error("Failed to fetch categories");
    return res.json();
  },
  staleTime: 1000 * 60 * 60, // 1 hour – categories rarely change
  gcTime: 1000 * 60 * 60 * 2, // 2 hours
});
