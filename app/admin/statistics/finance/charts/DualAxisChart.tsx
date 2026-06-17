"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import ChartWrapper from "../../_shared/components/ChartWrapper";
import { PALETTE } from "../../_shared/constants";

interface CombinedPoint {
  date: string;
  revenue: number;
  profit: number;
}

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

const fmtK = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}م`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}ك`;
  return String(n);
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const revenue = payload.find((p: any) => p.dataKey === "revenue");
  const profit = payload.find((p: any) => p.dataKey === "profit");
  const margin =
    revenue?.value > 0 ?
      (((profit?.value ?? 0) / revenue.value) * 100).toFixed(1)
    : "0";

  return (
    <div
      className="bg-white border border-[#EDE5D8] rounded-xl p-3 shadow-lg text-right min-w-[160px]"
      dir="rtl"
    >
      <p className="text-xs text-[#A89585] mb-2 font-medium">
        {fmtDate(label)}
      </p>
      {revenue && (
        <div className="flex items-center justify-between gap-4 mb-1">
          <span className="flex items-center gap-1.5 text-xs text-[#6B4C3B]">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#B89A5A]" />
            المبيعات
          </span>
          <span className="text-xs font-bold text-[#3D2B1F] tabular-nums">
            {fmtK(revenue.value)}ر.س
          </span>
        </div>
      )}
      {profit && (
        <div className="flex items-center justify-between gap-4 mb-1">
          <span className="flex items-center gap-1.5 text-xs text-[#6B4C3B]">
            <span className="w-2.5 h-1.5 rounded-full bg-[#6A9E7F]" />
            الأرباح
          </span>
          <span className="text-xs font-bold text-[#3D2B1F] tabular-nums">
            {fmtK(profit.value)}ر.س
          </span>
        </div>
      )}
      <div className="pt-1 mt-1 border-t border-[#EDE5D8]">
        <span className="text-[10px] text-[#A89585]">الهامش: {margin}%</span>
      </div>
    </div>
  );
};

export default function DualAxisChart({
  combined,
}: {
  combined: CombinedPoint[];
}) {
  const maxRevenue = Math.max(...combined.map((d) => d.revenue), 1);
  const maxProfit = Math.max(...combined.map((d) => d.profit), 1);

  return (
    <ChartWrapper
      title="الأداء المالي المدمج"
      description="المبيعات (أعمدة) والأرباح (خط) معاً على محورَين منفصلَين"
      exportData={combined.map((d) => ({
        التاريخ: d.date,
        "إجمالي المبيعات": d.revenue,
        "صافي الأرباح": d.profit,
      }))}
      exportFileName="أداء-مالي-مدمج"
      minHeight={280}
    >
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart
          data={combined}
          margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={PALETTE.gold} stopOpacity={0.9} />
              <stop
                offset="100%"
                stopColor={PALETTE.goldLight}
                stopOpacity={0.4}
              />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke={PALETTE.border}
            vertical={false}
          />

          <XAxis
            dataKey="date"
            tickFormatter={fmtDate}
            tick={{ fontSize: 10, fill: PALETTE.muted }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />

          {/* Left Y — Revenue (bars) */}
          <YAxis
            yAxisId="left"
            orientation="left"
            tickFormatter={fmtK}
            tick={{ fontSize: 10, fill: PALETTE.gold }}
            axisLine={false}
            tickLine={false}
            width={44}
            domain={[0, maxRevenue * 1.15]}
          />

          {/* Right Y — Profit (line) */}
          <YAxis
            yAxisId="right"
            orientation="right"
            tickFormatter={fmtK}
            tick={{ fontSize: 10, fill: PALETTE.sage }}
            axisLine={false}
            tickLine={false}
            width={44}
            domain={[0, maxProfit * 1.2]}
          />

          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 11, direction: "rtl", paddingTop: 8 }}
            formatter={(val) => (
              <span style={{ color: PALETTE.medBrown }}>{val}</span>
            )}
          />

          <ReferenceLine
            yAxisId="left"
            y={0}
            stroke={PALETTE.border}
            strokeDasharray="2 2"
          />

          {/* Revenue bars */}
          <Bar
            yAxisId="left"
            dataKey="revenue"
            name="المبيعات"
            fill="url(#barGrad)"
            radius={[4, 4, 0, 0]}
            maxBarSize={28}
          />

          {/* Profit line */}
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="profit"
            name="صافي الأرباح"
            stroke={PALETTE.sage}
            strokeWidth={2.5}
            dot={false}
            activeDot={{
              r: 5,
              fill: PALETTE.sage,
              stroke: PALETTE.white,
              strokeWidth: 2,
            }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}
