"use client";

import { useState } from "react";
import {
  Trash2,
  Send,
  Archive,
  FileEdit,
  X,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

interface BulkActionsProps {
  selectedIds: string[];
  onDone: () => void;
}

export function BulkActions({ selectedIds, onDone }: BulkActionsProps) {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const updateStatus = async (status: "PUBLISHED" | "DRAFT" | "ARCHIVED") => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/blog/posts/bulk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds, status }),
      });
      if (!res.ok) throw new Error((await res.json()).message);
      toast.success(`تم تحديث ${selectedIds.length} مقال`);
      onDone();
    } catch (err) {
      toast.error((err as Error).message || "فشل التحديث الجماعي");
    } finally {
      setLoading(false);
    }
  };

  const bulkDelete = async () => {
    setShowConfirm(false);
    setLoading(true);
    try {
      const params = new URLSearchParams({ ids: selectedIds.join(",") });
      const res = await fetch(
        `/api/admin/blog/posts/bulk?${params.toString()}`,
        {
          method: "DELETE",
        },
      );
      if (!res.ok) throw new Error((await res.json()).message);
      toast.success(`تم حذف ${selectedIds.length} مقال`);
      onDone();
    } catch (err) {
      toast.error((err as Error).message || "فشل الحذف الجماعي");
    } finally {
      setLoading(false);
    }
  };

  if (selectedIds.length === 0) return null;

  return (
    <>
      <div
        dir="rtl"
        className="flex flex-wrap items-center gap-2 px-3 py-2 bg-[var(--gold-bg)] rounded-[8px]"
      >
        <span className="text-[0.78rem] font-semibold text-[var(--text-inv)]">
          {selectedIds.length} محدد
        </span>
        <div className="flex flex-wrap gap-1.5">
          <button
            disabled={loading}
            onClick={() => updateStatus("PUBLISHED")}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-[var(--surface)] rounded-[6px] text-[0.74rem] text-[var(--text-1)] disabled:opacity-50"
          >
            <Send size={12} /> نشر
          </button>
          <button
            disabled={loading}
            onClick={() => updateStatus("DRAFT")}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-[var(--surface)] rounded-[6px] text-[0.74rem] text-[var(--text-1)] disabled:opacity-50"
          >
            <FileEdit size={12} /> مسودة
          </button>
          <button
            disabled={loading}
            onClick={() => updateStatus("ARCHIVED")}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-[var(--surface)] rounded-[6px] text-[0.74rem] text-[var(--text-1)] disabled:opacity-50"
          >
            <Archive size={12} /> أرشفة
          </button>
          <button
            disabled={loading}
            onClick={() => setShowConfirm(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-[var(--red)] text-white rounded-[6px] text-[0.74rem] disabled:opacity-50"
          >
            <Trash2 size={12} /> حذف
          </button>
        </div>
      </div>

      {showConfirm && (
        <div
          dir="rtl"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="w-full max-w-sm bg-[var(--surface)] rounded-[12px] shadow-[var(--shadow-md)] border border-[var(--border)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 p-5">
              <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-[var(--red)]/10">
                <AlertTriangle size={20} className="text-[var(--red)]" />
              </div>
              <div className="flex-1">
                <h3 className="text-[0.95rem] font-semibold text-[var(--text-1)]">
                  حذف {selectedIds.length} مقال؟
                </h3>
                <p className="mt-1 text-[0.82rem] text-[var(--text-2)] leading-relaxed">
                  هذا الإجراء نهائي ولا يمكن التراجع عنه. سيتم حذف المقالات
                  المحددة بشكل دائم.
                </p>
              </div>
              <button
                onClick={() => setShowConfirm(false)}
                className="shrink-0 text-[var(--text-3)] hover:text-[var(--text-1)] transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex gap-2 px-5 pb-5">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-3 py-2 rounded-[8px] text-[0.82rem] font-medium text-[var(--text-1)] bg-[var(--bg)] border border-[var(--border-md)] hover:bg-[var(--bg-deep)] transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={bulkDelete}
                disabled={loading}
                className="flex-1 px-3 py-2 rounded-[8px] text-[0.82rem] font-medium text-white bg-[var(--red)] hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? "جارٍ الحذف..." : "حذف نهائيًا"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
