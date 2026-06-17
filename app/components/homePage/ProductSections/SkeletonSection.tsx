function SkeletonCard() {
  return (
    <div className="flex flex-col bg-[var(--surface)] border border-[var(--border)] overflow-hidden">
      <div className="aspect-[4/3] bg-[var(--bg-deep)]" />
      <div className="p-3 flex flex-col gap-2">
        <div className="h-4 w-3/4 bg-[var(--bg-deep)] rounded-sm" />
        <div className="h-3 w-1/2 bg-[var(--bg-deep)] rounded-sm" />
        <div className="h-5 w-1/3 bg-[var(--bg-deep)] rounded-sm mt-1" />
      </div>
      <div className="mx-3 mb-3 h-8 bg-[var(--bg-deep)]" />
    </div>
  )
}

export default function SkeletonSection() {
  return (
    <div
      className="py-10 md:py-14 animate-pulse"
      role="status"
      aria-label="جاري تحميل المنتجات"
    >
      {/* Section A skeleton */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-7 bg-[var(--border-md)]" />
            <div className="h-7 w-36 bg-[var(--bg-deep)] rounded-sm" />
          </div>
          <div className="h-5 w-16 bg-[var(--bg-deep)] rounded-sm" />
        </div>

        {/* Cards */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Featured large */}
          <div className="lg:w-[42%] flex-shrink-0">
            <div className="aspect-[4/3] lg:aspect-[3/4] bg-[var(--bg-deep)]" />
          </div>
          {/* Small grid */}
          <div className="flex-1 grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>

      <span className="sr-only">جاري تحميل المنتجات، يرجى الانتظار...</span>
    </div>
  )
}
