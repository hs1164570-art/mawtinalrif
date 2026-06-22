// components/analytics/charts/FirstVisitTable.tsx
"use client";

import { EmptyState } from "../ChartCard";
import { ExportMenu } from "../ExportMenu";
import { ExportColumn } from "../../../lib/export-utils";
import { FirstVisitAttributionRow } from "../../../lib/types";
import { formatNumber } from "../../../lib/utils";

const columns: ExportColumn<FirstVisitAttributionRow>[] = [
  { key: "firstSource", header: "أول مصدر" },
  { key: "firstMedium", header: "أول وسيط" },
  { key: "firstCampaign", header: "أول حملة" },
  { key: "firstKeyword", header: "الكلمة المفتاحية" },
  { key: "firstAdContent", header: "محتوى الإعلان" },
  { key: "firstSourcePlatform", header: "منصة المصدر" },
  {
    key: "users",
    header: "المستخدمون",
    format: (v) => formatNumber(v as number),
  },
];

export default function FirstVisitTable({
  data,
}: {
  data: FirstVisitAttributionRow[];
}) {
  if (!data.length)
    return <EmptyState message="لا توجد بيانات إسناد أول زيارة كافية" />;

  return (
    <div>
      <div className="flex justify-end mb-3">
        <ExportMenu
          filename="first-visit-attribution"
          title="إسناد أول زيارة"
          columns={columns}
          rows={data}
        />
      </div>
      <div className="overflow-x-auto scroll-thin">
        <table className="w-full text-xs min-w-[640px]">
          <thead>
            <tr className="text-right text-text-3 border-b border-border">
              <th className="py-2 px-2 font-semibold">أول مصدر</th>
              <th className="py-2 px-2 font-semibold">أول وسيط</th>
              <th className="py-2 px-2 font-semibold">أول حملة</th>
              <th className="py-2 px-2 font-semibold">منصة المصدر</th>
              <th className="py-2 px-2 font-semibold">المستخدمون</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className="border-b border-border last:border-0">
                <td className="py-2.5 px-2 text-text-2">{row.firstSource}</td>
                <td className="py-2.5 px-2 text-text-2">{row.firstMedium}</td>
                <td className="py-2.5 px-2 text-text-2">{row.firstCampaign}</td>
                <td className="py-2.5 px-2 text-text-2">
                  {row.firstSourcePlatform}
                </td>
                <td className="py-2.5 px-2 font-bold text-text-1 tabular-nums">
                  {formatNumber(row.users)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
