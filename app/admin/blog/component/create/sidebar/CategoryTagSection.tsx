"use client";

import { useEffect, useState } from "react";
import { Tag as TagIcon, Plus, X } from "lucide-react";

interface CategoryOption { id: string; name: string }
interface TagOption { id: string; name: string }

interface CategoryTagSectionProps {
  categoryId: string | null;
  tagIds: string[];
  onCategoryChange: (id: string | null) => void;
  onTagsChange: (ids: string[]) => void;
}

export function CategoryTagSection({
  categoryId, tagIds, onCategoryChange, onTagsChange,
}: CategoryTagSectionProps) {
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [tags, setTags] = useState<TagOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/blog/categories").then((r) => (r.ok ? r.json() : { categories: [] })),
      fetch("/api/admin/blog/tags").then((r) => (r.ok ? r.json() : { tags: [] })),
    ])
      .then(([catData, tagData]) => {
        setCategories(catData.categories ?? []);
        setTags(tagData.tags ?? []);
      })
      .catch(() => { setCategories([]); setTags([]); })
      .finally(() => setLoading(false));
  }, []);

  const toggleTag = (id: string) =>
    onTagsChange(tagIds.includes(id) ? tagIds.filter((t) => t !== id) : [...tagIds, id]);

  return (
    <div dir="rtl" className="space-y-3">
      <div>
        <label className="text-[0.74rem] text-[var(--text-3)] mb-1 block">التصنيف</label>
        <select
          value={categoryId ?? ""}
          onChange={(e) => onCategoryChange(e.target.value || null)}
          disabled={loading}
          className="w-full px-2.5 py-1.5 bg-[var(--surface-3)] border border-[var(--border-md)] rounded-[6px] text-[0.78rem] text-[var(--text-1)] outline-none focus:border-[var(--gold)] disabled:opacity-60"
        >
          <option value="">بدون تصنيف</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {!loading && categories.length === 0 && (
          <p className="text-[0.7rem] text-[var(--text-3)] mt-1">لا توجد تصنيفات بعد — أضفها من صفحة «تصنيفات المدونة».</p>
        )}
      </div>

      <div>
        <label className="flex items-center gap-1.5 text-[0.74rem] text-[var(--text-3)] mb-1">
          <TagIcon size={12} />
          الوسوم
        </label>
        <div className="flex flex-wrap gap-1.5">
          {tags.map((t) => {
            const active = tagIds.includes(t.id);
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => toggleTag(t.id)}
                className={`flex items-center gap-1 px-2 py-1 rounded-[6px] text-[0.72rem] border ${
                  active
                    ? "bg-[var(--gold)] text-[var(--text-inv)] border-[var(--gold)]"
                    : "bg-[var(--surface-3)] text-[var(--text-2)] border-[var(--border-md)] hover:border-[var(--gold)]"
                }`}
              >
                {active ? <X size={10} /> : <Plus size={10} />}
                {t.name}
              </button>
            );
          })}
          {!loading && tags.length === 0 && (
            <p className="text-[0.7rem] text-[var(--text-3)]">لا توجد وسوم بعد.</p>
          )}
        </div>
      </div>
    </div>
  );
}
