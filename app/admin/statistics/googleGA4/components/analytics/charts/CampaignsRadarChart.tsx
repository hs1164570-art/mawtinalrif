// components/analytics/charts/CampaignsRadarChart.tsx
"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { EmptyState } from "../ChartCard";
import { chartColors } from "../../../lib/chart-colors";
import { CampaignRow } from "../../../lib/types";

export default function CampaignsRadarChart({ data }: { data: CampaignRow[] }) {
  if (!data.length)
    return <EmptyState message="لا توجد بيانات كافية للمقارنة" />;

  const top5 = [...data].sort((a, b) => b.sessions - a.sessions).slice(0, 5);
  const chartData = top5.map((c) => ({
    campaign:
      c.campaignName.length > 14 ?
        c.campaignName.slice(0, 14) + "…"
      : c.campaignName,
    "معدل التفاعل": c.engagementRate,
    "معدل الارتداد": c.bounceRate,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={chartData} outerRadius="72%">
        <PolarGrid stroke={chartColors.border} />
        <PolarAngleAxis
          dataKey="campaign"
          tick={{ fill: chartColors.text2, fontSize: 10 }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 100]}
          tick={{ fill: chartColors.text3, fontSize: 9 }}
        />
        <Radar
          name="معدل التفاعل"
          dataKey="معدل التفاعل"
          stroke={chartColors.cyan}
          fill={chartColors.cyan}
          fillOpacity={0.35}
        />
        <Radar
          name="معدل الارتداد"
          dataKey="معدل الارتداد"
          stroke={chartColors.red}
          fill={chartColors.red}
          fillOpacity={0.25}
        />
        <Legend
          formatter={(value) => (
            <span style={{ color: chartColors.text2, fontSize: 11 }}>
              {value}
            </span>
          )}
        />
        <Tooltip contentStyle={{ direction: "rtl", textAlign: "right" }} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
