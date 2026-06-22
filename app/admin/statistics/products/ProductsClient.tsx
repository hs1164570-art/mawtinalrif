// ProductsClient.tsx
"use client";

import { Suspense, lazy, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import hotkeys from "hotkeys-js";
import { ShoppingBag } from "lucide-react";
import { useAnalyticsFilters } from "../_shared/hooks/useAnalyticsFilters";
import { productsQueryOptions } from "../_lib/queryOptions";
import { PALETTE } from "../_shared/constants";
import FilterBar from "../_shared/components/FilterBar";
import DataExporter from "../_shared/components/DataExporter";
import ProductKpiCards from "./ProductKpiCards";
import SmartProductTable from "./SmartProductTable";
import ProductInsights from "./ProductInsights";

const InterestRadar = lazy(() => import("./charts/InterestRadar"));
const SalesTreemap = lazy(() => import("./charts/SalesTreemap"));
const ConversionBar = lazy(() => import("./charts/ConversionBar"));

const Skel = ({ h = 280 }: { h?: number }) => (
  <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border-md)] p-5 animate-pulse">
    <div className="h-4 bg-[var(--bg-deep)] rounded w-40 mb-4" />
    <div className="bg-[var(--surface-2)] rounded-xl" style={{ height: h }} />
  </div>
);

export default function ProductsClient({
  initialKey,
}: {
  initialKey: Record<string, string>;
}) {
  const hook = useAnalyticsFilters();
  const key = hook.queryKey;

  const { data, isLoading, isFetching } = useQuery({
    ...productsQueryOptions(key),
    placeholderData: (prev) => prev,
  });

  useEffect(() => {
    hotkeys("ctrl+e, command+e", (e) => {
      e.preventDefault();
      window.dispatchEvent(new Event("triggerExport"));
    });
    return () => hotkeys.unbind("ctrl+e, command+e");
  }, []);

  const getExportData = () => {
    if (!data?.groupedBarChartData) return [];
    return data.groupedBarChartData.map((r) => ({
      المنتج: r.name,
      المشاهدات: r.views,
      "إضافة للسلة": r.cart,
      المبيعات: r.sales,
    }));
  };

  const isStale = isFetching && !!data;

  return (
    <div className="flex flex-col gap-6 w-full min-w-0" dir="rtl">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className="p-2 rounded-xl"
              style={{
                backgroundColor: `${PALETTE.sage}1A`,
                color: PALETTE.sage,
              }}
            >
              <ShoppingBag size={18} />
            </span>
            <h1 className="text-xl font-bold text-[var(--text-1)]">
              المنتجات والمبيعات
            </h1>
            {isStale && (
              <span
                className="h-2 w-2 rounded-full animate-pulse"
                style={{ background: PALETTE.sage }}
              />
            )}
          </div>
          <p className="text-sm text-[var(--text-3)] mr-10">
            المشاهدات والسلة والتحويل البيعي
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <DataExporter
            getData={getExportData}
            fileName="تقرير-المنتجات"
            disabled={isLoading}
          />
        </div>
      </div>

      <FilterBar hook={hook} />

      {/* KPIs */}
      {isLoading ?
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-[var(--surface)] rounded-2xl border border-[var(--border-md)] p-5 animate-pulse h-28"
            />
          ))}
        </div>
      : data ?
        <ProductKpiCards data={data} />
      : null}

      {/* Charts */}
      <div
        className={`transition-opacity duration-300 ${isStale ? "opacity-70" : "opacity-100"}`}
        aria-busy={isStale}
        aria-live="polite"
      >
        {/* Row 1: Radar + Treemap */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          <Suspense fallback={<Skel />}>
            {data ?
              <InterestRadar data={data.individualCharts.topViews} />
            : <Skel />}
          </Suspense>
          <Suspense fallback={<Skel />}>
            {data ?
              <SalesTreemap data={data.individualCharts.topSales} />
            : <Skel />}
          </Suspense>
        </div>

        {/* Row 2: Grouped Bar (full width) */}
        <div className="mb-5">
          <Suspense fallback={<Skel h={300} />}>
            {data ?
              <ConversionBar data={data.groupedBarChartData.slice(0, 5)} />
            : <Skel h={300} />}
          </Suspense>
        </div>

        {/* Row 3: Smart table */}
        {data && (
          <SmartProductTable
            data={data.tableData ?? data.groupedBarChartData}
          />
        )}
      </div>

      {data && <ProductInsights data={data} periodLabel={hook.periodLabel()} />}
    </div>
  );
}
