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
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border-md)",
        borderRadius: "18px",
        overflow: "hidden",
        boxShadow: "0 1px 6px rgba(90,60,20,0.05)",
        transition: "box-shadow 0.2s ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow =
          "0 4px 18px rgba(90,60,20,0.10)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow =
          "0 1px 6px rgba(90,60,20,0.05)";
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
          alignItems: "center",
          justifyContent: "space-between",
          background: "var(--surface-2)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "16px",
            alignItems: "center",
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                fontSize: "0.68rem",
                color: "var(--text-3)",
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              Order
            </p>
            <p
              style={{
                margin: 0,
                fontSize: "0.85rem",
                fontWeight: 800,
                color: "var(--text-1)",
                letterSpacing: "0.04em",
                fontFamily: "monospace",
              }}
            >
              #{order.id.slice(-8).toUpperCase()}
            </p>
          </div>

          <div
            aria-hidden="true"
            style={{
              width: 1,
              height: 28,
              background: "var(--border-md)",
              flexShrink: 0,
            }}
          />

          <div>
            <p
              style={{
                margin: 0,
                fontSize: "0.68rem",
                color: "var(--text-3)",
                fontWeight: 600,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              Date
            </p>
            <p
              style={{
                margin: 0,
                fontSize: "0.82rem",
                fontWeight: 600,
                color: "var(--text-2)",
              }}
            >
              {formatDate(order.createdAt)}
            </p>
          </div>

          <div
            aria-hidden="true"
            style={{
              width: 1,
              height: 28,
              background: "var(--border-md)",
              flexShrink: 0,
            }}
          />

          <div>
            <p
              style={{
                margin: 0,
                fontSize: "0.68rem",
                color: "var(--text-3)",
                fontWeight: 600,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              Items
            </p>
            <p
              style={{
                margin: 0,
                fontSize: "0.82rem",
                fontWeight: 600,
                color: "var(--text-2)",
              }}
            >
              {totalQty} item{totalQty !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <OrderStatusBadge status={order.status} />
      </div>

      {/* Product previews */}
      <div
        style={{
          padding: "16px 20px",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            alignItems: "center",
          }}
        >
          {previewItems.map((item, idx) => (
            <Link
              key={idx}
              href={`/products/${item.product.slug}`}
              aria-label={`View ${item.product.name}`}
              style={{
                position: "relative",
                width: 52,
                height: 52,
                borderRadius: "10px",
                overflow: "hidden",
                border: "1px solid var(--border-md)",
                flexShrink: 0,
                display: "block",
              }}
            >
              <Image
                src={item.product.image}
                alt={item.product.name}
                fill
                sizes="52px"
                style={{ objectFit: "cover" }}
              />
              {item.quantity > 1 && (
                <span
                  aria-label={`Quantity: ${item.quantity}`}
                  style={{
                    position: "absolute",
                    bottom: 2,
                    right: 2,
                    background: "rgba(0,0,0,0.65)",
                    color: "#fff",
                    fontSize: "0.6rem",
                    fontWeight: 800,
                    padding: "1px 4px",
                    borderRadius: "4px",
                    lineHeight: 1.3,
                  }}
                >
                  ×{item.quantity}
                </span>
              )}
            </Link>
          ))}
          {remaining > 0 && (
            <div
              aria-label={`${remaining} more items`}
              style={{
                width: 52,
                height: 52,
                borderRadius: "10px",
                border: "1px dashed var(--border-strong)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.72rem",
                fontWeight: 700,
                color: "var(--text-3)",
                background: "var(--bg)",
                flexShrink: 0,
              }}
            >
              +{remaining}
            </div>
          )}
        </div>

        {/* Expand toggle */}
        {expanded && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              padding: "12px",
              background: "var(--bg)",
              borderRadius: "10px",
              border: "1px solid var(--border)",
            }}
          >
            {order.orderItems.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "12px",
                  padding: "6px 0",
                  borderBottom:
                    idx < order.orderItems.length - 1 ?
                      "1px solid var(--border)"
                    : "none",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      width: 36,
                      height: 36,
                      borderRadius: "6px",
                      overflow: "hidden",
                      flexShrink: 0,
                    }}
                  >
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      sizes="36px"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: "0.82rem",
                      color: "var(--text-2)",
                      fontWeight: 500,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.product.name}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--text-3)",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  ×{item.quantity} · ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
          }}
        >
          {/* Meta */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "14px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "0.75rem",
                color: "var(--text-3)",
              }}
            >
              <CreditCard size={12} />
              {order.paymentMethod}
              {order.coupon && (
                <span
                  style={{
                    marginLeft: 4,
                    padding: "2px 6px",
                    background: "rgba(22,163,74,0.08)",
                    color: "#15803d",
                    borderRadius: "6px",
                    fontWeight: 700,
                    fontSize: "0.68rem",
                  }}
                >
                  {order.coupon}
                </span>
              )}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "0.75rem",
                color: "var(--text-3)",
              }}
            >
              <MapPin size={12} />
              {order.region}, {order.country}
            </div>
          </div>

          {/* Total + expand */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ textAlign: "right" }}>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.68rem",
                  color: "var(--text-3)",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Total
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: "1.05rem",
                  fontWeight: 800,
                  color: "var(--gold)",
                  letterSpacing: "-0.02em",
                }}
              >
                ${order.totalPrice.toFixed(2)}
              </p>
            </div>

            <button
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              aria-label={
                expanded ? "Collapse order details" : "Expand order details"
              }
              style={{
                width: 32,
                height: 32,
                borderRadius: "8px",
                border: "1px solid var(--border-md)",
                background: "var(--bg)",
                color: "var(--text-3)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease",
              }}
            >
              <ChevronDown
                size={14}
                style={{
                  transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s ease",
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
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "18px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "16px 20px",
          background: "var(--surface-2)",
          display: "flex",
          gap: "16px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        {[80, 60, 50].map((w, i) => (
          <div
            key={i}
            style={{
              height: 32,
              width: w,
              borderRadius: 6,
              background: "var(--bg-deep)",
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          />
        ))}
      </div>
      <div style={{ padding: "16px 20px", display: "flex", gap: "10px" }}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              width: 52,
              height: 52,
              borderRadius: 10,
              background: "var(--bg-deep)",
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          />
        ))}
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.45} }`}</style>
    </div>
  );
}
