import { z } from "zod";

export const appointmentStatusEnum = z.enum(["UNREAD", "READ"]);

export const updateAppointmentStatusSchema = z.object({
  id: z.string().cuid({ message: "معرف الموعد غير صالح" }),
  status: appointmentStatusEnum,
});

export type UpdateAppointmentStatusInput = z.infer<
  typeof updateAppointmentStatusSchema
>;

export const getAppointmentsQuerySchema = z.object({
  status: z.enum(["ALL", "UNREAD", "READ"]).default("ALL"),
});
