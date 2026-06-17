"use client";

import { Treemap, ResponsiveContainer, Tooltip } from "recharts";
import ChartWrapper from "../../_shared/components/ChartWrapper";
import { PALETTE, CHART_COLORS } from "../../_shared/constants";
import type { ProductKPI } from "../../_shared/types";

const truncate = (s: string, n = 16) =>
  s.length > n ? s.slice(0, n) + "…" : s;

// Custom content renderer for treemap cells
const CustomContent = (props: any) => {
  const { x, y, width, height, name, value, index, depth } = props;

  if (!width || !height || width < 20 || height < 20) return null;

  const color = CHART_COLORS[index % CHART_COLORS.length];
  const showText = width > 40 && height > 30;

  return (
    <g>
      <rect
        x={x + 1}
        y={y + 1}
        width={width - 2}
        height={height - 2}
        style={{ fill: color, opacity: 0.85 }}
        rx={6}
        ry={6}
      />
      {/* Subtle inner gradient */}
      <rect
        x={x + 1}
        y={y + 1}
        width={width - 2}
        height={(height - 2) / 2}
        style={{ fill: "#FFFFFF", opacity: 0.08 }}
        rx={6}
        ry={6}
      />
      {showText && (
        <>
          <text
            x={x + width / 2}
            y={y + height / 2 - (height > 50 ? 8 : 0)}
            textAnchor="middle"
            dominantBaseline="middle"
            style={{
              fill: "#FFFFFF",
              fontSize: Math.min(12, width / 8),
              fontWeight: 600,
            }}
          >
            {truncate(name, Math.max(4, Math.floor(width / 9)))}
          </text>
          {height > 50 && (
            <text
              x={x + width / 2}
              y={y + height / 2 + 12}
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ fill: "rgba(255,255,255,0.75)", fontSize: 10 }}
            >
              {value?.toLocaleString("en-US")}
            </text>
          )}
        </>
      )}
    </g>
  );
};

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0].payload;
  return (
    <div
      className="bg-white border border-[#EDE5D8] rounded-xl p-3 shadow-lg text-right"
      dir="rtl"
    >
      <p className="text-xs text-[#A89585] mb-1">المنتج</p>
      <p className="text-sm font-bold text-[#3D2B1F] mb-1">{name}</p>
      <p className="text-xs text-[#6A9E7F] font-medium">
        {value?.toLocaleString("en-US")} مبيعة
      </p>
    </div>
  );
};

export default function SalesTreemap({ data }: { data: ProductKPI[] }) {
  const top10 = data.slice(0, 10);
  const chartData = top10.map((d) => ({ name: d.slug, value: d.totalScore }));

  const isEmpty = !chartData.length;

  return (
    <ChartWrapper
      title="توزيع الأداء الفعلي"
      description="أعلى المنتجات مبيعاً — حجم الخلية يعكس حجم المبيعات"
      exportData={top10.map((d) => ({
        المنتج: d.slug,
        المبيعات: d.totalScore,
      }))}
      exportFileName="توزيع-مبيعات"
      minHeight={280}
    >
      {isEmpty ?
        <div className="flex items-center justify-center h-72 text-sm text-[#A89585]">
          لا توجد بيانات مبيعات
        </div>
      : <ResponsiveContainer width="100%" height={280}>
          <Treemap
            data={chartData}
            dataKey="value"
            nameKey="name"
            content={<CustomContent />}
            isAnimationActive
            animationDuration={600}
          >
            <Tooltip content={<CustomTooltip />} />
          </Treemap>
        </ResponsiveContainer>
      }
    </ChartWrapper>
  );
}
