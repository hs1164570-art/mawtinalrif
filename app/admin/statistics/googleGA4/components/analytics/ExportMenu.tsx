// components/analytics/ExportMenu.tsx
"use client";

import { useRef, useState } from "react";
import { ExportFormat, ExportColumn, runExport } from "../../lib/export-utils";
import { cn } from "../../lib/utils";

const FORMAT_LABELS: { format: ExportFormat; label: string; icon: string }[] = [
  { format: "csv", label: "CSV", icon: "🗂️" },
  { format: "excel", label: "Excel", icon: "📊" },
  { format: "pdf", label: "PDF", icon: "📄" },
  { format: "word", label: "Word", icon: "📝" },
];

export function ExportMenu<T>({
  filename,
  title,
  columns,
  rows,
  className,
}: {
  filename: string;
  title: string;
  columns: ExportColumn<T>[];
  rows: T[];
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<ExportFormat | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  async function handleExport(format: ExportFormat) {
    setBusy(format);
    try {
      await runExport(format, { filename, title, columns, rows });
    } finally {
      setBusy(null);
      setOpen(false);
    }
  }

  return (
    <div className={cn("relative", className)} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-xl border border-border-md bg-surface px-3 py-1.5 text-xs font-bold text-text-2 hover:bg-bg-deep transition-colors"
      >
        تصدير
        <span
          aria-hidden
          className={cn("transition-transform", open && "rotate-180")}
        >
          ▾
        </span>
      </button>
      {open && (
        <div className="absolute z-20 left-0 mt-2 w-40 rounded-xl border border-border-md bg-surface shadow-md p-1.5 animate-fade-in">
          {FORMAT_LABELS.map((f) => (
            <button
              key={f.format}
              type="button"
              disabled={busy !== null || rows.length === 0}
              onClick={() => handleExport(f.format)}
              className="w-full flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-text-2 hover:bg-bg-deep disabled:opacity-40 transition-colors"
            >
              <span>{f.icon}</span>
              <span className="flex-1 text-right">
                {busy === f.format ? "جارٍ التصدير..." : `تصدير ${f.label}`}
              </span>
            </button>
          ))}
          {rows.length === 0 && (
            <p className="px-2.5 py-1.5 text-[11px] text-text-3">
              لا توجد بيانات للتصدير
            </p>
          )}
        </div>
      )}
    </div>
  );
}
