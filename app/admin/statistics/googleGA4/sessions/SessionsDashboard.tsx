// app/dashboard/analytics/sessions/SessionsDashboard.tsx
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
import { CampaignsTable } from "../components/analytics/CampaignsTable";
import { useSessionsReport } from "../lib/hooks/useAnalyticsQueries";
import { generateInsights } from "../lib/insights-generator";
import { formatNumber, formatPercent, formatDuration } from "../lib/utils";
import { DateRange } from "../lib/types";

const CampaignsBarChart = dynamic(
  () => import("../components/analytics/charts/CampaignsBarChart"),
  {
    ssr: false,
    loading: () => <ChartSkeleton variant="bar" />,
  },
);
const CampaignsTrendChart = dynamic(
  () => import("../components/analytics/charts/CampaignsTrendChart"),
  {
    ssr: false,
    loading: () => <ChartSkeleton variant="line" />,
  },
);
const CampaignsRadarChart = dynamic(
  () => import("../components/analytics/charts/CampaignsRadarChart"),
  {
    ssr: false,
    loading: () => <ChartSkeleton variant="scatter" />,
  },
);
const SessionFunnelChart = dynamic(
  () => import("../components/analytics/charts/SessionFunnelChart"),
  {
    ssr: false,
    loading: () => <ChartSkeleton variant="funnel" />,
  },
);
const TopSourcesBarChart = dynamic(
  () => import("../components/analytics/charts/TopSourcesBarChart"),
  {
    ssr: false,
    loading: () => <ChartSkeleton variant="bar" />,
  },
);
const BounceRateLineChart = dynamic(
  () => import("../components/analytics/charts/BounceRateLineChart"),
  {
    ssr: false,
    loading: () => <ChartSkeleton variant="line" />,
  },
);
const ChannelTreemap = dynamic(
  () => import("../components/analytics/charts/ChannelTreemap"),
  {
    ssr: false,
    loading: () => <ChartSkeleton variant="treemap" />,
  },
);
const SourceScatterChart = dynamic(
  () => import("../components/analytics/charts/SourceScatterChart"),
  {
    ssr: false,
    loading: () => <ChartSkeleton variant="scatter" />,
  },
);
const FirstVisitTable = dynamic(
  () => import("../components/analytics/charts/FirstVisitTable"),
  {
    ssr: false,
    loading: () => <ChartSkeleton variant="table" />,
  },
);
const AcquisitionSourceExplorer = dynamic(
  () => import("../components/analytics/charts/AcquisitionSourceExplorer"),
  {
    ssr: false,
    loading: () => <ChartSkeleton variant="bar" />,
  },
);

export function SessionsDashboard({ range }: { range: DateRange }) {
  const { data, isLoading } = useSessionsReport(range);

  const insights = useMemo(
    () => (data ? generateInsights(data, "sessions") : []),
    [data],
  );

  const kpis = useMemo(() => {
    if (!data) return null;
    const totalEngaged = data.sources.reduce(
      (s, r) => s + r.engagedSessions,
      0,
    );
    const weightedBounce =
      data.sources.reduce((s, r) => s + r.bounceRate * r.sessions, 0) /
      Math.max(1, data.totalSessions);
    const weightedDuration =
      data.sources.reduce(
        (s, r) => s + r.avgSessionDurationSec * r.sessions,
        0,
      ) / Math.max(1, data.totalSessions);
    const engagementRate =
      (totalEngaged / Math.max(1, data.totalSessions)) * 100;
    return { weightedBounce, weightedDuration, engagementRate };
  }, [data]);

  return (
    <div className="p-4 md:p-8 max-w-[1500px] mx-auto" dir="rtl">
      <PageHeader
        title="الجلسات والاكتساب"
        subtitle="من أين تأتي الزيارات، وأي الحملات الإعلانية تستحق استمرار الإنفاق عليها"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {isLoading || !data || !kpis ?
          Array.from({ length: 4 }).map((_, i) => <KpiCardSkeleton key={i} />)
        : <>
            <KpiCard
              label="إجمالي الجلسات"
              value={data.totalSessions}
              formattedValue={formatNumber(data.totalSessions)}
              accent="cyan"
            />
            <KpiCard
              label="معدل التفاعل"
              value={kpis.engagementRate}
              formattedValue={formatPercent(kpis.engagementRate)}
            />
            <KpiCard
              label="معدل الارتداد"
              value={kpis.weightedBounce}
              formattedValue={formatPercent(kpis.weightedBounce)}
              accent="red"
            />
            <KpiCard
              label="متوسط مدة الجلسة"
              value={kpis.weightedDuration}
              formattedValue={formatDuration(kpis.weightedDuration)}
            />
          </>
        }
      </div>

      {/* ───────── Campaigns section — the most important part of this page ───────── */}
      <div className="rounded-2xl bg-gradient-to-l from-brand-cyan-bg to-transparent p-px mb-4">
        <div className="rounded-2xl bg-surface p-1">
          <div className="px-4 pt-4 flex items-center gap-2">
            <span className="text-lg">📢</span>
            <h2 className="text-base font-extrabold text-text-1">
              الحملات الإعلانية — أين تضع ميزانيتك القادمة؟
            </h2>
          </div>
          <div className="p-4 grid gap-4">
            <ChartCard
              title="ترتيب الحملات حسب عدد الزيارات"
              subtitle="الحملات الأعلى زيارات أولًا — اللون يعكس جودة التفاعل (أخضر = جيدة، أصفر = متوسطة، أحمر = ضعيفة)"
              span="full"
            >
              {data && <CampaignsBarChart data={data.campaigns} />}
            </ChartCard>

            {data && <CampaignsTable campaigns={data.campaigns} />}

            <div className="grid lg:grid-cols-3 gap-4">
              <ChartCard
                title="اتجاه الزيارات لأهم ٥ حملات"
                subtitle="هل زيارات كل حملة في ازدياد أم انخفاض خلال آخر أسبوعين؟"
                span="2"
              >
                {data && <CampaignsTrendChart data={data.campaignTrend} />}
              </ChartCard>
              <ChartCard
                title="الارتداد مقابل التفاعل"
                subtitle="مقارنة أهم ٥ حملات في معدلي الارتداد والتفاعل"
              >
                {data && <CampaignsRadarChart data={data.campaigns} />}
              </ChartCard>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        <ChartCard
          title="مسار الجلسات: مصدر ← وسيط ← حملة"
          subtitle="كم جلسة تصل إلى كل مرحلة من مراحل الإسناد"
        >
          {data && <SessionFunnelChart data={data.funnel} />}
        </ChartCard>
        <ChartCard
          title="أهم مصادر الجلسات"
          subtitle="المصادر الأكثر جلبًا للزيارات بشكل عام"
        >
          {data && <TopSourcesBarChart data={data.sources} />}
        </ChartCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        <ChartCard
          title="اتجاه معدل الارتداد"
          subtitle="الخط المتقطع يمثل المتوسط خلال الفترة"
        >
          {data && <BounceRateLineChart data={data.bounceRateTrend} />}
        </ChartCard>
        <ChartCard
          title="توزيع مجموعات القنوات"
          subtitle="حجم كل قناة تسويقية نسبة إلى إجمالي الجلسات"
        >
          {data && <ChannelTreemap data={data.channelTreemap} />}
        </ChartCard>
      </div>

      <div className="grid gap-4 mb-4">
        <ChartCard
          title="مقارنة المصادر: الجلسات × معدل التفاعل"
          subtitle="حجم الفقاعة يمثل عدد الجلسات — كلما زاد الارتفاع وقل الانحراف يمينًا كان المصدر أفضل"
          span="full"
        >
          {data && <SourceScatterChart data={data.sourceBubbles} />}
        </ChartCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        <ChartCard
          title="إسناد أول زيارة"
          subtitle="من أين جاء المستخدم في أول مرة زار فيها المتجر"
        >
          {data && <FirstVisitTable data={data.firstVisitAttribution} />}
        </ChartCard>
        <ChartCard
          title="من أين يأتي زوارك؟"
          subtitle="فلترة تفاعلية حسب المصدر (QR / واتساب / إعلانات / مباشر) — تُحدّث هذه البطاقة فقط"
        >
          {data && <AcquisitionSourceExplorer sources={data.sources} />}
        </ChartCard>
      </div>

      <InsightsPanel insights={insights} />
    </div>
  );
}
