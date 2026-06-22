// components/analytics/charts/DeviceDonutChart.tsx
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
import { chartColors } from "../../../lib/chart-colors";
import { DeviceCategoryRow } from "../../../lib/types";
import { formatNumber } from "../../../lib/utils";

const LABEL: Record<string, string> = {
  mobile: "جوال",
  desktop: "حاسوب",
  tablet: "لوحي",
};
const COLOR: Record<string, string> = {
  mobile: chartColors.cyan,
  desktop: chartColors.gold,
  tablet: chartColors.red,
};

export default function DeviceDonutChart({
  data,
}: {
  data: DeviceCategoryRow[];
}) {
  if (!data.length) return <EmptyState message="لا توجد بيانات أجهزة كافية" />;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="sessions"
          nameKey="deviceCategory"
          innerRadius={58}
          outerRadius={90}
          paddingAngle={3}
          strokeWidth={0}
        >
          {data.map((entry) => (
            <Cell
              key={entry.deviceCategory}
              fill={COLOR[entry.deviceCategory] ?? chartColors.text3}
            />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: any) => formatNumber(value)}
          contentStyle={{ direction: "rtl", textAlign: "right" }}
        />
        <Legend
          formatter={(_value, entry) => {
            const key =
              (entry as { payload?: { deviceCategory?: string } })?.payload
                ?.deviceCategory ?? "";
            return (
              <span style={{ color: chartColors.text2, fontSize: 12 }}>
                {LABEL[key] ?? key}
              </span>
            );
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
