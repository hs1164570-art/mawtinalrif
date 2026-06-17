import z from "zod";
import { Role, UserStatus } from "@prisma/client"; // استيراد الـ Enums من بريزما

export const getUsersSchema = z.object({
  usersNumber: z.coerce.number().min(1).default(1),
  search: z.string().optional(),
  role: z.nativeEnum(Role).optional(),
  status: z.nativeEnum(UserStatus).optional(),
});
export const updateStatusSchema = z.object({
  userId: z.string(),
  status: z.enum(["ACTIVE", "BANNED"], {
    errorMap: () => ({ message: "Status must be either ACTIVE or BANNED" }),
  }),
});
export type UpdateStatusData = z.infer<typeof updateStatusSchema>;
