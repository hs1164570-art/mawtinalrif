// app/orders/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserOrders } from "../actions/orders";
import { OrdersClient } from "./orders-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Orders | مواطن الريف",
  description: "Track and review your order history.",
};

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in?callbackUrl=/orders");

  // Prefetch ALL orders on server
  const initialOrders = await getUserOrders("ALL");

  return <OrdersClient initialOrders={initialOrders} />;
}
