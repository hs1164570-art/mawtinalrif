// ─── lib/blog/queries.ts ─────────────────────────────────────────────────────
// All public-facing Prisma queries for the blog.
//
// Security rules (enforced on EVERY query):
//   • status = PUBLISHED only — DRAFT/SCHEDULED/ARCHIVED are NEVER returned
//   • publishedAt ≤ now()     — future-dated posts are excluded
//   • contentHtml only        — raw `content` (Tiptap JSON) never selected
//
// Caching: unstable_cache wraps every query with granular ISR tags.
// Phase 6 admin Server Actions call revalidateTag(CACHE_TAGS.*) on mutation.

import { unstable_cache } from "next/cache";
import { BlogPostStatus } from "@prisma/client";
import prisma from "@/lib/db";
import { BLOG_CONFIG, CACHE_TAGS } from "./config";
import type {
  PostCard,
  PostFull,
  PostSlug,
  PaginatedResult,
  BlogCategoryMeta,
  BlogTagMeta,
} from "./types";

// ─── Shared Prisma select shapes ─────────────────────────────────────────────
// Keep in one place — changes here propagate to all queries automatically.

const POST_CARD_SELECT = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  coverImage: true,
  publishedAt: true,
  readingTime: true,
  category: { select: { name: true, slug: true, color: true } },
  tags: { select: { name: true, slug: true } },
  author: { select: { name: true, image: true } },
} as const;

const POST_FULL_SELECT = {
  ...POST_CARD_SELECT,
  contentHtml: true,
  metaTitle: true,
  metaDescription: true,
  keywords: true,
  updatedAt: true,
  viewCount: true,
  categoryId: true,
  status: true,
} as const;

// ─── Published filter ─────────────────────────────────────────────────────────
// Evaluated fresh on each cache miss — correct for ISR.

function publishedFilter() {
  return {
    status: BlogPostStatus.PUBLISHED,
    publishedAt: { lte: new Date() },
  } as const;
}

// ─── 1. Paginated post listing ────────────────────────────────────────────────

export async function getPublishedPosts(
  page: number = 1,
): Promise<PaginatedResult<PostCard>> {
  return unstable_cache(
    async () => {
      const take = BLOG_CONFIG.postsPerPage;
      const skip = (page - 1) * take;
      const where = publishedFilter();

      const [posts, total] = await prisma.$transaction([
        prisma.blogPost.findMany({
          where,
          select: POST_CARD_SELECT,
          orderBy: { publishedAt: "desc" },
          skip,
          take,
        }),
        prisma.blogPost.count({ where }),
      ]);

      const totalPages = Math.ceil(total / take);
      return {
        items: posts as unknown as PostCard[],
        total,
        totalPages,
        currentPage: page,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      };
    },
    // Cache key includes page so each page is a separate cache entry
    ["blog", "posts", `page-${page}`],
    {
      // Revalidate via tags (from admin actions) OR after 1 hour as safety net
      tags: [CACHE_TAGS.POSTS, CACHE_TAGS.postsPage(page)],
      revalidate: 3600,
    },
  )();
}

// ─── 2. Single post by slug ───────────────────────────────────────────────────

export async function getPostBySlug(slug: string): Promise<PostFull | null> {
  return unstable_cache(
    async () => {
      const post = await prisma.blogPost.findUnique({
        where: { slug },
        select: POST_FULL_SELECT,
      });

      // Hard security gate: NEVER serve non-published posts
      if (
        !post ||
        post.status !== BlogPostStatus.PUBLISHED ||
        !post.publishedAt ||
        post.publishedAt > new Date()
      ) {
        return null;
      }

      return post as unknown as PostFull;
    },
    ["blog", "post", slug],
    {
      tags: [CACHE_TAGS.POSTS, CACHE_TAGS.post(slug)],
      revalidate: 3600,
    },
  )();
}

// ─── 3. Related posts ────────────────────────────────────────────────────────

export async function getRelatedPosts(
  currentPostId: string,
  categoryId: string | null,
  limit: number = 3,
): Promise<PostCard[]> {
  return unstable_cache(
    async () => {
      const where = {
        ...publishedFilter(),
        id: { not: currentPostId },
        // Prefer same category; fall back to latest posts if no category
        ...(categoryId ? { categoryId } : {}),
      };

      const posts = await prisma.blogPost.findMany({
        where,
        select: POST_CARD_SELECT,
        orderBy: { publishedAt: "desc" },
        take: limit,
      });

      // If same-category gave fewer than limit, pad with latest posts
      if (posts.length < limit && categoryId) {
        const existing = posts.map((p) => p.id);
        const extras = await prisma.blogPost.findMany({
          where: {
            ...publishedFilter(),
            id: { notIn: [currentPostId, ...existing] },
            categoryId: { not: categoryId },
          },
          select: POST_CARD_SELECT,
          orderBy: { publishedAt: "desc" },
          take: limit - posts.length,
        });
        return [...posts, ...extras] as unknown as PostCard[];
      }

      return posts as unknown as PostCard[];
    },
    ["blog", "related", currentPostId],
    {
      tags: [CACHE_TAGS.POSTS, CACHE_TAGS.post(`related-${currentPostId}`)],
      revalidate: 3600,
    },
  )();
}

// ─── 4. Posts by category ─────────────────────────────────────────────────────

export async function getPostsByCategory(
  categorySlug: string,
  page: number = 1,
): Promise<PaginatedResult<PostCard>> {
  return unstable_cache(
    async () => {
      const take = BLOG_CONFIG.postsPerPage;
      const skip = (page - 1) * take;
      const where = {
        ...publishedFilter(),
        category: { slug: categorySlug },
      };

      const [posts, total] = await prisma.$transaction([
        prisma.blogPost.findMany({
          where,
          select: POST_CARD_SELECT,
          orderBy: { publishedAt: "desc" },
          skip,
          take,
        }),
        prisma.blogPost.count({ where }),
      ]);

      const totalPages = Math.ceil(total / take);
      return {
        items: posts as unknown as PostCard[],
        total,
        totalPages,
        currentPage: page,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      };
    },
    ["blog", "category", categorySlug, `page-${page}`],
    {
      tags: [
        CACHE_TAGS.POSTS,
        CACHE_TAGS.category(categorySlug),
        CACHE_TAGS.categoryPage(categorySlug, page),
      ],
      revalidate: 3600,
    },
  )();
}

// ─── 5. Posts by tag ──────────────────────────────────────────────────────────

export async function getPostsByTag(
  tagSlug: string,
  page: number = 1,
): Promise<PaginatedResult<PostCard>> {
  return unstable_cache(
    async () => {
      const take = BLOG_CONFIG.postsPerPage;
      const skip = (page - 1) * take;
      const where = {
        ...publishedFilter(),
        tags: { some: { slug: tagSlug } },
      };

      const [posts, total] = await prisma.$transaction([
        prisma.blogPost.findMany({
          where,
          select: POST_CARD_SELECT,
          orderBy: { publishedAt: "desc" },
          skip,
          take,
        }),
        prisma.blogPost.count({ where }),
      ]);

      const totalPages = Math.ceil(total / take);
      return {
        items: posts as unknown as PostCard[],
        total,
        totalPages,
        currentPage: page,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      };
    },
    ["blog", "tag", tagSlug, `page-${page}`],
    {
      tags: [
        CACHE_TAGS.POSTS,
        CACHE_TAGS.tag(tagSlug),
        CACHE_TAGS.tagPage(tagSlug, page),
      ],
      revalidate: 3600,
    },
  )();
}

// ─── 6. Category metadata (for generateMetadata + breadcrumbs) ───────────────

export async function getCategoryBySlug(
  slug: string,
): Promise<BlogCategoryMeta | null> {
  return unstable_cache(
    async () => {
      return prisma.blogCategory.findUnique({
        where: { slug },
        select: {
          id: true,
          name: true,
          slug: true,
          color: true,
          description: true,
        },
      });
    },
    ["blog", "category-meta", slug],
    {
      tags: [CACHE_TAGS.CATEGORIES, CACHE_TAGS.category(slug)],
      revalidate: 86400, // categories change rarely
    },
  )();
}

// ─── 7. Tag metadata ──────────────────────────────────────────────────────────

export async function getTagBySlug(slug: string): Promise<BlogTagMeta | null> {
  return unstable_cache(
    async () => {
      return prisma.blogTag.findUnique({
        where: { slug },
        select: { id: true, name: true, slug: true },
      });
    },
    ["blog", "tag-meta", slug],
    {
      tags: [CACHE_TAGS.TAGS, CACHE_TAGS.tag(slug)],
      revalidate: 86400,
    },
  )();
}

// ─── 8. All categories (for listing page pills) ───────────────────────────────

export async function getAllCategories(): Promise<BlogCategoryMeta[]> {
  return unstable_cache(
    async () => {
      return prisma.blogCategory.findMany({
        where: {
          posts: {
            some: publishedFilter(),
          },
        },
        select: {
          id: true,
          name: true,
          slug: true,
          color: true,
          description: true,
        },
        orderBy: { name: "asc" },
      });
    },
    ["blog", "all-categories"],
    {
      tags: [CACHE_TAGS.CATEGORIES, CACHE_TAGS.POSTS],
      revalidate: 3600,
    },
  )();
}

// ─── 9. All published slugs (for generateStaticParams + sitemap) ──────────────

export async function getAllPublishedSlugs(): Promise<PostSlug[]> {
  return unstable_cache(
    async () => {
      return prisma.blogPost.findMany({
        where: publishedFilter(),
        select: { slug: true, updatedAt: true, publishedAt: true },
        orderBy: { publishedAt: "desc" },
      });
    },
    ["blog", "all-slugs"],
    {
      tags: [CACHE_TAGS.POSTS],
      revalidate: 3600,
    },
  )();
}

// ─── 10. All category slugs (for generateStaticParams + sitemap) ──────────────

export async function getAllCategorySlugs() {
  return unstable_cache(
    async () => {
      return prisma.blogCategory.findMany({
        where: { posts: { some: publishedFilter() } },
        select: { slug: true, updatedAt: true },
      });
    },
    ["blog", "all-category-slugs"],
    {
      tags: [CACHE_TAGS.CATEGORIES, CACHE_TAGS.POSTS],
      revalidate: 3600,
    },
  )();
}

// ─── 11. All tag slugs (for generateStaticParams + sitemap) ───────────────────

export async function getAllTagSlugs() {
  return unstable_cache(
    async () => {
      return prisma.blogTag.findMany({
        where: { posts: { some: publishedFilter() } },
        select: { slug: true, createdAt: true },
      });
    },
    ["blog", "all-tag-slugs"],
    {
      tags: [CACHE_TAGS.TAGS, CACHE_TAGS.POSTS],
      revalidate: 3600,
    },
  )();
}

// ─── 12. Increment view count (called from API route, NOT cached) ─────────────

export async function incrementViewCount(slug: string): Promise<void> {
  // Update only if post is published (double-check security)
  await prisma.blogPost.updateMany({
    where: {
      slug,
      ...publishedFilter(),
    },
    data: { viewCount: { increment: 1 } },
  });
}
