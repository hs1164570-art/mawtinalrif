"use client";

import { useState, useTransition } from "react";
import { Tag, ChevronRight, ShieldCheck, Loader2, X } from "lucide-react";
import { validateCoupon } from "@/app/actions/cart";

interface CartSummaryProps {
  subtotal: number;
  totalDiscount: number;
  total: number;
  totalItems: number;
  isAuthenticated: boolean;
  onCheckout: () => void;
  isMutating?: boolean;
}

type CouponState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "valid"; code: string; discount: number; isPercentage: boolean }
  | { status: "invalid"; error: string };

export function CartSummary({
  subtotal,
  totalDiscount,
  total,
  totalItems,
  isAuthenticated,
  onCheckout,
  isMutating = false,
}: CartSummaryProps) {
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<CouponState>({ status: "idle" });
  const [isPending, startTransition] = useTransition();

  const couponLoading = isPending || coupon.status === "loading";

  function handleApplyCoupon() {
    if (!couponInput.trim()) return;
    startTransition(async () => {
      const res = await validateCoupon(couponInput.trim());
      if (res.valid) {
        setCoupon({
          status: "valid",
          code: couponInput.trim().toUpperCase(),
          discount: res.discount!,
          isPercentage: res.isPercentage!,
        });
      } else {
        setCoupon({ status: "invalid", error: res.error ?? "Invalid coupon" });
      }
    });
  }

  function handleRemoveCoupon() {
    setCoupon({ status: "idle" });
    setCouponInput("");
  }

  const couponDiscount =
    coupon.status === "valid" ?
      coupon.isPercentage ?
        Math.round((total * coupon.discount) / 100)
      : coupon.discount
    : 0;

  const finalTotal = total - couponDiscount;

  const row = (
    label: string,
    value: string,
    muted = false,
    negative = false,
  ) => (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "6px 0",
      }}
    >
      <span
        style={{
          fontSize: "0.85rem",
          color: muted ? "var(--text-3)" : "var(--text-2)",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: "0.88rem",
          fontWeight: 600,
          color:
            negative ? "#16a34a"
            : muted ? "var(--text-3)"
            : "var(--text-1)",
        }}
      >
        {value}
      </span>
    </div>
  );

  return (
    <aside
      aria-label="Order summary"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border-md)",
        borderRadius: "20px",
        padding: "24px",
        boxShadow: "0 2px 12px rgba(90,60,20,0.06)",
        display: "flex",
        flexDirection: "column",
        gap: "0",
      }}
    >
      <h2
        style={{
          margin: "0 0 20px",
          fontSize: "1rem",
          fontWeight: 700,
          color: "var(--text-1)",
          letterSpacing: "-0.01em",
        }}
      >
        Order Summary
      </h2>

      {/* Totals */}
      <div
        style={{
          borderBottom: "1px solid var(--border)",
          paddingBottom: "12px",
          marginBottom: "12px",
        }}
      >
        {row(
          `Subtotal (${totalItems} item${totalItems !== 1 ? "s" : ""})`,
          `$${subtotal.toFixed(2)}`,
        )}
        {totalDiscount > 0 &&
          row(
            "Product discounts",
            `-$${totalDiscount.toFixed(2)}`,
            false,
            true,
          )}
        {couponDiscount > 0 &&
          row(
            `Coupon (${(coupon as { code: string }).code})`,
            `-$${couponDiscount.toFixed(2)}`,
            false,
            true,
          )}
      </div>

      {/* Final total */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <span
          style={{
            fontWeight: 700,
            color: "var(--text-1)",
            fontSize: "0.95rem",
          }}
        >
          Total
        </span>
        <span
          style={{
            fontWeight: 800,
            fontSize: "1.25rem",
            color: "var(--gold)",
            letterSpacing: "-0.02em",
          }}
        >
          ${finalTotal.toFixed(2)}
        </span>
      </div>

      {/* Coupon — only for authenticated users */}
      {isAuthenticated && (
        <div style={{ marginBottom: "20px" }}>
          {coupon.status === "valid" ?
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "rgba(22,163,74,0.07)",
                border: "1px solid rgba(22,163,74,0.25)",
                borderRadius: "10px",
                padding: "10px 12px",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <Tag size={14} style={{ color: "#16a34a" }} />
                <span
                  style={{
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    color: "#15803d",
                  }}
                >
                  {coupon.code} applied — saving ${couponDiscount.toFixed(2)}
                </span>
              </div>
              <button
                onClick={handleRemoveCoupon}
                aria-label="Remove coupon"
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#16a34a",
                  cursor: "pointer",
                  padding: "2px",
                  lineHeight: 1,
                }}
              >
                <X size={14} />
              </button>
            </div>
          : <div>
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                }}
              >
                <div style={{ position: "relative", flex: 1 }}>
                  <Tag
                    size={13}
                    style={{
                      position: "absolute",
                      left: 10,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--text-3)",
                      pointerEvents: "none",
                    }}
                  />
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => {
                      setCouponInput(e.target.value.toUpperCase());
                      if (coupon.status === "invalid")
                        setCoupon({ status: "idle" });
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                    placeholder="Coupon code"
                    aria-label="Coupon code"
                    aria-invalid={coupon.status === "invalid"}
                    aria-describedby={
                      coupon.status === "invalid" ? "coupon-error" : undefined
                    }
                    style={{
                      width: "100%",
                      padding: "9px 10px 9px 30px",
                      border: `1px solid ${coupon.status === "invalid" ? "rgba(185,28,28,0.4)" : "var(--border-md)"}`,
                      borderRadius: "10px",
                      background: "var(--bg)",
                      color: "var(--text-1)",
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                      outline: "none",
                      boxSizing: "border-box",
                      transition: "border-color 0.15s",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "var(--gold)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor =
                        coupon.status === "invalid" ?
                          "rgba(185,28,28,0.4)"
                        : "var(--border-md)";
                    }}
                  />
                </div>
                <button
                  onClick={handleApplyCoupon}
                  disabled={couponLoading || !couponInput.trim()}
                  aria-label="Apply coupon"
                  style={{
                    padding: "9px 14px",
                    background:
                      couponLoading || !couponInput.trim() ?
                        "var(--bg-deep)"
                      : "var(--gold)",
                    color:
                      couponLoading || !couponInput.trim() ?
                        "var(--text-3)"
                      : "var(--text-inv)",
                    border: "none",
                    borderRadius: "10px",
                    cursor:
                      couponLoading || !couponInput.trim() ?
                        "not-allowed"
                      : "pointer",
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    transition: "all 0.15s",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {couponLoading ?
                    <Loader2
                      size={13}
                      style={{ animation: "spin 1s linear infinite" }}
                    />
                  : "Apply"}
                </button>
              </div>
              {coupon.status === "invalid" && (
                <p
                  id="coupon-error"
                  role="alert"
                  style={{
                    margin: "6px 0 0",
                    fontSize: "0.75rem",
                    color: "var(--red)",
                  }}
                >
                  {coupon.error}
                </p>
              )}
            </div>
          }
        </div>
      )}

      {/* CTA */}
      <button
        onClick={onCheckout}
        disabled={isMutating || finalTotal <= 0}
        aria-label="Proceed to checkout"
        style={{
          width: "100%",
          padding: "14px",
          background: isMutating ? "var(--gold-mid)" : "var(--gold)",
          color: "var(--text-inv)",
          border: "none",
          borderRadius: "12px",
          fontWeight: 800,
          fontSize: "0.95rem",
          cursor: isMutating ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          letterSpacing: "0.01em",
          transition: "all 0.15s ease",
          boxShadow: "0 4px 16px rgba(160,120,48,0.35)",
        }}
        onMouseEnter={(e) => {
          if (!isMutating) {
            e.currentTarget.style.background = "var(--gold-mid)";
            e.currentTarget.style.boxShadow =
              "0 6px 20px rgba(160,120,48,0.45)";
            e.currentTarget.style.transform = "translateY(-1px)";
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "var(--gold)";
          e.currentTarget.style.boxShadow = "0 4px 16px rgba(160,120,48,0.35)";
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        {isMutating ?
          <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
        : <>
            Proceed to Checkout <ChevronRight size={16} />
          </>
        }
      </button>

      {/* Trust badges */}
      <div
        style={{
          marginTop: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          color: "var(--text-3)",
          fontSize: "0.72rem",
        }}
      >
        <ShieldCheck size={12} />
        <span>Secure checkout · SSL encrypted</span>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </aside>
  );
}
