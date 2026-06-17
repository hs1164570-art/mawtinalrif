"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { X, FolderOpen, Tag } from "lucide-react";
import { ImageUploader } from "../../products/_components/ImageUploader";
import type { Category } from "../../types";

// ─── Schemas ──────────────────────────────────────────────────────────────────
const rootSchema = z.object({
  name: z.string().min(2, "الاسم مطلوب"),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "أحرف إنجليزية وأرقام وشرطة فقط"),
  image: z.string().optional(),
  children: z
    .array(
      z.object({
        name: z.string().min(1),
        slug: z.string().regex(/^[a-z0-9-]+$/),
      }),
    )
    .optional()
    .default([]),
});

const subSchema = z.object({
  name: z.string().min(2, "الاسم مطلوب"),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "أحرف إنجليزية وأرقام وشرطة فقط"),
});

type RootForm = z.infer<typeof rootSchema>;
type SubForm = z.infer<typeof subSchema>;

// ─── API ──────────────────────────────────────────────────────────────────────
async function createRootCategory(data: RootForm) {
  const res = await fetch("/api/admin/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mode: "CREATE_NEW",
      ...data,
    }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "فشل في الإنشاء");
  }
  return res.json();
}

async function addSubCategory(data: SubForm & { parentId: string }) {
  const res = await fetch("/api/admin/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mode: "ADD_TO_EXISTING",
      parentId: data.parentId,
      children: [{ name: data.name, slug: data.slug }],
    }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "فشل في الإضافة");
  }
  return res.json();
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function toSlug(str: string) {
  return str
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "")
    .replace(/--+/g, "-")
    .slice(0, 50);
}

function FieldLabel({
  label,
  error,
  required,
}: {
  label: string;
  error?: string;
  required?: boolean;
}) {
  return (
    <div className="mb-1 flex justify-between">
      <label className="text-[#3D2B1F] font-semibold text-[0.85rem]">
        {label} {required && <span className="text-[#C4614A]">*</span>}
      </label>
      {error && <span className="text-[#C4614A] text-xs">{error}</span>}
    </div>
  );
}

// ─── Root Category Form ───────────────────────────────────────────────────────
function RootCategoryForm({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RootForm>({
    resolver: zodResolver(rootSchema),
    defaultValues: { children: [] },
  });

  const watchedName = watch("name");
  const watchedImage = watch("image");

  // auto-slug
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue("name", val);
    setValue("slug", toSlug(val));
  };

  const mutation = useMutation({
    mutationFn: createRootCategory,
    onSuccess: () => {
      toast.success("✅ تم إنشاء القسم الرئيسي بنجاح");
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
      onClose();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <form onSubmit={handleSubmit((d) => mutation.mutate(d))} noValidate>
      <div className="flex flex-col gap-[1.1rem]">
        {/* Image */}
        <div>
          <FieldLabel label="صورة القسم" />
          <ImageUploader
            value={watchedImage ?? ""}
            onChange={(url) => setValue("image", url)}
            folder="categories"
            label="اسحب صورة القسم الرئيسي"
          />
        </div>

        {/* Name */}
        <div>
          <FieldLabel label="اسم القسم" required error={errors.name?.message} />
          <input
            className={`w-full px-[0.875rem] py-[0.625rem] rounded-[9px] border-[1.5px] bg-[#FAF7F2] text-[#3D2B1F] text-sm outline-none box-border font-inherit ${
              errors.name ? "border-[#C4614A]" : "border-[#EDE5D8]"
            }`}
            placeholder="مثال: غرفة الجلوس"
            {...register("name")}
            onChange={handleNameChange}
          />
        </div>

        {/* Slug */}
        <div>
          <FieldLabel label="الـ Slug" required error={errors.slug?.message} />
          <input
            className={`w-full px-[0.875rem] py-[0.625rem] rounded-[9px] border-[1.5px] bg-[#FAF7F2] text-[#3D2B1F] text-sm outline-none box-border font-inherit direction-ltr ${
              errors.slug ? "border-[#C4614A]" : "border-[#EDE5D8]"
            }`}
            style={{ direction: "ltr" }}
            placeholder="living-room"
            {...register("slug")}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={mutation.isPending}
          className={`w-full py-3 rounded-[10px] border-none text-[#FAF7F2] font-bold cursor-pointer font-inherit text-[0.9rem] transition-all ${
            mutation.isPending ?
              "bg-[#DDD0B0] cursor-not-allowed shadow-none"
            : "bg-gradient-to-br from-[#B89A5A] to-[#8C7340] shadow-[0_4px_12px_rgba(184,154,90,0.3)] cursor-pointer"
          }`}
        >
          {mutation.isPending ? "جاري الحفظ..." : "إنشاء القسم الرئيسي"}
        </button>
      </div>
    </form>
  );
}

// ─── Sub Category Form ────────────────────────────────────────────────────────
function SubCategoryForm({
  parent,
  onClose,
}: {
  parent: Category;
  onClose: () => void;
}) {
  const qc = useQueryClient();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SubForm>({
    resolver: zodResolver(subSchema),
  });

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue("name", val);
    setValue("slug", toSlug(val));
  };

  const mutation = useMutation({
    mutationFn: (data: SubForm) =>
      addSubCategory({ ...data, parentId: parent.id }),
    onSuccess: () => {
      toast.success("✅ تم إضافة القسم الفرعي بنجاح");
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
      onClose();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <form onSubmit={handleSubmit((d) => mutation.mutate(d))} noValidate>
      {/* Parent info */}
      <div className="flex items-center gap-[0.625rem] px-[0.875rem] py-[0.625rem] bg-[#FBF6EC] border-[1.5px] border-[#DDD0B0] rounded-[9px] mb-[1.1rem]">
        <FolderOpen size={16} color="#B89A5A" />
        <span className="text-[#6B4C3B] text-[0.85rem]">
          إضافة إلى: <strong>{parent.name}</strong>
        </span>
      </div>

      <div className="flex flex-col gap-[1.1rem]">
        <div>
          <FieldLabel
            label="اسم القسم الفرعي"
            required
            error={errors.name?.message}
          />
          <input
            className={`w-full px-[0.875rem] py-[0.625rem] rounded-[9px] border-[1.5px] bg-[#FAF7F2] text-[#3D2B1F] text-sm outline-none box-border font-inherit ${
              errors.name ? "border-[#C4614A]" : "border-[#EDE5D8]"
            }`}
            placeholder="مثال: أرائك"
            {...register("name")}
            onChange={handleNameChange}
          />
        </div>

        <div>
          <FieldLabel label="الـ Slug" required error={errors.slug?.message} />
          <input
            className={`w-full px-[0.875rem] py-[0.625rem] rounded-[9px] border-[1.5px] bg-[#FAF7F2] text-[#3D2B1F] text-sm outline-none box-border font-inherit ${
              errors.slug ? "border-[#C4614A]" : "border-[#EDE5D8]"
            }`}
            style={{ direction: "ltr" }}
            placeholder="sofas"
            {...register("slug")}
          />
        </div>

        <button
          type="submit"
          disabled={mutation.isPending}
          className={`w-full py-3 rounded-[10px] border-none text-[#FAF7F2] font-bold font-inherit text-[0.9rem] transition-all ${
            mutation.isPending ?
              "bg-[#DDD0B0] cursor-not-allowed shadow-none"
            : "bg-gradient-to-br from-[#B89A5A] to-[#8C7340] cursor-pointer"
          }`}
        >
          {mutation.isPending ? "جاري الإضافة..." : "إضافة القسم الفرعي"}
        </button>
      </div>
    </form>
  );
}

// ─── Main Dialog ──────────────────────────────────────────────────────────────
interface CategoryFormDialogProps {
  mode: "root" | "sub" | "edit";
  parent: Category | null;
  onClose: () => void;
  initialData?: {
    name: string;
    slug: string;
    image?: string;
  };
}

export function CategoryFormDialog({
  mode,
  parent,
  onClose,
}: CategoryFormDialogProps) {
  const isRoot = mode === "root";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
    >
      <motion.div
        className="fixed inset-0 bg-black/40 backdrop-blur-[4px]"
        onClick={onClose}
      />
      <motion.div
        initial={{ scale: 0.96, y: 12 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.96, y: 12 }}
        className="relative bg-white rounded-[20px] w-full max-w-[480px] max-h-[90vh] overflow-y-auto shadow-[0_24px_64px_rgba(0,0,0,0.15)]"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b-[1.5px] border-[#EDE5D8] flex items-center gap-[0.875rem] sticky top-0 bg-[#FAF7F2] z-[1]">
          <div
            className={`w-10 h-10 rounded-[10px] flex items-center justify-center ${
              isRoot ?
                "bg-gradient-to-br from-[#B89A5A] to-[#8C7340] text-[#FAF7F2]"
              : "bg-[#FBF6EC] border-[1.5px] border-[#DDD0B0] text-[#B89A5A]"
            }`}
          >
            {isRoot ?
              <FolderOpen size={18} />
            : <Tag size={18} />}
          </div>
          <div className="flex-1">
            <h3 className="text-[#3D2B1F] font-bold m-0 text-base">
              {isRoot ? "إنشاء قسم رئيسي" : `إضافة قسم فرعي`}
            </h3>
            {!isRoot && parent && (
              <p className="text-[#A89585] text-[0.78rem] mt-0.5 mb-0">
                ضمن: {parent.name}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-[8px] border-[1.5px] border-[#EDE5D8] bg-white cursor-pointer flex items-center justify-center text-[#A89585]"
            aria-label="إغلاق"
          >
            <X size={14} />
          </button>
        </div>

        {/* Form */}
        <div className="p-6">
          {isRoot ?
            <RootCategoryForm onClose={onClose} />
          : parent ?
            <SubCategoryForm parent={parent} onClose={onClose} />
          : null}
        </div>
      </motion.div>
    </motion.div>
  );
}
