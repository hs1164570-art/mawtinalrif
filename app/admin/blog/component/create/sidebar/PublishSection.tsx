"use client";

import { CalendarClock, Send, AlertTriangle } from "lucide-react";
import { StatusBadge, type BlogStatus } from "../../shared/StatusBadge";

interface PublishSectionProps {
  status: BlogStatus;
  scheduledFor: string | null;
  onStatusChange: (status: BlogStatus) => void;
  onScheduledForChange: (value: string | null) => void;
  validationErrors: string[];
  onPublishClick: () => void;
  publishing: boolean;
}

const STATUS_LABELS: Record<BlogStatus, string> = {
  DRAFT: "مسودة", PUBLISHED: "نشر", SCHEDULED: "جدولة", ARCHIVED: "أرشفة",
};

export function PublishSection({
  status, scheduledFor, onStatusChange, onScheduledForChange,
  validationErrors, onPublishClick, publishing,
}: PublishSectionProps) {
  return (
    <div dir="rtl" className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[0.78rem] text-[var(--text-2)]">الحالة الحالية</span>
        <StatusBadge status={status} />
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        {(Object.keys(STATUS_LABELS) as BlogStatus[]).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => (s === "PUBLISHED" ? onPublishClick() : onStatusChange(s))}
            disabled={s === "PUBLISHED" && publishing}
            className={`py-1.5 rounded-[6px] text-[0.74rem] font-semibold border transition-colors disabled:opacity-50 ${
              status === s
                ? "bg-[var(--gold)] text-[var(--text-inv)] border-[var(--gold)]"
                : "bg-[var(--surface-3)] text-[var(--text-2)] border-[var(--border-md)] hover:border-[var(--gold)]"
            }`}
          >
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {status === "SCHEDULED" && (
        <div>
          <label className="flex items-center gap-1.5 text-[0.74rem] text-[var(--text-3)] mb-1">
            <CalendarClock size={13} />
            موعد النشر
          </label>
          <input
            type="datetime-local"
            value={scheduledFor ?? ""}
            onChange={(e) => onScheduledForChange(e.target.value || null)}
            className="w-full px-2.5 py-1.5 bg-[var(--surface-3)] border border-[var(--border-md)] rounded-[6px] text-[0.78rem] text-[var(--text-1)] outline-none focus:border-[var(--gold)]"
          />
        </div>
      )}

      {validationErrors.length > 0 && (
        <div className="space-y-1 px-2.5 py-2 bg-[var(--red)]/8 rounded-[8px]">
          {validationErrors.map((err) => (
            <p key={err} className="flex items-start gap-1.5 text-[0.72rem] text-[var(--red)] m-0">
              <AlertTriangle size={12} className="mt-0.5 shrink-0" />
              {err}
            </p>
          ))}
        </div>
      )}

      {status !== "PUBLISHED" && (
        <button
          type="button"
          onClick={onPublishClick}
          disabled={publishing}
          className="w-full flex items-center justify-center gap-1.5 py-2 bg-[var(--gold)] text-[var(--text-inv)] rounded-[8px] text-[0.8rem] font-semibold disabled:opacity-50"
        >
          <Send size={14} />
          {publishing ? "جارٍ النشر..." : "نشر المقال الآن"}
        </button>
      )}
    </div>
  );
}
