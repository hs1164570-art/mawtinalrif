import type { OrderStatus } from "@/utils";

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; bg: string; color: string; dot: string }
> = {
  PENDING_PAYMENT: {
    label: "Pending Payment",
    bg: "bg-[rgba(217,119,6,0.10)]",
    color: "text-[#b45309]",
    dot: "bg-[#d97706]",
  },
  PROCESSING: {
    label: "Processing",
    bg: "bg-[rgba(37,99,235,0.10)]",
    color: "text-[#1d4ed8]",
    dot: "bg-[#3b82f6]",
  },
  SHIPPED: {
    label: "Shipped",
    bg: "bg-[rgba(109,40,217,0.10)]",
    color: "text-[#7c3aed]",
    dot: "bg-[#8b5cf6]",
  },
  DELIVERED: {
    label: "Delivered",
    bg: "bg-[rgba(22,163,74,0.10)]",
    color: "text-[#15803d]",
    dot: "bg-[#22c55e]",
  },
  CANCELLED: {
    label: "Cancelled",
    bg: "bg-[rgba(185,28,28,0.10)]",
    color: "text-[#b91c1c]",
    dot: "bg-[#ef4444]",
  },
  REFUNDED: {
    label: "Refunded",
    bg: "bg-[rgba(100,116,139,0.10)]",
    color: "text-[#475569]",
    dot: "bg-[#94a3b8]",
  },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      role="status"
      aria-label={`Order status: ${cfg.label}`}
      className={`inline-flex items-center gap-1.25 px-2.5 py-0.75 rounded-full text-[0.72rem] font-bold tracking-[0.03em] whitespace-nowrap ${cfg.bg} ${cfg.color}`}
    >
      <span
        aria-hidden="true"
        className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`}
      />
      {cfg.label}
    </span>
  );
}
