import Link from "next/link"
import { ArrowLeft } from "lucide-react"

interface Props {
  name: string
  slug: string
  variant?: "default" | "banner"
}

export default function SectionHeader({ name, slug, variant = "default" }: Props) {
  if (variant === "banner") {
    return (
      <div className="relative overflow-hidden bg-[var(--bg-deep)] border-b border-[var(--border-strong)] px-4 md:px-8 py-8 md:py-12">
        {/* Ghost watermark — purely decorative */}
        <span
          aria-hidden="true"
          className="pointer-events-none select-none absolute inset-0 flex items-center justify-center text-[5rem] sm:text-[7rem] md:text-[9rem] font-black text-[var(--text-1)] opacity-[0.035] leading-none overflow-hidden"
        >
          {name}
        </span>

        {/* Gold geometric line — top */}
        <div
          aria-hidden="true"
          className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[var(--gold)] to-transparent"
        />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 max-w-7xl mx-auto">
          <div>
            <p className="text-[var(--gold)] text-[11px] font-black tracking-[0.25em] uppercase mb-2 flex items-center gap-2">
              <span aria-hidden="true">◆</span>
              <span>تسوق الآن</span>
            </p>
            <h2
              id={`banner-heading-${slug}`}
              className="text-[var(--text-1)] text-2xl sm:text-3xl md:text-4xl font-black leading-tight"
            >
              {name}
            </h2>
          </div>

          <Link
            href={`/categories/${slug}`}
            className="inline-flex items-center gap-2 text-sm font-bold text-[var(--gold)] hover:text-[var(--text-1)] transition-colors duration-200 group shrink-0"
            aria-label={`تصفح جميع منتجات قسم ${name}`}
          >
            تصفح القسم كاملًا
            <ArrowLeft
              size={15}
              className="transition-transform duration-200 group-hover:-translate-x-1"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    )
  }

  // ── Default variant ──
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        {/* Gold accent bar */}
        <div
          aria-hidden="true"
          className="w-1 h-7 bg-[var(--gold)] shrink-0"
        />
        <h2
          id={`section-heading-${slug}`}
          className="text-[var(--text-1)] text-xl md:text-2xl font-black leading-tight"
        >
          {name}
        </h2>
      </div>

      <Link
        href={`/categories/${slug}`}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--text-3)] hover:text-[var(--gold)] transition-colors duration-200 group shrink-0"
        aria-label={`عرض جميع منتجات قسم ${name}`}
      >
        عرض الكل
        <ArrowLeft
          size={13}
          className="transition-transform duration-200 group-hover:-translate-x-1"
          aria-hidden="true"
        />
      </Link>
    </div>
  )
}
