import { Circle } from "lucide-react";

export type BlogStatus = "DRAFT" | "PUBLISHED" | "SCHEDULED" | "ARCHIVED";

const STATUS_CONFIG: Record<BlogStatus, { label: string; color: string; bg: string }> = {
  DRAFT: { label: "مسودة", color: "var(--text-2)", bg: "var(--bg-deep)" },
  PUBLISHED: { label: "منشور", color: "#2f9e44", bg: "rgba(47,158,68,.1)" },
  SCHEDULED: { label: "مجدول", color: "var(--cyan)", bg: "var(--cyan-bg)" },
  ARCHIVED: { label: "مؤرشف", color: "var(--text-3)", bg: "var(--bg-deep)" },
};

export function StatusBadge({ status }: { status: BlogStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[0.7rem] font-bold whitespace-nowrap"
      style={{ color: cfg.color, background: cfg.bg }}
    >
      <Circle size={6} fill={cfg.color} stroke="none" />
      {cfg.label}
    </span>
  );
}
