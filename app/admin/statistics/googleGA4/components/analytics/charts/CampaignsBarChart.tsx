// components/analytics/charts/CampaignsBarChart.tsx
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
  LabelList,
} from "recharts";

import { EmptyState } from "../ChartCard";
import { chartColors, qualityColors } from "../../../lib/chart-colors";
import { CampaignRow } from "../../../lib/types";
import { formatNumber } from "../../../lib/utils";

export default function CampaignsBarChart({ data }: { data: CampaignRow[] }) {
  if (!data.length)
    return <EmptyState message="لا توجد حملات بزيارات مسجّلة" />;

  const chartData = [...data]
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 8);
  const height = Math.max(260, chartData.length * 42);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ left: 8, right: 36 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={chartColors.border}
          horizontal={false}
        />
        <XAxis
          type="number"
          tick={{ fill: chartColors.text3, fontSize: 11 }}
          tickFormatter={(v) => formatNumber(v)}
        />
        <YAxis
          type="category"
          dataKey="campaignName"
          tick={{ fill: chartColors.text2, fontSize: 12, fontWeight: 700 }}
          width={140}
        />
        <Tooltip
          formatter={(value: any) => [formatNumber(value), "الزيارات"]}
          contentStyle={{ direction: "rtl", textAlign: "right" }}
        />
        <Bar dataKey="sessions" radius={[6, 6, 6, 6]} barSize={22}>
          {chartData.map((entry) => (
            <Cell
              key={entry.campaignName}
              fill={qualityColors[entry.quality]}
              fillOpacity={0.85}
            />
          ))}
          <LabelList
            dataKey="sessions"
            position="left"
            formatter={(v: any) => formatNumber(v)}
            style={{ fill: chartColors.text1, fontSize: 12, fontWeight: 700 }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
