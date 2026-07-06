// ─── app/blog/loading.tsx ─────────────────────────────────────────────────────
// Skeleton for /blog and /blog/page/[n] (Next.js applies the nearest loading.tsx
// up the tree to all matching segments, including the [pageNumber] route).

export default function Loading() {
  return (
    <div dir="rtl" className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 animate-pulse">
      {/* Hero skeleton */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="h-9 w-64 bg-[var(--bg-deep)] rounded-lg mx-auto mb-3" />
        <div className="h-5 w-80 bg-[var(--bg-deep)] rounded mx-auto" />
      </div>

      {/* Pills skeleton */}
      <div className="flex gap-2 mb-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-9 w-20 bg-[var(--bg-deep)] rounded-full" />
        ))}
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="rounded-xl overflow-hidden border border-[var(--border)]">
            <div className="aspect-[16/10] bg-[var(--bg-deep)]" />
            <div className="p-4 space-y-2">
              <div className="h-4 bg-[var(--bg-deep)] rounded w-full" />
              <div className="h-4 bg-[var(--bg-deep)] rounded w-2/3" />
              <div className="h-3 bg-[var(--bg-deep)] rounded w-1/3 mt-3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
