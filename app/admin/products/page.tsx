import type { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import getQueryClient from "@/lib/getQueryClient";
import { ProductsClient } from "./_components/ProductsClient";
import { headers } from "next/headers"; // 👈 استيراد الهيدرز لتمرير الكوكيز

export const metadata: Metadata = { title: "المنتجات" };

interface ProductsPageProps {
  searchParams: Promise<{
    page?: string;
    q?: string;
    cat?: string;
    sort?: string;
    min?: string;
    max?: string;
  }>;
}

async function fetchProducts(params: Record<string, string>) {
  const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const sp = new URLSearchParams();

  Object.entries(params).forEach(([k, v]) => v && sp.set(k, v));
  if (!sp.has("limit")) sp.set("limit", "12");

  try {
    // 💡 التعديل الجوهري: نمرر الهيدرز الحالية للمتصفح (بما فيها كوكيز الـ Auth) للسيرفر
    const currentHeaders = await headers();

    const res = await fetch(`${BASE}/api/admin/products?${sp.toString()}`, {
      cache: "no-store",
      headers: Object.fromEntries(currentHeaders.entries()), // تمرير الكوكيز هنا
    });

    if (!res.ok) {
      console.error("🚨 Fetch Products Failed Status:", res.status);
      // 🔥 حماية: بدل ما نعمل throw يوقع الصفحة ويموت الـ Thread، بنرجع شكل الداتا الافتراضي
      return { products: [], meta: { totalCount: 0 } };
    }

    return await res.json();
  } catch (error) {
    console.error("🚨 Network/Auth Error in fetchProducts:", error);
    return { products: [], meta: { totalCount: 0 } };
  }
}

async function fetchCategories() {
  const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  try {
    const res = await fetch(`${BASE}/api/categories`, {
      next: { tags: ["categories"] },
    });
    if (!res.ok) {
      console.error("🚨 Fetch Categories Failed Status:", res.status);
      return [];
    }
    return await res.json();
  } catch (error) {
    console.error("🚨 Error in fetchCategories:", error);
    return [];
  }
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const sp = await searchParams;

  const params: Record<string, string> = {
    page: sp.page ?? "1",
    sort: sp.sort ?? "newest",
    q: sp.q ?? "",
    cat: sp.cat ?? "",
    ...(sp.min && { min: sp.min }),
    ...(sp.max && { max: sp.max }),
  };

  const queryClient = getQueryClient();

  // عمل الـ Prefetch داخل try/catch لحماية الـ Server Lifecycle بالكامل
  try {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: ["admin-products", params],
        queryFn: () => fetchProducts(params),
        staleTime: Infinity,
        gcTime: Infinity,
      }),
      queryClient.prefetchQuery({
        queryKey: ["admin-categories"],
        queryFn: fetchCategories,
        staleTime: Infinity,
        gcTime: Infinity,
      }),
    ]);
  } catch (prefetchError) {
    console.error("🚨 QueryClient Prefetch Failed safely:", prefetchError);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductsClient initialParams={params} />
    </HydrationBoundary>
  );
}
