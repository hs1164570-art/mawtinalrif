// ─── lib/blog/revalidate.ts ───────────────────────────────────────────────────
// Call these from admin Server Actions (publish/update/delete/status-change)
// and admin API Route Handlers on mutation — see wiring guide below.
//
// Rules:
//   • revalidateTag/revalidatePath work inside Server Actions + Route Handlers
//   • Safe to over-call — both are cheap and idempotent
//   • Every mutation must call at minimum revalidateBlogPost({ slug })
//
// ─── WIRING GUIDE ─────────────────────────────────────────────────────────────
//
//  post.actions.ts → savePost()
//    After successful prisma update/create:
//      revalidateBlogPost({
//        slug: finalSlug,
//        previousSlug: previousSlug !== finalSlug ? previousSlug : undefined,
//        categorySlug: data.categorySlug ?? null,
//        tagSlugs:     data.tagSlugs ?? [],
//      })
//
//  post.actions.ts → autosaveDraft()
//    Only revalidate if status is being changed to PUBLISHED.
//    Autosaves of DRAFT can skip revalidation (cache is only for published).
//
//  app/api/admin/blog/posts/[id]/route.ts → PATCH
//    After prisma update:
//      revalidateBlogPost({ slug, previousSlug?, categorySlug?, tagSlugs? })
//
//  app/api/admin/blog/posts/[id]/route.ts → DELETE
//    After prisma delete:
//      revalidateDeletedPost({ slug, categorySlug?, tagSlugs? })
//
//  app/api/admin/blog/posts/bulk/route.ts → PATCH (bulk status change)
//    After prisma updateMany:
//      slugs.forEach(slug => revalidateBlogPost({ slug }))
//
//  app/api/admin/blog/posts/bulk/route.ts → DELETE (bulk delete)
//    After prisma deleteMany:
//      slugs.forEach(slug => revalidateDeletedPost({ slug }))
//
//  category.actions.ts → upsertCategory()
//    After prisma update/create:
//      revalidateCategoryMeta(slug)
//      if previousSlug changed: revalidateCategoryMeta(previousSlug)
//
//  category.actions.ts → deleteCategory()
//    After prisma delete:
//      revalidateCategoryMeta(slug)
//
//  category.actions.ts → upsertTag()
//    After prisma update/create:
//      revalidateTagMeta(slug)
//      if previousSlug changed: revalidateTagMeta(previousSlug)
//
//  category.actions.ts → deleteTag()
//    After prisma delete:
//      revalidateTagMeta(slug)
// ─────────────────────────────────────────────────────────────────────────────

import { revalidateTag, revalidatePath } from "next/cache";
import { CACHE_TAGS, BLOG_PATHS } from "./config";

interface RevalidatePostArgs {
  slug: string;
  /** Pass the OLD slug too if the slug changed during this update */
  previousSlug?: string;
  categorySlug?: string | null;
  tagSlugs?: string[];
}

/**
 * Call after: CREATE, UPDATE, PUBLISH, STATUS_CHANGE, DELETE, ARCHIVE.
 * Safe to over-call — revalidateTag/Path are cheap and idempotent.
 */
export function revalidateBlogPost({
  slug,
  previousSlug,
  categorySlug,
  tagSlugs = [],
}: RevalidatePostArgs): void {
  // ── Tags (covers unstable_cache'd query functions) ──
  revalidateTag(CACHE_TAGS.POSTS); // all listing pages
  revalidateTag(CACHE_TAGS.post(slug)); // this specific post + related-posts cache
  if (previousSlug && previousSlug !== slug) {
    revalidateTag(CACHE_TAGS.post(previousSlug)); // old slug's cache (now returns 404 correctly)
  }
  if (categorySlug) {
    revalidateTag(CACHE_TAGS.category(categorySlug));
  }
  for (const tagSlug of tagSlugs) {
    revalidateTag(CACHE_TAGS.tag(tagSlug));
  }

  // ── Paths (covers the actual rendered page route segments / ISR cache) ──
  revalidatePath(BLOG_PATHS.listing);
  revalidatePath(BLOG_PATHS.post(slug), "page");
  if (previousSlug && previousSlug !== slug) {
    revalidatePath(BLOG_PATHS.post(previousSlug), "page");
  }
  if (categorySlug) {
    revalidatePath(BLOG_PATHS.category(categorySlug), "page");
  }
  for (const tagSlug of tagSlugs) {
    revalidatePath(BLOG_PATHS.tag(tagSlug), "page");
  }

  // ── Sitemap (new/changed/removed post must reflect immediately) ──
  revalidatePath(BLOG_PATHS.sitemap);
}

/**
 * Call after: bulk operations, or when you've changed a CATEGORY's
 * name/slug/description (the category listing page + all posts in it need refresh).
 */
export function revalidateCategoryMeta(slug: string): void {
  revalidateTag(CACHE_TAGS.CATEGORIES);
  revalidateTag(CACHE_TAGS.category(slug));
  revalidatePath(BLOG_PATHS.category(slug), "page");
  revalidatePath(BLOG_PATHS.listing); // category pills on /blog
}

/**
 * Call after: TAG name/slug update.
 */
export function revalidateTagMeta(slug: string): void {
  revalidateTag(CACHE_TAGS.TAGS);
  revalidateTag(CACHE_TAGS.tag(slug));
  revalidatePath(BLOG_PATHS.tag(slug), "page");
}

/**
 * Call after DELETE — same as revalidateBlogPost but named for clarity
 * at call-sites. The post no longer exists, so the post-page route will
 * correctly start returning notFound() once cache is invalidated.
 */
export const revalidateDeletedPost = revalidateBlogPost;
