"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Tag as TagIcon, X } from "lucide-react";
import { toast } from "sonner";
import { upsertTag, deleteTag } from "../lib/actions/category.actions";

interface Tag { id: string; name: string; slug: string; postCount: number }

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    fetch("/api/admin/blog/tags")
      .then((r) => r.json())
      .then((d) => setTags(d.tags ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const addTag = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    const result = await upsertTag({ name: newName.trim() });
    if (result.success) { toast.success("تم إضافة الوسم"); setNewName(""); load(); }
    else toast.error(result.error);
    setSaving(false);
  };

  const saveEdit = async (id: string) => {
    if (!draftName.trim()) return;
    const result = await upsertTag({ id, name: draftName.trim() });
    if (result.success) { toast.success("تم التحديث"); setEditingId(null); load(); }
    else toast.error(result.error);
  };

  const handleDelete = async (tag: Tag) => {
    if (!confirm(`متأكد من حذف الوسم "${tag.name}"؟ سيُزال من ${tag.postCount} مقال.`)) return;
    const result = await deleteTag(tag.id);
    if (result.success) { toast.success("تم الحذف"); load(); }
    else toast.error(result.error);
  };

  return (
    <div dir="rtl" className="p-4 sm:p-6 space-y-4">
      <div>
        <h1 className="text-[1.3rem] sm:text-[1.5rem] font-bold text-[var(--text-1)] m-0">وسوم المدونة</h1>
        <p className="text-[0.8rem] text-[var(--text-3)] m-0">صفات دقيقة تُستخدم عبر تصنيفات متعددة</p>
      </div>

      <div className="flex gap-2 max-w-full sm:max-w-[420px]">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTag()}
          placeholder="مثال: خشب-سويدي"
          className="flex-1 min-w-0 px-3 py-2 bg-[var(--surface)] border border-[var(--border-md)] rounded-[8px] text-[0.85rem] text-[var(--text-1)] outline-none focus:border-[var(--gold)]"
        />
        <button
          onClick={addTag}
          disabled={saving || !newName.trim()}
          className="flex items-center gap-1.5 px-3.5 bg-[var(--gold)] text-[var(--text-inv)] rounded-[8px] text-[0.82rem] font-semibold disabled:opacity-40 shrink-0"
        >
          <Plus size={15} />
          إضافة
        </button>
      </div>

      {loading ? (
        <p className="text-[0.82rem] text-[var(--text-3)] py-8 text-center">جاري التحميل...</p>
      ) : tags.length === 0 ? (
        <p className="text-[0.82rem] text-[var(--text-3)] py-8 text-center">لا توجد وسوم بعد.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <div key={tag.id} className="flex items-center gap-2 px-3 py-2 bg-[var(--surface)] border border-[var(--border-md)] rounded-[8px]">
              {editingId === tag.id ? (
                <>
                  <input
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && saveEdit(tag.id)}
                    autoFocus
                    className="w-28 px-1.5 py-0.5 bg-[var(--surface-3)] border border-[var(--gold)] rounded-[4px] text-[0.78rem] outline-none"
                  />
                  <button onClick={() => saveEdit(tag.id)} className="text-[var(--gold)]"><Pencil size={12} /></button>
                  <button onClick={() => setEditingId(null)} className="text-[var(--text-3)]"><X size={12} /></button>
                </>
              ) : (
                <>
                  <TagIcon size={12} className="text-[var(--text-3)]" />
                  <span className="text-[0.82rem] text-[var(--text-1)]">{tag.name}</span>
                  <span className="text-[0.68rem] text-[var(--text-3)]">({tag.postCount})</span>
                  <button onClick={() => { setEditingId(tag.id); setDraftName(tag.name); }} className="text-[var(--text-3)] hover:text-[var(--gold)]">
                    <Pencil size={12} />
                  </button>
                  <button onClick={() => handleDelete(tag)} className="text-[var(--text-3)] hover:text-[var(--red)]">
                    <Trash2 size={12} />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
