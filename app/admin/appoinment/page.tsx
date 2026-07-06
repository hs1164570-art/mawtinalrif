import { Suspense } from "react";
import prisma from "@/lib/db";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { type Metadata } from "next";
import AppointmentsClient from "./AppointmentsClient";

export const metadata: Metadata = {
  title: "طلبات الحجز | لوحة التحكم",
};

export default async function AppointmentsPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["admin", "appointments"],
    queryFn: () =>
      prisma.appointment.findMany({
        orderBy: { createdAt: "desc" },
      }),
  });

  return (
    <section className="p-6 lg:p-10" dir="rtl">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<div>جاري التحميل...</div>}>
          <AppointmentsClient />
        </Suspense>
      </HydrationBoundary>
    </section>
  );
}
