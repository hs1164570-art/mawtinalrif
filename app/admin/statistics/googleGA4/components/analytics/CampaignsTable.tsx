// components/analytics/CampaignsTable.tsx
"use client";

import { useMemo, useState } from "react";
import type { CampaignRow } from "../../lib/types";
import { ExportMenu } from "./ExportMenu";
import type { ExportColumn } from "../../lib/export-utils";
import { EmptyState } from "./ChartCard";
import {
  formatNumber,
  formatPercent,
  formatDuration,
  cn,
} from "../../lib/utils";

type SortKey = keyof Pick<
  CampaignRow,
  | "sessions"
  | "bounceRate"
  | "engagementRate"
  | "avgSessionDurationSec"
  | "sessionsPerUser"
>;

const QUALITY_LABEL: Record<CampaignRow["quality"], string> = {
  good: "جيدة",
  average: "متوسطة",
  poor: "ضعيفة",
};

const QUALITY_DOT: Record<CampaignRow["quality"], string> = {
  good: "bg-[#2f9e44]",
  average: "bg-[#f08c00]",
  poor: "bg-brand-red",
};

const exportColumns: ExportColumn<CampaignRow>[] = [
  { key: "campaignName", header: "اسم الحملة" },
  {
    key: "sessions",
    header: "عدد الزيارات",
    format: (v) => formatNumber(v as number),
  },
  { key: "source", header: "المصدر" },
  { key: "medium", header: "الوسيط" },
  {
    key: "bounceRate",
    header: "معدل الارتداد",
    format: (v) => formatPercent(v as number),
  },
  {
    key: "engagementRate",
    header: "معدل التفاعل",
    format: (v) => formatPercent(v as number),
  },
  {
    key: "avgSessionDurationSec",
    header: "متوسط مدة الجلسة",
    format: (v) => formatDuration(v as number),
  },
  {
    key: "sessionsPerUser",
    header: "جلسات لكل مستخدم",
    format: (v) => formatNumber(v as number),
  },
  {
    key: "quality",
    header: "جودة التفاعل",
    format: (v) => QUALITY_LABEL[v as CampaignRow["quality"]],
  },
];

export function CampaignsTable({ campaigns }: { campaigns: CampaignRow[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("sessions");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sorted = useMemo(() => {
    const rows = [...campaigns];
    rows.sort((a, b) =>
      sortDir === "desc" ? b[sortKey] - a[sortKey] : a[sortKey] - b[sortKey],
    );
    return rows;
  }, [campaigns, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const columns: { key: SortKey; label: string }[] = [
    { key: "sessions", label: "عدد الزيارات" },
    { key: "bounceRate", label: "معدل الارتداد" },
    { key: "engagementRate", label: "معدل التفاعل" },
    { key: "avgSessionDurationSec", label: "متوسط المدة" },
    { key: "sessionsPerUser", label: "جلسات/مستخدم" },
  ];

  return (
    <section className="rounded-2xl border border-border bg-surface shadow-sm p-5 animate-fade-in">
      <header className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-bold text-text-1 flex items-center gap-2">
            ترتيب الحملات الإعلانية
            <span className="text-[10px] font-normal text-text-3 bg-bg-deep rounded-full px-2 py-0.5">
              {campaigns.length} حملة
            </span>
          </h3>
          <p className="text-xs text-text-3 mt-1">
            رتّب الجدول حسب أي عمود لمعرفة الحملات الأكثر زيارات والأفضل تفاعلًا
            — بدون بيانات تحويل أو إيراد.
          </p>
        </div>
        <ExportMenu
          filename="campaigns-report"
          title="تقرير الحملات الإعلانية"
          columns={exportColumns}
          rows={sorted}
        />
      </header>

      {sorted.length === 0 ?
        <EmptyState message="لا توجد حملات بزيارات مسجّلة في هذه الفترة" />
      : <div className="overflow-x-auto scroll-thin -mx-1">
          <table className="w-full text-sm min-w-[820px]">
            <thead>
              <tr className="text-right text-xs text-text-3 border-b border-border">
                <th className="py-2.5 px-2 font-semibold">الحملة</th>
                <th className="py-2.5 px-2 font-semibold">المصدر / الوسيط</th>
                {columns.map((c) => (
                  <th key={c.key} className="py-2.5 px-2 font-semibold">
                    <button
                      type="button"
                      onClick={() => toggleSort(c.key)}
                      className={cn(
                        "inline-flex items-center gap-1 hover:text-text-1 transition-colors",
                        sortKey === c.key && "text-text-1 font-bold",
                      )}
                    >
                      {c.label}
                      {sortKey === c.key && (
                        <span>{sortDir === "desc" ? "▾" : "▴"}</span>
                      )}
                    </button>
                  </th>
                ))}
                <th className="py-2.5 px-2 font-semibold">جودة التفاعل</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((c, i) => (
                <tr
                  key={c.campaignName}
                  className={cn(
                    "border-b border-border last:border-0 hover:bg-bg-deep/50 transition-colors",
                    i === 0 && "bg-brand-cyan-bg/40",
                  )}
                >
                  <td className="py-3 px-2 font-bold text-text-1">
                    {c.campaignName}
                  </td>
                  <td className="py-3 px-2 text-text-2">
                    {c.source} <span className="text-text-3">/ {c.medium}</span>
                  </td>
                  <td className="py-3 px-2 font-extrabold text-text-1 tabular-nums text-[15px]">
                    {formatNumber(c.sessions)}
                  </td>
                  <td className="py-3 px-2 text-text-2 tabular-nums">
                    {formatPercent(c.bounceRate)}
                  </td>
                  <td className="py-3 px-2 text-text-2 tabular-nums">
                    {formatPercent(c.engagementRate)}
                  </td>
                  <td className="py-3 px-2 text-text-2 tabular-nums">
                    {formatDuration(c.avgSessionDurationSec)}
                  </td>
                  <td className="py-3 px-2 text-text-2 tabular-nums">
                    {formatNumber(c.sessionsPerUser)}
                  </td>
                  <td className="py-3 px-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-bg-deep px-2 py-1 text-[11px] font-bold text-text-2">
                      <span
                        className={cn(
                          "w-2 h-2 rounded-full",
                          QUALITY_DOT[c.quality],
                        )}
                      />
                      {QUALITY_LABEL[c.quality]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      }
    </section>
  );
}
