// components/analytics/charts/EventsBarChart.tsx
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
import { EventRow } from "../../../lib/types";
import { formatNumber } from "../../../lib/utils";

export default function EventsBarChart({ data }: { data: EventRow[] }) {
  if (!data.length) return <EmptyState message="لا توجد أحداث مسجّلة كافية" />;

  const sorted = [...data].sort((a, b) => b.count - a.count);

  return (
    <ResponsiveContainer
      width="100%"
      height={Math.max(240, sorted.length * 36)}
    >
      <BarChart data={sorted} layout="vertical" margin={{ left: 8, right: 16 }}>
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
          dataKey="eventName"
          tick={{ fill: chartColors.text2, fontSize: 12 }}
          width={120}
        />
        <Tooltip
          formatter={(value: any) => formatNumber(value)}
          contentStyle={{ direction: "rtl", textAlign: "right" }}
        />
        <Bar
          dataKey="count"
          fill={chartColors.goldBright}
          radius={[6, 6, 6, 6]}
          barSize={16}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
