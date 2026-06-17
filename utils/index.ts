// ─── Cart ────────────────────────────────────────────────────────────────────
export type CartProduct = {
  id: string;
  name: string;
  price: number;
  discount: number | null;
  image: string;
  slug: string;
  inStock: boolean;
  countStock: number;
};

export type CartItemFromDB = {
  id: string;
  quantity: number;
  productId: string;
  product: CartProduct;
};

/** Item stored in localStorage when user is a guest */
export type LocalCartItem = {
  localId: string; // crypto.randomUUID() — used as React key & mutation key
  productId: string;
  quantity: number;
  addedAt: Date; // ISO string
  product: CartProduct;
};

/** Unified shape used in the UI regardless of source */
export type CartItem = {
  id: string; // cartId (DB) | localId (localStorage)
  productId: string;
  quantity: number;
  product: CartProduct;
  source: "db" | "local";
};

// ─── Orders ──────────────────────────────────────────────────────────────────
export type OrderStatus =
  | "PENDING_PAYMENT"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export type PaymentMethod = "PAYPAL";

export type OrderItemType = {
  quantity: number;
  price: number;
  product: {
    name: string;
    image: string;
    slug: string;
  };
};

export type Order = {
  id: string;
  totalPrice: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  country: string;
  region: string;
  street: string | null;
  coupon: string | null;
  createdAt: string;
  orderItems: OrderItemType[];
};

// ─── Profile ─────────────────────────────────────────────────────────────────
export type UserProfile = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: "USER" | "ADMIN";
  status: "ACTIVE" | "BANNED";
  country: string;
  createdAt: string;
  cart: CartItemFromDB[];
  order: Order[];
};
