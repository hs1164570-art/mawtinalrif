// components/analytics/charts/BounceRateLineChart.tsx
"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";

import { EmptyState } from "../ChartCard";
import { formatArabicDate, formatPercent } from "../../../lib/utils";
import { chartColors } from "../../../lib/chart-colors";

export default function BounceRateLineChart({
  data,
}: {
  data: { date: string; bounceRate: number }[];
}) {
  if (!data.length)
    return <EmptyState message="لا توجد بيانات معدل ارتداد كافية" />;

  const avg = data.reduce((s, d) => s + d.bounceRate, 0) / data.length;

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={chartColors.border}
          vertical={false}
        />
        <XAxis
          dataKey="date"
          tickFormatter={formatArabicDate}
          tick={{ fill: chartColors.text3, fontSize: 11 }}
          minTickGap={24}
        />
        <YAxis
          tick={{ fill: chartColors.text3, fontSize: 11 }}
          tickFormatter={(v) => `${v}٪`}
          width={36}
        />
        <Tooltip
          labelFormatter={(l) => formatArabicDate(String(l))}
          formatter={(value: any) => formatPercent(value)}
          contentStyle={{ direction: "rtl", textAlign: "right" }}
        />
        <ReferenceLine
          y={avg}
          stroke={chartColors.text3}
          strokeDasharray="4 4"
        />
        <Line
          type="monotone"
          dataKey="bounceRate"
          stroke={chartColors.red}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
