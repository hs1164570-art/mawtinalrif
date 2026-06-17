"use server";

import { auth } from "@/auth";
import prisma from "@/lib/db";
import type { UserProfile } from "../../utils/index";

export async function getUserProfile(): Promise<UserProfile | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const profile = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      status: true,
      country: true,
      createdAt: true,
      cart: {
        take: 4,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          quantity: true,
          productId: true,
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              discount: true,
              image: true,
              slug: true,
              inStock: true,
              countStock: true,
            },
          },
        },
      },
      order: {
        take: 3,
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
              product: { select: { name: true, image: true, slug: true } },
            },
          },
        },
      },
    },
  });

  if (!profile) return null;

  return {
    ...profile,
    createdAt: profile.createdAt.toISOString(),
    order: profile.order.map((o) => ({
      ...o,
      createdAt: o.createdAt.toISOString(),
    })),
  } as UserProfile;
}
