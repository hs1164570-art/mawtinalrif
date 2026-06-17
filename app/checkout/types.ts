// app/checkout/types.ts

export interface CheckoutItem {
  productId: string;
  quantity: number;
  price: number;
  name: string;
  image: string;
  slug: string;
  inStock: boolean;
  countStock: number;
  discount: number | null;
}

export type CheckoutStep = 1 | 2 | 3;

export interface PendingOrderResult {
  paypalOrderId: string;
  totalPrice: number;
}

export const SAUDI_REGIONS = [
  "الرياض",
  "مكة المكرمة",
  "المدينة المنورة",
  "القصيم",
  "المنطقة الشرقية",
  "عسير",
  "تبوك",
  "حائل",
  "الحدود الشمالية",
  "جازان",
  "نجران",
  "الباحة",
  "الجوف",
] as const;

export type SaudiRegion = (typeof SAUDI_REGIONS)[number];
