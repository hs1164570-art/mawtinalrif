"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
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
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: p.color }}
          />
          <span className="text-xs text-[#6B4C3B]">{p.name}:</span>
          <span className="text-xs font-bold text-[#3D2B1F] tabular-nums">
            {fmtCurrency(p.value)}ر.س
          </span>
        </div>
      ))}
    </div>
  );
};

export default function SalesLineChart({
  data,
  isComparison,
}: {
  data: DataPoint[];
  isComparison: boolean;
}) {
  return (
    <ChartWrapper
      title="مقارنة المبيعات الزمنية"
      description="إجمالي المبيعات اليومية عبر الفترة"
      exportData={data.map((d) => ({ التاريخ: d.date, المبيعات: d.value }))}
      exportFileName="مبيعات-زمنية"
      minHeight={260}
    >
      <ResponsiveContainer width="100%" height={260}>
        <LineChart
          data={data}
          margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="salesGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={PALETTE.gold} />
              <stop offset="100%" stopColor={PALETTE.goldLight} />
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
          {isComparison && (
            <Legend
              wrapperStyle={{ fontSize: 11, direction: "rtl", paddingTop: 8 }}
            />
          )}

          <Line
            type="monotone"
            dataKey="value"
            name="المبيعات"
            stroke="url(#salesGrad)"
            strokeWidth={2.5}
            dot={false}
            activeDot={{
              r: 5,
              fill: PALETTE.gold,
              stroke: PALETTE.white,
              strokeWidth: 2,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}
