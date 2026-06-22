// components/analytics/DateRangePicker.tsx
"use client";

import type { DateRange } from "../../lib/types";
import { cn } from "../../lib/utils";

// Re-exported here for convenience so existing client-side imports of
// `presetToRange` from this file keep working — the actual implementation
// lives in lib/utils.ts (a server-safe module) so server components can call
// it too. A "use client" module's exports can never be invoked on the server.

const PRESETS: { label: string; days: number }[] = [
  { label: "آخر 7 أيام", days: 7 },
  { label: "آخر 28 يومًا", days: 28 },
  { label: "آخر 90 يومًا", days: 90 },
];

export function DateRangePicker({
  range,
  onChange,
  activeDays,
  onPresetChange,
}: {
  range: DateRange;
  onChange: (r: DateRange) => void;
  activeDays: number;
  onPresetChange: (days: number) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-surface p-2 shadow-sm">
      {PRESETS.map((p) => (
        <button
          key={p.days}
          type="button"
          onClick={() => onPresetChange(p.days)}
          className={cn(
            "px-3 py-1.5 rounded-xl text-xs font-bold transition-colors",
            activeDays === p.days ?
              "bg-text-1 text-text-inv"
            : "text-text-2 hover:bg-bg-deep",
          )}
        >
          {p.label}
        </button>
      ))}
      <span className="w-px h-5 bg-border-md mx-1" />
      <div className="flex items-center gap-2 text-xs text-text-2">
        <input
          type="date"
          value={range.startDate}
          max={range.endDate}
          onChange={(e) => onChange({ ...range, startDate: e.target.value })}
          className="rounded-lg border border-border-md bg-bg px-2 py-1.5 text-xs outline-none focus:border-brand-cyan tabular-nums"
        />
        <span className="text-text-3">إلى</span>
        <input
          type="date"
          value={range.endDate}
          min={range.startDate}
          onChange={(e) => onChange({ ...range, endDate: e.target.value })}
          className="rounded-lg border border-border-md bg-bg px-2 py-1.5 text-xs outline-none focus:border-brand-cyan tabular-nums"
        />
      </div>
    </div>
  );
}
