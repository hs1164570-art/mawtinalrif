// components/analytics/charts/SessionFunnelChart.tsx
"use client";

import {
  FunnelChart,
  Funnel,
  Tooltip,
  LabelList,
  ResponsiveContainer,
  Cell,
} from "recharts";

import { EmptyState } from "../ChartCard";
import { getSeriesColor, chartColors } from "../../../lib/chart-colors";
import { ChannelFunnelStep } from "../../../lib/types";
import { formatNumber } from "../../../lib/utils";

const STAGE_LABEL: Record<ChannelFunnelStep["stage"], string> = {
  Source: "المصدر",
  Medium: "الوسيط",
  Campaign: "الحملة",
};

export default function SessionFunnelChart({
  data,
}: {
  data: ChannelFunnelStep[];
}) {
  if (!data.length)
    return <EmptyState message="لا توجد بيانات مسار جلسات كافية" />;

  const chartData = data.map((d) => ({
    name: `${STAGE_LABEL[d.stage]} — ${d.label}`,
    value: d.value,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <FunnelChart>
        <Tooltip
          formatter={(value: any) => formatNumber(value)}
          contentStyle={{ direction: "rtl", textAlign: "right" }}
        />
        <Funnel dataKey="value" data={chartData} isAnimationActive>
          {chartData.map((entry, i) => (
            <Cell
              key={entry.name}
              fill={getSeriesColor(i)}
              fillOpacity={0.85}
            />
          ))}
          <LabelList
            dataKey="name"
            position="right"
            fill={chartColors.text2}
            stroke="none"
            fontSize={12}
          />
          <LabelList
            dataKey="value"
            position="center"
            formatter={(v: any) => formatNumber(v)}
            fill={chartColors.textInv}
            stroke="none"
            fontSize={13}
            fontWeight={700}
          />
        </Funnel>
      </FunnelChart>
    </ResponsiveContainer>
  );
}
