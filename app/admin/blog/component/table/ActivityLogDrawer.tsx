"use client";

import { useEffect, useState } from "react";
import { Drawer } from "vaul";
import { X, Clock } from "lucide-react";

interface ActivityLog {
  id: string;
  action: string;
  createdAt: string;
  metadata: Record<string, unknown> | null;
}

const ACTION_LABELS: Record<string, string> = {
  CREATED: "تم الإنشاء", UPDATED: "تم التعديل", PUBLISHED: "تم النشر",
  ARCHIVED: "تمت الأرشفة", DELETED: "تم الحذف", STATUS_CHANGED: "تغيّرت الحالة",
};

interface ActivityLogDrawerProps {
  postId: string | null;
  postTitle: string;
  onClose: () => void;
}

export function ActivityLogDrawer({ postId, postTitle, onClose }: ActivityLogDrawerProps) {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!postId) return;
    setLoading(true);
    fetch(`/api/admin/blog/posts/${postId}/activity`)
      .then((r) => (r.ok ? r.json() : { logs: [] }))
      .then((d) => setLogs(d.logs ?? []))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, [postId]);

  return (
    <Drawer.Root open={!!postId} onOpenChange={(open) => !open && onClose()} direction="left">
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/30 z-40" />
        <Drawer.Content
          dir="rtl"
          className="fixed left-0 top-0 bottom-0 w-full sm:w-[380px] bg-[var(--surface)] z-50 flex flex-col"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
            <div className="min-w-0">
              <p className="text-[0.7rem] text-[var(--text-3)] m-0">سجل النشاط</p>
              <p className="text-[0.85rem] font-bold text-[var(--text-1)] m-0 truncate">{postTitle}</p>
            </div>
            <button onClick={onClose} aria-label="إغلاق" className="w-7 h-7 flex items-center justify-center text-[var(--text-3)] shrink-0">
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <p className="text-[0.78rem] text-[var(--text-3)]">جاري التحميل...</p>
            ) : logs.length === 0 ? (
              <p className="text-[0.78rem] text-[var(--text-3)]">لا يوجد نشاط مسجل بعد.</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[var(--bg-deep)] flex items-center justify-center shrink-0">
                    <Clock size={13} className="text-[var(--gold)]" />
                  </div>
                  <div>
                    <p className="text-[0.8rem] text-[var(--text-1)] font-medium m-0">
                      {ACTION_LABELS[log.action] ?? log.action}
                    </p>
                    <p className="text-[0.7rem] text-[var(--text-3)] m-0">
                      {new Date(log.createdAt).toLocaleString("ar-SA", { dateStyle: "medium", timeStyle: "short" })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
