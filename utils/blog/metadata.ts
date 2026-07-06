// ─── lib/blog/metadata.ts ────────────────────────────────────────────────────
// Centralized generateMetadata helpers for all blog routes.
// Import the right builder in each page file.
//
// SEO decisions made here:
//   • metaTitle / metaDescription from DB → fallback to title / excerpt / defaults
//   • Canonical URL always set (prevents duplicate content from paginated pages)
//   • Open Graph type: "article" for posts, "website" for listing/category/tag
//   • Twitter card: summary_large_image everywhere
//   • Robots: "noindex" for page > 1 of paginated listings → debatable,
//     but preferred since paginated pages have thin unique content.
//     Set NOINDEX_PAGINATED = false to index them and rely on sitemap instead.

import type { Metadata } from 'next'
import { SITE_CONFIG, BLOG_CONFIG } from './config'
import { formatDateIso, optimizeCloudinaryUrl } from './utils'
import type { PostFull, BlogCategoryMeta, BlogTagMeta } from './types'

// Change to `false` if you want paginated listing pages indexed by Google
const NOINDEX_PAGINATED = false

// ─── Base OG image ────────────────────────────────────────────────────────────

function buildOgImages(coverImage?: string | null) {
  const url = coverImage
    ? optimizeCloudinaryUrl(coverImage, 1200)
    : SITE_CONFIG.defaultOgImage

  return [
    {
      url,
      width:  1200,
      height: 630,
      alt:    SITE_CONFIG.name,
    },
  ]
}

// ─── Blog listing page ────────────────────────────────────────────────────────

export function buildListingMetadata(page: number = 1): Metadata {
  const isFirstPage = page === 1
  const title       = isFirstPage
    ? BLOG_CONFIG.title
    : `${BLOG_CONFIG.title} — الصفحة ${page}`

  const canonical = isFirstPage
    ? `${SITE_CONFIG.url}${BLOG_CONFIG.basePath}`
    : `${SITE_CONFIG.url}${BLOG_CONFIG.basePath}/page/${page}`

  return {
    title,
    description:   BLOG_CONFIG.description,
    alternates:    { canonical },
    robots: !isFirstPage && NOINDEX_PAGINATED
      ? { index: false, follow: true }
      : undefined,
    openGraph: {
      title,
      description: BLOG_CONFIG.description,
      url:         canonical,
      siteName:    SITE_CONFIG.name,
      locale:      SITE_CONFIG.locale,
      type:        'website',
      images:      buildOgImages(),
    },
    twitter: {
      card:        'summary_large_image',
      title,
      description: BLOG_CONFIG.description,
      site:        SITE_CONFIG.twitterHandle,
      images:      [SITE_CONFIG.defaultOgImage],
    },
  }
}

// ─── Single post page ─────────────────────────────────────────────────────────

export function buildPostMetadata(post: PostFull): Metadata {
  const title       = post.metaTitle       ?? post.title
  const description = post.metaDescription ?? post.excerpt ?? BLOG_CONFIG.description
  const canonical   = `${SITE_CONFIG.url}${BLOG_CONFIG.basePath}/${post.slug}`

  return {
    title,
    description,
    keywords:   post.keywords,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url:         canonical,
      siteName:    SITE_CONFIG.name,
      locale:      SITE_CONFIG.locale,
      type:        'article',
      images:      buildOgImages(post.coverImage),
      publishedTime: post.publishedAt ? formatDateIso(post.publishedAt) : undefined,
      modifiedTime:  formatDateIso(post.updatedAt),
      authors:       post.author.name ? [post.author.name] : undefined,
      tags:          post.tags.map(t => t.name),
    },
    twitter: {
      card:        'summary_large_image',
      title,
      description,
      site:        SITE_CONFIG.twitterHandle,
      images:      [post.coverImage
        ? optimizeCloudinaryUrl(post.coverImage, 1200)
        : SITE_CONFIG.defaultOgImage],
    },
  }
}

// ─── Category page ────────────────────────────────────────────────────────────

export function buildCategoryMetadata(
  category: BlogCategoryMeta,
  page: number = 1
): Metadata {
  const isFirstPage = page === 1
  const title       = isFirstPage
    ? `${category.name}${BLOG_CONFIG.titleSuffix}`
    : `${category.name} — الصفحة ${page}${BLOG_CONFIG.titleSuffix}`

  const description = category.description
    ?? `مقالات في تصنيف ${category.name} من مدونة موطن الريف`

  const canonical = isFirstPage
    ? `${SITE_CONFIG.url}${BLOG_CONFIG.basePath}/category/${category.slug}`
    : `${SITE_CONFIG.url}${BLOG_CONFIG.basePath}/category/${category.slug}/page/${page}`

  return {
    title,
    description,
    alternates: { canonical },
    robots: !isFirstPage && NOINDEX_PAGINATED
      ? { index: false, follow: true }
      : undefined,
    openGraph: {
      title,
      description,
      url:      canonical,
      siteName: SITE_CONFIG.name,
      locale:   SITE_CONFIG.locale,
      type:     'website',
      images:   buildOgImages(),
    },
    twitter: {
      card:        'summary_large_image',
      title,
      description,
      site:        SITE_CONFIG.twitterHandle,
      images:      [SITE_CONFIG.defaultOgImage],
    },
  }
}

// ─── Tag page ─────────────────────────────────────────────────────────────────

export function buildTagMetadata(tag: BlogTagMeta, page: number = 1): Metadata {
  const isFirstPage = page === 1
  const title       = isFirstPage
    ? `${tag.name}${BLOG_CONFIG.titleSuffix}`
    : `${tag.name} — الصفحة ${page}${BLOG_CONFIG.titleSuffix}`

  const description = `مقالات موسومة بـ "${tag.name}" من مدونة موطن الريف`

  const canonical = isFirstPage
    ? `${SITE_CONFIG.url}${BLOG_CONFIG.basePath}/tag/${tag.slug}`
    : `${SITE_CONFIG.url}${BLOG_CONFIG.basePath}/tag/${tag.slug}/page/${page}`

  return {
    title,
    description,
    alternates: { canonical },
    robots: !isFirstPage && NOINDEX_PAGINATED
      ? { index: false, follow: true }
      : undefined,
    openGraph: {
      title,
      description,
      url:      canonical,
      siteName: SITE_CONFIG.name,
      locale:   SITE_CONFIG.locale,
      type:     'website',
      images:   buildOgImages(),
    },
    twitter: {
      card:        'summary_large_image',
      title,
      description,
      site:        SITE_CONFIG.twitterHandle,
      images:      [SITE_CONFIG.defaultOgImage],
    },
  }
}
