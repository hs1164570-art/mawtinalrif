// components/analytics/charts/ContentGroupDonut.tsx
"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { EmptyState } from "../ChartCard";
import { getSeriesColor, chartColors } from "../../../lib/chart-colors";
import { ContentGroupRow } from "../../../lib/types";
import { formatNumber } from "../../../lib/utils";

export default function ContentGroupDonut({
  data,
}: {
  data: ContentGroupRow[];
}) {
  if (!data.length)
    return <EmptyState message="لا توجد بيانات تصنيفات محتوى كافية" />;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="views"
          nameKey="contentGroup"
          innerRadius={58}
          outerRadius={90}
          paddingAngle={2}
          strokeWidth={0}
        >
          {data.map((entry, i) => (
            <Cell key={entry.contentGroup} fill={getSeriesColor(i)} />
          ))}
        </Pie>
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
      </PieChart>
    </ResponsiveContainer>
  );
}
