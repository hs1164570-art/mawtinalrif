// components/analytics/charts/AgeGroupStackedBar.tsx
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
import { UserDemographicRow } from "../../../lib/types";
import { chartColors } from "../../../lib/chart-colors";
import { formatNumber } from "../../../lib/utils";

export default function AgeGroupStackedBar({
  data,
}: {
  data: UserDemographicRow[];
}) {
  const byAge = new Map<
    string,
    { ageGroup: string; جدد: number; عائدون: number }
  >();
  data.forEach((d) => {
    const cur = byAge.get(d.ageGroup) ?? {
      ageGroup: d.ageGroup,
      جدد: 0,
      عائدون: 0,
    };
    cur["جدد"] += d.newUsers;
    cur["عائدون"] += d.returningUsers;
    byAge.set(d.ageGroup, cur);
  });
  const chartData = Array.from(byAge.values()).filter(
    (d) => d["جدد"] + d["عائدون"] > 0,
  );

  if (chartData.length === 0)
    return <EmptyState message="لا توجد بيانات فئات عمرية كافية" />;

  return (
    <ResponsiveContainer width="100%" height={260}>
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
          dataKey="ageGroup"
          tick={{ fill: chartColors.text2, fontSize: 12 }}
          width={48}
        />
        <Tooltip
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
        <Bar
          dataKey="جدد"
          stackId="a"
          fill={chartColors.cyan}
          radius={[0, 0, 0, 0]}
        />
        <Bar
          dataKey="عائدون"
          stackId="a"
          fill={chartColors.goldBright}
          radius={[0, 4, 4, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
