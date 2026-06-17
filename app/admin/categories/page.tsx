import type { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import getQueryClient from "@/lib/getQueryClient";
import { CategoriesClient } from "./_components/CategoriesClient";

export const metadata: Metadata = { title: "الفئات" };

async function fetchCategories() {
  const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const res = await fetch(`${BASE}/api/categories`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

export default async function CategoriesPage() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["admin-categories"],
    queryFn: fetchCategories,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CategoriesClient />
    </HydrationBoundary>
  );
}
