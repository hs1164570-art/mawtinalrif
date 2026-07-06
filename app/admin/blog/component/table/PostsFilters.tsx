"use client";

import { useQueryState, parseAsInteger, parseAsString } from "nuqs";
import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";

interface CategoryOption { id: string; name: string }

const STATUS_OPTIONS = [
  { value: "", label: "كل الحالات" },
  { value: "DRAFT", label: "مسودة" },
  { value: "PUBLISHED", label: "منشور" },
  { value: "SCHEDULED", label: "مجدول" },
  { value: "ARCHIVED", label: "مؤرشف" },
];

export function PostsFilters() {
  const [search, setSearch] = useQueryState("search", parseAsString.withDefault(""));
  const [status, setStatus] = useQueryState("status", parseAsString.withDefault(""));
  const [categoryId, setCategoryId] = useQueryState("categoryId", parseAsString.withDefault(""));
  const [, setPage] = useQueryState("page", parseAsInteger.withDefault(1));

  const [localSearch, setLocalSearch] = useState(search);
  const [categories, setCategories] = useState<CategoryOption[]>([]);

  useEffect(() => {
    fetch("/api/admin/blog/categories")
      .then((r) => (r.ok ? r.json() : { categories: [] }))
      .then((d) => setCategories(d.categories ?? []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => { setSearch(localSearch || null); setPage(1); }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localSearch]);

  const hasFilters = search || status || categoryId;

  return (
    <div dir="rtl" className="flex flex-col sm:flex-row gap-2.5 sm:items-center">
      <div className="relative flex-1 min-w-0">
        <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-3)]" />
        <input
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="ابحث بعنوان المقال..."
          className="w-full pr-9 pl-3 py-2 bg-[var(--surface)] border border-[var(--border-md)] rounded-[8px] text-[0.82rem] text-[var(--text-1)] outline-none focus:border-[var(--gold)]"
        />
      </div>

      <div className="flex gap-2.5 overflow-x-auto sm:overflow-visible">
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value || null); setPage(1); }}
          className="shrink-0 px-2.5 py-2 bg-[var(--surface)] border border-[var(--border-md)] rounded-[8px] text-[0.78rem] text-[var(--text-1)] outline-none"
        >
          {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <select
          value={categoryId}
          onChange={(e) => { setCategoryId(e.target.value || null); setPage(1); }}
          className="shrink-0 px-2.5 py-2 bg-[var(--surface)] border border-[var(--border-md)] rounded-[8px] text-[0.78rem] text-[var(--text-1)] outline-none"
        >
          <option value="">كل التصنيفات</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        {hasFilters && (
          <button
            type="button"
            onClick={() => { setLocalSearch(""); setSearch(null); setStatus(null); setCategoryId(null); setPage(1); }}
            className="shrink-0 flex items-center gap-1 px-2.5 py-2 text-[0.78rem] text-[var(--text-3)] hover:text-[var(--red)]"
          >
            <X size={13} />
            مسح الفلاتر
          </button>
        )}
      </div>
    </div>
  );
}
