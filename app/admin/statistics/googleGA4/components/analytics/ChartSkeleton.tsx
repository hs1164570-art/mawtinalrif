// components/analytics/ChartSkeleton.tsx
// Custom skeleton shapes per chart type (never a generic spinner), used as the
// `loading` fallback for every next/dynamic chart import.

import { cn } from "../../lib/utils";

type SkeletonVariant =
  | "bar"
  | "line"
  | "donut"
  | "map"
  | "heatmap"
  | "table"
  | "kpi"
  | "funnel"
  | "treemap"
  | "scatter";

export function ChartSkeleton({
  variant = "bar",
  className,
}: {
  variant?: SkeletonVariant;
  className?: string;
}) {
  return (
    <div className={cn("w-full h-full min-h-[260px] p-4", className)}>
      <div className="h-4 w-1/3 rounded skeleton-shimmer mb-2" />
      <div className="h-3 w-1/2 rounded skeleton-shimmer mb-6" />
      <SkeletonBody variant={variant} />
    </div>
  );
}

function SkeletonBody({ variant }: { variant: SkeletonVariant }) {
  switch (variant) {
    case "bar":
      return (
        <div className="flex items-end gap-3 h-40">
          {[55, 80, 40, 95, 65, 30, 70].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-md skeleton-shimmer"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      );
    case "line":
      return (
        <div className="h-40 w-full rounded-xl skeleton-shimmer relative overflow-hidden">
          <div className="absolute inset-x-4 bottom-4 h-px bg-border-md" />
        </div>
      );
    case "donut":
      return (
        <div className="flex items-center justify-center h-40">
          <div className="w-32 h-32 rounded-full skeleton-shimmer relative">
            <div className="absolute inset-[22%] rounded-full bg-surface" />
          </div>
        </div>
      );
    case "map":
      return <div className="h-48 w-full rounded-xl skeleton-shimmer" />;
    case "heatmap":
      return (
        <div className="grid grid-cols-12 gap-1 h-40">
          {Array.from({ length: 84 }).map((_, i) => (
            <div key={i} className="rounded skeleton-shimmer" />
          ))}
        </div>
      );
    case "table":
      return (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-9 w-full rounded-lg skeleton-shimmer" />
          ))}
        </div>
      );
    case "kpi":
      return <div className="h-16 w-2/3 rounded-lg skeleton-shimmer" />;
    case "funnel":
      return (
        <div className="space-y-2 px-6">
          {[100, 70, 45].map((w, i) => (
            <div
              key={i}
              className="h-10 rounded-lg skeleton-shimmer mx-auto"
              style={{ width: `${w}%` }}
            />
          ))}
        </div>
      );
    case "treemap":
      return (
        <div className="grid grid-cols-3 grid-rows-2 gap-1 h-40">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded skeleton-shimmer" />
          ))}
        </div>
      );
    case "scatter":
      return (
        <div className="relative h-40 w-full rounded-xl skeleton-shimmer overflow-hidden">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 rounded-full bg-border-strong"
              style={{ left: `${(i * 37) % 90}%`, top: `${(i * 53) % 80}%` }}
            />
          ))}
        </div>
      );
    default:
      return <div className="h-40 w-full rounded-xl skeleton-shimmer" />;
  }
}

export function KpiCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
      <div className="h-3 w-2/3 rounded skeleton-shimmer mb-3" />
      <div className="h-7 w-1/2 rounded skeleton-shimmer" />
    </div>
  );
}
