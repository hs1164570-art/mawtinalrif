"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { upsertCategory } from "../../lib/actions/category.actions";

interface CategoryFormDialogProps {
  initial?: { id: string; name: string; description: string | null; color: string } | null;
  onClose: () => void;
  onSaved: () => void;
}

const PRESET_COLORS = ["#408fb4", "#2c9bca", "#e8590c", "#2f9e44", "#9c36b5", "#e03131", "#212529"];

export function CategoryFormDialog({ initial, onClose, onSaved }: CategoryFormDialogProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [color, setColor] = useState(initial?.color ?? PRESET_COLORS[0]);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) { toast.error("اسم التصنيف مطلوب"); return; }
    setSaving(true);
    const result = await upsertCategory({ id: initial?.id, name: name.trim(), description, color });
    if (result.success) {
      toast.success(initial ? "تم تحديث التصنيف" : "تم إنشاء التصنيف");
      onSaved();
      onClose();
    } else {
      toast.error(result.error);
    }
    setSaving(false);
  };

  return (
    <div dir="rtl" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
      <div className="w-full max-w-[420px] bg-[var(--surface)] rounded-[14px] p-5 shadow-[var(--shadow-md)] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[1rem] font-bold text-[var(--text-1)] m-0">{initial ? "تعديل التصنيف" : "تصنيف جديد"}</h3>
          <button onClick={onClose} aria-label="إغلاق" className="text-[var(--text-3)]"><X size={18} /></button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-[0.78rem] text-[var(--text-3)] mb-1 block">الاسم</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: غرف نوم"
              className="w-full px-3 py-2 bg-[var(--surface-3)] border border-[var(--border-md)] rounded-[8px] text-[0.85rem] text-[var(--text-1)] outline-none focus:border-[var(--gold)]"
            />
          </div>

          <div>
            <label className="text-[0.78rem] text-[var(--text-3)] mb-1 block">الوصف (يساعد في SEO الخاص بصفحة التصنيف)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="وصف قصير يظهر أعلى صفحة التصنيف..."
              className="w-full px-3 py-2 bg-[var(--surface-3)] border border-[var(--border-md)] rounded-[8px] text-[0.85rem] text-[var(--text-1)] outline-none focus:border-[var(--gold)] resize-none"
            />
          </div>

          <div>
            <label className="text-[0.78rem] text-[var(--text-3)] mb-1.5 block">اللون</label>
            <div className="flex gap-2 flex-wrap">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  aria-label={c}
                  className="w-7 h-7 rounded-full border-2"
                  style={{ background: c, borderColor: color === c ? "var(--text-1)" : "transparent" }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 py-2 rounded-[8px] border border-[var(--border-md)] text-[0.85rem] text-[var(--text-2)]">إلغاء</button>
          <button onClick={handleSave} disabled={saving} className="flex-1 py-2 rounded-[8px] bg-[var(--gold)] text-[var(--text-inv)] text-[0.85rem] font-semibold disabled:opacity-50">
            {saving ? "جارٍ الحفظ..." : "حفظ"}
          </button>
        </div>
      </div>
    </div>
  );
}
