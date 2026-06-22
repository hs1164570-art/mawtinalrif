// components/analytics/KpiCard.tsx

import { hasValue, cn } from "../../lib/utils";

export function KpiCard({
  label,
  value,
  formattedValue,
  deltaPct,
  accent = "default",
}: {
  label: string;
  value: number | null | undefined;
  formattedValue: string;
  deltaPct?: number;
  accent?: "default" | "cyan" | "red";
}) {
  const noData = !hasValue(value);

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm flex flex-col gap-2 animate-fade-in">
      <span className="text-xs font-medium text-text-3">{label}</span>
      {noData ?
        <span className="text-sm text-text-3">لا توجد بيانات بعد</span>
      : <div className="flex items-end justify-between gap-2">
          <span
            className={cn(
              "text-2xl font-extrabold tabular-nums",
              accent === "cyan" && "text-brand-cyan",
              accent === "red" && "text-brand-red",
              accent === "default" && "text-text-1",
            )}
          >
            {formattedValue}
          </span>
          {typeof deltaPct === "number" && (
            <span
              className={cn(
                "text-xs font-bold px-1.5 py-0.5 rounded-md tabular-nums",
                deltaPct >= 0 ?
                  "text-[#2f9e44] bg-[#2f9e4414]"
                : "text-brand-red bg-[#e0313114]",
              )}
            >
              {deltaPct >= 0 ? "▲" : "▼"} {Math.abs(deltaPct).toFixed(1)}٪
            </span>
          )}
        </div>
      }
    </div>
  );
}
