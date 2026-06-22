// components/analytics/charts/BrowserOsBarChart.tsx
"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { EmptyState } from "../ChartCard";
import { chartColors } from "../../../lib/chart-colors";
import { TechBrowserRow, TechOsRow } from "../../../lib/types";
import { cn, formatNumber } from "../../../lib/utils";

export default function BrowserOsBarChart({
  browsers,
  operatingSystems,
}: {
  browsers: TechBrowserRow[];
  operatingSystems: TechOsRow[];
}) {
  const [tab, setTab] = useState<"browser" | "os">("browser");

  const chartData =
    tab === "browser" ?
      browsers.map((b) => ({ name: b.browser, sessions: b.sessions }))
    : operatingSystems.map((o) => ({ name: o.os, sessions: o.sessions }));

  return (
    <div>
      <div className="flex gap-1.5 mb-3">
        <button
          type="button"
          onClick={() => setTab("browser")}
          className={cn(
            "px-3 py-1 rounded-lg text-xs font-bold",
            tab === "browser" ?
              "bg-text-1 text-text-inv"
            : "bg-bg-deep text-text-2",
          )}
        >
          المتصفحات
        </button>
        <button
          type="button"
          onClick={() => setTab("os")}
          className={cn(
            "px-3 py-1 rounded-lg text-xs font-bold",
            tab === "os" ? "bg-text-1 text-text-inv" : "bg-bg-deep text-text-2",
          )}
        >
          أنظمة التشغيل
        </button>
      </div>
      {chartData.length === 0 ?
        <EmptyState message="لا توجد بيانات كافية" />
      : <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ left: 8, right: 16 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={chartColors.border}
              horizontal={false}
            />
            <XAxis
              type="number"
              tick={{ fill: chartColors.text3, fontSize: 11 }}
              tickFormatter={(v) => formatNumber(v)}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: chartColors.text2, fontSize: 12 }}
              width={92}
            />
            <Tooltip
              formatter={(value: any) => formatNumber(value)}
              contentStyle={{ direction: "rtl", textAlign: "right" }}
            />
            <Bar
              dataKey="sessions"
              fill={chartColors.cyanBright}
              radius={[6, 6, 6, 6]}
              barSize={16}
            />
          </BarChart>
        </ResponsiveContainer>
      }
    </div>
  );
}
