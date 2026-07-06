// ─── components/blog/BlogListingGrid.tsx ─────────────────────────────────────
// Server Component — pure UI assembly shared between app/blog/page.tsx and
// app/blog/page/[pageNumber]/page.tsx (so we don't duplicate the grid/empty
// state/pagination markup in two files). No SEO logic here — that stays
// inline in each page.tsx (generateMetadata, JSON-LD).

import { CategoryPills } from "./CategoryPills";
import { PostCard } from "./PostCard";
import { Pagination } from "./Pagination";
import type {
  PaginatedResult,
  PostCard as PostCardType,
  BlogCategoryMeta,
} from "@/utils/blog/types";

interface BlogListingGridProps {
  result: PaginatedResult<PostCardType>;
  categories: BlogCategoryMeta[];
  basePath: string; // "/blog"
}

export function BlogListingGrid({
  result,
  categories,
  basePath,
}: BlogListingGridProps) {
  const { items, currentPage, totalPages } = result;
  const isFirstPage = currentPage === 1;

  return (
    <div
      dir="rtl"
      className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10"
    >
      {/* Hero / intro — only on page 1 */}
      {isFirstPage && (
        <header className="text-center max-w-2xl mx-auto mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-1)] mb-3">
            مدونة موطن الريف
          </h1>
          <p className="text-[var(--text-2)] leading-relaxed text-base sm:text-lg">
            مقالات في عالم الأثاث الفاخر والديكور الداخلي وإلهامات تصميمية أصيلة
          </p>
        </header>
      )}

      {!isFirstPage && (
        <h1 className="text-2xl font-bold text-[var(--text-1)] mb-6">
          مدونة موطن الريف — الصفحة {currentPage}
        </h1>
      )}

      {/* Category filter pills */}
      {categories.length > 0 && (
        <div className="mb-8">
          <CategoryPills categories={categories} />
        </div>
      )}

      {/* Posts grid */}
      {items.length > 0 ?
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {items.map((post, index) => (
            <PostCard
              key={post.id}
              post={post}
              priority={isFirstPage && index < 3}
            />
          ))}
        </div>
      : <EmptyState />}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath={basePath}
      />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-20 flex flex-col items-center gap-4">
      <span className="text-5xl" aria-hidden="true">
        📝
      </span>
      <h2 className="text-lg font-semibold text-[var(--text-1)]">
        لا توجد مقالات حالياً
      </h2>
      <p className="text-[var(--text-2)] text-sm">
        ترقّبوا مقالات جديدة قريباً
      </p>
    </div>
  );
}
