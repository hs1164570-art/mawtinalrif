import { z } from "zod";

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export const createAnnouncementSchema = z.object({
  title: z.string().min(1, "العنوان مطلوب"),
  url: z.string().url("رابط غير صحيح").optional().or(z.literal("")),
  backgroundColor: z.string().default("#c9ba89"),
  textColor: z.string().default("rgba(27, 26, 26, 1)"),
  isActive: z.boolean().default(true),
  priority: z.number().int().default(0),
  showCount: z.number().int().min(1).max(10).default(1), // ← ✅
});
export const updateAnnouncementSchema = createAnnouncementSchema
  .partial()
  .extend({
    id: z.string().cuid("ID غير صحيح"),
  });

export const deleteAnnouncementSchema = z.object({
  id: z.string().cuid("ID غير صحيح"),
});
