"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useQueryState, parseAsInteger, parseAsString } from "nuqs";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Package,
  User,
  MapPin,
  Calendar,
  RefreshCw,
  Eye,
  ShoppingBag,
} from "lucide-react";
import { OrderStatusModal } from "./OrderStatusModal";
import type { Order, OrderStatus, OrderStatusCount } from "../../types";
import { ORDER_STATUS_CONFIG, ORDERS_PER_PAGE } from "../../types";

// ─── API ──────────────────────────────────────────────────────────────────────
async function fetchOrders(params: Record<string, string>): Promise<Order[]> {
  const sp = new URLSearchParams(params);
  const res = await fetch(`/api/admin/orders?${sp}`);
  if (!res.ok) throw new Error("فشل في جلب الطلبات");
  return res.json();
}

async function fetchOrderStats(): Promise<OrderStatusCount[]> {
  const res = await fetch("/api/admin/orders/stats");
  if (!res.ok) throw new Error("فشل في جلب الإحصاءات");
  return res.json();
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = ORDER_STATUS_CONFIG[status];
  return (
    <span
      className="inline-flex items-center gap-1 px-[10px] py-[3px] rounded-[20px] text-[0.78rem] font-semibold whitespace-nowrap border"
      style={{ background: cfg.bg, borderColor: cfg.border, color: cfg.color }}
    >
      {cfg.icon} {cfg.label}
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
interface OrdersClientProps {
  initialParams: Record<string, string>;
}

export function OrdersClient({ initialParams }: OrdersClientProps) {
  const qc = useQueryClient();

  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [statusFilter, setStatusFilter] = useQueryState(
    "status",
    parseAsString,
  );
  const [searchQuery, setSearchQuery] = useQueryState(
    "searchQuery",
    parseAsString.withDefault(""),
  );
  const [searchType, setSearchType] = useQueryState(
    "searchType",
    parseAsString.withDefault("id"),
  );

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const params: Record<string, string> = {
    pageNumber: String(page ?? 1),
    ...(statusFilter && { status: statusFilter }),
    ...(searchQuery && { searchQuery }),
    ...(searchQuery && { searchType: searchType ?? "id" }),
  };

  const {
    data: orders = [],
    isLoading,
    isFetching,
  } = useQuery<Order[]>({
    queryKey: ["admin-orders", params],
    queryFn: () => fetchOrders(params),
    placeholderData: (prev) => prev,
  });

  const { data: stats = [] } = useQuery<OrderStatusCount[]>({
    queryKey: ["admin-order-stats"],
    queryFn: fetchOrderStats,
  });

  const getStatusCount = (s: OrderStatus) =>
    stats.find((st) => st.status === s)?._count.status ?? 0;

  const allCount = stats.reduce((acc, s) => acc + s._count.status, 0);

  const ALL_STATUSES: OrderStatus[] = [
    "PENDING_PAYMENT",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
    "REFUNDED",
  ];

  return (
    <div>
      {/* ─── Header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h2 className="m-0 text-[var(--text-1)] font-bold text-[1.3rem]">
            الطلبات
          </h2>
          <p className="mt-1 mb-0 text-[var(--text-3)] text-[0.82rem]">
            {allCount} طلب إجمالي
          </p>
        </div>
        <button
          onClick={() => qc.invalidateQueries({ queryKey: ["admin-orders"] })}
          className="w-[38px] h-[38px] rounded-[10px] border-[1.5px] border-[var(--border-md)] bg-[var(--bg)] cursor-pointer flex items-center justify-center text-[var(--text-2)]"
          aria-label="تحديث"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      {/* ─── Stats Cards ────────────────────────────────────────── */}
      <div
        className="grid gap-3 mb-5"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))" }}
      >
        {ALL_STATUSES.map((status) => {
          const cfg = ORDER_STATUS_CONFIG[status];
          const count = getStatusCount(status);
          const isActive = statusFilter === status;
          return (
            <motion.button
              key={status}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setStatusFilter(isActive ? null : status);
                setPage(1);
              }}
              className="p-[0.875rem] rounded-[12px] border-[1.5px] cursor-pointer text-right transition-all duration-200 font-inherit"
              style={{
                borderColor: isActive ? cfg.border : "var(--border-md)",
                background: isActive ? cfg.bg : "var(--surface)",
              }}
            >
              <div className="text-2xl mb-[0.3rem]">{cfg.icon}</div>
              <div
                className="font-bold text-[1.3rem]"
                style={{ color: cfg.color }}
              >
                {count}
              </div>
              <div className="text-[var(--text-3)] text-[0.72rem] mt-0.5">
                {cfg.label}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* ─── Filters ────────────────────────────────────────────── */}
      <div className="bg-[var(--surface)] border-[1.5px] border-[var(--border-md)] rounded-[14px] px-4 py-[0.875rem] mb-5 flex gap-3 flex-wrap items-center">
        {/* Status tabs */}
        <div className="flex gap-1 flex-wrap">
          <button
            onClick={() => {
              setStatusFilter(null);
              setPage(1);
            }}
            className="px-[0.875rem] py-[0.4rem] rounded-[20px] border-[1.5px] font-semibold text-[0.8rem] cursor-pointer font-inherit transition-all"
            style={{
              borderColor: !statusFilter ? "var(--gold)" : "var(--border-md)",
              background: !statusFilter ? "var(--gold-bg)" : "transparent",
              color: !statusFilter ? "var(--gold)" : "var(--text-3)",
            }}
          >
            الكل ({allCount})
          </button>
        </div>

        <div className="w-px h-6 bg-[var(--border-md)] mx-1" />

        {/* Search type */}
        <select
          value={searchType ?? "id"}
          onChange={(e) => setSearchType(e.target.value)}
          className="px-3 py-[0.45rem] rounded-[8px] border-[1.5px] border-[var(--border-md)] bg-[var(--bg)] text-[var(--text-1)] text-[0.82rem] font-inherit cursor-pointer outline-none"
          aria-label="نوع البحث"
        >
          <option value="id">بحث بـ ID</option>
          <option value="email">بحث بالإيميل</option>
        </select>

        {/* Search input */}
        <div className="relative flex-[1_1_200px] min-w-[160px]">
          <Search
            size={14}
            color="var(--text-3)"
            className="absolute top-1/2 right-3 -translate-y-1/2"
          />
          <input
            type="search"
            placeholder={
              searchType === "email" ? "email@example.com..." : "رقم الطلب..."
            }
            value={searchQuery ?? ""}
            onChange={(e) => {
              setSearchQuery(e.target.value || null);
              setPage(1);
            }}
            className="w-full pl-3 pr-9 py-[0.45rem] rounded-[8px] border-[1.5px] border-[var(--border-md)] bg-[var(--bg)] text-[var(--text-1)] text-[0.82rem] font-inherit outline-none box-border"
            style={{ direction: searchType === "email" ? "ltr" : "rtl" }}
          />
        </div>
      </div>

      {/* ─── Orders Table ───────────────────────────────────────── */}
      <div className="bg-[var(--surface)] border-[1.5px] border-[var(--border-md)] rounded-[16px] overflow-hidden">
        {isLoading && (
          <div className="py-16 text-center text-[var(--text-3)]">
            جاري التحميل...
          </div>
        )}

        {!isLoading && orders.length === 0 && (
          <div className="py-16 text-center">
            <ShoppingBag
              size={40}
              color="var(--border-md)"
              className="mx-auto mb-4"
            />
            <div className="text-[var(--text-3)] text-[0.9rem]">
              لا توجد طلبات مطابقة
            </div>
          </div>
        )}

        {!isLoading && orders.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[var(--bg)] border-b-[1.5px] border-[var(--border-md)]">
                  {[
                    "#",
                    "العميل",
                    "المبلغ",
                    "الحالة",
                    "طريقة الدفع",
                    "التاريخ",
                    "إجراءات",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-[0.875rem] text-right text-[var(--text-3)] font-semibold text-[0.78rem] uppercase tracking-[0.06em] whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order, idx) => (
                  <>
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      className="border-b border-[var(--border)] cursor-pointer transition-colors duration-150 hover:bg-[var(--bg)]"
                    >
                      {/* Order ID */}
                      <td className="px-4 py-[0.875rem]">
                        <div
                          className="text-[var(--text-2)] font-semibold text-[0.8rem] max-w-[120px] overflow-hidden text-ellipsis text-right"
                          style={{ direction: "ltr" }}
                          title={order.id}
                        >
                          #{order.id.slice(-8).toUpperCase()}
                        </div>
                        <div className="text-[var(--text-3)] text-[0.72rem] mt-px">
                          {order.orderItems.length} منتج
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="px-4 py-[0.875rem]">
                        <div className="flex items-center gap-[0.625rem]">
                          <div className="w-9 h-9 rounded-full overflow-hidden border-[1.5px] border-[var(--border-md)] bg-[var(--bg-deep)] flex items-center justify-center shrink-0">
                            {order.user.image ?
                              <Image
                                src={order.user.image}
                                alt={order.user.name ?? ""}
                                width={36}
                                height={36}
                                className="object-cover"
                              />
                            : <User size={16} color="var(--text-3)" />}
                          </div>
                          <div>
                            <div className="text-[var(--text-1)] font-semibold text-[0.85rem]">
                              {order.user.name ?? "—"}
                            </div>
                            <div
                              className="text-[var(--text-3)] text-[0.75rem] text-right"
                              style={{ direction: "ltr" }}
                            >
                              {order.user.email ?? "—"}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-[0.875rem]">
                        <div className="text-[var(--text-1)] font-bold text-[0.9rem]">
                          {order.totalPrice.toLocaleString("en-US")} ج
                        </div>
                        <div className="text-[var(--cyan)] text-[0.75rem] mt-px">
                          ربح:{" "}
                          {(
                            order.totalPrice - order.totalCostPrice
                          ).toLocaleString("en-US")}{" "}
                          ج
                        </div>
                        {order.coupon && (
                          <div className="text-[var(--cyan-bright)] text-[0.72rem]">
                            كوبون: {order.coupon}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-[0.875rem]">
                        <StatusBadge status={order.status} />
                      </td>

                      {/* Payment */}
                      <td className="px-4 py-[0.875rem]">
                        <span className="text-[var(--text-2)] text-[0.82rem]">
                          {order.paymentMethod}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-[0.875rem]">
                        <div className="flex items-center gap-1 text-[var(--text-2)] text-[0.8rem]">
                          <Calendar size={13} />
                          {new Date(order.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-[var(--text-3)] text-[0.72rem] mt-0.5">
                          <MapPin size={11} />
                          {order.country} · {order.region}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-[0.875rem]">
                        <div className="flex gap-1.5">
                          <button
                            onClick={() =>
                              setExpandedOrder(
                                expandedOrder === order.id ? null : order.id,
                              )
                            }
                            className="w-[34px] h-[34px] rounded-[8px] border-[1.5px] border-[var(--border-md)] bg-[var(--bg)] cursor-pointer flex items-center justify-center text-[var(--cyan)] transition-all duration-150"
                            aria-label="عرض التفاصيل"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="px-[0.875rem] h-[34px] rounded-[8px] border-[1.5px] border-[var(--border-md)] bg-[var(--gold-bg)] text-[var(--gold)] font-semibold text-[0.78rem] cursor-pointer font-inherit whitespace-nowrap"
                          >
                            تغيير الحالة
                          </button>
                        </div>
                      </td>
                    </motion.tr>

                    {/* Expanded order items */}
                    <AnimatePresence>
                      {expandedOrder === order.id && (
                        <tr key={`${order.id}-expanded`}>
                          <td colSpan={7} className="p-0">
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden bg-[var(--bg)] border-b border-[var(--border-md)]"
                            >
                              <div className="px-6 py-4">
                                <div className="text-[var(--text-2)] font-semibold text-[0.85rem] mb-3">
                                  المنتجات في الطلب:
                                </div>
                                <div className="flex flex-wrap gap-[0.625rem]">
                                  {order.orderItems.map((item) => (
                                    <div
                                      key={item.id}
                                      className="flex items-center gap-[0.625rem] bg-[var(--surface)] border border-[var(--border-md)] rounded-[10px] px-3 py-2 min-w-[200px]"
                                    >
                                      <div className="w-10 h-10 rounded-[8px] overflow-hidden border border-[var(--border-md)] shrink-0 bg-[var(--bg-deep)]">
                                        <Image
                                          src={item.product.image}
                                          alt={item.product.name}
                                          width={40}
                                          height={40}
                                          className="object-cover w-full h-full"
                                        />
                                      </div>
                                      <div>
                                        <div className="text-[var(--text-1)] font-semibold text-[0.82rem]">
                                          {item.product.name}
                                        </div>
                                        <div className="text-[var(--text-3)] text-[0.75rem]">
                                          × {item.quantity} —{" "}
                                          {item.price.toLocaleString("en-US")} ج
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <div className="mt-3 text-[var(--text-3)] text-[0.8rem]">
                                  العنوان: {order.country}، {order.region}
                                  {order.street && `، ${order.street}`} | ☎️{" "}
                                  {order.phoneNumber}
                                </div>
                              </div>
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── Pagination ─────────────────────────────────────────── */}
      {orders.length > 0 && (
        <div className="flex items-center justify-between mt-4 px-5 py-[0.875rem] bg-[var(--surface)] border-[1.5px] border-[var(--border-md)] rounded-[12px] flex-wrap gap-3">
          <span className="text-[var(--text-3)] text-[0.82rem]">
            صفحة {page}
          </span>
          <div className="flex gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, (p ?? 1) - 1))}
              disabled={(page ?? 1) <= 1}
              className="w-9 h-9 rounded-[8px] border-[1.5px] border-[var(--border-md)] flex items-center justify-center transition-all"
              style={{
                background: (page ?? 1) <= 1 ? "var(--bg)" : "var(--surface)",
                color: (page ?? 1) <= 1 ? "var(--text-3)" : "var(--text-1)",
                cursor: (page ?? 1) <= 1 ? "not-allowed" : "pointer",
              }}
              aria-label="الصفحة السابقة"
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={() => setPage((p) => (p ?? 1) + 1)}
              disabled={orders.length < ORDERS_PER_PAGE}
              className="w-9 h-9 rounded-[8px] border-[1.5px] border-[var(--border-md)] flex items-center justify-center transition-all"
              style={{
                background:
                  orders.length < ORDERS_PER_PAGE ?
                    "var(--bg)"
                  : "var(--surface)",
                color:
                  orders.length < ORDERS_PER_PAGE ?
                    "var(--text-3)"
                  : "var(--text-1)",
                cursor:
                  orders.length < ORDERS_PER_PAGE ? "not-allowed" : "pointer",
              }}
              aria-label="الصفحة التالية"
            >
              <ChevronLeft size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ─── Status Modal ───────────────────────────────────────── */}
      <AnimatePresence>
        {selectedOrder && (
          <OrderStatusModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
