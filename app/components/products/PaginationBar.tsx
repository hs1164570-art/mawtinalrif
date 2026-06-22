"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function getPages(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "…")[] = [1];

  if (current > 3) pages.push("…");
  if (current > 2) pages.push(current - 1);
  if (current !== 1 && current !== total) pages.push(current);
  if (current < total - 1) pages.push(current + 1);
  if (current < total - 2) pages.push("…");

  pages.push(total);

  return [...new Set(pages)];
}

export default function PaginationBar({
  currentPage,
  totalPages,
  onPageChange,
}: Props) {
  if (totalPages <= 1) return null;

  const pages = getPages(currentPage, totalPages);

  return (
    <nav
      className="flex items-center justify-center gap-1.5 mt-10"
      aria-label="التنقل بين الصفحات"
      role="navigation"
    >
      {/* ✅ Prev */}
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="w-10 h-10 flex items-center justify-center rounded-xl border border-[var(--border-md)] bg-[var(--surface)] text-[var(--text-2)] hover:bg-[var(--bg-deep)] hover:text-[var(--gold)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-1"
        aria-label="الصفحة السابقة"
      >
        <ChevronRight className="w-4 h-4" aria-hidden="true" />
      </button>

      {/* Pages */}
      {pages.map((p, i) =>
        p === "…" ?
          <span
            key={`ellipsis-${i}`}
            className="w-10 h-10 flex items-center justify-center text-[var(--text-3)] text-sm select-none"
            aria-hidden="true"
          >
            …
          </span>
        : <button
            key={p}
            type="button"
            onClick={() => onPageChange(p as number)}
            aria-label={`الصفحة ${p}`}
            aria-current={p === currentPage ? "page" : undefined}
            className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-medium transition-all focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-1 ${
              p === currentPage ?
                "bg-[var(--gold)] text-[var(--text-inv)] shadow-md scale-110"
              : "border border-[var(--border-md)] bg-[var(--surface)] text-[var(--text-2)] hover:bg-[var(--bg-deep)] hover:text-[var(--gold)]"
            }`}
          >
            {(p as number).toLocaleString("en-US")}
          </button>,
      )}

      {/* ✅ Next */}
      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="w-10 h-10 flex items-center justify-center rounded-xl border border-[var(--border-md)] bg-[var(--surface)] text-[var(--text-2)] hover:bg-[var(--bg-deep)] hover:text-[var(--gold)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-1"
        aria-label="الصفحة التالية"
      >
        <ChevronLeft className="w-4 h-4" aria-hidden="true" />
      </button>

      {/* Screen reader page count */}
      <span className="sr-only">
        صفحة {currentPage} من {totalPages}
      </span>
    </nav>
  );
}
