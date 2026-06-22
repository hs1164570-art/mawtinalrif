"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { HexColorPicker } from "react-colorful";
import { useQueryState } from "nuqs";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Announcement,
  announcementAdminQueryOptions,
} from "@/hook/Announcementadminqueryoptions ";

// ─── helpers ────────────────────────────────────────────────────────────────

/** يحوّل rgba(...) أو أي لون CSS إلى hex لـ react-colorful */
function toHex(color: string): string {
  if (!color) return "#000000";
  if (color.startsWith("#")) return color.slice(0, 7); // نقطع أي alpha channel
  if (color.startsWith("rgb")) {
    const m = color.match(/(\d+),\s*(\d+),\s*(\d+)/);
    if (m) {
      return (
        "#" +
        [m[1], m[2], m[3]]
          .map((n) => parseInt(n).toString(16).padStart(2, "0"))
          .join("")
      );
    }
  }
  return "#000000";
}

// ─── form schema ────────────────────────────────────────────────────────────

const formSchema = z.object({
  title: z.string().min(1, "النص مطلوب"),
  url: z.string().url("رابط غير صحيح").optional().or(z.literal("")),
  backgroundColor: z.string().default("#1a1a1a"), // تُترك كـ داتا للـ Database والـ Picker
  textColor: z.string().default("#ffffff"),
  isActive: z.boolean().default(true),
  priority: z.number().int().default(0),
  showCount: z.number().int().min(1).max(10).default(1),
});

type FormData = z.infer<typeof formSchema>;

const DEFAULT_VALUES: FormData = {
  title: "",
  url: "",
  backgroundColor: "#1a1a1a",
  textColor: "#ffffff",
  isActive: true,
  priority: 0,
  showCount: 1,
};

// ─── Color Picker Popover ────────────────────────────────────────────────────

function ColorSwatch({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <p className="text-[11px] font-semibold text-[var(--text-2)] uppercase tracking-wider mb-2">
        {label}
      </p>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl border border-[var(--border-md)] bg-[var(--surface)] hover:border-[var(--cyan)] transition-colors group"
      >
        <span
          className="w-6 h-6 rounded-lg border border-[var(--border-md)] flex-shrink-0 shadow-sm"
          style={{ backgroundColor: value }}
        />
        <span className="text-xs text-[var(--text-2)] font-mono group-hover:text-[var(--cyan)] transition-colors">
          {value.toUpperCase()}
        </span>
        <svg
          className={`w-3.5 h-3.5 text-[var(--text-3)] mr-auto transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 z-50 p-4 bg-[var(--surface)] rounded-2xl border border-[var(--border-md)] shadow-[var(--shadow-md)]"
            style={{ minWidth: 220 }}
          >
            <HexColorPicker
              color={value}
              onChange={onChange}
              style={{ width: "100%" }}
            />
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="mt-3 w-full text-xs font-mono px-3 py-2 border border-[var(--border-md)] rounded-lg text-[var(--text-2)] text-center bg-[var(--surface)] focus:outline-none focus:border-[var(--cyan)]"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Live Preview ────────────────────────────────────────────────────────────

function LivePreview({ values }: { values: FormData }) {
  const items = Array.from({ length: 6 }, (_, i) => i);

  return (
    <div className="rounded-2xl overflow-hidden border border-[var(--border-md)] shadow-sm">
      {/* browser bar */}
      <div className="px-4 py-2.5 bg-[var(--bg-deep)] border-b border-[var(--border)] flex items-center gap-2">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[color-mix(in_srgb,var(--red)_40%,transparent)]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[color-mix(in_srgb,var(--gold-bright)_40%,transparent)]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[color-mix(in_srgb,var(--text-3)_40%,transparent)]" />
        </div>
        <div className="flex-1 mx-3 px-3 py-1 bg-[color-mix(in_srgb,var(--surface)_60%,transparent)] rounded-md text-[10px] text-[var(--text-2)] font-mono text-center truncate">
          mawtin-el-rif.com
        </div>
        <span className="text-[10px] text-[var(--cyan)] font-semibold">
          معاينة مباشرة
        </span>
      </div>

      {/* announcement bar */}
      <div
        className="relative overflow-hidden"
        style={{ backgroundColor: values.backgroundColor }}
      >
        <div
          className="flex whitespace-nowrap py-2.5"
          style={{
            animation: "marquee-admin 18s linear infinite",
            color: values.textColor,
          }}
        >
          {[...items, ...items].map((_, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-5 px-6 text-sm font-medium"
            >
              {values.title || "نص الإعلان هنا..."}
              <span className="opacity-30 text-xs">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* fake navbar */}
      <div className="px-6 py-3 bg-[var(--gold)] flex items-center justify-between">
        <span className="text-[var(--text-inv)] text-sm font-bold tracking-wide">
          موطن الريف
        </span>
        <div className="flex gap-4">
          {["الرئيسية", "المنتجات", "من نحن"].map((item) => (
            <span
              key={item}
              className="text-[color-mix(in_srgb,var(--text-inv)_40%,transparent)] text-xs"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Announcement Row ────────────────────────────────────────────────────────

function AnnouncementRow({
  bar,
  isEditing,
  onEdit,
  onToggle,
  onDelete,
}: {
  bar: Announcement;
  isEditing: boolean;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12 }}
      className={`px-5 py-4 flex items-center gap-3 transition-colors ${
        isEditing ?
          "bg-[color-mix(in_srgb,var(--cyan)_4%,transparent)] border-r-2 border-[var(--cyan)]"
        : "hover:bg-[var(--bg)]"
      }`}
    >
      {/* color dot */}
      <div className="flex-shrink-0 relative">
        <span
          className="w-9 h-9 rounded-xl block border border-[var(--border)] shadow-sm"
          style={{ backgroundColor: bar.backgroundColor }}
        />
        <span
          className="absolute -bottom-0.5 -left-0.5 w-3.5 h-3.5 rounded-full border-2 border-white flex items-center justify-center"
          style={{ backgroundColor: bar.textColor }}
        />
      </div>

      {/* info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[var(--text-1)] truncate">
          {bar.title}
        </p>
        <div className="flex items-center gap-2.5 mt-0.5 flex-wrap">
          <span className="text-[10px] text-[var(--text-2)] bg-[var(--bg-deep)] px-1.5 py-0.5 rounded-md">
            ×{bar.showCount} تكرار
          </span>
          {bar.priority > 0 && (
            <span className="text-[10px] text-[var(--cyan)] bg-[var(--cyan-bg)] px-1.5 py-0.5 rounded-md">
              أولوية {bar.priority}
            </span>
          )}
          {bar.url && (
            <span className="text-[10px] text-[var(--text-3)] truncate max-w-[120px]">
              🔗 {bar.url}
            </span>
          )}
        </div>
      </div>

      {/* toggle */}
      <button
        onClick={onToggle}
        className={`flex-shrink-0 text-[11px] px-2.5 py-1 rounded-full font-semibold transition-all ${
          bar.isActive ?
            "bg-[var(--cyan-bg)] text-[var(--cyan)]"
          : "bg-[var(--bg-deep)] text-[var(--text-3)]"
        }`}
      >
        {bar.isActive ? "● نشط" : "○ معطّل"}
      </button>

      {/* edit */}
      <button
        onClick={onEdit}
        className={`flex-shrink-0 text-[11px] px-3 py-1.5 rounded-lg border transition-all ${
          isEditing ?
            "bg-[var(--cyan)] border-[var(--cyan)] text-[var(--text-inv)]"
          : "border-[var(--border-md)] text-[var(--text-2)] hover:border-[var(--cyan)] hover:text-[var(--cyan)]"
        }`}
      >
        {isEditing ? "جاري التعديل" : "تعديل"}
      </button>

      {/* delete */}
      <AnimatePresence mode="wait">
        {confirmDelete ?
          <motion.div
            key="confirm"
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            className="flex items-center gap-1.5 flex-shrink-0"
          >
            <button
              onClick={onDelete}
              className="text-[11px] px-2.5 py-1.5 rounded-lg bg-[color-mix(in_srgb,var(--red)_5%,transparent)] text-[var(--red)] hover:bg-[color-mix(in_srgb,var(--red)_10%,transparent)] font-semibold transition-all"
            >
              تأكيد
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="text-[11px] px-2.5 py-1.5 rounded-lg bg-[var(--bg-deep)] text-[var(--text-2)] transition-all"
            >
              إلغاء
            </button>
          </motion.div>
        : <motion.button
            key="delete"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setConfirmDelete(true)}
            className="flex-shrink-0 text-[11px] px-3 py-1.5 rounded-lg border border-[var(--border-md)] text-[var(--red)] hover:border-[var(--red)] hover:bg-[color-mix(in_srgb,var(--red)_5%,transparent)] transition-all"
          >
            حذف
          </motion.button>
        }
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AnnouncementClient() {
  const qc = useQueryClient();

  // nuqs — id الإعلان اللي بيتعدّل حالياً
  const [editId, setEditId] = useQueryState("editId");

  const { data, isLoading } = useQuery(announcementAdminQueryOptions());
  const bars = data?.bars ?? [];

  const editingBar = bars.find((b) => b.id === editId) ?? null;

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: DEFAULT_VALUES,
  });

  // لما editId يتغير → حمّل بيانات الإعلان في الفورم
  useEffect(() => {
    if (editingBar) {
      reset({
        title: editingBar.title,
        url: editingBar.url ?? "",
        backgroundColor: toHex(editingBar.backgroundColor),
        textColor: toHex(editingBar.textColor),
        isActive: editingBar.isActive,
        priority: editingBar.priority,
        showCount: editingBar.showCount,
      });
    } else {
      reset(DEFAULT_VALUES);
    }
  }, [editId, editingBar, reset]);

  const preview = watch();

  // ─── Mutations ──────────────────────────────────────────────────────────────

  const invalidate = useCallback(
    () => qc.invalidateQueries({ queryKey: ["admin", "announcement-bar"] }),
    [qc],
  );

  const createMutation = useMutation({
    mutationFn: async (body: FormData) => {
      const res = await fetch("/api/admin/announcement-bar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
    },
    onSuccess: () => {
      invalidate();
      reset(DEFAULT_VALUES);
      toast.success("✅ تم إنشاء الإعلان بنجاح");
    },
    onError: () => toast.error("❌ فشل في إنشاء الإعلان"),
  });

  const updateMutation = useMutation({
    mutationFn: async (body: FormData & { id: string }) => {
      const res = await fetch("/api/admin/announcement-bar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
    },
    onSuccess: () => {
      invalidate();
      setEditId(null);
      reset(DEFAULT_VALUES);
      toast.success("✅ تم تحديث الإعلان");
    },
    onError: () => toast.error("❌ فشل في تحديث الإعلان"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/announcement-bar?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
    },
    onSuccess: () => {
      invalidate();
      if (editId) {
        setEditId(null);
        reset(DEFAULT_VALUES);
      }
      toast.success("🗑️ تم حذف الإعلان");
    },
    onError: () => toast.error("❌ فشل في حذف الإعلان"),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const res = await fetch("/api/admin/announcement-bar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive }),
      });
      if (!res.ok) throw new Error();
    },
    onSuccess: () => {
      invalidate();
      toast.success("تم تحديث الحالة");
    },
    onError: () => toast.error("فشل في تحديث الحالة"),
  });

  const onSubmit = (data: FormData) => {
    if (editId) updateMutation.mutate({ ...data, id: editId });
    else createMutation.mutate(data);
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // ─── UI ────────────────────────────────────────────────────────────────────

  return (
    <>
      {/* keyframe مرة واحدة */}
      <style>{`
        @keyframes marquee-admin {
          from { transform: translateX(0);    }
          to   { transform: translateX(-50%); }
        }
      `}</style>

      <div className="min-h-screen bg-[var(--bg)] p-6 font-arabic" dir="rtl">
        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="mb-7 flex items-start justify-between">
          <div>
            <p className="text-[var(--text-3)] text-xs font-medium tracking-widest uppercase mb-1">
              الإشعارات
            </p>
            <h1 className="text-2xl font-bold text-[var(--text-1)]">
              شريط الإعلانات
            </h1>
          </div>
          <span className="mt-1 text-xs text-[var(--text-2)] bg-[var(--surface)] border border-[var(--border)] px-3 py-1.5 rounded-full">
            {bars.filter((b) => b.isActive).length} نشط / {bars.length} إجمالي
          </span>
        </div>

        {/* ── Live Preview ────────────────────────────────────────────────────── */}
        <div className="mb-7">
          <LivePreview values={preview} />
        </div>

        {/* ── Main Grid ───────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-[400px_1fr] gap-6 items-start">
          {/* ── Form ──────────────────────────────────────────────────────────── */}
          <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] overflow-hidden shadow-sm">
            {/* form header */}
            <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
              <h2 className="text-sm font-bold text-[var(--text-1)]">
                {editId ? "✏️  تعديل الإعلان" : "＋  إعلان جديد"}
              </h2>
              {editId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditId(null);
                    reset(DEFAULT_VALUES);
                  }}
                  className="text-[11px] text-[var(--text-3)] hover:text-[var(--red)] transition-colors"
                >
                  إلغاء التعديل ✕
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
              {/* Title */}
              <div>
                <p className="text-[11px] font-semibold text-[var(--text-2)] uppercase tracking-wider mb-2">
                  نص الإعلان <span className="text-[var(--red)]">*</span>
                </p>
                <input
                  {...register("title")}
                  placeholder="مثال: خصم 20% على كل المنتجات 🎉"
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-md)] bg-[var(--surface)] text-[var(--text-1)] text-sm placeholder-[color-mix(in_srgb,var(--text-3)_40%,transparent)] focus:outline-none focus:border-[var(--cyan)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--cyan)_10%,transparent)] transition-all"
                />
                {errors.title && (
                  <p className="text-[var(--red)] text-xs mt-1.5">
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* URL */}
              <div>
                <p className="text-[11px] font-semibold text-[var(--text-2)] uppercase tracking-wider mb-2">
                  رابط (اختياري)
                </p>
                <input
                  {...register("url")}
                  dir="ltr"
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-md)] bg-[var(--surface)] text-[var(--text-1)] text-sm font-mono placeholder-[color-mix(in_srgb,var(--text-3)_40%,transparent)] focus:outline-none focus:border-[var(--cyan)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--cyan)_10%,transparent)] transition-all"
                />
                {errors.url && (
                  <p className="text-[var(--red)] text-xs mt-1.5">
                    {errors.url.message}
                  </p>
                )}
              </div>

              {/* Colors */}
              <div className="grid grid-cols-2 gap-3">
                <Controller
                  control={control}
                  name="backgroundColor"
                  render={({ field }) => (
                    <ColorSwatch
                      label="لون الخلفية"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="textColor"
                  render={({ field }) => (
                    <ColorSwatch
                      label="لون النص"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>

              {/* Show Count */}
              <Controller
                control={control}
                name="showCount"
                render={({ field }) => (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[11px] font-semibold text-[var(--text-2)] uppercase tracking-wider">
                        عدد التكرار في الشريط
                      </p>
                      <span className="text-sm font-bold text-[var(--cyan)] bg-[var(--cyan-bg)] px-2.5 py-0.5 rounded-lg">
                        ×{field.value}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={field.value}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      className="w-full h-1.5 rounded-full appearance-none bg-[var(--bg-deep)] accent-[var(--cyan)] cursor-pointer"
                    />
                    <div className="flex justify-between mt-1">
                      <span className="text-[10px] text-[var(--text-3)]">
                        1 مرة
                      </span>
                      <span className="text-[10px] text-[var(--text-3)]">
                        10 مرات
                      </span>
                    </div>
                  </div>
                )}
              />

              {/* Priority + isActive */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[11px] font-semibold text-[var(--text-2)] uppercase tracking-wider mb-2">
                    الأولوية
                  </p>
                  <Controller
                    control={control}
                    name="priority"
                    render={({ field }) => (
                      <input
                        type="number"
                        value={field.value}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-md)] bg-[var(--surface)] text-[var(--text-1)] text-sm text-center focus:outline-none focus:border-[var(--cyan)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--cyan)_10%,transparent)] transition-all"
                      />
                    )}
                  />
                </div>

                <div>
                  <p className="text-[11px] font-semibold text-[var(--text-2)] uppercase tracking-wider mb-2">
                    الحالة
                  </p>
                  <Controller
                    control={control}
                    name="isActive"
                    render={({ field }) => (
                      <button
                        type="button"
                        onClick={() => field.onChange(!field.value)}
                        className={`w-full py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                          field.value ?
                            "bg-[var(--cyan-bg)] border-[var(--cyan)] text-[var(--cyan)]"
                          : "bg-[var(--bg-deep)] border-[var(--border-md)] text-[var(--text-2)]"
                        }`}
                      >
                        {field.value ? "● مفعّل" : "○ معطّل"}
                      </button>
                    )}
                  />
                </div>
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 rounded-xl bg-[var(--cyan)] hover:bg-[var(--cyan-bright)] active:bg-[color-mix(in_srgb,var(--cyan)_90%,black)] text-[var(--text-inv)] font-bold text-sm transition-colors disabled:opacity-60 shadow-sm shadow-[color-mix(in_srgb,var(--cyan)_20%,transparent)] mt-1"
              >
                {isSubmitting ?
                  "جاري الحفظ..."
                : editId ?
                  "حفظ التعديلات"
                : "إنشاء الإعلان"}
              </motion.button>
            </form>
          </div>

          {/* ── Table ─────────────────────────────────────────────────────────── */}
          <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
              <h2 className="text-sm font-bold text-[var(--text-1)]">
                الإعلانات الحالية
              </h2>
              {bars.length > 0 && (
                <span className="text-[11px] text-[var(--text-3)]">
                  مرتبة حسب الأولوية ثم التاريخ
                </span>
              )}
            </div>

            {isLoading ?
              <div className="p-16 flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-[color-mix(in_srgb,var(--cyan)_20%,transparent)] border-t-[var(--cyan)] rounded-full animate-spin" />
                <p className="text-sm text-[var(--text-3)]">جاري التحميل...</p>
              </div>
            : bars.length === 0 ?
              <div className="p-16 text-center">
                <p className="text-4xl mb-3">📢</p>
                <p className="text-sm font-medium text-[var(--text-2)]">
                  لا يوجد إعلانات بعد
                </p>
                <p className="text-xs text-[var(--text-3)] mt-1">
                  أنشئ إعلانك الأول من النموذج على اليمين
                </p>
              </div>
            : <div className="divide-y divide-[var(--border)]">
                <AnimatePresence>
                  {bars.map((bar) => (
                    <AnnouncementRow
                      key={bar.id}
                      bar={bar}
                      isEditing={editId === bar.id}
                      onEdit={() =>
                        editId === bar.id ?
                          (setEditId(null), reset(DEFAULT_VALUES))
                        : setEditId(bar.id)
                      }
                      onToggle={() =>
                        toggleMutation.mutate({
                          id: bar.id,
                          isActive: !bar.isActive,
                        })
                      }
                      onDelete={() => deleteMutation.mutate(bar.id)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            }
          </div>
        </div>
      </div>
    </>
  );
}
