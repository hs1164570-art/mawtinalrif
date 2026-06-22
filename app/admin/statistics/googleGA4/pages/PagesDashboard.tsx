// app/dashboard/analytics/pages/PagesDashboard.tsx
"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { ChartCard } from "../components/analytics/ChartCard";
import {
  ChartSkeleton,
  KpiCardSkeleton,
} from "../components/analytics/ChartSkeleton";
import { InsightsPanel } from "../components/analytics/InsightsPanel";
import { KpiCard } from "../components/analytics/KpiCard";
import { PageHeader } from "../components/analytics/PageHeader";
import { usePagesReport } from "../lib/hooks/useAnalyticsQueries";
import { generateInsights } from "../lib/insights-generator";
import { DateRange } from "../lib/types";
import { formatNumber } from "../lib/utils";

const TopPagesTable = dynamic(
  () => import("../components/analytics/charts/TopPagesTable"),
  {
    ssr: false,
    loading: () => <ChartSkeleton variant="table" />,
  },
);
const LandingExitBarChart = dynamic(
  () => import("../components/analytics/charts/LandingExitBarChart"),
  {
    ssr: false,
    loading: () => <ChartSkeleton variant="bar" />,
  },
);
const PageFlowSankey = dynamic(
  () => import("../components/analytics/charts/PageFlowSankey"),
  {
    ssr: false,
    loading: () => <ChartSkeleton variant="funnel" />,
  },
);
const ContentGroupDonut = dynamic(
  () => import("../components/analytics/charts/ContentGroupDonut"),
  {
    ssr: false,
    loading: () => <ChartSkeleton variant="donut" />,
  },
);
const EventsBarChart = dynamic(
  () => import("../components/analytics/charts/EventsBarChart"),
  {
    ssr: false,
    loading: () => <ChartSkeleton variant="bar" />,
  },
);

export function PagesDashboard({ range }: { range: DateRange }) {
  const { data, isLoading } = usePagesReport(range);
  const insights = useMemo(
    () => (data ? generateInsights(data, "pages") : []),
    [data],
  );

  return (
    <div className="p-4 md:p-8 max-w-[1500px] mx-auto" dir="rtl">
      <PageHeader
        title="الصفحات والأحداث"
        subtitle="أكثر الصفحات زيارة، ومسار تصفح الزوار داخل المتجر"
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        {isLoading || !data ?
          Array.from({ length: 3 }).map((_, i) => <KpiCardSkeleton key={i} />)
        : <>
            <KpiCard
              label="إجمالي المشاهدات"
              value={data.totalViews}
              formattedValue={formatNumber(data.totalViews)}
              accent="cyan"
            />
            <KpiCard
              label="مشاهدات لكل جلسة"
              value={data.viewsPerSession}
              formattedValue={String(data.viewsPerSession)}
            />
            <KpiCard
              label="مشاهدات لكل مستخدم"
              value={data.viewsPerUser}
              formattedValue={String(data.viewsPerUser)}
            />
          </>
        }
      </div>

      <div className="grid gap-4 mb-4">
        <ChartCard
          title="أهم الصفحات"
          subtitle="الصفحات الأكثر مشاهدة مع اتجاه آخر ١٠ فترات لكل صفحة"
          span="full"
        >
          {data && <TopPagesTable data={data.topPages} />}
        </ChartCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        <ChartCard
          title="صفحات الدخول مقابل الخروج"
          subtitle="أي الصفحات يبدأ بها الزوار رحلتهم وأيها ينهونها"
        >
          {data && <LandingExitBarChart data={data.landingVsExit} />}
        </ChartCard>
        <ChartCard
          title="مسار التصفح"
          subtitle="تدفق الزوار من صفحة الدخول وصولًا إلى الخروج"
        >
          {data && <PageFlowSankey data={data.flow} />}
        </ChartCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        <ChartCard
          title="توزيع تصنيفات المحتوى"
          subtitle="حصة كل تصنيف من إجمالي المشاهدات"
        >
          {data && <ContentGroupDonut data={data.contentGroups} />}
        </ChartCard>
        <ChartCard
          title="أكثر الأحداث تكرارًا"
          subtitle="الإجراءات التي يقوم بها الزوار داخل المتجر"
        >
          {data && <EventsBarChart data={data.events} />}
        </ChartCard>
      </div>

      <InsightsPanel insights={insights} />
    </div>
  );
}
