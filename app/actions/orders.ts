"use server";

import { auth } from "@/auth";
import prisma from "@/lib/db";
import type { Order, OrderStatus } from "../../utils/index";

export async function getUserOrders(
  status?: OrderStatus | "ALL",
): Promise<Order[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  const where: Record<string, unknown> = { userId: session.user.id };
  if (status && status !== "ALL") where.status = status;

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      totalPrice: true,
      status: true,
      paymentMethod: true,
      country: true,
      region: true,
      street: true,
      coupon: true,
      createdAt: true,
      orderItems: {
        select: {
          quantity: true,
          price: true,
          product: {
            select: { name: true, image: true, slug: true },
          },
        },
      },
    },
  });

  return orders.map((o) => ({
    ...o,
    createdAt: o.createdAt.toISOString(),
  })) as Order[];
}

export async function getOrderById(id: string): Promise<Order | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const order = await prisma.order.findUnique({
    where: { id, userId: session.user.id },
    select: {
      id: true,
      totalPrice: true,
      status: true,
      paymentMethod: true,
      country: true,
      region: true,
      street: true,
      coupon: true,
      createdAt: true,
      orderItems: {
        select: {
          quantity: true,
          price: true,
          product: { select: { name: true, image: true, slug: true } },
        },
      },
    },
  });

  if (!order) return null;
  return { ...order, createdAt: order.createdAt.toISOString() } as Order;
}
