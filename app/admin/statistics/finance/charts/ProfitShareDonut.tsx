"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import ChartWrapper from "../../_shared/components/ChartWrapper";
import { PALETTE } from "../../_shared/constants";

interface Props {
  profit: number;
  costs: number;
  profitMargin: number;
}

const fmtCurrency = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)} مر.س`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)} ألفر.س`;
  return `${n.toFixed(0)}ر.س`;
};

const SEGMENTS = (profit: number, costs: number) => [
  { name: "صافي الأرباح", value: Math.max(profit, 0), color: PALETTE.sage },
  { name: "التكاليف", value: Math.max(costs, 0), color: PALETTE.terra },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  const total = payload[0].payload.total;
  const pct = total > 0 ? ((value / total) * 100).toFixed(1) : "0";
  return (
    <div
      className="bg-white border border-[#EDE5D8] rounded-xl p-3 shadow-lg text-right"
      dir="rtl"
    >
      <div className="flex items-center gap-2 mb-1">
        <span
          className="w-2 h-2 rounded-full"
          style={{ background: payload[0].payload.color }}
        />
        <span className="text-xs font-medium text-[#3D2B1F]">{name}</span>
      </div>
      <p className="text-sm font-bold text-[#3D2B1F] tabular-nums">
        {fmtCurrency(value)}
      </p>
      <p className="text-xs text-[#A89585]">{pct}% من الإجمالي</p>
    </div>
  );
};

// Custom label renderer inside donut hole
const RADIAN = Math.PI / 180;
function CenterLabel({
  cx,
  cy,
  profitMargin,
}: {
  cx: number;
  cy: number;
  profitMargin: number;
}) {
  return (
    <>
      <text x={cx} y={cy - 10} textAnchor="middle" className="fill-[#3D2B1F]">
        <tspan fontSize={22} fontWeight={700}>
          {profitMargin.toFixed(1)}%
        </tspan>
      </text>
      <text
        x={cx}
        y={cy + 12}
        textAnchor="middle"
        fontSize={11}
        fill={PALETTE.muted}
      >
        هامش الربح
      </text>
    </>
  );
}

export default function ProfitShareDonut({
  profit,
  costs,
  profitMargin,
}: Props) {
  const total = profit + costs;
  const segments = SEGMENTS(profit, costs).map((s) => ({ ...s, total }));
  const isEmpty = total === 0;

  return (
    <ChartWrapper
      title="حصة الأرباح"
      description="نسبة صافي الأرباح مقابل التكاليف"
      exportData={segments.map((s) => ({ الفئة: s.name, القيمة: s.value }))}
      exportFileName="حصة-أرباح"
      minHeight={240}
    >
      {isEmpty ?
        <div className="flex items-center justify-center h-60 text-sm text-[#A89585]">
          لا توجد بيانات كافية
        </div>
      : <>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <defs>
                <filter
                  id="pieShadow"
                  x="-20%"
                  y="-20%"
                  width="140%"
                  height="140%"
                >
                  <feDropShadow
                    dx="0"
                    dy="2"
                    stdDeviation="3"
                    floodColor="#00000018"
                  />
                </filter>
              </defs>
              <Pie
                data={segments}
                cx="50%"
                cy="50%"
                innerRadius="55%"
                outerRadius="80%"
                paddingAngle={3}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
                filter="url(#pieShadow)"
              >
                {segments.map((seg, i) => (
                  <Cell
                    key={i}
                    fill={seg.color}
                    stroke="transparent"
                    style={{ outline: "none", cursor: "default" }}
                    aria-label={`${seg.name}: ${fmtCurrency(seg.value)}`}
                  />
                ))}
                {/* Center label injected via label prop */}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div
            className="flex justify-center gap-5 -mt-2"
            dir="rtl"
            aria-label="مفتاح الشارت"
          >
            {segments.map((seg) => (
              <div key={seg.name} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ background: seg.color }}
                />
                <span className="text-xs text-[#6B4C3B]">{seg.name}</span>
                <span className="text-xs font-semibold text-[#3D2B1F] tabular-nums">
                  {total > 0 ? ((seg.value / total) * 100).toFixed(0) : 0}%
                </span>
              </div>
            ))}
          </div>

          {/* Center value overlay (absolute positioned over the SVG hole) */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ top: 40, paddingBottom: 40 }}
          >
            <div className="text-center">
              <p className="text-2xl font-bold text-[#3D2B1F] tabular-nums leading-none">
                {profitMargin.toFixed(1)}%
              </p>
              <p className="text-[11px] text-[#A89585] mt-0.5">هامش الربح</p>
            </div>
          </div>
        </>
      }
    </ChartWrapper>
  );
}
