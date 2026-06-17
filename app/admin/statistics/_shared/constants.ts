import type { Timeframe } from "./types";

// ─── Palette ─────────────────────────────────────────────────────────────────
export const PALETTE = {
  warmWhite: "#FAF7F2",
  white: "#FFFFFF",
  cream: "#F5EFE6",
  gold: "#B89A5A",
  goldLight: "#D4B97A",
  espresso: "#3D2B1F",
  medBrown: "#6B4C3B",
  muted: "#A89585",
  border: "#EDE5D8",
  sage: "#6A9E7F",
  sageLight: "#8BBF9F",
  terra: "#C4614A",
  terraLight: "#D4806C",
  blue: "#7A9BBF",
  blueLight: "#9AB5D4",
} as const;

// ─── Chart color sequences (one per series slot) ──────────────────────────
export const CHART_COLORS = [
  PALETTE.gold,
  PALETTE.sage,
  PALETTE.blue,
  PALETTE.terra,
  PALETTE.medBrown,
  PALETTE.muted,
] as const;

// ─── Timeframe options ────────────────────────────────────────────────────────
export const TIMEFRAME_OPTIONS: Array<{
  value: Timeframe;
  label: string;
  shortLabel: string;
}> = [
  { value: "7d", label: "آخر ٧ أيام", shortLabel: "٧ أيام" },
  { value: "30d", label: "آخر ٣٠ يوم", shortLabel: "٣٠ يوم" },
  { value: "90d", label: "آخر ٩٠ يوم", shortLabel: "٩٠ يوم" },
  { value: "year", label: "هذه السنة", shortLabel: "السنة" },
  { value: "custom", label: "نطاق مخصص", shortLabel: "مخصص" },
];

// ─── Order status config ──────────────────────────────────────────────────────
export const ORDER_STATUS_CONFIG = {
  PENDING_PAYMENT: {
    label: "انتظار الدفع",
    color: PALETTE.blue,
    bg: "#EBF2F8",
  },
  PROCESSING: { label: "قيد التجهيز", color: PALETTE.gold, bg: "#F8F3EB" },
  SHIPPED: { label: "تم الشحن", color: PALETTE.blue, bg: "#EBF2F8" },
  DELIVERED: { label: "تم التسليم", color: PALETTE.sage, bg: "#EBF5EF" },
  CANCELLED: { label: "ملغي", color: PALETTE.terra, bg: "#F8EEEB" },
  REFUNDED: { label: "مسترجع", color: PALETTE.muted, bg: "#F3EFEC" },
} as const;

// ─── Stale / cache times ──────────────────────────────────────────────────────
export const STALE_TIME_ANALYTICS = 60 * 60 * 1000; // 1 hour
export const STALE_TIME_PRODUCTS = 60 * 60 * 1000; // 1 hour

// ─── i18n labels used across all pages ───────────────────────────────────────
export const LABELS = {
  revenue: "إجمالي المبيعات",
  profit: "صافي الأرباح",
  profitMargin: "هامش الربح",
  costs: "التكاليف",
  totalOrders: "إجمالي الطلبات",
  pending: "قيد الانتظار",
  processing: "قيد التجهيز",
  done: "مكتمل",
  cancelled: "ملغي",
  topSeller: "الأعلى مبيعاً",
  topCarted: "الأكثر إضافةً للسلة",
  topViewed: "الأعلى مشاهدة",
  vsLastPeriod: "مقارنةً بالفترة السابقة",
  expand: "توسيع الشارت",
  export: "تصدير البيانات",
  comparison: "عرض المقارنة",
  currentPeriod: "الفترة الحالية",
  prevPeriod: "الفترة السابقة",
  noData: "لا توجد بيانات كافية لهذه الفترة",
} as const;
