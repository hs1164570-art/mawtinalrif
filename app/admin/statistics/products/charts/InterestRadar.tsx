// InterestRadar.tsx
"use client";

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import ChartWrapper from "../../_shared/components/ChartWrapper";
import { PALETTE } from "../../_shared/constants";
import type { ProductKPI } from "../../_shared/types";

const truncate = (s: string, n = 14) =>
  s.length > n ? s.slice(0, n) + "…" : s;

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="bg-[var(--surface)] border border-[var(--border-md)] rounded-xl p-3 shadow-[var(--shadow-md)] text-right"
      dir="rtl"
    >
      <p className="text-xs text-[var(--text-3)]">
        {payload[0]?.payload?.subject}
      </p>
      <p className="text-sm font-bold text-[var(--text-1)] tabular-nums mt-1">
        {payload[0]?.value?.toLocaleString("en-US")} مشاهدة
      </p>
    </div>
  );
};

export default function InterestRadar({ data }: { data: ProductKPI[] }) {
  const top8 = data.slice(0, 8);
  const chartData = top8.map((d) => ({
    subject: d.slug,
    label: truncate(d.slug),
    value: d.totalScore,
  }));

  const isEmpty = !chartData.length;

  return (
    <ChartWrapper
      title="توزيع الاهتمام"
      description="أعلى المنتجات مشاهدةً — مؤشر اهتمام الجمهور"
      exportData={top8.map((d) => ({
        المنتج: d.slug,
        المشاهدات: d.totalScore,
      }))}
      exportFileName="اهتمام-منتجات"
      minHeight={280}
    >
      {isEmpty ?
        <div className="flex items-center justify-center h-72 text-sm text-[var(--text-3)]">
          لا توجد بيانات مشاهدات
        </div>
      : <ResponsiveContainer width="100%" height={280}>
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
            <defs>
              <radialGradient id="radarFill" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={PALETTE.blue} stopOpacity={0.3} />
                <stop
                  offset="100%"
                  stopColor={PALETTE.blue}
                  stopOpacity={0.05}
                />
              </radialGradient>
            </defs>
            <PolarGrid stroke={PALETTE.border} gridType="polygon" />
            <PolarAngleAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: PALETTE.medBrown }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, "auto"]}
              tick={{ fontSize: 9, fill: PALETTE.muted }}
              tickCount={4}
            />
            <Radar
              name="المشاهدات"
              dataKey="value"
              stroke={PALETTE.blue}
              strokeWidth={2}
              fill="url(#radarFill)"
              dot={{ r: 3, fill: PALETTE.blue, strokeWidth: 0 }}
              activeDot={{
                r: 5,
                fill: PALETTE.blue,
                stroke: PALETTE.white,
                strokeWidth: 2,
              }}
            />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      }
    </ChartWrapper>
  );
}
