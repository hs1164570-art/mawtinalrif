// components/analytics/charts/DauWauMauGauge.tsx
"use client";

import {
  RadialBarChart,
  RadialBar,
  Legend,
  ResponsiveContainer,
  PolarAngleAxis,
} from "recharts";

import { EmptyState } from "../ChartCard";
import { chartColors } from "../../../lib/chart-colors";
import { EngagementRatios } from "../../../lib/types";
import { formatPercent } from "../../../lib/utils";

export default function DauWauMauGauge({ data }: { data: EngagementRatios }) {
  if (!data || (data.dauWauRatio <= 0 && data.dauMauRatio <= 0)) {
    return <EmptyState message="لا توجد بيانات كافية لحساب نسب الالتصاق" />;
  }

  const chartData = [
    { name: "DAU/MAU", value: data.dauMauRatio, fill: chartColors.cyan },
    { name: "DAU/WAU", value: data.dauWauRatio, fill: chartColors.goldBright },
  ];

  return (
    <div className="flex flex-col items-center">
      <ResponsiveContainer width="100%" height={220}>
        <RadialBarChart
          innerRadius="35%"
          outerRadius="100%"
          data={chartData}
          startAngle={180}
          endAngle={0}
          barSize={16}
        >
          <PolarAngleAxis
            type="number"
            domain={[0, 100]}
            angleAxisId={0}
            tick={false}
          />
          <RadialBar background dataKey="value" cornerRadius={8} />
          <Legend
            iconSize={10}
            formatter={(value, entry) => {
              const v =
                (entry as { payload?: { value: number } })?.payload?.value ?? 0;
              return (
                <span style={{ color: chartColors.text2, fontSize: 12 }}>
                  {value}: {formatPercent(v)}
                </span>
              );
            }}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-3 gap-3 w-full mt-1 text-center">
        <div>
          <p className="text-[11px] text-text-3">يومي</p>
          <p className="text-sm font-bold text-text-1 tabular-nums">
            {data.dau}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-text-3">أسبوعي</p>
          <p className="text-sm font-bold text-text-1 tabular-nums">
            {data.wau}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-text-3">شهري</p>
          <p className="text-sm font-bold text-text-1 tabular-nums">
            {data.mau}
          </p>
        </div>
      </div>
    </div>
  );
}
