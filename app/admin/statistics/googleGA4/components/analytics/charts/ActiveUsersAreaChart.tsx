// components/analytics/charts/ActiveUsersAreaChart.tsx
"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { ActiveUsersTrendPoint } from "../../../lib/types";
import { chartColors } from "../../../lib/chart-colors";
import { EmptyState } from "../ChartCard";
import { formatArabicDate, formatNumber } from "../../../lib/utils";

export default function ActiveUsersAreaChart({
  data,
}: {
  data: ActiveUsersTrendPoint[];
}) {
  if (!data.length)
    return <EmptyState message="لا توجد بيانات مستخدمين نشطين كافية" />;

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="g28" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor={chartColors.text3}
              stopOpacity={0.25}
            />
            <stop offset="95%" stopColor={chartColors.text3} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="g7" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor={chartColors.goldBright}
              stopOpacity={0.3}
            />
            <stop
              offset="95%"
              stopColor={chartColors.goldBright}
              stopOpacity={0}
            />
          </linearGradient>
          <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={chartColors.cyan} stopOpacity={0.45} />
            <stop offset="95%" stopColor={chartColors.cyan} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={chartColors.border}
          vertical={false}
        />
        <XAxis
          dataKey="date"
          tickFormatter={formatArabicDate}
          tick={{ fill: chartColors.text3, fontSize: 11 }}
          minTickGap={28}
        />
        <YAxis
          tick={{ fill: chartColors.text3, fontSize: 11 }}
          tickFormatter={(v) => formatNumber(v)}
          width={48}
        />
        <Tooltip
          labelFormatter={(l) => formatArabicDate(String(l))}
          formatter={(value: any) => formatNumber(value)}
          contentStyle={{ direction: "rtl", textAlign: "right" }}
        />
        <Legend
          formatter={(value) => (
            <span style={{ color: chartColors.text2, fontSize: 12 }}>
              {value}
            </span>
          )}
        />
        <Area
          type="monotone"
          dataKey="active28Day"
          name="٢٨ يومًا"
          stroke={chartColors.text3}
          fill="url(#g28)"
          strokeWidth={1.5}
        />
        <Area
          type="monotone"
          dataKey="active7Day"
          name="٧ أيام"
          stroke={chartColors.goldBright}
          fill="url(#g7)"
          strokeWidth={1.5}
        />
        <Area
          type="monotone"
          dataKey="active1Day"
          name="يوم واحد"
          stroke={chartColors.cyan}
          fill="url(#g1)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
