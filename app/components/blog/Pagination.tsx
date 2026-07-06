// ─── components/blog/Pagination.tsx ──────────────────────────────────────────
// Server Component — pure <Link> based pagination, fully crawlable.
//
// SEO note on rel="next"/"prev":
// Google officially stopped using rel="next"/"prev" for indexing signals
// back in 2019 (confirmed by Google's John Mueller). They now treat each
// paginated page as a standalone page, discovered via crawling/sitemap and
// internal links. We still emit rel="next"/"prev" on the <link> tags in
// <head> (via generateMetadata->other, see page.tsx) because Bing AND some
// crawlers/accessibility tools still read them — it's free and harmless.
// The actual ranking signal today is: unique canonical per page + strong
// internal linking + sitemap inclusion (handled in Phase 5).

import Link from 'next/link'

interface PaginationProps {
  currentPage: number
  totalPages:  number
  /** Base path WITHOUT page segment, e.g. "/blog" or "/blog/category/decor" */
  basePath:    string
}

export function Pagination({ currentPage, totalPages, basePath }: PaginationProps) {
  if (totalPages <= 1) return null

  const buildHref = (page: number) =>
    page === 1 ? basePath : `${basePath}/page/${page}`

  // Build a compact page list: 1 … (current-1) current (current+1) … last
  const pages = buildPageList(currentPage, totalPages)

  return (
    <nav
      aria-label="ترقيم الصفحات"
      dir="rtl"
      className="flex items-center justify-center gap-1.5 mt-10"
    >
      {/* Previous */}
      <PageLink
        href={currentPage > 1 ? buildHref(currentPage - 1) : undefined}
        disabled={currentPage === 1}
        ariaLabel="الصفحة السابقة"
      >
        <ChevronIcon direction="prev" />
      </PageLink>

      {pages.map((page, i) =>
        page === 'ellipsis' ? (
          <span key={`e-${i}`} className="px-2 text-[var(--text-3)] select-none">
            …
          </span>
        ) : (
          <PageLink
            key={page}
            href={buildHref(page)}
            active={page === currentPage}
            ariaLabel={`الصفحة ${page}`}
          >
            {page}
          </PageLink>
        )
      )}

      {/* Next */}
      <PageLink
        href={currentPage < totalPages ? buildHref(currentPage + 1) : undefined}
        disabled={currentPage === totalPages}
        ariaLabel="الصفحة التالية"
      >
        <ChevronIcon direction="next" />
      </PageLink>
    </nav>
  )
}

// ─── Page list builder ────────────────────────────────────────────────────────

function buildPageList(current: number, total: number): Array<number | 'ellipsis'> {
  const delta = 1
  const range: Array<number | 'ellipsis'> = []
  const left  = Math.max(2, current - delta)
  const right = Math.min(total - 1, current + delta)

  range.push(1)
  if (left > 2) range.push('ellipsis')
  for (let i = left; i <= right; i++) range.push(i)
  if (right < total - 1) range.push('ellipsis')
  if (total > 1) range.push(total)

  return range
}

// ─── PageLink ─────────────────────────────────────────────────────────────────

interface PageLinkProps {
  href?:     string
  active?:   boolean
  disabled?: boolean
  ariaLabel: string
  children:  React.ReactNode
}

function PageLink({ href, active, disabled, ariaLabel, children }: PageLinkProps) {
  const base = `
    min-w-[38px] h-[38px] flex items-center justify-center rounded-lg text-sm font-medium
    transition-colors duration-150
  `

  if (disabled || !href) {
    return (
      <span
        aria-disabled="true"
        aria-label={ariaLabel}
        className={`${base} text-[var(--text-3)] opacity-40 cursor-not-allowed`}
      >
        {children}
      </span>
    )
  }

  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      aria-current={active ? 'page' : undefined}
      className={`
        ${base}
        ${active
          ? 'bg-[var(--gold-mid)] text-[var(--text-inv)]'
          : 'text-[var(--text-2)] border border-[var(--border-md)] hover:border-[var(--border-strong)] bg-[var(--surface)]'
        }
      `}
    >
      {children}
    </Link>
  )
}

function ChevronIcon({ direction }: { direction: 'next' | 'prev' }) {
  const rotate = direction === 'next' ? 'rotate-180' : ''
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" className={rotate}>
      <path d="M10 3L5 8l5 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
