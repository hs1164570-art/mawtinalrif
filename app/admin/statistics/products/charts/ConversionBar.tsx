// ConversionBar.tsx
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import ChartWrapper from "../../_shared/components/ChartWrapper";
import { PALETTE } from "../../_shared/constants";

interface ConversionPoint {
  name: string;
  sales: number;
  cart: number;
  views: number;
}

const truncate = (s: string, n = 14) =>
  s.length > n ? s.slice(0, n) + "…" : s;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const views = payload.find((p: any) => p.dataKey === "views")?.value ?? 0;
  const cart = payload.find((p: any) => p.dataKey === "cart")?.value ?? 0;
  const sales = payload.find((p: any) => p.dataKey === "sales")?.value ?? 0;
  const cartRate = views > 0 ? ((cart / views) * 100).toFixed(1) : "0";
  const salesRate = cart > 0 ? ((sales / cart) * 100).toFixed(1) : "0";

  return (
    <div
      className="bg-[var(--surface)] border border-[var(--border-md)] rounded-xl p-3 shadow-[var(--shadow-md)] text-right min-w-[170px]"
      dir="rtl"
    >
      <p className="text-xs font-semibold text-[var(--text-1)] mb-2 truncate">
        {label}
      </p>
      {[
        { key: "views", label: "مشاهدات", color: PALETTE.blue, val: views },
        { key: "cart", label: "سلة", color: PALETTE.gold, val: cart },
        { key: "sales", label: "مبيعات", color: PALETTE.sage, val: sales },
      ].map((row) => (
        <div
          key={row.key}
          className="flex items-center justify-between gap-3 mb-1"
        >
          <span className="flex items-center gap-1.5 text-xs text-[var(--text-2)]">
            <span
              className="w-2 h-2 rounded-sm"
              style={{ background: row.color }}
            />
            {row.label}
          </span>
          <span className="text-xs font-bold tabular-nums text-[var(--text-1)]">
            {row.val.toLocaleString("en-US")}
          </span>
        </div>
      ))}
      <div className="mt-2 pt-2 border-t border-[var(--border-md)] space-y-0.5">
        <p className="text-[10px] text-[var(--text-3)]">
          معدل الإضافة للسلة: {cartRate}%
        </p>
        <p className="text-[10px] text-[var(--text-3)]">
          معدل التحويل البيعي: {salesRate}%
        </p>
      </div>
    </div>
  );
};

export default function ConversionBar({ data }: { data: ConversionPoint[] }) {
  const chartData = data.map((d) => ({ ...d, name: truncate(d.name, 16) }));

  return (
    <ChartWrapper
      title="قمع التحويل للمنتجات"
      description="مقارنة المشاهدات والسلة والمبيعات لأعلى ٥ منتجات"
      exportData={data.map((d) => ({
        المنتج: d.name,
        المشاهدات: d.views,
        السلة: d.cart,
        المبيعات: d.sales,
      }))}
      exportFileName="قمع-تحويل"
      minHeight={300}
    >
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
          barCategoryGap="25%"
          barGap={3}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={PALETTE.border}
            vertical={false}
          />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, fill: PALETTE.medBrown }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: PALETTE.muted }}
            axisLine={false}
            tickLine={false}
            width={40}
            tickFormatter={(n) =>
              n >= 1000 ? `${(n / 1000).toFixed(0)}ك` : String(n)
            }
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 11, direction: "rtl", paddingTop: 8 }}
            formatter={(val) => (
              <span style={{ color: PALETTE.medBrown }}>{val}</span>
            )}
          />

          <Bar
            dataKey="views"
            name="مشاهدات"
            fill={PALETTE.blue}
            radius={[4, 4, 0, 0]}
            maxBarSize={22}
          />
          <Bar
            dataKey="cart"
            name="سلة"
            fill={PALETTE.gold}
            radius={[4, 4, 0, 0]}
            maxBarSize={22}
          />
          <Bar
            dataKey="sales"
            name="مبيعات"
            fill={PALETTE.sage}
            radius={[4, 4, 0, 0]}
            maxBarSize={22}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}
