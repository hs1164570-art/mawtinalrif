import * as z from "zod";

const SubCategorySchema = z.object({
  name: z.string().min(2, "Sub-category name is too short"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens",
    ),
});

export const CategoryFormSchema = z.discriminatedUnion("mode", [
  // Case 1: Create a new root category (with optional children)
  z.object({
    mode: z.literal("CREATE_NEW"),
    name: z.string().min(2, "Root category name is required"),
    slug: z
      .string()
      .min(2, "Slug must be at least 2 characters")
      .regex(
        /^[a-z0-9-]+$/,
        "Slug can only contain lowercase letters, numbers, and hyphens",
      ),
    image: z.string().optional(),
    children: z.array(SubCategorySchema).default([]),
  }),

  // Case 2: Add sub-categories to an existing category
  z.object({
    mode: z.literal("ADD_TO_EXISTING"),
    parentId: z.string().min(1, "Parent category ID is required"),

    children: z
      .array(SubCategorySchema)
      .min(1, "At least one sub-category is required"),
  }),
]);

export type CategoryFormValues = z.infer<typeof CategoryFormSchema>;
export const UpdateCategorySchema = z.object({
  id: z.string().min(1, "Category ID is required"),
  name: z.string().min(2, "Name is too short").optional(),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, "Invalid slug format")
    .optional(),
  parentId: z.string().nullable().optional(), // يقبل null لو هتحوله لقسم رئيسي
  image: z.string().optional(),
});

export type UpdateCategoryValues = z.infer<typeof UpdateCategorySchema>;

// 2. سكيما الحذف (DELETE)
export const DeleteCategorySchema = z.object({
  id: z.string().min(1, "Category ID is required"),
});

export type DeleteCategoryValues = z.infer<typeof DeleteCategorySchema>;
