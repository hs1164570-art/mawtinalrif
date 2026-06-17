"use client";
// app/checkout/_components/OrderSummary.tsx

import Image from "next/image";
import type { CheckoutItem } from "../types";

interface Props {
  items: CheckoutItem[];
  /** When set (Step 2), shows the server-confirmed discounted total */
  overrideTotal?: number;
}

const fmt = (cents: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "SAR",
    minimumFractionDigits: 2,
  }).format(cents / 100);

export default function OrderSummary({ items, overrideTotal }: Props) {
  const rawTotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const finalTotal = overrideTotal ?? rawTotal;
  const discountSaved =
    overrideTotal !== undefined ? rawTotal - overrideTotal : 0;

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border-md)",
        boxShadow: "var(--shadow-sm)",
        position: "sticky",
        top: "5rem",
      }}
    >
      {/* Header */}
      <div
        className="px-5 py-4 flex items-center justify-between"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <h2 className="text-sm font-bold" style={{ color: "var(--text-1)" }}>
          ملخص الطلب
        </h2>
        <span
          className="text-xs px-2 py-0.5 rounded-full font-medium"
          style={{ background: "var(--gold-bg)", color: "var(--gold)" }}
        >
          {items.length} {items.length === 1 ? "منتج" : "منتجات"}
        </span>
      </div>

      {/* Items list */}
      <ul
        className="divide-y px-4 py-2"
        style={{ borderColor: "var(--border)" }}
      >
        {items.map((item) => {
          const effectivePrice =
            item.discount ?
              Math.round(item.price * (1 - item.discount / 100))
            : item.price;

          return (
            <li key={item.productId} className="flex gap-3 py-3 items-start">
              {/* Thumbnail */}
              <div
                className="relative rounded-lg overflow-hidden flex-shrink-0"
                style={{
                  width: 52,
                  height: 52,
                  border: "1px solid var(--border)",
                  background: "var(--bg-deep)",
                }}
              >
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="52px"
                  className="object-cover"
                />
                {/* Quantity badge */}
                <span
                  className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                  style={{
                    background: "var(--gold)",
                    color: "var(--text-inv)",
                    boxShadow: "var(--shadow-sm)",
                  }}
                  aria-label={`الكمية ${item.quantity}`}
                >
                  {item.quantity}
                </span>
              </div>

              {/* Name + price */}
              <div className="flex-1 min-w-0">
                <p
                  className="text-xs font-medium leading-tight line-clamp-2"
                  style={{ color: "var(--text-1)" }}
                >
                  {item.name}
                </p>
                {item.discount ?
                  <p
                    className="text-[11px] mt-0.5"
                    style={{ color: "var(--text-3)" }}
                  >
                    <span className="line-through">{fmt(item.price)}</span>
                    <span className="mr-1" style={{ color: "var(--gold)" }}>
                      -{item.discount}%
                    </span>
                  </p>
                : null}
              </div>

              <span
                className="text-xs font-semibold flex-shrink-0"
                style={{ color: "var(--text-1)" }}
              >
                {fmt(effectivePrice * item.quantity)}
              </span>
            </li>
          );
        })}
      </ul>

      {/* Totals */}
      <div
        className="px-5 py-4 space-y-2.5"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <div
          className="flex justify-between text-xs"
          style={{ color: "var(--text-2)" }}
        >
          <span>المجموع قبل الخصم</span>
          <span>{fmt(rawTotal)}</span>
        </div>

        {discountSaved > 0 && (
          <div className="flex justify-between text-xs">
            <span style={{ color: "var(--text-2)" }}>خصم الكوبون</span>
            <span className="font-semibold" style={{ color: "#16a34a" }}>
              - {fmt(discountSaved)}
            </span>
          </div>
        )}

        <div className="flex justify-between text-xs">
          <span style={{ color: "var(--text-2)" }}>رسوم الشحن</span>
          <span className="text-[11px] font-bold" style={{ color: "#16a34a" }}>
            مجاني 🎁
          </span>
        </div>

        {/* Grand total */}
        <div
          className="flex justify-between items-center pt-2.5 mt-1"
          style={{ borderTop: "1px solid var(--border-md)" }}
        >
          <span
            className="text-sm font-bold"
            style={{ color: "var(--text-1)" }}
          >
            الإجمالي
          </span>
          <span className="text-xl font-bold" style={{ color: "var(--gold)" }}>
            {fmt(finalTotal)}
          </span>
        </div>
      </div>

      {/* Security notice */}
      <div
        className="mx-4 mb-4 rounded-xl px-3 py-2.5 flex items-center gap-2 text-[11px]"
        style={{ background: "var(--gold-bg)", color: "var(--text-3)" }}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        مدفوعاتك محمية بتشفير SSL
      </div>
    </div>
  );
}
