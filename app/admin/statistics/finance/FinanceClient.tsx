"use client";

import { Suspense, lazy, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import hotkeys from "hotkeys-js";
import { TrendingUp } from "lucide-react";
import { useAnalyticsFilters } from "../_shared/hooks/useAnalyticsFilters";
import { financeQueryOptions } from "../_lib/queryOptions";
import FilterBar from "../_shared/components/FilterBar";
import DataExporter from "../_shared/components/DataExporter";
import FinanceKpiCards from "./FinanceKpiCards";
import FinanceInsights from "./FinanceInsights";

const SalesLineChart = lazy(() => import("./charts/SalesLineChart"));
const ProfitAreaChart = lazy(() => import("./charts/ProfitAreaChart"));
const DualAxisChart = lazy(() => import("./charts/DualAxisChart"));
const ProfitShareDonut = lazy(() => import("./charts/ProfitShareDonut"));

const ChartSkeleton = ({ h = 280 }: { h?: number }) => (
  <div className="bg-white rounded-2xl border border-[#EDE5D8] p-5 animate-pulse">
    <div className="h-4 bg-[#F5EFE6] rounded w-32 mb-4" />
    <div className="bg-[#FAF7F2] rounded-xl" style={{ height: h }} />
  </div>
);

export default function FinanceClient({
  initialKey,
}: {
  initialKey: Record<string, string>;
}) {
  const hook = useAnalyticsFilters();
  const key = hook.queryKey;

  const { data, isLoading, isFetching } = useQuery({
    ...financeQueryOptions(key),
    placeholderData: (prev) => prev,
  });

  // ── Global hotkeys ──────────────────────────────────────────────────────
  useEffect(() => {
    hotkeys("ctrl+e, command+e", (e) => {
      e.preventDefault();
      window.dispatchEvent(new Event("triggerExport"));
    });
    hotkeys("ctrl+shift+c", () => hook.toggleComparison());
    return () => hotkeys.unbind("ctrl+e, command+e, ctrl+shift+c");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Export data builder ─────────────────────────────────────────────────
  const getExportData = () => {
    if (!data?.combined) return [];
    return data.combined.map((r) => ({
      التاريخ: r.date,
      "إجمالي المبيعات": r.revenue,
      "صافي الأرباح": r.profit,
      التكاليف: Math.max(0, r.revenue - r.profit),
    }));
  };

  const isStale = isFetching && !!data;

  return (
    <div className="flex flex-col gap-6 w-full min-w-0" dir="rtl">
      {/* ── Page header ── */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-[#B89A5A]/10 text-[#B89A5A]">
              <TrendingUp size={18} />
            </span>
            <h1 className="text-xl font-bold text-[#3D2B1F]">
              الإيرادات والأرباح
            </h1>
            {isStale && (
              <span
                className="h-2 w-2 rounded-full bg-[#B89A5A] animate-pulse"
                aria-label="جاري التحديث"
              />
            )}
          </div>
          <p className="text-sm text-[#A89585] mr-10">
            حركة الأموال وصافي الربح
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <DataExporter
            getData={getExportData}
            fileName="تقرير-المالية"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* ── Filter bar ── */}
      <FilterBar hook={hook} />

      {/* ── KPI cards ── */}
      {isLoading ?
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-[#EDE5D8] p-5 animate-pulse h-28"
            />
          ))}
        </div>
      : data ?
        <FinanceKpiCards data={data} isComparison={hook.isComparison} />
      : null}

      {/* ── Charts grid ── */}
      <div
        className={`transition-opacity duration-300 ${isStale ? "opacity-70" : "opacity-100"}`}
        aria-busy={isStale}
        aria-live="polite"
      >
        {/* Row 1: Sales line + Profit area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          <Suspense fallback={<ChartSkeleton />}>
            {data ?
              <SalesLineChart
                data={data.revenue.data}
                isComparison={hook.isComparison}
              />
            : <ChartSkeleton />}
          </Suspense>
          <Suspense fallback={<ChartSkeleton />}>
            {data ?
              <ProfitAreaChart
                data={data.profit.data}
                isComparison={hook.isComparison}
              />
            : <ChartSkeleton />}
          </Suspense>
        </div>

        {/* Row 2: Dual-axis + Donut */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <Suspense fallback={<ChartSkeleton />}>
              {data ?
                <DualAxisChart combined={data.combined} />
              : <ChartSkeleton />}
            </Suspense>
          </div>
          <div>
            <Suspense fallback={<ChartSkeleton h={240} />}>
              {data ?
                <ProfitShareDonut
                  profit={data.profit.total}
                  costs={data.costs}
                  profitMargin={data.profitMargin}
                />
              : <ChartSkeleton h={240} />}
            </Suspense>
          </div>
        </div>
      </div>

      {/* ── Insights footer ── */}
      {data && <FinanceInsights data={data} periodLabel={hook.periodLabel()} />}
    </div>
  );
}
