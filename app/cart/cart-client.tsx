"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Trash2, ShoppingBag, LogIn } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/hook/use-cart";
import { CartItemCard } from "../components/cart/cart-item-card";
import { CartSummary } from "../components/cart/cart-summary";
import { EmptyCart } from "../components/cart/empty-cart";
import type { CartItemFromDB } from "@/utils";

interface CartClientProps {
  initialCartData: CartItemFromDB[];
  isAuthenticated: boolean;
}

/* ── تم إعادة هيكلة المتغيرات لتعكس النظام المحايد والنظيف المتفق عليه ── */
const CSS_VARS = `
  :root {
    --bg: #f8f9fa;
    --bg-deep: #f1f3f5;
    --surface: #ffffff;
    --surface-2: #fafbfa;
    --border: rgba(33, 37, 41, 0.06);
    --border-md: rgba(33, 37, 41, 0.12);
    --border-strong: rgba(33, 37, 41, 0.25);
    
    /* توجيه مسميات الـ gold والأسماء المقترنة بها إلى الأسود والتون التفاعلي الجديد */
    --gold: #1a1a1a;
    --gold-mid: #212529;
    --gold-bright: #495057;
    --gold-bg: rgba(0, 0, 0, 0.06);
    
    /* درجات النصوص المحايدة عالية القراءة */
    --text-1: #1a1a1a;
    --text-2: #495057;
    --text-3: #868e96;
    --text-inv: #ffffff;
    
    /* الأحمر التفاعلي للخصومات والإجراءات القوية */
    --red: #e03131;
  }
`;

export function CartClient({
  initialCartData,
  isAuthenticated,
}: CartClientProps) {
  const qc = useQueryClient();
  const router = useRouter();

  // Hydrate TanStack Query cache with server-fetched data
  useEffect(() => {
    if (isAuthenticated && initialCartData.length > 0) {
      qc.setQueryData(["cart", "db"], initialCartData);
    }
  }, [isAuthenticated, initialCartData, qc]);

  const {
    items,
    isLoading,
    subtotal,
    totalDiscount,
    total,
    totalItems,
    updateQty,
    removeItem,
    clearCart,
    loading: isMutating,
  } = useCart();

  const handleCheckout = () => {
    router.push("/checkout");
  };

  // ── Skeleton ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <>
        <style>{CSS_VARS}</style>
        <CartPageShell>
          <div style={{ gridColumn: "1 / -1" }}>
            {[1, 2, 3].map((n) => (
              <CartItemSkeleton key={n} />
            ))}
          </div>
        </CartPageShell>
      </>
    );
  }

  // ── Empty ────────────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <>
        <style>{CSS_VARS}</style>
        <CartPageShell showHeader={false}>
          <EmptyCart isAuthenticated={isAuthenticated} />
        </CartPageShell>
      </>
    );
  }

  // ── Guest banner ─────────────────────────────────────────────────────────
  const GuestBanner = !isAuthenticated && (
    <div
      role="note"
      style={{
        gridColumn: "1 / -1",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        background: "var(--gold-bg)",
        border: "1px solid var(--border-md)",
        borderRadius: "12px",
        padding: "12px 16px",
        fontSize: "0.82rem",
        color: "var(--text-2)",
      }}
    >
      <LogIn size={15} style={{ color: "var(--gold)", flexShrink: 0 }} />
      <span>
        You&apos;re shopping as a guest.{" "}
        <Link
          href="/sign-in"
          style={{
            color: "var(--gold)",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          Sign in
        </Link>{" "}
        to save your cart and use coupons.
      </span>
    </div>
  );

  return (
    <>
      <style>{CSS_VARS}</style>
      <CartPageShell
        totalItems={totalItems}
        onClear={() => clearCart()}
        isMutating={isMutating}
      >
        {/* Guest banner */}
        {GuestBanner}

        {/* Items column */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {items.map((item) => (
            <CartItemCard
              key={item.id}
              item={item}
              onUpdateQty={updateQty}
              onRemove={removeItem}
              isPending={isMutating}
            />
          ))}
        </div>

        {/* Summary column */}
        <CartSummary
          subtotal={subtotal}
          totalDiscount={totalDiscount}
          total={total}
          totalItems={totalItems}
          isAuthenticated={isAuthenticated}
          onCheckout={handleCheckout}
          isMutating={isMutating}
        />
      </CartPageShell>
    </>
  );
}

// ── Shell layout ─────────────────────────────────────────────────────────────
function CartPageShell({
  children,
  totalItems,
  onClear,
  isMutating,
  showHeader = true,
}: {
  children: React.ReactNode;
  totalItems?: number;
  onClear?: () => void;
  isMutating?: boolean;
  showHeader?: boolean;
}) {
  return (
    <main
      aria-label="Shopping cart"
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        padding: "32px 16px 80px",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {showHeader && (
          <header
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "28px",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                aria-hidden="true"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "10px",
                  background: "var(--gold-bg)",
                  border: "1px solid var(--border-md)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ShoppingBag size={18} style={{ color: "var(--gold)" }} />
              </div>
              <div>
                <h1
                  style={{
                    margin: 0,
                    fontSize: "1.4rem",
                    fontWeight: 800,
                    color: "var(--text-1)",
                    letterSpacing: "-0.025em",
                    lineHeight: 1.2,
                  }}
                >
                  Shopping Cart
                </h1>
                {totalItems !== undefined && (
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.78rem",
                      color: "var(--text-3)",
                    }}
                  >
                    {totalItems} item{totalItems !== 1 ? "s" : ""}
                  </p>
                )}
              </div>
            </div>

            {onClear && (
              <button
                onClick={onClear}
                disabled={isMutating}
                aria-label="Clear all cart items"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "7px 14px",
                  background: "transparent",
                  border: "1px solid var(--border-md)",
                  borderRadius: "10px",
                  color: "var(--text-3)",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  cursor: isMutating ? "not-allowed" : "pointer",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  if (!isMutating) {
                    e.currentTarget.style.background = "rgba(224,49,49,0.06)";
                    e.currentTarget.style.borderColor = "rgba(224,49,49,0.3)";
                    e.currentTarget.style.color = "var(--red)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.borderColor = "var(--border-md)";
                  e.currentTarget.style.color = "var(--text-3)";
                }}
              >
                <Trash2 size={13} />
                Clear all
              </button>
            )}
          </header>
        )}

        {/* Responsive grid: items (2fr) | summary (1fr) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)",
            gap: "24px",
            alignItems: "start",
          }}
          className="cart-grid"
        >
          {children}
        </div>
      </div>

      {/* Responsive override */}
      <style>{`
        @media (max-width: 768px) {
          .cart-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}

// ── Skeleton card ─────────────────────────────────────────────────────────────
function CartItemSkeleton() {
  return (
    <div
      aria-hidden="true"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "16px",
        padding: "16px",
        display: "grid",
        gridTemplateColumns: "80px 1fr",
        gap: "14px",
        marginBottom: "12px",
      }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: "10px",
          background: "var(--bg-deep)",
          animation: "pulse 1.5s ease-in-out infinite",
        }}
      ></div>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <div
          style={{
            height: 14,
            width: "70%",
            borderRadius: 6,
            background: "var(--bg-deep)",
            animation: "pulse 1.5s ease-in-out infinite",
          }}
        />
        <div
          style={{
            height: 12,
            width: "40%",
            borderRadius: 6,
            background: "var(--bg-deep)",
            animation: "pulse 1.5s ease-in-out infinite 0.2s",
          }}
        />
        <div
          style={{
            height: 30,
            width: "50%",
            borderRadius: 10,
            background: "var(--bg-deep)",
            animation: "pulse 1.5s ease-in-out infinite 0.4s",
          }}
        />
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.45; }
        }
      `}</style>
    </div>
  );
}
