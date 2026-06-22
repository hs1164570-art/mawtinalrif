// components/analytics/charts/SourceScatterChart.tsx
"use client";

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

import { EmptyState } from "../ChartCard";
import { chartColors, getSeriesColor } from "../../../lib/chart-colors";
import { SourceBubblePoint } from "../../../lib/types";
import { formatPercent } from "../../../lib/utils";

export default function SourceScatterChart({
  data,
}: {
  data: SourceBubblePoint[];
}) {
  if (!data.length)
    return <EmptyState message="لا توجد بيانات مقارنة مصادر كافية" />;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <ScatterChart margin={{ top: 16, right: 16, bottom: 8, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={chartColors.border} />
        <XAxis
          type="number"
          dataKey="bounceRate"
          name="معدل الارتداد"
          unit="٪"
          tick={{ fill: chartColors.text3, fontSize: 11 }}
          label={{
            value: "معدل الارتداد",
            position: "insideBottom",
            offset: -4,
            fill: chartColors.text3,
            fontSize: 11,
          }}
        />
        <YAxis
          type="number"
          dataKey="engagementRate"
          name="معدل التفاعل"
          unit="٪"
          tick={{ fill: chartColors.text3, fontSize: 11 }}
          label={{
            value: "معدل التفاعل",
            angle: -90,
            position: "insideLeft",
            fill: chartColors.text3,
            fontSize: 11,
          }}
        />
        <ZAxis
          type="number"
          dataKey="sessions"
          range={[80, 600]}
          name="الجلسات"
        />
        <Tooltip
          cursor={{ strokeDasharray: "3 3" }}
          formatter={(value: any, name: any) =>
            name.includes("معدل") ? formatPercent(value) : value
          }
          contentStyle={{ direction: "rtl", textAlign: "right" }}
        />
        <Scatter data={data}>
          {data.map((entry, i) => (
            <Cell
              key={entry.source}
              fill={getSeriesColor(i)}
              fillOpacity={0.7}
            />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
}
