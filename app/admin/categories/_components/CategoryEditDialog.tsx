"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { X, Loader2, Edit3 } from "lucide-react";
import { toast } from "sonner";
import { ImageUploader } from "../../products/_components/ImageUploader";
import type { Category } from "../../types";

interface CategoryEditDialogProps {
  category: Category;
  onClose: () => void;
}

async function updateCategory(payload: {
  id: string;
  name: string;
  slug: string;
  image?: string;
  parentId?: string | null;
}): Promise<void> {
  const res = await fetch("/api/admin/categories", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "فشل في تحديث القسم");
  }
}

export function CategoryEditDialog({
  category,
  onClose,
}: CategoryEditDialogProps) {
  const qc = useQueryClient();
  const [name, setName] = useState(category.name);
  const [slug, setSlug] = useState(category.slug);
  const [image, setImage] = useState(category.image || "");

  const isRoot = !category.parentId;

  // تحديث الـ States لو البيانات اتغيرت في الخلفية
  useEffect(() => {
    setName(category.name);
    setSlug(category.slug);
    setImage(category.image || "");
  }, [category.name, category.slug, category.image]); // تم تحسينها للاعتماد على القيم الأساسية لمنع إعادة التعيين العشوائي أثناء الكتابة

  const mutation = useMutation({
    mutationFn: updateCategory,
    onSuccess: () => {
      toast.success("✅ تم تحديث القسم بنجاح");
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
      onClose();
    },
    onError: (err: Error) => {
      toast.error(err.message || "حدث خطأ أثناء التعديل");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    mutation.mutate({
      id: category.id,
      name: name.trim(),
      slug: slug.trim(),
      // نرسل الصورة فقط إذا كان قسماً رئيسياً ليتوافق مع شرط الـ API عندك
      image: isRoot ? image : undefined,
      parentId: category.parentId,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 bg-black/30 backdrop-blur-[3px]"
        onClick={onClose}
      />

      {/* Modal Content */}
      <motion.div
        initial={{ scale: 0.96, y: 8 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.96, y: 8 }}
        className="relative bg-white rounded-2xl p-6 max-w-[460px] w-full shadow-[0_20px_60px_rgba(0,0,0,0.12)] z-10"
        style={{ border: "1px solid rgba(90,60,20,0.10)" }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:bg-[rgba(90,60,20,0.05)]"
          style={{ color: "#a08858" }}
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div
          className="flex items-center gap-2.5 mb-5 pb-3"
          style={{ borderBottom: "1px solid rgba(90,60,20,0.06)" }}
        >
          <div className="w-9 h-9 rounded-lg bg-[rgba(196,152,72,0.1)] flex items-center justify-center text-[#c49848]">
            <Edit3 size={16} />
          </div>
          <div>
            <h3
              className="font-bold text-[1.05rem] m-0"
              style={{ color: "#281808" }}
            >
              تعديل {isRoot ? "القسم الرئيسي" : "القسم الفرعي"}
            </h3>
            <p className="m-0 text-[0.75rem]" style={{ color: "#a08858" }}>
              تحديث بيانات الاسم والمظهر بالكامل
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Image Upload Zone (يظهر فقط للأقسام الرئيسية) */}
          {isRoot && (
            <div className="flex flex-col gap-1.5">
              <label
                className="text-[0.8rem] font-semibold"
                style={{ color: "#604830" }}
              >
                صورة القسم الحالية / الجديدة
              </label>
              <ImageUploader
                value={image}
                onChange={setImage}
                folder="categories"
                label="اسحب صورة هنا لتغيير مظهر القسم"
              />
            </div>
          )}

          {/* Input Name */}
          <div className="flex flex-col gap-1.5">
            <label
              className="text-[0.8rem] font-semibold"
              style={{ color: "#604830" }}
            >
              اسم القسم بالكامل
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg text-[0.88rem] outline-none transition-all duration-150 bg-[#fdfaf5]"
              style={{
                border: "1px solid rgba(90,60,20,0.12)",
                color: "#281808",
              }}
              required
            />
          </div>

          {/* Input Slug */}
          <div className="flex flex-col gap-1.5">
            <label
              className="text-[0.8rem] font-semibold"
              style={{ color: "#604830" }}
            >
              الرابط الدائم (Slug)
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg text-[0.88rem] font-mono text-left outline-none transition-all duration-150 bg-[#fdfaf5]"
              style={{
                border: "1px solid rgba(90,60,20,0.12)",
                color: "#281808",
                direction: "ltr",
              }}
              required
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2.5 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg text-[0.85rem] font-medium transition-colors"
              style={{
                border: "1.5px solid rgba(90,60,20,0.13)",
                background: "#ffffff",
                color: "#281808",
              }}
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex-1 py-2.5 rounded-lg text-white text-[0.85rem] font-semibold transition-opacity flex items-center justify-center gap-1.5"
              style={{
                background: "linear-gradient(135deg, #d4ac5c 0%, #c49848 100%)",
                opacity: mutation.isPending ? 0.7 : 1,
              }}
            >
              {mutation.isPending ?
                <>
                  <Loader2 size={14} className="animate-spin" />
                  جاري الحفظ...
                </>
              : "حفظ التعديلات"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
