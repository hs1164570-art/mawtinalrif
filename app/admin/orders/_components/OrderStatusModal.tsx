"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { X, CheckCircle, ShoppingBag } from "lucide-react";
import type { Order, OrderStatus } from "../../types";
import { ORDER_STATUS_CONFIG } from "../../types";

// ─── API ──────────────────────────────────────────────────────────────────────
async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const res = await fetch("/api/products/order", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId, status }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "فشل في تحديث الحالة");
  }
  return res.json();
}

// ─── Status flow (logical order) ─────────────────────────────────────────────
const STATUS_ORDER: OrderStatus[] = [
  "PENDING_PAYMENT",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

interface OrderStatusModalProps {
  order: Order;
  onClose: () => void;
}

export function OrderStatusModal({ order, onClose }: OrderStatusModalProps) {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<OrderStatus>(order.status);
  const currentCfg = ORDER_STATUS_CONFIG[order.status];

  const mutation = useMutation({
    mutationFn: (status: OrderStatus) => updateOrderStatus(order.id, status),
    onSuccess: () => {
      toast.success("✅ تم تحديث حالة الطلب بنجاح");
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
      qc.invalidateQueries({ queryKey: ["admin-order-stats"] });
      onClose();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const hasChanged = selected !== order.status;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0"
        style={{
          background: "var(--gold-bg)",
          backdropFilter: "blur(6px)",
        }}
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ scale: 0.95, y: 12 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 12 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative bg-[var(--surface)] rounded-3xl w-full max-w-[480px] overflow-hidden"
        style={{ boxShadow: "var(--shadow-md)" }}
      >
        {/* Header */}
        <div
          className="p-6 flex items-start gap-4"
          style={{
            background: "var(--bg)",
            borderBottom: "1.5px solid var(--border-md)",
          }}
        >
          <div
            className="w-12 h-12 rounded-[13px] flex items-center justify-center shrink-0"
            style={{
              background: "linear-gradient(135deg,var(--gold),var(--gold-mid))",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <ShoppingBag size={22} color="var(--text-inv)" />
          </div>

          <div className="flex-1">
            <h3
              className="font-bold text-[1.05rem] mb-1.5"
              style={{ color: "var(--text-1)" }}
            >
              تحديث حالة الطلب
            </h3>
            <div className="flex gap-2.5 flex-wrap items-center">
              <span
                className="bg-[var(--surface)] rounded-md px-2 py-0.5 text-xs font-mono ltr"
                style={{
                  border: "1px solid var(--border-md)",
                  color: "var(--text-2)",
                }}
              >
                #{order.id.slice(-8).toUpperCase()}
              </span>
              <span
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                style={{
                  background: currentCfg.bg,
                  border: `1px solid ${currentCfg.border}`,
                  color: currentCfg.color,
                }}
              >
                {currentCfg.icon} {currentCfg.label}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-[34px] h-[34px] rounded-lg bg-[var(--surface)] flex items-center justify-center cursor-pointer"
            style={{
              border: "1.5px solid var(--border-md)",
              color: "var(--text-3)",
            }}
            aria-label="إغلاق"
          >
            <X size={15} />
          </button>
        </div>

        {/* Status options */}
        <div className="p-5">
          <p className="text-[0.82rem] mb-4" style={{ color: "var(--text-3)" }}>
            اختر الحالة الجديدة للطلب:
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            {STATUS_ORDER.map((status) => {
              const cfg = ORDER_STATUS_CONFIG[status];
              const isCurrent = status === order.status;
              const isSelected = status === selected;

              return (
                <motion.button
                  key={status}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelected(status)}
                  className="p-3.5 rounded-xl cursor-pointer text-right relative font-[inherit] transition-all duration-[180ms]"
                  style={{
                    border: `2px solid ${isSelected ? cfg.border : "var(--border-md)"}`,
                    background:
                      isSelected ? cfg.bg
                      : isCurrent ? "var(--bg)"
                      : "var(--surface)",
                    outline: isSelected ? `2px solid ${cfg.color}` : "none",
                    outlineOffset: 1,
                  }}
                  aria-pressed={isSelected}
                  aria-label={cfg.label}
                >
                  {/* Selected checkmark */}
                  {isSelected && (
                    <div
                      className="absolute top-2 left-2 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: cfg.color }}
                    >
                      <CheckCircle
                        size={13}
                        color="var(--text-inv)"
                        strokeWidth={2.5}
                      />
                    </div>
                  )}

                  <div className="text-[1.4rem] mb-1">{cfg.icon}</div>
                  <div
                    className="text-sm"
                    style={{
                      color: isSelected ? cfg.color : "var(--text-1)",
                      fontWeight: isSelected ? 700 : 500,
                    }}
                  >
                    {cfg.label}
                  </div>
                  {isCurrent && (
                    <div
                      className="mt-0.5 text-[0.7rem] flex items-center gap-1"
                      style={{ color: "var(--text-3)" }}
                    >
                      الحالة الحالية
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-5 py-4 flex gap-3 items-center"
          style={{
            borderTop: "1.5px solid var(--border-md)",
            background: "var(--bg)",
          }}
        >
          {hasChanged && (
            <div
              className="flex-1 text-[0.8rem]"
              style={{ color: "var(--text-2)" }}
            >
              ستتغير إلى:{" "}
              <strong style={{ color: ORDER_STATUS_CONFIG[selected].color }}>
                {ORDER_STATUS_CONFIG[selected].label}
              </strong>
            </div>
          )}
          {!hasChanged && (
            <div
              className="flex-1 text-[0.8rem]"
              style={{ color: "var(--text-3)" }}
            >
              اختر حالة مختلفة للتحديث
            </div>
          )}

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-[10px] bg-[var(--surface)] font-medium cursor-pointer text-sm font-[inherit]"
            style={{
              border: "1.5px solid var(--border-md)",
              color: "var(--text-1)",
            }}
          >
            إلغاء
          </button>

          <motion.button
            whileHover={
              hasChanged && !mutation.isPending ? { scale: 1.03 } : {}
            }
            whileTap={hasChanged && !mutation.isPending ? { scale: 0.97 } : {}}
            onClick={() => hasChanged && mutation.mutate(selected)}
            disabled={!hasChanged || mutation.isPending}
            className="px-6 py-2.5 rounded-[10px] border-none font-bold text-sm font-[inherit] transition-all duration-200"
            style={{
              background:
                !hasChanged || mutation.isPending ?
                  "var(--border-md)"
                : "linear-gradient(135deg,var(--gold),var(--gold-mid))",
              color: "var(--text-inv)",
              cursor:
                !hasChanged || mutation.isPending ? "not-allowed" : "pointer",
              boxShadow:
                hasChanged && !mutation.isPending ? "var(--shadow-md)" : "none",
            }}
          >
            {mutation.isPending ? "جاري التحديث..." : "تأكيد التحديث"}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
