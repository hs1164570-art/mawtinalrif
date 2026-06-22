// app/dashboard/analytics/tech-realtime/TechRealtimeDashboard.tsx
"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";

import { PageHeader } from "../components/analytics/PageHeader";
import { ChartCard } from "../components/analytics/ChartCard";
import {
  ChartSkeleton,
  KpiCardSkeleton,
} from "../components/analytics/ChartSkeleton";
import { InsightsPanel } from "../components/analytics/InsightsPanel";
import { KpiCard } from "../components/analytics/KpiCard";
import { DateRangePicker } from "../components/analytics/DateRangePicker";
import { LiveIndicator } from "../components/analytics/LiveIndicator";
import {
  useTechReport,
  useRealtimeReport,
} from "../lib/hooks/useAnalyticsQueries";
import { generateInsights } from "../lib/insights-generator";
import { DateRange } from "../lib/types";
import { formatNumber } from "../lib/utils";

const HourDayHeatmap = dynamic(
  () => import("../components/analytics/charts/HourDayHeatmap"),
  {
    ssr: false,
    loading: () => <ChartSkeleton variant="heatmap" />,
  },
);
const DeviceDonutChart = dynamic(
  () => import("../components/analytics/charts/DeviceDonutChart"),
  {
    ssr: false,
    loading: () => <ChartSkeleton variant="donut" />,
  },
);
const BrowserOsBarChart = dynamic(
  () => import("../components/analytics/charts/BrowserOsBarChart"),
  {
    ssr: false,
    loading: () => <ChartSkeleton variant="bar" />,
  },
);
const CountryMap = dynamic(
  () => import("../components/analytics/CountryMap").then((m) => m.CountryMap),
  {
    ssr: false,
    loading: () => <ChartSkeleton variant="map" />,
  },
);
const RealtimeAreaChart = dynamic(
  () => import("../components/analytics/charts/RealtimeAreaChart"),
  {
    ssr: false,
    loading: () => <ChartSkeleton variant="line" />,
  },
);
const RealtimeLocationTable = dynamic(
  () => import("../components/analytics/charts/RealtimeLocationTable"),
  {
    ssr: false,
    loading: () => <ChartSkeleton variant="table" />,
  },
);

export function TechRealtimeDashboard({
  initialRange,
}: {
  initialRange: DateRange;
}) {
  const [range, setRange] = useState(initialRange);
  const [activeDays, setActiveDays] = useState(28);

  const { data: tech, isLoading: techLoading } = useTechReport(range);
  const { data: realtime } = useRealtimeReport();

  const insights = useMemo(
    () => (tech ? generateInsights(tech, "tech-realtime") : []),
    [tech],
  );
  const realtimeMapData = useMemo(
    () =>
      realtime ?
        realtime.byLocation.map((r) => ({
          countryCode: r.countryCode,
          value: r.activeUsers,
        }))
      : [],
    [realtime],
  );

  function handlePreset(days: number) {
    setActiveDays(days);
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - (days - 1));
    setRange({
      startDate: start.toISOString().slice(0, 10),
      endDate: end.toISOString().slice(0, 10),
    });
  }

  return (
    <div className="p-4 md:p-8 max-w-[1500px] mx-auto" dir="rtl">
      <PageHeader
        title="الأجهزة والبيانات اللحظية"
        subtitle="كيف يصل الزوار إليك تقنيًا، ومن يتصفح المتجر الآن"
        actions={
          <DateRangePicker
            range={range}
            onChange={setRange}
            activeDays={activeDays}
            onPresetChange={handlePreset}
          />
        }
      />

      {/* ───────── Realtime section — visually distinct, top of page ───────── */}
      <section className="rounded-2xl border border-brand-red/20 bg-gradient-to-l from-brand-red/[0.04] to-transparent p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-extrabold text-text-1">
            النشاط اللحظي
          </h2>
          <LiveIndicator />
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-1 flex flex-col gap-3">
            <div className="rounded-2xl bg-surface border border-border p-5 text-center shadow-sm">
              <p className="text-xs text-text-3 mb-1">نشطون الآن</p>
              <p className="text-4xl font-extrabold text-brand-red tabular-nums">
                {realtime ? formatNumber(realtime.activeUsersNow) : "—"}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-surface border border-border p-3 text-center">
                <p className="text-[11px] text-text-3">الأحداث</p>
                <p className="text-base font-bold text-text-1 tabular-nums">
                  {realtime ? formatNumber(realtime.eventCountNow) : "—"}
                </p>
              </div>
              <div className="rounded-xl bg-surface border border-border p-3 text-center">
                <p className="text-[11px] text-text-3">المشاهدات</p>
                <p className="text-base font-bold text-text-1 tabular-nums">
                  {realtime ? formatNumber(realtime.pageViewsNow) : "—"}
                </p>
              </div>
            </div>
          </div>
          <div className="md:col-span-2 rounded-2xl bg-surface border border-border p-4 shadow-sm">
            <p className="text-xs text-text-3 mb-1">آخر ٣٠ دقيقة</p>
            {realtime ?
              <RealtimeAreaChart data={realtime.last30Minutes} />
            : <ChartSkeleton variant="line" />}
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <div className="rounded-2xl bg-surface border border-border p-4 shadow-sm">
            <p className="text-xs font-bold text-text-2 mb-3">
              المستخدمون النشطون حسب الدولة
            </p>
            {realtime && <CountryMap data={realtimeMapData} size="small" />}
          </div>
          <div className="rounded-2xl bg-surface border border-border p-4 shadow-sm">
            <p className="text-xs font-bold text-text-2 mb-3">
              تفاصيل النشاط الحالي
            </p>
            {realtime && <RealtimeLocationTable data={realtime.byLocation} />}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        {techLoading || !tech ?
          Array.from({ length: 3 }).map((_, i) => <KpiCardSkeleton key={i} />)
        : <>
            <KpiCard
              label="أكثر متصفح استخدامًا"
              value={tech.browsers[0]?.sessions}
              formattedValue={tech.browsers[0]?.browser ?? "—"}
            />
            <KpiCard
              label="أكثر جهاز استخدامًا"
              value={tech.devices[0]?.sessions}
              formattedValue={
                tech.devices[0] ?
                  tech.devices[0].deviceCategory === "mobile" ?
                    "جوال"
                  : tech.devices[0].deviceCategory === "desktop" ?
                    "حاسوب"
                  : "لوحي"
                : "—"
              }
            />
            <KpiCard
              label="أكثر نظام تشغيل استخدامًا"
              value={tech.operatingSystems[0]?.sessions}
              formattedValue={tech.operatingSystems[0]?.os ?? "—"}
            />
          </>
        }
      </div>

      <div className="grid gap-4 mb-4">
        <ChartCard
          title="خريطة الحرارة: الساعة × اليوم"
          subtitle="متى يكون الزوار أكثر نشاطًا خلال الأسبوع — مفيد لجدولة الإعلانات"
          span="full"
        >
          {tech && <HourDayHeatmap data={tech.hourDayHeatmap} />}
        </ChartCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        <ChartCard
          title="فئة الجهاز"
          subtitle="توزيع الجلسات بين الجوال والحاسوب واللوحي"
        >
          {tech && <DeviceDonutChart data={tech.devices} />}
        </ChartCard>
        <ChartCard
          title="المتصفحات وأنظمة التشغيل"
          subtitle="الأكثر استخدامًا بين الزوار"
        >
          {tech && (
            <BrowserOsBarChart
              browsers={tech.browsers}
              operatingSystems={tech.operatingSystems}
            />
          )}
        </ChartCard>
      </div>

      <InsightsPanel insights={insights} />
    </div>
  );
}
