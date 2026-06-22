// components/analytics/charts/CampaignsTrendChart.tsx
"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { EmptyState } from "../ChartCard";
import { chartColors, getSeriesColor } from "../../../lib/chart-colors";
import { CampaignTrendPoint } from "../../../lib/types";
import { formatArabicDate, formatNumber } from "../../../lib/utils";

export default function CampaignsTrendChart({
  data,
}: {
  data: CampaignTrendPoint[];
}) {
  if (!data.length)
    return <EmptyState message="لا توجد بيانات اتجاه زمني للحملات" />;

  const seriesKeys = Object.keys(data[0]).filter((k) => k !== "date");

  return (
    <ResponsiveContainer width="100%" height={280}>
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
          tickFormatter={(v) => formatNumber(v)}
          width={40}
        />
        <Tooltip
          labelFormatter={(l) => formatArabicDate(String(l))}
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
        {seriesKeys.map((key, i) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            stroke={getSeriesColor(i)}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
