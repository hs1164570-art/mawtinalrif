// ─── app/blog/[slug]/loading.tsx ─────────────────────────────────────────────
// Skeleton shown while the post page is streaming/loading.

export default function Loading() {
  return (
    <div dir="rtl" className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 animate-pulse">
      {/* Breadcrumb skeleton */}
      <div className="flex gap-2 mb-6">
        <div className="h-4 w-16 bg-[var(--bg-deep)] rounded" />
        <div className="h-4 w-16 bg-[var(--bg-deep)] rounded" />
        <div className="h-4 w-32 bg-[var(--bg-deep)] rounded" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8 lg:gap-10">
        <div>
          {/* Title */}
          <div className="h-9 w-3/4 bg-[var(--bg-deep)] rounded-lg mb-3" />
          <div className="h-9 w-1/2 bg-[var(--bg-deep)] rounded-lg mb-6" />

          {/* Meta row */}
          <div className="flex gap-4 mb-6">
            <div className="h-7 w-7 bg-[var(--bg-deep)] rounded-full" />
            <div className="h-4 w-24 bg-[var(--bg-deep)] rounded self-center" />
            <div className="h-4 w-20 bg-[var(--bg-deep)] rounded self-center" />
          </div>

          {/* Cover image */}
          <div className="w-full aspect-[16/9] bg-[var(--bg-deep)] rounded-xl mb-8" />

          {/* Paragraphs */}
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-4 bg-[var(--bg-deep)] rounded" style={{ width: `${85 - i * 5}%` }} />
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="hidden lg:block h-64 bg-[var(--bg-deep)] rounded-xl" />
      </div>
    </div>
  )
}
