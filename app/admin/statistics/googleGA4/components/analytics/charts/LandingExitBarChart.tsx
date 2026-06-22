// components/analytics/charts/LandingExitBarChart.tsx
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { EmptyState } from "../ChartCard";
import { chartColors } from "../../../lib/chart-colors";
import { LandingExitRow } from "../../../lib/types";
import { formatNumber } from "../../../lib/utils";

export default function LandingExitBarChart({
  data,
}: {
  data: LandingExitRow[];
}) {
  if (!data.length)
    return <EmptyState message="لا توجد بيانات صفحات دخول/خروج كافية" />;

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={chartColors.border}
          vertical={false}
        />
        <XAxis
          dataKey="page"
          tick={{ fill: chartColors.text2, fontSize: 11 }}
          interval={0}
          angle={-15}
          textAnchor="end"
          height={56}
        />
        <YAxis
          tick={{ fill: chartColors.text3, fontSize: 11 }}
          tickFormatter={(v) => formatNumber(v)}
          width={40}
        />
        <Tooltip
          formatter={(value: any) => formatNumber(value)}
          contentStyle={{ direction: "rtl", textAlign: "right" }}
        />
        <Legend
          formatter={(value) => (
            <span style={{ color: chartColors.text2, fontSize: 11 }}>
              {value}
            </span>
          )}
        />
        <Bar
          dataKey="landingCount"
          name="دخول"
          fill={chartColors.cyan}
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="exitCount"
          name="خروج"
          fill={chartColors.red}
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
