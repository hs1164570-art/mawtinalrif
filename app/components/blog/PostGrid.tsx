// ─── components/blog/PostGrid.tsx ────────────────────────────────────────────
// Server Component — minimal cards grid + pagination, shared between
// category and tag listing pages (no hero, no category pills — those pages
// already declare their own context via the page header).

import { PostCard } from "./PostCard";
import { Pagination } from "./Pagination";
import type {
  PaginatedResult,
  PostCard as PostCardType,
} from "@/utils/blog/types";

interface PostGridProps {
  result: PaginatedResult<PostCardType>;
  basePath: string;
}

export function PostGrid({ result, basePath }: PostGridProps) {
  const { items, currentPage, totalPages } = result;

  if (items.length === 0) {
    return (
      <div className="text-center py-16 flex flex-col items-center gap-4">
        <span className="text-5xl" aria-hidden="true">
          📭
        </span>
        <p className="text-[var(--text-2)] text-sm">
          لا توجد مقالات في هذا القسم حالياً
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
        {items.map((post, index) => (
          <PostCard
            key={post.id}
            post={post}
            priority={currentPage === 1 && index < 3}
          />
        ))}
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath={basePath}
      />
    </>
  );
}
