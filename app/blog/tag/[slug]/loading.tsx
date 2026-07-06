// ─── app/blog/category/[slug]/loading.tsx ────────────────────────────────────

export default function Loading() {
  return (
    <div dir="rtl" className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 animate-pulse">
      <div className="h-4 w-40 bg-[var(--bg-deep)] rounded mb-6" />
      <div className="h-8 w-56 bg-[var(--bg-deep)] rounded-lg mb-8" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="rounded-xl overflow-hidden border border-[var(--border)]">
            <div className="aspect-[16/10] bg-[var(--bg-deep)]" />
            <div className="p-4 space-y-2">
              <div className="h-4 bg-[var(--bg-deep)] rounded w-full" />
              <div className="h-4 bg-[var(--bg-deep)] rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
