"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, FolderTree } from "lucide-react";
import { toast } from "sonner";
import { CategoryFormDialog } from "../component/create/CategoryFormDialog";
import { deleteCategory } from "../lib/actions/category.actions";

interface Category {
  id: string; name: string; slug: string; description: string | null; color: string; postCount: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  const load = () => {
    setLoading(true);
    fetch("/api/admin/blog/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (cat: Category) => {
    if (!confirm(`متأكد من حذف "${cat.name}"؟`)) return;
    const result = await deleteCategory(cat.id);
    if (result.success) { toast.success("تم الحذف"); load(); }
    else toast.error(result.error);
  };

  return (
    <div dir="rtl" className="p-4 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-[1.3rem] sm:text-[1.5rem] font-bold text-[var(--text-1)] m-0">تصنيفات المدونة</h1>
          <p className="text-[0.8rem] text-[var(--text-3)] m-0">تنظيم المقالات في فئات رئيسية</p>
        </div>
        <button
          onClick={() => { setEditing(null); setDialogOpen(true); }}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[var(--gold)] text-[var(--text-inv)] rounded-[8px] text-[0.85rem] font-semibold"
        >
          <Plus size={16} />
          تصنيف جديد
        </button>
      </div>

      {loading ? (
        <p className="text-[0.82rem] text-[var(--text-3)] py-8 text-center">جاري التحميل...</p>
      ) : categories.length === 0 ? (
        <p className="text-[0.82rem] text-[var(--text-3)] py-8 text-center">لا توجد تصنيفات بعد.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.map((cat) => (
            <div key={cat.id} className="p-4 bg-[var(--surface)] border border-[var(--border-md)] rounded-[10px]">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ background: cat.color }} />
                  <h3 className="text-[0.9rem] font-bold text-[var(--text-1)] m-0 truncate">{cat.name}</h3>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => { setEditing(cat); setDialogOpen(true); }} className="w-7 h-7 flex items-center justify-center text-[var(--text-3)] hover:text-[var(--gold)]">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => handleDelete(cat)} className="w-7 h-7 flex items-center justify-center text-[var(--text-3)] hover:text-[var(--red)]">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              {cat.description && <p className="text-[0.76rem] text-[var(--text-3)] mt-1.5 line-clamp-2">{cat.description}</p>}
              <p className="flex items-center gap-1 text-[0.72rem] text-[var(--text-3)] mt-2.5">
                <FolderTree size={11} />
                {cat.postCount} مقال
              </p>
            </div>
          ))}
        </div>
      )}

      {dialogOpen && (
        <CategoryFormDialog initial={editing} onClose={() => setDialogOpen(false)} onSaved={load} />
      )}
    </div>
  );
}
