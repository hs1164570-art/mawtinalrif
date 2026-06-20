"use client";

import { SlidersHorizontal, Loader2 } from "lucide-react";
import { ProductsFilters } from "@/utils/products";

interface Props {
  filters: ProductsFilters;
  onFilterChange: (f: Partial<ProductsFilters>) => void;
  onOpenFilter: () => void;
  total: number;
  isFetching: boolean;
}

const SORT_OPTIONS = [
  { value: "newest", label: "الأحدث" },
  { value: "price-asc", label: "الأقل سعرًا" },
  { value: "price-desc", label: "الأعلى سعرًا" },
  { value: "rating-desc", label: "الأعلى تقييمًا" },
];

export default function FilterTopBar({
  filters,
  onFilterChange,
  onOpenFilter,
  total,
  isFetching,
}: Props) {
  const activeFiltersCount = [
    filters.sort !== "newest",
    filters.minPrice > 0,
    filters.maxPrice < 9_999_999,
    filters.inStock,
    filters.rating > 0,
  ].filter(Boolean).length;

  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      {/* Results count */}
      <p
        className="text-sm text-[var(--text-3)]"
        aria-live="polite"
        aria-atomic="true"
      >
        {isFetching ?
          <span className="flex items-center gap-1.5">
            <Loader2
              className="w-3.5 h-3.5 animate-spin"
              style={{ color: "var(--cyan)" }}
              aria-hidden="true"
            />
            <span className="sr-only">جاري التحديث</span>
            <span className="text-[var(--text-3)]">جاري التحديث…</span>
          </span>
        : <>
            <span className="font-semibold text-[var(--text-1)]">
              {total.toLocaleString("en-US")}
            </span>{" "}
            منتج
          </>
        }
      </p>

      <div className="flex items-center gap-2">
        {/* Sort select */}
        <label htmlFor="sort-select" className="sr-only">
          ترتيب المنتجات
        </label>
        <select
          id="sort-select"
          value={filters.sort}
          onChange={(e) => onFilterChange({ sort: e.target.value, page: 1 })}
          className="h-10 text-sm rounded-xl border border-[var(--border-md)] bg-[var(--surface)] text-[var(--text-1)] px-3 focus:outline-none focus:ring-2 focus:border-transparent cursor-pointer"
          style={{ "--tw-ring-color": "var(--cyan)" } as React.CSSProperties}
          aria-label="ترتيب المنتجات"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        {/* Filter toggle — mobile only */}
        <button
          type="button"
          onClick={onOpenFilter}
          className="lg:hidden relative h-10 px-4 flex items-center gap-2 rounded-xl border border-[var(--border-md)] bg-[var(--surface)] text-sm text-[var(--text-1)] hover:bg-[var(--bg-deep)] transition-colors focus-visible:ring-2 focus-visible:ring-offset-1"
          style={{ "--tw-ring-color": "var(--cyan)" } as React.CSSProperties}
          aria-label="فتح خيارات التصفية"
          aria-expanded="false"
        >
          <SlidersHorizontal
            className="w-4 h-4"
            style={{ color: "var(--cyan)" }}
            aria-hidden="true"
          />
          <span>فلتر</span>
          {activeFiltersCount > 0 && (
            <span
              className="absolute -top-1.5 -end-1.5 w-5 h-5 rounded-full text-[var(--text-inv)] text-[10px] font-bold flex items-center justify-center"
              style={{ backgroundColor: "var(--cyan)" }}
              aria-label={`${activeFiltersCount} فلاتر نشطة`}
            >
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
