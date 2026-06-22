"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { X, Package } from "lucide-react";
import { ImageUploader } from "./ImageUploader";

import type { Product, Category } from "../../types";
import {
  DESCRIPTION_MAX_LENGTH,
  sanitizeDescriptionHtml,
} from "@/utils/sanitize-html";

// ─── محرر الوصف الغني — Lazy load علشان مكتبة Tiptap تقيلة نسبيًا ─────────
const RichTextEditor = dynamic(
  () => import("./RichTextEditor").then((mod) => mod.RichTextEditor),
  {
    ssr: false,
    loading: () => (
      <div
        className="w-full rounded-[10px] animate-pulse"
        style={{
          height: 280,
          background: "var(--bg)",
          border: "1.5px solid var(--border-md)",
        }}
      />
    ),
  },
);

// ─── Zod Schema ──────────────────────────────────────────────────────────────
const productSchema = z.object({
  name: z.string().min(2, "الاسم مطلوب (٢ أحرف على الأقل)"),
  description: z
    .string()
    .max(
      DESCRIPTION_MAX_LENGTH,
      `الوصف طويل جدًا (الحد الأقصى ${DESCRIPTION_MAX_LENGTH.toLocaleString("en-US")} حرف)`,
    )
    .optional()
    .default("")
    .transform((html) => sanitizeDescriptionHtml(html)),
  price: z.coerce.number().min(1, "السعر مطلوب"),
  costPrice: z.coerce.number().min(1, "سعر التكلفة مطلوب"),
  countStock: z.coerce.number().min(0, "الكمية مطلوبة"),
  discount: z.coerce.number().min(0).max(100).optional().default(0),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "الـ slug: أحرف إنجليزية صغيرة وأرقام وشرطة فقط"),
  subCategoryId: z.string().min(1, "اختر قسمًا فرعيًا"),
  image: z.string().min(1, "صورة المنتج الرئيسية مطلوبة"),
  gallery: z.array(z.string()).max(10).optional().default([]),
  inStock: z.boolean().default(true),
});

type ProductFormData = z.infer<typeof productSchema>;

// ─── API calls ────────────────────────────────────────────────────────────────
async function createProduct(data: ProductFormData) {
  const res = await fetch("/api/admin/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "فشل في إنشاء المنتج");
  }
  return res.json();
}

async function updateProduct(data: ProductFormData & { id: string }) {
  const res = await fetch("/api/admin/products", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "فشل في تحديث المنتج");
  }
  return res.json();
}

// ─── Helper: auto-generate slug ──────────────────────────────────────────────
function toSlug(str: string) {
  return str
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "")
    .replace(/--+/g, "-")
    .slice(0, 60);
}

// ─── Field component ─────────────────────────────────────────────────────────
function Field({
  label,
  error,
  required,
  children,
  hint,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <label
        className="block font-semibold text-[0.85rem] mb-1.5"
        style={{ color: "var(--text-1)" }}
      >
        {label} {required && <span style={{ color: "var(--red)" }}>*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-[0.75rem] mt-1" style={{ color: "var(--text-3)" }}>
          {hint}
        </p>
      )}
      {error && (
        <p className="text-[0.75rem] mt-1" style={{ color: "var(--red)" }}>
          {error}
        </p>
      )}
    </div>
  );
}

const inputClassName =
  "w-full px-3.5 py-2.5 rounded-[9px] text-sm font-[inherit] outline-none transition-colors duration-150 box-border";
const inputStyle: React.CSSProperties = {
  border: "1.5px solid var(--border-md)",
  background: "var(--bg)",
  color: "var(--text-1)",
};

// ─── Main Component (No Drawer) ──────────────────────────────────────────────
interface ProductFormDrawerProps {
  open: boolean;
  onClose: () => void;
  product: Product | null;
  categories: Category[];
}

export function ProductFormDrawer({
  open,
  onClose,
  product,
  categories,
}: ProductFormDrawerProps) {
  const qc = useQueryClient();
  const isEdit = !!product;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      inStock: true,
      discount: 0,
      gallery: [],
      description: "",
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        description: product.description ?? "",
        price: product.price,
        costPrice: product.costPrice,
        countStock: product.countStock,
        discount: product.discount ?? 0,
        slug: product.slug,
        subCategoryId: product.subCategoryId,
        image: product.image,
        gallery: product.gallery ?? [],
        inStock: product.inStock,
      });
    } else {
      reset({
        name: "",
        description: "",
        price: 0,
        costPrice: 0,
        countStock: 0,
        discount: 0,
        slug: "",
        subCategoryId: "",
        image: "",
        gallery: [],
        inStock: true,
      });
    }
  }, [product, reset, open]);

  // Auto-generate slug from name (only when creating)
  const nameValue = watch("name");
  useEffect(() => {
    if (!isEdit && nameValue) {
      setValue("slug", toSlug(nameValue), { shouldValidate: false });
    }
  }, [nameValue, isEdit, setValue]);

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      toast.success("✅ تم إنشاء المنتج بنجاح");
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      onClose();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: updateProduct,
    onSuccess: () => {
      toast.success("✅ تم تحديث المنتج بنجاح");
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      onClose();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const onSubmit = (data: ProductFormData) => {
    const payload = {
      ...data,
      description: sanitizeDescriptionHtml(data.description),
    };
    if (isEdit && product) {
      updateMutation.mutate({ ...payload, id: product.id });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  const watchedImage = watch("image");
  const watchedGallery = watch("gallery") ?? [];
  const watchedDescription = watch("description") ?? "";

  // مراقبة الحقول الحسابية
  const price = watch("price") || 0;
  const costPrice = watch("costPrice") || 0;
  const discount = watch("discount") || 0;

  // الحسابات بعد الخصم
  const salePriceAfterDiscount = price - (price * discount) / 100;
  const expectedProfit = salePriceAfterDiscount - costPrice;

  if (!open) return null;

  return (
    <div
      className="fixed bottom-0 left-0 top-0 z-[80] w-full sm:w-[92vw] sm:max-w-[920px] bg-[var(--surface)] flex flex-col outline-none"
      style={{ boxShadow: "var(--shadow-md)" }}
      aria-label={isEdit ? "تعديل المنتج" : "إضافة منتج جديد"}
    >
      {/* Header */}
      <div
        className="px-6 py-5 flex items-center gap-3.5"
        style={{
          borderBottom: "1.5px solid var(--border-md)",
          background: "var(--bg)",
        }}
      >
        <div
          className="w-[42px] h-[42px] rounded-[11px] flex items-center justify-center"
          style={{
            background:
              isEdit ? "var(--gold-bg)" : (
                "linear-gradient(135deg,var(--gold),var(--gold-mid))"
              ),
            border: isEdit ? "1.5px solid var(--border-md)" : "none",
            color: isEdit ? "var(--gold)" : "var(--text-inv)",
          }}
        >
          <Package size={20} />
        </div>

        <div className="flex-1">
          <h2
            className="font-bold text-[1.05rem] m-0"
            style={{ color: "var(--text-1)" }}
          >
            {isEdit ? "تعديل المنتج" : "إضافة منتج جديد"}
          </h2>
          <p
            className="text-[0.78rem] mt-0.5 mb-0"
            style={{ color: "var(--text-3)" }}
          >
            {isEdit ? product?.name : "موطن الريف للأثاث"}
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-[34px] h-[34px] rounded-lg bg-[var(--surface)] cursor-pointer flex items-center justify-center"
          style={{
            border: "1.5px solid var(--border-md)",
            color: "var(--text-3)",
          }}
          aria-label="إغلاق"
        >
          <X size={15} />
        </button>
      </div>

      {/* Scrollable form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex-1 overflow-y-auto p-6"
        noValidate
      >
        <div className="flex flex-col gap-5">
          {/* Main Image */}
          <Field label="الصورة الرئيسية" required error={errors.image?.message}>
            <ImageUploader
              value={watchedImage}
              onChange={(url) =>
                setValue("image", url, { shouldValidate: true })
              }
              folder="products/main"
              label="اسحب أو اختر الصورة الرئيسية"
            />
          </Field>

          {/* Gallery */}
          <Field
            label={`معرض الصور (${watchedGallery.length}/10)`}
            hint="يمكنك رفع حتى 10 صور إضافية"
          >
            <ImageUploader
              value={watchedGallery}
              onChange={(urls) => setValue("gallery", urls as string[])}
              multiple
              maxFiles={10}
              folder="products/gallery"
              label="اسحب صور المعرض هنا"
            />
          </Field>

          {/* Name */}
          <Field label="اسم المنتج" required error={errors.name?.message}>
            <input
              {...register("name")}
              className={inputClassName}
              style={{
                ...inputStyle,
                borderColor: errors.name ? "var(--red)" : "var(--border-md)",
              }}
              placeholder="مثال: طقم أريكة ملكي"
            />
          </Field>

          {/* Description — Rich Text Editor */}
          <Field label="الوصف" error={errors.description?.message}>
            <RichTextEditor
              value={watchedDescription}
              onChange={(html: string) =>
                setValue("description", html, {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
              placeholder="وصف مختصر وجذاب للمنتج..."
              maxLength={DESCRIPTION_MAX_LENGTH}
            />
          </Field>

          {/* Slug */}
          <Field
            label="الـ Slug (رابط المنتج)"
            required
            error={errors.slug?.message}
            hint="يُولَّد تلقائيًا من الاسم — يمكن تعديله"
          >
            <input
              {...register("slug")}
              className={`${inputClassName} ltr`}
              style={{
                ...inputStyle,
                borderColor: errors.slug ? "var(--red)" : "var(--border-md)",
              }}
              placeholder="my-product-slug"
            />
          </Field>

          {/* Category */}
          <Field
            label="القسم الفرعي"
            required
            error={errors.subCategoryId?.message}
          >
            <select
              {...register("subCategoryId")}
              className={inputClassName}
              style={{
                ...inputStyle,
                borderColor:
                  errors.subCategoryId ? "var(--red)" : "var(--border-md)",
              }}
            >
              <option value="">-- اختر القسم الفرعي --</option>
              {categories.map((cat) => (
                <optgroup key={cat.id} label={`📂 ${cat.name}`}>
                  {cat.children?.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </Field>

          {/* Price row */}
          <div className="grid grid-cols-2 gap-3.5">
            <Field
              label="سعر البيع (ر.س)"
              required
              error={errors.price?.message}
            >
              <input
                {...register("price")}
                type="number"
                min={0}
                className={inputClassName}
                style={{
                  ...inputStyle,
                  borderColor: errors.price ? "var(--red)" : "var(--border-md)",
                }}
                placeholder="0"
              />
            </Field>
            <Field
              label="سعر التكلفة (ر.س)"
              required
              error={errors.costPrice?.message}
            >
              <input
                {...register("costPrice")}
                type="number"
                min={0}
                className={inputClassName}
                style={{
                  ...inputStyle,
                  borderColor:
                    errors.costPrice ? "var(--red)" : "var(--border-md)",
                }}
                placeholder="0"
              />
            </Field>
          </div>

          {/* Stock row */}
          <div className="grid grid-cols-2 gap-3.5">
            <Field
              label="الكمية في المخزون"
              required
              error={errors.countStock?.message}
            >
              <input
                {...register("countStock")}
                type="number"
                min={0}
                className={inputClassName}
                style={{
                  ...inputStyle,
                  borderColor:
                    errors.countStock ? "var(--red)" : "var(--border-md)",
                }}
                placeholder="0"
              />
            </Field>
            <Field label="نسبة الخصم (%)" error={errors.discount?.message}>
              <input
                {...register("discount")}
                type="number"
                min={0}
                max={100}
                className={inputClassName}
                style={inputStyle}
                placeholder="0"
              />
            </Field>
          </div>

          {/* inStock toggle */}
          <Field label="حالة التوفر">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                {...register("inStock")}
                type="checkbox"
                className="w-[18px] h-[18px] cursor-pointer"
                style={{ accentColor: "var(--gold)" }}
              />
              <span className="text-sm" style={{ color: "var(--text-1)" }}>
                المنتج متاح للبيع
              </span>
            </label>
          </Field>

          {/* المعاينات المالية الحسابية */}
          {price > 0 && (
            <div className="flex flex-col gap-3">
              {discount > 0 && (
                <div
                  className="rounded-[10px] p-3.5 flex justify-between items-center"
                  style={{
                    background: "var(--bg)",
                    border: "1.5px solid var(--border-md)",
                  }}
                >
                  <span
                    className="text-[0.85rem] font-medium"
                    style={{ color: "var(--text-1)" }}
                  >
                    السعر بعد الخصم:
                  </span>
                  <span
                    className="font-bold text-base"
                    style={{ color: "var(--gold)" }}
                  >
                    {salePriceAfterDiscount.toLocaleString("en-US")} ر.س
                  </span>
                </div>
              )}

              {costPrice > 0 && (
                <div
                  className="rounded-[10px] p-3.5 flex justify-between items-center"
                  style={{
                    background:
                      expectedProfit >= 0 ? "var(--cyan-bg)" : "var(--red)1A",
                    border:
                      expectedProfit >= 0 ?
                        "1.5px solid var(--cyan-bright)"
                      : "1.5px solid var(--red)",
                  }}
                >
                  <span
                    className="text-[0.85rem] font-medium"
                    style={{
                      color: expectedProfit >= 0 ? "var(--cyan)" : "var(--red)",
                    }}
                  >
                    صافي الربح المتوقع (بعد الخصم):
                  </span>
                  <span
                    className="font-bold text-base"
                    style={{
                      color: expectedProfit >= 0 ? "var(--cyan)" : "var(--red)",
                    }}
                  >
                    {expectedProfit.toLocaleString("en-US")} ر.س
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </form>

      {/* Footer actions */}
      <div
        className="px-6 py-5 flex gap-3"
        style={{
          borderTop: "1.5px solid var(--border-md)",
          background: "var(--bg)",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-3 rounded-[10px] bg-[var(--surface)] font-medium cursor-pointer text-[0.9rem] font-[inherit]"
          style={{
            border: "1.5px solid var(--border-md)",
            color: "var(--text-1)",
          }}
        >
          إلغاء
        </button>
        <button
          onClick={handleSubmit(onSubmit)}
          disabled={isPending}
          className="flex-[2] py-3 rounded-[10px] border-none font-bold text-[0.9rem] font-[inherit] transition-all duration-200"
          style={{
            background:
              isPending ? "var(--border-md)" : (
                "linear-gradient(135deg, var(--gold) 0%, var(--gold-mid) 100%)"
              ),
            color: "var(--text-inv)",
            cursor: isPending ? "not-allowed" : "pointer",
            boxShadow: isPending ? "none" : "var(--shadow-md)",
          }}
        >
          {isPending ?
            "جاري الحفظ..."
          : isEdit ?
            "حفظ التعديلات"
          : "إنشاء المنتج"}
        </button>
      </div>
    </div>
  );
}
