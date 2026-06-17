// app/checkout/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import CheckoutClient from "./CheckoutClient";
import type { CheckoutItem } from "./types";

export const metadata = {
  title: "إتمام الطلب | موطن الريف",
  description: "أكمل طلبك بأمان وسرعة",
};

export default async function CheckoutPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login?callbackUrl=/checkout");
  }

  const cartItems = await prisma.cart.findMany({
    where: { userId: session.user.id },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          price: true,
          image: true,
          slug: true,
          inStock: true,
          countStock: true,
          discount: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  if (!cartItems.length) {
    redirect("/cart");
  }

  const items: CheckoutItem[] = cartItems.map((c) => ({
    productId: c.product.id,
    quantity: c.quantity,
    price: c.product.price,
    name: c.product.name,
    image: c.product.image,
    slug: c.product.slug,
    inStock: c.product.inStock,
    countStock: c.product.countStock,
    discount: c.product.discount,
  }));

  return (
    <CheckoutClient
      items={items}
      // PayPal client ID passed server-side so it stays out of NEXT_PUBLIC_ env
      paypalClientId={process.env.PAYPAL_CLIENT_ID!}
    />
  );
}
