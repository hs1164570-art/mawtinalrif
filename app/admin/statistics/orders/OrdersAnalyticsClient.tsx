// OrdersClient.tsx
"use client";

import { Suspense, lazy, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import hotkeys from "hotkeys-js";
import { ClipboardList } from "lucide-react";
import { useAnalyticsFilters } from "../_shared/hooks/useAnalyticsFilters";
import { ordersQueryOptions } from "../_lib/queryOptions";
import FilterBar from "../_shared/components/FilterBar";
import DataExporter from "../_shared/components/DataExporter";
import OrderKpiCards from "./OrderKpiCards";
import OrderInsights from "./OrderInsights";

const OrderFunnel = lazy(() => import("./charts/OrderFunnel"));
const StatusRadialBar = lazy(() => import("./charts/StatusRadialBar"));
const EfficiencyScatter = lazy(() => import("./charts/EfficiencyScatter"));
import OrderHeatmapWrapper from "./OrderHeatmapWrapper";
const Skel = ({ h = 280 }: { h?: number }) => (
  <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border-md)] p-5 animate-pulse">
    <div className="h-4 bg-[var(--bg-deep)] rounded w-40 mb-4" />
    <div className="bg-[var(--surface-2)] rounded-xl" style={{ height: h }} />
  </div>
);

export default function OrdersClient({
  initialKey,
}: {
  initialKey: Record<string, string>;
}) {
  const hook = useAnalyticsFilters();
  const key = hook.queryKey;

  const { data, isLoading, isFetching } = useQuery({
    ...ordersQueryOptions(key),
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
    if (!data?.flowByDay) return [];
    return data.flowByDay.map((r) => ({
      التاريخ: r.date,
      "عدد الطلبات": r.count,
    }));
  };

  const isStale = isFetching && !!data;

  return (
    <div className="flex flex-col gap-6 w-full min-w-0" dir="rtl">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-[#7A9BBF]/10 text-[#7A9BBF]">
              <ClipboardList size={18} />
            </span>
            <h1 className="text-xl font-bold text-[var(--text-1)]">
              الطلبات والعمليات
            </h1>
            {isStale && (
              <span className="h-2 w-2 rounded-full bg-[#7A9BBF] animate-pulse" />
            )}
          </div>
          <p className="text-sm text-[var(--text-3)] mr-10">
            تدفق الطلبات وكفاءة التشغيل
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <DataExporter
            getData={getExportData}
            fileName="تقرير-الطلبات"
            disabled={isLoading}
          />
        </div>
      </div>

      <FilterBar hook={hook} />

      {/* KPIs */}
      {isLoading ?
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-[var(--surface)] rounded-2xl border border-[var(--border-md)] p-5 animate-pulse h-24"
            />
          ))}
        </div>
      : data ?
        <OrderKpiCards data={data} isComparison={hook.isComparison} />
      : null}

      {/* Charts */}
      <div
        className={`transition-opacity duration-300 ${isStale ? "opacity-70" : "opacity-100"}`}
        aria-busy={isStale}
        aria-live="polite"
      >
        {/* Row 1: Funnel + Radial */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          <Suspense fallback={<Skel />}>
            {data ?
              <OrderFunnel statusDistribution={data.statusDistribution} />
            : <Skel />}
          </Suspense>
          <Suspense fallback={<Skel />}>
            {data ?
              <StatusRadialBar statusDistribution={data.statusDistribution} />
            : <Skel />}
          </Suspense>
        </div>

        {/* Row 2: Scatter (full) */}
        <div className="mb-5">
          <Suspense fallback={<Skel h={300} />}>
            {data ?
              <EfficiencyScatter
                data={data.efficiencyData}
                isComparison={hook.isComparison}
              />
            : <Skel h={300} />}
          </Suspense>
        </div>

        {/* Row 3: Calendar Heatmap */}
        <Suspense fallback={<Skel h={180} />}>
          {data ?
            <OrderHeatmapWrapper data={data.heatmapData} />
          : <Skel h={180} />}
        </Suspense>
      </div>

      {data && <OrderInsights data={data} periodLabel={hook.periodLabel()} />}
    </div>
  );
}
