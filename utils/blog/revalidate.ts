// ─── lib/blog/revalidate.ts ───────────────────────────────────────────────────
// Call these from your EXISTING admin Server Actions (publish/update/delete/
// status-change) — see the wiring guide below each function for exact
// call-sites. Import only `revalidateTag`/`revalidatePath` from 'next/cache'
// inside Server Actions (not Route Handlers) for them to take effect.

import { revalidateTag, revalidatePath } from "next/cache";
import { CACHE_TAGS, BLOG_PATHS, BLOG_CONFIG } from "./config";

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
 *
 *
 *
 *   }
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
 
 *   }
 */
export function revalidateCategoryMeta(slug: string): void {
  revalidateTag(CACHE_TAGS.CATEGORIES);
  revalidateTag(CACHE_TAGS.category(slug));
  revalidatePath(BLOG_PATHS.category(slug), "page");
  revalidatePath(BLOG_PATHS.listing); // category pills on /blog
}

/**
 * Call after: TAG name/slug update.
 *
 *
 *   }
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
