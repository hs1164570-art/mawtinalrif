"use client";

import {
  FunnelChart,
  Funnel,
  Cell,
  Tooltip,
  LabelList,
  ResponsiveContainer,
} from "recharts";
import ChartWrapper from "../../_shared/components/ChartWrapper";

interface StatusPoint {
  name: string;
  value: number;
  color: string;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const { name, value, color } = payload[0].payload;
  return (
    <div
      className="bg-white border border-[#EDE5D8] rounded-xl p-3 shadow-lg text-right"
      dir="rtl"
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="w-2 h-2 rounded-full" style={{ background: color }} />
        <span className="text-xs font-medium text-[#3D2B1F]">{name}</span>
      </div>
      <p className="text-base font-bold text-[#3D2B1F] tabular-nums">
        {value.toLocaleString("en-US")} طلب
      </p>
    </div>
  );
};

export default function OrderFunnel({
  statusDistribution,
}: {
  statusDistribution: StatusPoint[];
}) {
  // Sort by value desc so funnel goes large → small
  const sorted = [...statusDistribution].sort((a, b) => b.value - a.value);
  const isEmpty = sorted.every((s) => s.value === 0);

  return (
    <ChartWrapper
      title="قمع حالات الطلبات"
      description="تدرج الطلبات من الأعلى حجماً للأقل"
      exportData={sorted.map((s) => ({ الحالة: s.name, العدد: s.value }))}
      exportFileName="قمع-طلبات"
      minHeight={280}
    >
      {isEmpty ?
        <div className="flex items-center justify-center h-72 text-sm text-[#A89585]">
          لا توجد طلبات في هذه الفترة
        </div>
      : <ResponsiveContainer width="100%" height={280}>
          <FunnelChart margin={{ top: 4, right: 20, left: 20, bottom: 4 }}>
            <Funnel
              dataKey="value"
              data={sorted}
              isAnimationActive
              animationDuration={800}
            >
              {sorted.map((entry, i) => (
                <Cell key={i} fill={entry.color} fillOpacity={0.85} />
              ))}
              <LabelList
                position="right"
                fill="#3D2B1F"
                stroke="none"
                dataKey="name"
                style={{ fontSize: 11, fontWeight: 500 }}
              />
              <LabelList
                position="center"
                fill="#FFFFFF"
                stroke="none"
                dataKey="value"
                style={{ fontSize: 12, fontWeight: 700 }}
                // formatter={(v: number) => v.toLocaleString("en-US") as any}
              />
            </Funnel>
            <Tooltip content={<CustomTooltip />} />
          </FunnelChart>
        </ResponsiveContainer>
      }
    </ChartWrapper>
  );
}
