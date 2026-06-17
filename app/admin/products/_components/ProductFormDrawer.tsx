"use client";

import { useEffect } from "react";
import { Drawer } from "vaul";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { X, Package } from "lucide-react";
import { ImageUploader } from "./ImageUploader";
import type { Product, Category } from "../../types";

// ─── Zod Schema ──────────────────────────────────────────────────────────────
const productSchema = z.object({
  name: z.string().min(2, "الاسم مطلوب (٢ أحرف على الأقل)"),
  description: z.string().optional(),
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
        style={{ color: "#3D2B1F" }}
      >
        {label} {required && <span style={{ color: "#C4614A" }}>*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-[0.75rem] mt-1" style={{ color: "#A89585" }}>
          {hint}
        </p>
      )}
      {error && (
        <p className="text-[0.75rem] mt-1" style={{ color: "#C4614A" }}>
          {error}
        </p>
      )}
    </div>
  );
}

const inputClassName =
  "w-full px-3.5 py-2.5 rounded-[9px] text-sm font-[inherit] outline-none transition-colors duration-150 box-border";
const inputStyle: React.CSSProperties = {
  border: "1.5px solid #EDE5D8",
  background: "#FAF7F2",
  color: "#3D2B1F",
};

// ─── Main Drawer ──────────────────────────────────────────────────────────────
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
    if (isEdit && product) {
      updateMutation.mutate({ ...data, id: product.id });
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  const watchedImage = watch("image");
  const watchedGallery = watch("gallery") ?? [];

  // مراقبة الحقول الحسابية
  const price = watch("price") || 0;
  const costPrice = watch("costPrice") || 0;
  const discount = watch("discount") || 0;

  // الحسابات بعد الخصم
  const salePriceAfterDiscount = price - (price * discount) / 100;
  const expectedProfit = salePriceAfterDiscount - costPrice;

  return (
    <Drawer.Root
      open={open}
      onOpenChange={(o) => !o && onClose()}
      direction="left"
    >
      <Drawer.Portal>
        <Drawer.Overlay
          className="fixed inset-0 z-[70]"
          style={{
            background: "rgba(61,43,31,0.4)",
            backdropFilter: "blur(4px)",
          }}
        />
        <Drawer.Content
          className="fixed bottom-0 left-0 top-0 z-[80] w-full max-w-[560px] bg-white flex flex-col outline-none"
          style={{ boxShadow: "8px 0 40px rgba(61,43,31,0.15)" }}
          aria-label={isEdit ? "تعديل المنتج" : "إضافة منتج جديد"}
        >
          {/* Header */}
          <div
            className="px-6 py-5 flex items-center gap-3.5"
            style={{
              borderBottom: "1.5px solid #EDE5D8",
              background: "#FAF7F2",
            }}
          >
            <div
              className="w-[42px] h-[42px] rounded-[11px] flex items-center justify-center"
              style={{
                background:
                  isEdit ? "#FBF6EC" : (
                    "linear-gradient(135deg,#B89A5A,#8C7340)"
                  ),
                border: isEdit ? "1.5px solid #DDD0B0" : "none",
                color: isEdit ? "#B89A5A" : "#FAF7F2",
              }}
            >
              <Package size={20} />
            </div>

            <div className="flex-1">
              <Drawer.Title
                className="font-bold text-[1.05rem] m-0"
                style={{ color: "#3D2B1F" }}
              >
                {isEdit ? "تعديل المنتج" : "إضافة منتج جديد"}
              </Drawer.Title>
              <p
                className="text-[0.78rem] mt-0.5 mb-0"
                style={{ color: "#A89585" }}
              >
                {isEdit ? product?.name : "موطن الريف للأثاث"}
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-[34px] h-[34px] rounded-lg bg-white cursor-pointer flex items-center justify-center"
              style={{
                border: "1.5px solid #EDE5D8",
                color: "#A89585",
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
              <Field
                label="الصورة الرئيسية"
                required
                error={errors.image?.message}
              >
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
                    borderColor: errors.name ? "#C4614A" : "#EDE5D8",
                  }}
                  placeholder="مثال: طقم أريكة ملكي"
                />
              </Field>

              {/* Description */}
              <Field label="الوصف" error={errors.description?.message}>
                <textarea
                  {...register("description")}
                  rows={3}
                  className={inputClassName}
                  style={{
                    ...inputStyle,
                    resize: "vertical",
                    minHeight: 80,
                  }}
                  placeholder="وصف مختصر للمنتج..."
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
                    borderColor: errors.slug ? "#C4614A" : "#EDE5D8",
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
                    borderColor: errors.subCategoryId ? "#C4614A" : "#EDE5D8",
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
                      borderColor: errors.price ? "#C4614A" : "#EDE5D8",
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
                      borderColor: errors.costPrice ? "#C4614A" : "#EDE5D8",
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
                      borderColor: errors.countStock ? "#C4614A" : "#EDE5D8",
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
                    style={{ accentColor: "#B89A5A" }}
                  />
                  <span className="text-sm" style={{ color: "#3D2B1F" }}>
                    المنتج متاح للبيع
                  </span>
                </label>
              </Field>

              {/* المعاينات المالية الحسابية (السعر بعد الخصم + صافي الربح الفعلي) */}
              {price > 0 && (
                <div className="flex flex-col gap-3">
                  {/* ديف السعر بعد الخصم الجديد - يظهر فقط إذا كان هناك خصم أكبر من صفر */}
                  {discount > 0 && (
                    <div
                      className="rounded-[10px] p-3.5 flex justify-between items-center"
                      style={{
                        background: "#FAF7F2",
                        border: "1.5px solid #EDE5D8",
                      }}
                    >
                      <span
                        className="text-[0.85rem] font-medium"
                        style={{ color: "#3D2B1F" }}
                      >
                        السعر بعد الخصم:
                      </span>
                      <span
                        className="font-bold text-base"
                        style={{ color: "#B89A5A" }}
                      >
                        {salePriceAfterDiscount.toLocaleString("en-US")} ر.س
                      </span>
                    </div>
                  )}

                  {/* صافي الربح المتوقع بعد خصم الـ discount والتكلفة */}
                  {costPrice > 0 && (
                    <div
                      className="rounded-[10px] p-3.5 flex justify-between items-center"
                      style={{
                        background: expectedProfit >= 0 ? "#EEF7F2" : "#FCE8E6",
                        border:
                          expectedProfit >= 0 ?
                            "1.5px solid #B3D5C3"
                          : "1.5px solid #F3A9A0",
                      }}
                    >
                      <span
                        className="text-[0.85rem] font-medium"
                        style={{
                          color: expectedProfit >= 0 ? "#6A9E7F" : "#C4614A",
                        }}
                      >
                        صافي الربح المتوقع (بعد الخصم):
                      </span>
                      <span
                        className="font-bold text-base"
                        style={{
                          color: expectedProfit >= 0 ? "#6A9E7F" : "#C4614A",
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
              borderTop: "1.5px solid #EDE5D8",
              background: "#FAF7F2",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-[10px] bg-white font-medium cursor-pointer text-[0.9rem] font-[inherit]"
              style={{
                border: "1.5px solid #EDE5D8",
                color: "#3D2B1F",
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
                  isPending ? "#DDD0B0" : (
                    "linear-gradient(135deg, #B89A5A 0%, #8C7340 100%)"
                  ),
                color: "#FAF7F2",
                cursor: isPending ? "not-allowed" : "pointer",
                boxShadow:
                  isPending ? "none" : "0 4px 12px rgba(184,154,90,0.35)",
              }}
            >
              {isPending ?
                "جاري الحفظ..."
              : isEdit ?
                "حفظ التعديلات"
              : "إنشاء المنتج"}
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
