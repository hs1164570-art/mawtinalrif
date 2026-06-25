"use client";

import { useState, useCallback, useTransition } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  useQueryStates,
} from "nuqs";
import { AnimatePresence } from "framer-motion";

import CategoryHero from "./CategoryHero";
import ProductsGrid from "./ProductsGrid";
import FilterDrawer from "./FilterDrawer";
import FilterTopBar from "./FilterTopBar";
import PaginationBar from "./PaginationBar";

import type { ProductsPageData, ProductsFilters } from "@/utils/products";

const FALLBACK_BG =
  "https://bwmvrztnbjayktocsdvc.supabase.co/storage/v1/object/sign/alrif/productBacground.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hNzkzMzE5NS0xOGUwLTRkOTMtYTRiMC0xNjczMTVlOTUyMGUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhbHJpZi9wcm9kdWN0QmFjZ3JvdW5kLnBuZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODEwOTc1OTEsImV4cCI6Mjk1MDEyNDE1OTF9.4ObB39B7KzW9kHij2anpwn8-U0ukXNDG7Bq0nAHMKPQ";

const filterParsers = {
  page: parseAsInteger.withDefault(1),
  sort: parseAsString.withDefault("newest"),
  minPrice: parseAsInteger.withDefault(0),
  maxPrice: parseAsInteger.withDefault(9_999_999),
  inStock: parseAsBoolean.withDefault(false),
  rating: parseAsInteger.withDefault(0),
};

async function fetchProducts(
  slug: string,
  filters: ProductsFilters,
): Promise<ProductsPageData> {
  const params = new URLSearchParams({ slug });
  params.set("page", String(filters.page));
  params.set("sort", filters.sort);
  params.set("minPrice", String(filters.minPrice));
  params.set("maxPrice", String(filters.maxPrice));
  params.set("inStock", String(filters.inStock));
  params.set("rating", String(filters.rating));
  const res = await fetch(`/api/products?${params.toString()}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error("فشل تحميل المنتجات");
  return res.json();
}

interface Props {
  initialData: ProductsPageData;
  slugPath: string[];
  defaultBg?: string;
}

export default function ProductsPageClient({
  initialData,
  slugPath,
  defaultBg = FALLBACK_BG,
}: Props) {
  const lastSlug = slugPath[slugPath.length - 1];
  const [filterOpen, setFilterOpen] = useState(false);
  const [, startTransition] = useTransition();

  const [filters, setFilters] = useQueryStates(filterParsers, {
    history: "push",
    shallow: true,
    scroll: false,
  });

  const { data, isFetching } = useQuery<ProductsPageData>({
    queryKey: ["products", lastSlug, filters],
    queryFn: () => fetchProducts(lastSlug, filters as ProductsFilters),
    placeholderData: (prev) => prev ?? initialData,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const current = data ?? initialData;
  const heroImage =
    current.category.image ?? current.category.parent?.image ?? defaultBg;

  const handleFilterChange = useCallback(
    (partial: Partial<ProductsFilters>) =>
      startTransition(() => setFilters({ ...partial }) as any),
    [setFilters],
  );

  const handlePageChange = useCallback(
    (page: number) =>
      startTransition(() => {
        setFilters({ page });
        window.scrollTo({ top: 0, behavior: "smooth" });
      }),
    [setFilters],
  );

  return (
    <main
      id="main-content"
      dir="rtl"
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        overflowX: "hidden",
      }}
    >
      {/* ── Hero ── */}
      <CategoryHero
        image={heroImage}
        categoryName={current.category.name}
        parentName={current.category.parent?.name}
        breadcrumbs={current.breadcrumbs}
        total={current.total}
        slug={current.category.slug}
      />

      {/* ── Body ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        {/* Top bar */}
        <FilterTopBar
          filters={filters as ProductsFilters}
          onFilterChange={handleFilterChange}
          onOpenFilter={() => setFilterOpen(true)}
          total={current.total}
          isFetching={isFetching}
        />

        {/* Grid */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 mt-6">
          {/* Sidebar — desktop only */}
          <div className="hidden lg:block lg:w-64 xl:w-72 shrink-0">
            <FilterDrawer
              mode="sidebar"
              filters={filters as ProductsFilters}
              priceRange={current.priceRange}
              onFilterChange={handleFilterChange}
              onClose={() => {}}
            />
          </div>

          {/* Products */}
          <div className="flex-1 min-w-0 space-y-8">
            <ProductsGrid
              products={current.products}
              categoryName={current.category.name}
              isFetching={isFetching}
            />

            {current.totalPages > 1 && (
              <div
                className="pt-4"
                style={{ borderTop: "1px solid var(--border)" }}
              >
                <PaginationBar
                  currentPage={current.currentPage}
                  totalPages={current.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {filterOpen && (
          <FilterDrawer
            key="mobile-filter"
            mode="drawer"
            filters={filters as ProductsFilters}
            priceRange={current.priceRange}
            onFilterChange={handleFilterChange}
            onClose={() => setFilterOpen(false)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
