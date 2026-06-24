import type { appointment, appointmentStatus } from "@prisma/client";

export type AppointmentStatus = appointmentStatus;

// التواريخ تتحول لـ string دايماً قبل ما توصل للفرونت
// عشان الـ type يفضل ثابت بين الـ prefetch على السيرفر وأي refetch من الكلاينت
export type AppointmentDTO = Omit<appointment, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

export function toAppointmentDTO(appointment: appointment): AppointmentDTO {
  return {
    ...appointment,
    createdAt: appointment.createdAt.toISOString(),
    updatedAt: appointment.updatedAt.toISOString(),
  };
}
