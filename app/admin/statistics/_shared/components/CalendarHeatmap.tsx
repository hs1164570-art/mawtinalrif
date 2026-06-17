"use client";

import { useMemo, useState } from "react";
import { PALETTE } from "../constants";

interface HeatmapCell {
  date: string;
  count: number;
}

interface CalendarHeatmapProps {
  data: HeatmapCell[];
  weeks?: number; // how many weeks to show (default 13 ≈ 3 months)
  colorBase?: string;
  label?: string;
}

const DAY_NAMES_AR = [
  "الأحد",
  "الاثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
];
const DAY_SHORT_AR = [
  "أحد",
  "إثنين",
  "ثلاثاء",
  "أربعاء",
  "خميس",
  "جمعة",
  "سبت",
];
const MONTH_AR = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

function getColor(count: number, max: number, base: string): string {
  if (count === 0) return "#F5EFE6";
  const intensity = Math.ceil((count / Math.max(max, 1)) * 4);
  const opacities = [0.25, 0.45, 0.7, 1];
  const hex = base;
  // We can't do opacity trick for heatmap, so we interpolate between cream and base
  const ratio = opacities[Math.min(intensity - 1, 3)];
  // Parse hex and interpolate
  const r1 = parseInt(hex.slice(1, 3), 16);
  const g1 = parseInt(hex.slice(3, 5), 16);
  const b1 = parseInt(hex.slice(5, 7), 16);
  const r0 = 0xf5,
    g0 = 0xef,
    b0 = 0xe6; // cream #F5EFE6
  const r = Math.round(r0 + (r1 - r0) * ratio);
  const g = Math.round(g0 + (g1 - g0) * ratio);
  const b = Math.round(b0 + (b1 - b0) * ratio);
  return `rgb(${r},${g},${b})`;
}

export default function CalendarHeatmap({
  data,
  weeks = 13,
  colorBase = PALETTE.gold,
  label = "الطلبات",
}: CalendarHeatmapProps) {
  const [tooltip, setTooltip] = useState<{
    date: string;
    count: number;
    x: number;
    y: number;
  } | null>(null);

  const { grid, months, maxCount } = useMemo(() => {
    // Build a map from date → count
    const map = new Map(data.map((d) => [d.date, d.count]));
    const maxCount = Math.max(0, ...data.map((d) => d.count));

    // Start from `weeks` weeks ago, aligned to Sunday
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endSunday = new Date(today);
    endSunday.setDate(today.getDate() + (6 - today.getDay())); // next Saturday or today

    const startDate = new Date(endSunday);
    startDate.setDate(endSunday.getDate() - weeks * 7 + 1);
    // Align start to Sunday
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const grid: Array<
      Array<{ date: string; count: number; isCurrentMonth: boolean }>
    > = [];
    const monthLabels: Array<{ month: string; col: number }> = [];
    let lastMonth = -1;

    for (let w = 0; w < weeks; w++) {
      const col: Array<{
        date: string;
        count: number;
        isCurrentMonth: boolean;
      }> = [];
      for (let d = 0; d < 7; d++) {
        const cell = new Date(startDate);
        cell.setDate(startDate.getDate() + w * 7 + d);
        const dateStr = cell.toLocaleDateString("en-CA");
        const month = cell.getMonth();
        if (d === 0 && month !== lastMonth) {
          monthLabels.push({ month: MONTH_AR[month], col: w });
          lastMonth = month;
        }
        col.push({
          date: dateStr,
          count: map.get(dateStr) ?? 0,
          isCurrentMonth: month === today.getMonth(),
        });
      }
      grid.push(col);
    }

    return { grid, months: monthLabels, maxCount };
  }, [data, weeks]);

  const CELL = 14;
  const GAP = 3;
  const STEP = CELL + GAP;

  return (
    <div
      className="relative"
      dir="ltr"
      role="img"
      aria-label={`خريطة كثافة ${label}`}
    >
      {/* Month labels */}
      <div
        className="flex mb-1 text-[10px] text-[#A89585] relative"
        style={{ marginRight: 36 }}
      >
        {months.map((m, i) => (
          <span key={i} className="absolute" style={{ left: m.col * STEP }}>
            {m.month}
          </span>
        ))}
      </div>

      <div className="flex gap-0 mt-5">
        {/* Day labels */}
        <div className="flex flex-col gap-[3px] mr-1 text-[10px] text-[#A89585]">
          {DAY_SHORT_AR.map((d, i) => (
            <div
              key={d}
              style={{ height: CELL, lineHeight: `${CELL}px` }}
              className={i % 2 === 0 ? "invisible" : ""}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="flex gap-[3px]" role="grid">
          {grid.map((col, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]" role="row">
              {col.map((cell, di) => {
                const bg = getColor(cell.count, maxCount, colorBase);
                return (
                  <div
                    key={di}
                    role="gridcell"
                    aria-label={`${cell.date}: ${cell.count} ${label}`}
                    tabIndex={0}
                    style={{ width: CELL, height: CELL, backgroundColor: bg }}
                    className="rounded-sm cursor-default transition-transform hover:scale-125
                               focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#B89A5A]"
                    onMouseEnter={(e) => {
                      const rect = (
                        e.target as HTMLElement
                      ).getBoundingClientRect();
                      setTooltip({
                        date: cell.date,
                        count: cell.count,
                        x: rect.left,
                        y: rect.top,
                      });
                    }}
                    onMouseLeave={() => setTooltip(null)}
                    onFocus={(e) => {
                      const rect = (
                        e.target as HTMLElement
                      ).getBoundingClientRect();
                      setTooltip({
                        date: cell.date,
                        count: cell.count,
                        x: rect.left,
                        y: rect.top,
                      });
                    }}
                    onBlur={() => setTooltip(null)}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div
        className="flex items-center gap-1.5 mt-3 text-[10px] text-[#A89585]"
        dir="rtl"
      >
        <span>أقل</span>
        {[0, 0.25, 0.5, 0.75, 1].map((v, i) => (
          <div
            key={i}
            style={{
              width: CELL,
              height: CELL,
              backgroundColor:
                v === 0 ? "#F5EFE6" : (
                  getColor(Math.ceil(v * maxCount), maxCount, colorBase)
                ),
            }}
            className="rounded-sm flex-shrink-0"
            aria-hidden
          />
        ))}
        <span>أكثر</span>
      </div>

      {/* Tooltip - rendered at the document level via portal or just fixed */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none px-2.5 py-1.5 bg-[#3D2B1F] text-white
                     text-xs rounded-lg shadow-lg whitespace-nowrap"
          style={{ top: tooltip.y - 36, left: tooltip.x - 20 }}
          dir="rtl"
          role="tooltip"
        >
          <p className="font-medium">
            {new Date(tooltip.date).toLocaleDateString("en-US", {
              weekday: "short",
              day: "numeric",
              month: "short",
            })}
          </p>
          <p className="text-[#D4B97A]">
            {tooltip.count} {label}
          </p>
        </div>
      )}
    </div>
  );
}
