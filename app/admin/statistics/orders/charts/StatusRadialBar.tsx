// StatusRadialBar.tsx
"use client";
import {
  RadialBarChart,
  RadialBar,
  Tooltip,
  Legend,
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
  const p = payload[0];
  return (
    <div
      className="bg-[var(--surface)] border border-[var(--border-md)] rounded-xl p-3 shadow-[var(--shadow-md)] text-right"
      dir="rtl"
    >
      <div className="flex items-center gap-2 mb-1">
        <span
          className="w-2 h-2 rounded-full"
          style={{ background: p.payload.fill }}
        />
        <span className="text-xs font-medium text-[var(--text-1)]">
          {p.payload.name}
        </span>
      </div>
      <p className="text-sm font-bold text-[var(--text-1)] tabular-nums">
        {p.value?.toLocaleString("en-US")} طلب
      </p>
    </div>
  );
};
const renderLegend = (props: any) => {
  const { payload } = props;
  return (
    <ul
      className="flex flex-wrap justify-center gap-x-3 gap-y-1.5 pt-2"
      dir="rtl"
    >
      {payload?.map((entry: any, i: number) => (
        <li key={i} className="flex items-center gap-1">
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: entry.color }}
          />
          <span className="text-[10px] text-[var(--text-2)]">
            {entry.value}
          </span>
        </li>
      ))}
    </ul>
  );
};
export default function StatusRadialBar({
  statusDistribution,
}: {
  statusDistribution: StatusPoint[];
}) {
  const total = statusDistribution.reduce((s, d) => s + d.value, 0);
  const data = statusDistribution
    .filter((d) => d.value > 0)
    .map((d) => ({
      ...d,
      fill: d.color,
      pct: total > 0 ? ((d.value / total) * 100).toFixed(1) : "0",
    }));
  const isEmpty = data.length === 0;
  return (
    <ChartWrapper
      title="التوزيع النسبي للحالات"
      description="النسبة المئوية لكل حالة من إجمالي الطلبات"
      exportData={data.map((d) => ({
        الحالة: d.name,
        العدد: d.value,
        النسبة: `${d.pct}%`,
      }))}
      exportFileName="توزيع-حالات"
      minHeight={280}
    >
      {isEmpty ?
        <div className="flex items-center justify-center h-72 text-sm text-[var(--text-3)]">
          لا توجد طلبات
        </div>
      : <>
          <ResponsiveContainer width="100%" height={220}>
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="20%"
              outerRadius="90%"
              data={data}
              startAngle={180}
              endAngle={0}
              barSize={14}
              barCategoryGap={4}
            >
              <RadialBar
                dataKey="value"
                background={{ fill: "var(--bg-deep)" }}
                cornerRadius={7}
                isAnimationActive
                animationDuration={800}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend content={renderLegend} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="flex justify-center -mt-10 pb-4">
            <div className="text-center">
              <p className="text-xl font-bold text-[var(--text-1)] tabular-nums">
                {total.toLocaleString("en-US")}
              </p>
              <p className="text-[10px] text-[var(--text-3)]">إجمالي الطلبات</p>
            </div>
          </div>
        </>
      }
    </ChartWrapper>
  );
}
