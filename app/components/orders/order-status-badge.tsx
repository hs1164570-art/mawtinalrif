import type { OrderStatus } from "@/utils";

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; bg: string; color: string; dot: string }
> = {
  PENDING_PAYMENT: {
    label: "Pending Payment",
    bg: "rgba(217,119,6,0.10)",
    color: "#b45309",
    dot: "#d97706",
  },
  PROCESSING: {
    label: "Processing",
    bg: "rgba(37,99,235,0.10)",
    color: "#1d4ed8",
    dot: "#3b82f6",
  },
  SHIPPED: {
    label: "Shipped",
    bg: "rgba(109,40,217,0.10)",
    color: "#7c3aed",
    dot: "#8b5cf6",
  },
  DELIVERED: {
    label: "Delivered",
    bg: "rgba(22,163,74,0.10)",
    color: "#15803d",
    dot: "#22c55e",
  },
  CANCELLED: {
    label: "Cancelled",
    bg: "rgba(185,28,28,0.10)",
    color: "#b91c1c",
    dot: "#ef4444",
  },
  REFUNDED: {
    label: "Refunded",
    bg: "rgba(100,116,139,0.10)",
    color: "#475569",
    dot: "#94a3b8",
  },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      role="status"
      aria-label={`Order status: ${cfg.label}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        padding: "3px 10px",
        background: cfg.bg,
        color: cfg.color,
        borderRadius: "99px",
        fontSize: "0.72rem",
        fontWeight: 700,
        letterSpacing: "0.03em",
        whiteSpace: "nowrap",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: cfg.dot,
          flexShrink: 0,
        }}
      />
      {cfg.label}
    </span>
  );
}
