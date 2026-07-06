// ─── app/blog/category/[slug]/not-found.tsx ──────────────────────────────────

import Link from 'next/link'

export default function NotFound() {
  return (
    <div dir="rtl" className="max-w-[600px] mx-auto px-4 py-24 text-center flex flex-col items-center gap-5">
      <span className="text-6xl" aria-hidden="true">🗂️</span>
      <h1 className="text-2xl font-bold text-[var(--text-1)]">التصنيف غير موجود</h1>
      <p className="text-[var(--text-2)] leading-relaxed">
        عذرًا، التصنيف الذي تبحث عنه غير متوفر.
      </p>
      <Link
        href="/blog"
        className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--gold-mid)] text-[var(--text-inv)] font-semibold text-sm hover:bg-[var(--gold-bright)] transition-colors"
      >
        تصفح المدونة
      </Link>
    </div>
  )
}
