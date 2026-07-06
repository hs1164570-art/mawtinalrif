// ─── components/blog/RelatedPosts.tsx ────────────────────────────────────────
// Server Component — fetches related posts directly (no client-side fetch).

import { getRelatedPosts } from "@/utils/blog/queries";
import { PostCard } from "./PostCard";

interface RelatedPostsProps {
  postId: string;
  categoryId: string | null;
}

export async function RelatedPosts({ postId, categoryId }: RelatedPostsProps) {
  const posts = await getRelatedPosts(postId, categoryId, 3);

  if (posts.length === 0) return null;

  return (
    <section
      dir="rtl"
      aria-labelledby="related-posts-heading"
      className="mt-12 pt-10 border-t border-[var(--border)]"
    >
      <h2
        id="related-posts-heading"
        className="text-xl font-bold text-[var(--text-1)] mb-5"
      >
        مقالات ذات صلة
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}
