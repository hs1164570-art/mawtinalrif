// components/analytics/ChartCard.tsx
// Every chart on the dashboard is wrapped in this so title/subtitle/empty-state
// handling is written once (DRY) instead of duplicated per chart component.

import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

export function ChartCard({
  title,
  subtitle,
  children,
  className,
  actions,
  span,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
  span?: "1" | "2" | "3" | "full";
}) {
  const spanClass =
    span === "2" ? "lg:col-span-2"
    : span === "3" ? "lg:col-span-3"
    : span === "full" ? "col-span-full"
    : "";

  return (
    <section
      className={cn(
        "rounded-2xl border border-border bg-surface shadow-sm p-5 flex flex-col animate-fade-in",
        spanClass,
        className,
      )}
    >
      <header className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-bold text-text-1">{title}</h3>
          <p className="text-xs text-text-3 mt-1 leading-relaxed">{subtitle}</p>
        </div>
        {actions}
      </header>
      <div className="flex-1 min-h-0">{children}</div>
    </section>
  );
}

export function EmptyState({
  message = "لا توجد بيانات كافية لعرضها بعد",
  hint,
}: {
  message?: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center gap-2 py-8">
      <div className="w-12 h-12 rounded-full bg-bg-deep flex items-center justify-center text-text-3 text-xl">
        ◌
      </div>
      <p className="text-sm font-medium text-text-2">{message}</p>
      {hint && <p className="text-xs text-text-3 max-w-[220px]">{hint}</p>}
    </div>
  );
}
