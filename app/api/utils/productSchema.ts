import {
  DESCRIPTION_MAX_LENGTH,
  sanitizeDescriptionHtml,
} from "@/utils/sanitize-html";
import { z } from "zod";

// ─── الحقول المشتركة بين الإنشاء والتعديل ────────────────────────────────
const baseProductFields = {
  name: z.string().min(2, "الاسم مطلوب (٢ أحرف على الأقل)"),

  // 👇 ده الحقل المُعدَّل: بيستقبل HTML من محرر Tiptap، بحد أقصى للطول،
  // وبيتطهّر تلقائيًا قبل ما يوصل لـ Prisma — دفاع مستقل تمامًا عن الفرونت
  // إند (حتى لو حد نادى الـ API مباشرة من بوستمان مثلًا، هيتطهّر برضه).
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
};

// ─── إنشاء منتج ────────────────────────────────────────────────────────────
export const CreateProductSchema = z.object(baseProductFields);

// ─── تعديل منتج (نفس الحقول + id) ──────────────────────────────────────────
export const UpdateProductSchema = z.object({
  id: z.string().min(1, "معرّف المنتج مطلوب"),
  ...baseProductFields,
});

// ─── حذف منتج ──────────────────────────────────────────────────────────────
export const DeleteProductSchema = z.object({
  id: z.string().min(1, "معرّف المنتج مطلوب"),
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
export type DeleteProductInput = z.infer<typeof DeleteProductSchema>;
