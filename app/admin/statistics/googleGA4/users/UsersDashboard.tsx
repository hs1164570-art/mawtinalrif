// app/dashboard/analytics/users/UsersDashboard.tsx
"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

import { PageHeader } from "../components/analytics/PageHeader";
import { KpiCard } from "../components/analytics/KpiCard";
import {
  KpiCardSkeleton,
  ChartSkeleton,
} from "../components/analytics/ChartSkeleton";
import { ChartCard } from "../components/analytics/ChartCard";
import { InsightsPanel } from "../components/analytics/InsightsPanel";
import { useUsersReport } from "../lib/hooks/useAnalyticsQueries";
import { generateInsights } from "../lib/insights-generator";
import { DateRange } from "../lib/types";
import { formatNumber, formatDuration } from "../lib/utils";

const CountryMap = dynamic(
  () => import("../components/analytics/CountryMap").then((m) => m.CountryMap),
  {
    ssr: false,
    loading: () => <ChartSkeleton variant="map" />,
  },
);
const GenderDonutChart = dynamic(
  () => import("../components/analytics/charts/GenderDonutChart"),
  {
    ssr: false,
    loading: () => <ChartSkeleton variant="donut" />,
  },
);
const AgeGroupStackedBar = dynamic(
  () => import("../components/analytics/charts/AgeGroupStackedBar"),
  {
    ssr: false,
    loading: () => <ChartSkeleton variant="bar" />,
  },
);
const ActiveUsersAreaChart = dynamic(
  () => import("../components/analytics/charts/ActiveUsersAreaChart"),
  {
    ssr: false,
    loading: () => <ChartSkeleton variant="line" />,
  },
);
const DauWauMauGauge = dynamic(
  () => import("../components/analytics/charts/DauWauMauGauge"),
  {
    ssr: false,
    loading: () => <ChartSkeleton variant="donut" />,
  },
);
const CohortHeatmapTable = dynamic(
  () => import("../components/analytics/charts/CohortHeatmapTable"),
  {
    ssr: false,
    loading: () => <ChartSkeleton variant="table" />,
  },
);

export function UsersDashboard({ range }: { range: DateRange }) {
  const { data, isLoading } = useUsersReport(range);

  const insights = useMemo(
    () => (data ? generateInsights(data, "users") : []),
    [data],
  );
  const mapData = useMemo(
    () =>
      data ?
        data.geo.map((g) => ({
          countryCode: g.countryCode,
          value: g.totalUsers,
        }))
      : [],
    [data],
  );

  return (
    <div className="p-4 md:p-8 max-w-[1500px] mx-auto" dir="rtl">
      <PageHeader
        title="المستخدمون"
        subtitle="من هم زوارك، من أين يأتون، ومدى تفاعلهم مع المتجر"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {isLoading || !data ?
          Array.from({ length: 4 }).map((_, i) => <KpiCardSkeleton key={i} />)
        : <>
            <KpiCard
              label="إجمالي المستخدمين"
              value={data.totalUsers}
              formattedValue={formatNumber(data.totalUsers)}
            />
            <KpiCard
              label="مستخدمون جدد"
              value={data.newUsers}
              formattedValue={formatNumber(data.newUsers)}
              accent="cyan"
            />
            <KpiCard
              label="مستخدمون عائدون"
              value={data.returningUsers}
              formattedValue={formatNumber(data.returningUsers)}
            />
            <KpiCard
              label="متوسط مدة التفاعل"
              value={data.avgEngagementDurationSec}
              formattedValue={formatDuration(data.avgEngagementDurationSec)}
            />
          </>
        }
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        <ChartCard
          title="توزيع المستخدمين الجغرافي"
          subtitle="عدد المستخدمين حسب الدولة والمدينة"
          span="2"
        >
          {data && <CountryMap data={mapData} />}
        </ChartCard>
        <ChartCard
          title="التوزيع حسب الجنس"
          subtitle="نسبة الذكور إلى الإناث بين الزوار"
        >
          {data && <GenderDonutChart data={data.demographics} />}
        </ChartCard>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        <ChartCard
          title="الفئات العمرية: جدد مقابل عائدين"
          subtitle="توزيع المستخدمين الجدد والعائدين حسب العمر"
          span="2"
        >
          {data && <AgeGroupStackedBar data={data.demographics} />}
        </ChartCard>
        <ChartCard
          title="نسب الالتصاق (DAU/WAU/MAU)"
          subtitle="مدى تكرار عودة المستخدمين للمتجر"
        >
          {data && <DauWauMauGauge data={data.ratios} />}
        </ChartCard>
      </div>

      <div className="grid gap-4 mb-4">
        <ChartCard
          title="اتجاه المستخدمين النشطين"
          subtitle="عدد المستخدمين النشطين خلال يوم، ٧ أيام، و٢٨ يومًا"
          span="full"
        >
          {data && <ActiveUsersAreaChart data={data.activeUsersTrend} />}
        </ChartCard>
      </div>

      <div className="grid gap-4 mb-6">
        <ChartCard
          title="معدل الاحتفاظ بالجمهور (Cohorts)"
          subtitle="نسبة عودة كل جمهور أسبوعًا بعد أسبوع منذ أول زيارة"
          span="full"
        >
          {data && <CohortHeatmapTable data={data.cohorts} />}
        </ChartCard>
      </div>

      <InsightsPanel insights={insights} />
    </div>
  );
}
