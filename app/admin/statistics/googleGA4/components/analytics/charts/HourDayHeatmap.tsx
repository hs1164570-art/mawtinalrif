// components/analytics/charts/HourDayHeatmap.tsx
"use client";

import { HourDayHeatPoint } from "../../../lib/types";
import { cn, formatNumber } from "../../../lib/utils";
import { EmptyState } from "../ChartCard";

const DAYS_AR = [
  "الأحد",
  "الإثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
];

function intensityClass(ratio: number): string {
  if (ratio >= 0.85) return "bg-brand-cyan";
  if (ratio >= 0.65) return "bg-brand-cyan/75";
  if (ratio >= 0.45) return "bg-brand-cyan/50";
  if (ratio >= 0.25) return "bg-brand-cyan/28";
  if (ratio > 0) return "bg-brand-cyan/12";
  return "bg-bg-deep";
}

export default function HourDayHeatmap({ data }: { data: HourDayHeatPoint[] }) {
  if (!data.length)
    return <EmptyState message="لا توجد بيانات نشاط كافية حسب الساعة واليوم" />;

  const max = Math.max(...data.map((d) => d.sessions));
  const grid = new Map<string, number>();
  data.forEach((d) => grid.set(`${d.dayOfWeek}-${d.hour}`, d.sessions));

  return (
    <div className="overflow-x-auto scroll-thin">
      <div className="min-w-[640px]">
        <div className="flex gap-[3px] mb-1 mr-9">
          {Array.from({ length: 24 }).map((_, h) => (
            <div key={h} className="flex-1 text-center text-[9px] text-text-3">
              {h % 3 === 0 ? h : ""}
            </div>
          ))}
        </div>
        {DAYS_AR.map((day, dayIndex) => (
          <div key={day} className="flex items-center gap-[3px] mb-[3px]">
            <span className="w-9 text-[10px] text-text-3 shrink-0 text-left">
              {day.slice(0, 3)}
            </span>
            {Array.from({ length: 24 }).map((_, hour) => {
              const value = grid.get(`${dayIndex}-${hour}`) ?? 0;
              const ratio = max > 0 ? value / max : 0;
              return (
                <div
                  key={hour}
                  className={cn(
                    "flex-1 aspect-square rounded-[3px] min-w-[14px]",
                    intensityClass(ratio),
                  )}
                  title={`${day} ${hour}:00 — ${formatNumber(value)} جلسة`}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
