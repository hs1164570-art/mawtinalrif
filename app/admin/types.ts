// ─── Enums ───────────────────────────────────────────────────────────────────
export type OrderStatus =
  | "PENDING_PAYMENT"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export type UserStatus = "ACTIVE" | "BANNED";
export type Role = "USER" | "ADMIN";
export type PaymentMethod = "PAYPAL";

// ─── Prisma Models ────────────────────────────────────────────────────────────
export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
  parentId?: string | null;
  children?: Category[];
  _count?: { products: number };
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  costPrice: number;
  image: string;
  gallery: string[];
  rating: number;
  inStock: boolean;
  countStock: number;
  discount?: number | null;
  slug: string;
  subCategoryId: string;
  category?: { name: string };
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    image: string;
    price: number;
    costPrice: number;
    slug: string;
    inStock: boolean;
    countStock: number;
  };
}

export interface Order {
  id: string;
  totalPrice: number;
  totalCostPrice: number;
  phoneNumber: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  coupon?: string | null;
  country: string;
  region: string;
  street?: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    status: UserStatus;
  };
  orderItems: OrderItem[];
}

export interface AdminUser {
  id: string;
  name?: string | null;
  email?: string | null;
  role: Role;
  status: UserStatus;
  country: string;
  image?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { order: number };
}

export interface ProductsResponse {
  products: Product[];
  meta: {
    totalCount: number;
    totalPages: number;
    currentPage: number;
  };
}

export type OrderStatusCount = {
  status: OrderStatus;
  _count: { status: number };
};

export type UserStatusCount = {
  status: UserStatus;
  _count: { status: number };
};

// ─── UI Config ────────────────────────────────────────────────────────────────
export const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; bg: string; border: string; icon: string }
> = {
  PENDING_PAYMENT: {
    label: "بانتظار الدفع",
    color: "#7A9BBF",
    bg: "#EEF3F9",
    border: "#BDD1E8",
    icon: "⏳",
  },
  PROCESSING: {
    label: "قيد المعالجة",
    color: "#B89A5A",
    bg: "#FBF6EC",
    border: "#DDD0B0",
    icon: "⚙️",
  },
  SHIPPED: {
    label: "تم الشحن",
    color: "#6B4C3B",
    bg: "#F5EFE6",
    border: "#C8B9AD",
    icon: "🚚",
  },
  DELIVERED: {
    label: "تم التسليم",
    color: "#6A9E7F",
    bg: "#EEF7F2",
    border: "#B3D5C3",
    icon: "✅",
  },
  CANCELLED: {
    label: "ملغي",
    color: "#C4614A",
    bg: "#FBF0EE",
    border: "#E8C3BB",
    icon: "❌",
  },
  REFUNDED: {
    label: "مسترد",
    color: "#A89585",
    bg: "#F5EFE6",
    border: "#D4C7BC",
    icon: "↩️",
  },
};

export const USER_STATUS_CONFIG: Record<
  UserStatus,
  { label: string; color: string; bg: string; border: string }
> = {
  ACTIVE: { label: "نشط", color: "#6A9E7F", bg: "#EEF7F2", border: "#B3D5C3" },
  BANNED: {
    label: "محظور",
    color: "#C4614A",
    bg: "#FBF0EE",
    border: "#E8C3BB",
  },
};

export const COLORS = {
  bg: "#FAF7F2",
  card: "#FFFFFF",
  cream: "#F5EFE6",
  gold: "#B89A5A",
  goldLight: "#D4BC8A",
  espresso: "#3D2B1F",
  brown: "#6B4C3B",
  muted: "#A89585",
  green: "#6A9E7F",
  red: "#C4614A",
  blue: "#7A9BBF",
  border: "#EDE5D8",
} as const;

export const LOW_STOCK_THRESHOLD = 10;
export const PRODUCTS_PER_PAGE = 12;
export const ORDERS_PER_PAGE = 15;
export const USERS_PER_PAGE = 15;
