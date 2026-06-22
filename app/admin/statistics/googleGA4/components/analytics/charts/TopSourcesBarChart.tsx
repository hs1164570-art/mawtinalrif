// components/analytics/charts/TopSourcesBarChart.tsx
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { EmptyState } from "../ChartCard";
import { chartColors } from "../../../lib/chart-colors";
import { SessionSourceRow } from "../../../lib/types";
import { formatNumber } from "../../../lib/utils";

export default function TopSourcesBarChart({
  data,
}: {
  data: SessionSourceRow[];
}) {
  if (!data.length) return <EmptyState message="لا توجد مصادر جلسات كافية" />;

  const chartData = [...data]
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 7);

  return (
    <ResponsiveContainer
      width="100%"
      height={Math.max(240, chartData.length * 38)}
    >
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ left: 8, right: 16 }}
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
          dataKey="source"
          tick={{ fill: chartColors.text2, fontSize: 12 }}
          width={88}
        />
        <Tooltip
          formatter={(value: any) => formatNumber(value)}
          contentStyle={{ direction: "rtl", textAlign: "right" }}
        />
        <Bar
          dataKey="sessions"
          fill={chartColors.cyan}
          radius={[6, 6, 6, 6]}
          barSize={18}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
