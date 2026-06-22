// components/analytics/charts/AcquisitionSourceExplorer.tsx
"use client";

import { useMemo, useState } from "react";
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
import { AcquisitionSourceFilter, SessionSourceRow } from "../../../lib/types";
import { cn, formatNumber } from "../../../lib/utils";

const FILTERS: { key: AcquisitionSourceFilter; label: string }[] = [
  { key: "all", label: "كل المصادر" },
  { key: "qr", label: "QR Code" },
  { key: "whatsapp", label: "واتساب" },
  { key: "google_ads", label: "إعلانات جوجل" },
  { key: "direct", label: "مباشر" },
  { key: "social", label: "منصات اجتماعية" },
];

function matchesFilter(
  row: SessionSourceRow,
  filter: AcquisitionSourceFilter,
): boolean {
  const s = row.source.toLowerCase();
  switch (filter) {
    case "all":
      return true;
    case "qr":
      return s.includes("qr");
    case "whatsapp":
      return s.includes("whatsapp");
    case "google_ads":
      return s.includes("google") && row.medium.toLowerCase().includes("cpc");
    case "direct":
      return s.includes("direct");
    case "social":
      return [
        "facebook",
        "instagram",
        "tiktok",
        "snapchat",
        "x",
        "twitter",
      ].some((p) => s.includes(p));
  }
}

export default function AcquisitionSourceExplorer({
  sources,
}: {
  sources: SessionSourceRow[];
}) {
  const [filter, setFilter] = useState<AcquisitionSourceFilter>("all");

  const filtered = useMemo(
    () => sources.filter((s) => matchesFilter(s, filter)),
    [sources, filter],
  );
  const totalSessions = filtered.reduce((s, r) => s + r.sessions, 0);

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-bold transition-colors",
              filter === f.key ?
                "bg-text-1 text-text-inv"
              : "bg-bg-deep text-text-2 hover:bg-border-md",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ?
        <EmptyState message="لا توجد بيانات لهذا المصدر في الفترة الحالية" />
      : <>
          <p className="text-xs text-text-3 mb-3">
            إجمالي الجلسات لهذا التصنيف:{" "}
            <span className="font-bold text-text-1">
              {formatNumber(totalSessions)}
            </span>
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={filtered}
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
                dataKey="source"
                tick={{ fill: chartColors.text2, fontSize: 12 }}
                width={84}
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
        </>
      }
    </div>
  );
}
