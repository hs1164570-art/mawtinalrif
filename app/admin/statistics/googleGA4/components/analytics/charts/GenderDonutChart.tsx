// components/analytics/charts/GenderDonutChart.tsx
"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import { EmptyState } from "../ChartCard";
import { chartColors } from "../../../lib/chart-colors";
import { UserDemographicRow } from "../../../lib/types";
import { formatNumber } from "../../../lib/utils";

const GENDER_LABEL: Record<string, string> = {
  male: "ذكور",
  female: "إناث",
  unknown: "غير محدد",
};
const GENDER_COLOR: Record<string, string> = {
  male: chartColors.cyan,
  female: chartColors.red,
  unknown: chartColors.text3,
};

export default function GenderDonutChart({
  data,
}: {
  data: UserDemographicRow[];
}) {
  const totals = new Map<string, number>();
  data.forEach((d) => {
    const total = d.newUsers + d.returningUsers;
    totals.set(d.gender, (totals.get(d.gender) ?? 0) + total);
  });
  const pieData = Array.from(totals.entries())
    .filter(([, value]) => value > 0)
    .map(([gender, value]) => ({
      name: GENDER_LABEL[gender] ?? gender,
      value,
      gender,
    }));

  if (pieData.length === 0)
    return <EmptyState message="لا توجد بيانات جنس كافية" />;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={pieData}
          dataKey="value"
          nameKey="name"
          innerRadius={62}
          outerRadius={92}
          paddingAngle={3}
          strokeWidth={0}
        >
          {pieData.map((entry) => (
            <Cell
              key={entry.gender}
              fill={GENDER_COLOR[entry.gender] ?? chartColors.text3}
            />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: any, name: any) => [formatNumber(value), name]}
          contentStyle={{ direction: "rtl", textAlign: "right" }}
        />
        <Legend
          formatter={(value) => (
            <span style={{ color: chartColors.text2, fontSize: 12 }}>
              {value}
            </span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
