// components/analytics/LiveIndicator.tsx
export function LiveIndicator({ label = "مباشر" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-red/10 px-2.5 py-1 text-[11px] font-bold text-brand-red">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full rounded-full bg-brand-red animate-pulse-live" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-red" />
      </span>
      {label}
    </span>
  );
}
