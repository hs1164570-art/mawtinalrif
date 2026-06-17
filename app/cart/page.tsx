// app/cart/page.tsx
import { auth } from "@/auth";
import { getCartFromDB } from "../actions/cart";
import { CartClient } from "./cart-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cart | مواطن الريف",
  description: "Review your selected items and proceed to checkout.",
};

export default async function CartPage() {
  const session = await auth();
  const isAuthenticated = !!session?.user?.id;

  // Prefetch DB cart on the server for authenticated users
  const initialCartData = isAuthenticated ? await getCartFromDB() : [];

  return (
    <CartClient
      initialCartData={initialCartData}
      isAuthenticated={isAuthenticated}
    />
  );
}
