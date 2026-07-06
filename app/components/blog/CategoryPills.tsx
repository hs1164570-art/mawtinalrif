"use client";
// ─── components/blog/CategoryPills.tsx ───────────────────────────────────────
// Client Component — needs usePathname to highlight active category.
// Pure navigation links (no client-side filtering) → keeps SSR/SEO benefits,
// every category has its own crawlable, indexable URL.

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { BlogCategoryMeta } from "@/utils/blog/types";

interface CategoryPillsProps {
  categories: BlogCategoryMeta[];
}

export function CategoryPills({ categories }: CategoryPillsProps) {
  const pathname = usePathname();

  const isAllActive = pathname === "/blog";

  return (
    <nav
      aria-label="تصفية حسب التصنيف"
      dir="rtl"
      className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0"
    >
      <ul className="flex items-center gap-2 w-max sm:w-full sm:flex-wrap pb-1">
        <li>
          <Link
            href="/blog"
            aria-current={isAllActive ? "page" : undefined}
            className={`
              inline-flex items-center px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap
              transition-colors duration-150 border
              ${
                isAllActive ?
                  "bg-[var(--gold-mid)] text-[var(--text-inv)] border-[var(--gold-mid)]"
                : "bg-[var(--surface)] text-[var(--text-2)] border-[var(--border-md)] hover:border-[var(--border-strong)]"
              }
            `}
          >
            الكل
          </Link>
        </li>
        {categories.map((category) => {
          const isActive = pathname === `/blog/category/${category.slug}`;
          return (
            <li key={category.slug}>
              <Link
                href={`/blog/category/${category.slug}`}
                aria-current={isActive ? "page" : undefined}
                className={`
                  inline-flex items-center px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap
                  transition-colors duration-150 border
                  ${
                    isActive ?
                      "bg-[var(--gold-mid)] text-[var(--text-inv)] border-[var(--gold-mid)]"
                    : "bg-[var(--surface)] text-[var(--text-2)] border-[var(--border-md)] hover:border-[var(--border-strong)]"
                  }
                `}
              >
                {category.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
