// components/analytics/charts/TopPagesTable.tsx
"use client";

import { LineChart, Line, ResponsiveContainer } from "recharts";

import { EmptyState } from "../ChartCard";
import { ExportMenu } from "../ExportMenu";
import { chartColors } from "../../../lib/chart-colors";
import { ExportColumn } from "../../../lib/export-utils";
import { TopPageRow } from "../../../lib/types";
import { formatNumber } from "../../../lib/utils";

const columns: ExportColumn<TopPageRow>[] = [
  { key: "pageTitle", header: "عنوان الصفحة" },
  { key: "pagePath", header: "المسار" },
  {
    key: "views",
    header: "المشاهدات",
    format: (v) => formatNumber(v as number),
  },
  { key: "viewsPerSession", header: "مشاهدات/جلسة" },
  { key: "viewsPerUser", header: "مشاهدات/مستخدم" },
];

function Sparkline({ trend }: { trend: number[] }) {
  const data = trend.map((v, i) => ({ i, v }));
  return (
    <ResponsiveContainer width={80} height={28}>
      <LineChart data={data}>
        <Line
          type="monotone"
          dataKey="v"
          stroke={chartColors.cyan}
          strokeWidth={1.75}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default function TopPagesTable({ data }: { data: TopPageRow[] }) {
  if (!data.length)
    return <EmptyState message="لا توجد صفحات بمشاهدات مسجّلة" />;

  const sorted = [...data].sort((a, b) => b.views - a.views);

  return (
    <div>
      <div className="flex justify-end mb-3">
        <ExportMenu
          filename="top-pages"
          title="أهم الصفحات"
          columns={columns}
          rows={sorted}
        />
      </div>
      <div className="overflow-x-auto scroll-thin">
        <table className="w-full text-xs min-w-[560px]">
          <thead>
            <tr className="text-right text-text-3 border-b border-border">
              <th className="py-2 px-2 font-semibold">الصفحة</th>
              <th className="py-2 px-2 font-semibold">المشاهدات</th>
              <th className="py-2 px-2 font-semibold">مشاهدات/جلسة</th>
              <th className="py-2 px-2 font-semibold">الاتجاه</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((p) => (
              <tr
                key={p.pagePath}
                className="border-b border-border last:border-0"
              >
                <td className="py-2.5 px-2">
                  <p className="font-bold text-text-1">{p.pageTitle}</p>
                  <p className="text-text-3 text-[11px]">{p.pagePath}</p>
                </td>
                <td className="py-2.5 px-2 font-bold text-text-1 tabular-nums">
                  {formatNumber(p.views)}
                </td>
                <td className="py-2.5 px-2 text-text-2 tabular-nums">
                  {p.viewsPerSession}
                </td>
                <td className="py-2.5 px-2">
                  <Sparkline trend={p.trend} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
