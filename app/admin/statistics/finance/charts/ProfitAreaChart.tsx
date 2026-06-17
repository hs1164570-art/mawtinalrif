"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import ChartWrapper from "../../_shared/components/ChartWrapper";
import { PALETTE } from "../../_shared/constants";

interface DataPoint {
  date: string;
  value: number;
}

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

const fmtCurrency = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}م`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}ك`;
  return String(n);
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="bg-white border border-[#EDE5D8] rounded-xl p-3 shadow-lg text-right"
      dir="rtl"
    >
      <p className="text-xs text-[#A89585] mb-2">{fmtDate(label)}</p>
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#6A9E7F] flex-shrink-0" />
        <span className="text-xs text-[#6B4C3B]">الأرباح:</span>
        <span className="text-xs font-bold text-[#3D2B1F] tabular-nums">
          {fmtCurrency(payload[0]?.value ?? 0)}ر.س
        </span>
      </div>
    </div>
  );
};

export default function ProfitAreaChart({
  data,
  isComparison,
}: {
  data: DataPoint[];
  isComparison: boolean;
}) {
  return (
    <ChartWrapper
      title="منحنى صافي الأرباح"
      description="تطور صافي الربح اليومي عبر الفترة"
      exportData={data.map((d) => ({
        التاريخ: d.date,
        "صافي الأرباح": d.value,
      }))}
      exportFileName="أرباح-زمنية"
      minHeight={260}
    >
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart
          data={data}
          margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
        >
          <defs>
            {/* Fill gradient */}
            <linearGradient id="profitFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={PALETTE.sage} stopOpacity={0.35} />
              <stop offset="95%" stopColor={PALETTE.sage} stopOpacity={0} />
            </linearGradient>
            {/* Stroke gradient */}
            <linearGradient id="profitStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={PALETTE.sage} />
              <stop offset="100%" stopColor={PALETTE.sageLight} />
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
            tick={{ fontSize: 11, fill: PALETTE.muted }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tickFormatter={fmtCurrency}
            tick={{ fontSize: 11, fill: PALETTE.muted }}
            axisLine={false}
            tickLine={false}
            width={48}
          />
          <Tooltip content={<CustomTooltip />} />

          <Area
            type="monotone"
            dataKey="value"
            name="صافي الأرباح"
            stroke="url(#profitStroke)"
            strokeWidth={2.5}
            fill="url(#profitFill)"
            dot={false}
            activeDot={{
              r: 5,
              fill: PALETTE.sage,
              stroke: PALETTE.white,
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}
