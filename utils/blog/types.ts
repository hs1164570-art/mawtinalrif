// ─── lib/blog/types.ts ───────────────────────────────────────────────────────
// Shared TypeScript interfaces for the public blog system.
// All Prisma return shapes are narrowed here so pages never accidentally
// expose unpublished fields (like raw `content` JSON) to the browser.

// ─── Author ──────────────────────────────────────────────────────────────────

export interface BlogAuthor {
  name: string | null
  image: string | null
}

// ─── Category / Tag ───────────────────────────────────────────────────────────

export interface BlogCategoryMeta {
  id: string
  name: string
  slug: string
  color: string
  description: string | null
}

export interface BlogTagMeta {
  id: string
  name: string
  slug: string
}

// ─── Post shapes ─────────────────────────────────────────────────────────────

/** Lightweight card — used in listing, category, tag, related posts. */
export interface PostCard {
  id: string
  title: string
  slug: string
  excerpt: string | null
  coverImage: string | null
  publishedAt: Date | null
  readingTime: number
  category: Pick<BlogCategoryMeta, 'name' | 'slug' | 'color'> | null
  tags: Array<Pick<BlogTagMeta, 'name' | 'slug'>>
  author: BlogAuthor
}

/** Full post — used on the single post page only. */
export interface PostFull extends PostCard {
  contentHtml: string | null
  metaTitle: string | null
  metaDescription: string | null
  keywords: string[]
  updatedAt: Date
  viewCount: number
  categoryId: string | null
}

/** Minimal slug list — used for generateStaticParams & sitemap. */
export interface PostSlug {
  slug: string
  updatedAt: Date
  publishedAt: Date | null
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginatedResult<T> {
  items: T[]
  total: number
  totalPages: number
  currentPage: number
  hasNext: boolean
  hasPrev: boolean
}

// ─── Table of Contents ────────────────────────────────────────────────────────

export interface TocItem {
  id: string
  text: string
  level: 2 | 3
}

// ─── Breadcrumbs ─────────────────────────────────────────────────────────────

export interface BreadcrumbItem {
  label: string
  /** Full path, e.g. "/blog/category/decor". Omit for the current (last) item. */
  href?: string
}
