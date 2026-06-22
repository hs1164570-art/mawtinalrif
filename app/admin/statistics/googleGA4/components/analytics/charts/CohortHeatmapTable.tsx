// components/analytics/charts/CohortHeatmapTable.tsx
"use client";

import { CohortRow } from "../../../lib/types";
import { cn } from "../../../lib/utils";
import { EmptyState } from "../ChartCard";

function colorForRate(rate: number): string {
  // Grayscale/cyan intensity scale derived from the project palette — no new colors.
  if (rate >= 70) return "bg-brand-cyan text-white";
  if (rate >= 50) return "bg-brand-cyan/70 text-white";
  if (rate >= 30) return "bg-brand-cyan/40 text-text-1";
  if (rate >= 15) return "bg-brand-cyan/20 text-text-1";
  if (rate > 0) return "bg-bg-deep text-text-2";
  return "bg-transparent text-text-3";
}

export default function CohortHeatmapTable({ data }: { data: CohortRow[] }) {
  if (!data.length) {
    return <EmptyState message="لا توجد بيانات أتراب (cohorts) كافية بعد" />;
  }

  const audiences = Array.from(new Set(data.map((d) => d.audienceName)));
  const periods = Array.from(new Set(data.map((d) => d.periodNumber))).sort(
    (a, b) => a - b,
  );

  return (
    <div className="overflow-x-auto scroll-thin">
      <table className="w-full text-xs min-w-[560px] border-separate border-spacing-1">
        <thead>
          <tr>
            <th className="text-right text-text-3 font-semibold px-2 py-1 sticky right-0 bg-surface">
              الجمهور
            </th>
            {periods.map((p) => (
              <th
                key={p}
                className="text-text-3 font-semibold px-1 py-1 min-w-[44px]"
              >
                أسبوع {p}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {audiences.map((audience) => (
            <tr key={audience}>
              <td className="text-right font-bold text-text-2 px-2 py-1 whitespace-nowrap sticky right-0 bg-surface">
                {audience}
              </td>
              {periods.map((p) => {
                const cell = data.find(
                  (d) => d.audienceName === audience && d.periodNumber === p,
                );
                const rate = cell?.retentionRate ?? 0;
                return (
                  <td key={p} className="p-0">
                    <div
                      className={cn(
                        "rounded-md py-2 text-center font-bold tabular-nums",
                        colorForRate(rate),
                      )}
                    >
                      {rate > 0 ? `${rate}٪` : "—"}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
