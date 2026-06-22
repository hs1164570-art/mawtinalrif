// components/analytics/charts/RealtimeAreaChart.tsx
"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { EmptyState } from "../ChartCard";
import { chartColors } from "../../../lib/chart-colors";
import { RealtimeMinutePoint } from "../../../lib/types";

export default function RealtimeAreaChart({
  data,
}: {
  data: RealtimeMinutePoint[];
}) {
  if (!data.length) return <EmptyState message="لا توجد بيانات لحظية كافية" />;

  return (
    <ResponsiveContainer width="100%" height={120}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="liveGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={chartColors.red} stopOpacity={0.35} />
            <stop offset="95%" stopColor={chartColors.red} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="minutesAgo" reversed tick={false} axisLine={false} />
        <YAxis hide domain={[0, "dataMax + 5"]} />
        <Tooltip
          labelFormatter={(l) => `قبل ${l} دقيقة`}
          formatter={(value: any) => [value, "نشط الآن"]}
          contentStyle={{ direction: "rtl", textAlign: "right" }}
        />
        <Area
          type="monotone"
          dataKey="activeUsers"
          stroke={chartColors.red}
          fill="url(#liveGrad)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
