// components/analytics/charts/RealtimeLocationTable.tsx
"use client";

import { RealtimeActiveRow } from "../../../lib/types";
import { formatNumber } from "../../../lib/utils";
import { EmptyState } from "../ChartCard";

export default function RealtimeLocationTable({
  data,
}: {
  data: RealtimeActiveRow[];
}) {
  if (!data.length) return <EmptyState message="لا يوجد مستخدمون نشطون الآن" />;

  return (
    <div className="overflow-x-auto scroll-thin">
      <table className="w-full text-xs min-w-[440px]">
        <thead>
          <tr className="text-right text-text-3 border-b border-border">
            <th className="py-2 px-2 font-semibold">الموقع</th>
            <th className="py-2 px-2 font-semibold">الجهاز</th>
            <th className="py-2 px-2 font-semibold">الصفحة الحالية</th>
            <th className="py-2 px-2 font-semibold">نشطون</th>
          </tr>
        </thead>
        <tbody>
          {data
            .sort((a, b) => b.activeUsers - a.activeUsers)
            .map((row, i) => (
              <tr key={i} className="border-b border-border last:border-0">
                <td className="py-2.5 px-2 text-text-2">
                  {row.city}، {row.country}
                </td>
                <td className="py-2.5 px-2 text-text-2">
                  {row.deviceCategory === "mobile" ?
                    "جوال"
                  : row.deviceCategory === "desktop" ?
                    "حاسوب"
                  : "لوحي"}
                </td>
                <td className="py-2.5 px-2 text-text-2">{row.pageTitle}</td>
                <td className="py-2.5 px-2 font-bold text-brand-red tabular-nums">
                  {formatNumber(row.activeUsers)}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
