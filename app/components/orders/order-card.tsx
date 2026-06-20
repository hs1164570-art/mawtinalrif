"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, MapPin, CreditCard, Package } from "lucide-react";
import { OrderStatusBadge } from "./order-status-badge";
import type { Order } from "@/utils";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(iso));
}

export function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  const totalQty = order.orderItems.reduce((s, i) => s + i.quantity, 0);
  const previewItems = order.orderItems.slice(0, 3);
  const remaining = order.orderItems.length - 3;

  return (
    <article
      aria-label={`Order ${order.id.slice(-8).toUpperCase()}`}
      className="bg-[var(--surface)] border border-[var(--border-md)] rounded-[18px] overflow-hidden shadow-[0_1px_6px_rgba(90,60,20,0.05)] hover:shadow-[0_4px_18px_rgba(90,60,20,0.10)] transition-shadow duration-200 ease-in-out"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-[var(--border)] flex flex-wrap gap-3 items-center justify-between bg-[var(--surface-2)]">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <p className="m-0 text-[0.68rem] text-[var(--text-3)] font-semibold tracking-[0.06em] uppercase">
              Order
            </p>
            <p className="m-0 text-[0.85rem] font-extrabold text-[var(--text-1)] tracking-[0.04em] font-mono">
              #{order.id.slice(-8).toUpperCase()}
            </p>
          </div>

          <div
            aria-hidden="true"
            className="w-px h-7 bg-[var(--border-md)] shrink-0"
          />

          <div>
            <p className="m-0 text-[0.68rem] text-[var(--text-3)] font-semibold tracking-[0.04em] uppercase">
              Date
            </p>
            <p className="m-0 text-[0.82rem] font-semibold text-[var(--text-2)]">
              {formatDate(order.createdAt)}
            </p>
          </div>

          <div
            aria-hidden="true"
            className="w-px h-7 bg-[var(--border-md)] shrink-0"
          />

          <div>
            <p className="m-0 text-[0.68rem] text-[var(--text-3)] font-semibold tracking-[0.04em] uppercase">
              Items
            </p>
            <p className="m-0 text-[0.82rem] font-semibold text-[var(--text-2)]">
              {totalQty} item{totalQty !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <OrderStatusBadge status={order.status} />
      </div>

      {/* Product previews */}
      <div className="px-5 py-4 flex flex-col gap-3.5">
        <div className="flex flex-wrap gap-2.5 items-center">
          {previewItems.map((item, idx) => (
            <Link
              key={idx}
              href={`/products/${item.product.slug}`}
              aria-label={`View ${item.product.name}`}
              className="relative w-13 h-13 rounded-n-[10px] overflow-hidden border border-[var(--border-md)] shrink-0 block"
              style={{ width: "52px", height: "52px", borderRadius: "10px" }}
            >
              <Image
                src={item.product.image}
                alt={item.product.name}
                fill
                sizes="52px"
                className="object-cover"
              />
              {item.quantity > 1 && (
                <span
                  aria-label={`Quantity: ${item.quantity}`}
                  className="absolute bottom-0.5 right-0.5 bg-black/65 text-white text-[0.6rem] font-extrabold px-1 py-0.25 rounded-[4px] style-line-height"
                  style={{ lineHeight: 1.3 }}
                >
                  ×{item.quantity}
                </span>
              )}
            </Link>
          ))}
          {remaining > 0 && (
            <div
              aria-label={`${remaining} more items`}
              className="w-13 h-13 rounded-[10px] border border-dashed border-[var(--border-strong)] flex items-center justify-center text-[0.72rem] font-bold text-[var(--text-3)] bg-[var(--bg)] shrink-0"
              style={{ width: "52px", height: "52px" }}
            >
              +{remaining}
            </div>
          )}
        </div>

        {/* Expand toggle */}
        {expanded && (
          <div className="flex flex-col gap-2 p-3 bg-[var(--bg)] rounded-[10px] border border-[var(--border)]">
            {order.orderItems.map((item, idx) => (
              <div
                key={idx}
                className={`flex justify-between items-center gap-3 py-1.5 ${
                  idx < order.orderItems.length - 1 ?
                    "border-b border-[var(--border)]"
                  : ""
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative w-9 h-9 rounded-[6px] overflow-hidden shrink-0">
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      sizes="36px"
                      className="object-cover"
                    />
                  </div>
                  <span className="text-[0.82rem] text-[var(--text-2)] font-medium overflow-hidden text-ellipsis whitespace-nowrap">
                    {item.product.name}
                  </span>
                </div>
                <span className="text-[0.8rem] text-[var(--text-3)] whitespace-nowrap shrink-0">
                  ×{item.quantity} · ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Meta */}
          <div className="flex flex-wrap gap-3.5">
            <div className="flex items-center gap-1.25 text-[0.75rem] text-[var(--text-3)]">
              <CreditCard size={12} className="inline-block" />
              <span className="ml-1.25">{order.paymentMethod}</span>
              {order.coupon && (
                <span className="ml-1 px-1.5 py-0.5 bg-[rgba(22,163,74,0.08)] text-[#15803d] rounded-[6px] font-bold text-[0.68rem]">
                  {order.coupon}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.25 text-[0.75rem] text-[var(--text-3)]">
              <MapPin size={12} className="inline-block" />
              <span className="ml-1.25">
                {order.region}, {order.country}
              </span>
            </div>
          </div>

          {/* Total + expand */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="m-0 text-[0.68rem] text-[var(--text-3)] font-semibold uppercase tracking-[0.04em]">
                Total
              </p>
              <p className="m-0 text-[1.05rem] font-extrabold text-[var(--gold)] tracking-[-0.02em]">
                ${order.totalPrice.toFixed(2)}
              </p>
            </div>

            <button
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              aria-label={
                expanded ? "Collapse order details" : "Expand order details"
              }
              className="w-8 h-8 rounded-[8px] border border-[var(--border-md)] bg-[var(--bg)] text-[var(--text-3)] cursor-pointer flex items-center justify-center transition-all duration-200 ease-in-out"
            >
              <ChevronDown
                size={14}
                className="transition-transform duration-200 ease-in-out"
                style={{
                  transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export function OrderCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="bg-[var(--surface)] border border-[var(--border)] rounded-[18px] overflow-hidden"
    >
      <div className="px-5 py-4 bg-[var(--surface-2)] flex gap-4 border-b border-[var(--border)]">
        {[80, 60, 50].map((w, i) => (
          <div
            key={i}
            style={{ width: `${w}px` }}
            className="h-8 rounded-[6px] bg-[var(--bg-deep)] animate-pulse"
          />
        ))}
      </div>
      <div className="px-5 py-4 flex gap-2.5">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-13 h-13 rounded-[10px] bg-[var(--bg-deep)] animate-pulse"
            style={{ width: "52px", height: "52px" }}
          />
        ))}
      </div>
    </div>
  );
}
