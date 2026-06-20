"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";

interface EmptyCartProps {
  isAuthenticated: boolean;
}

export function EmptyCart({ isAuthenticated }: EmptyCartProps) {
  return (
    <div
      role="status"
      aria-label="Your cart is empty"
      style={{
        gridColumn: "1 / -1",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 24px",
        textAlign: "center",
        gap: "20px",
      }}
    >
      {/* Icon */}
      <div
        aria-hidden="true"
        style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: "var(--gold-bg)",
          border: "2px dashed var(--border-strong)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ShoppingBag size={32} style={{ color: "var(--gold)" }} />
      </div>

      <div>
        <h2
          style={{
            margin: "0 0 8px",
            fontSize: "1.3rem",
            fontWeight: 700,
            color: "var(--text-1)",
            letterSpacing: "-0.02em",
          }}
        >
          Your cart is empty
        </h2>
        <p
          style={{
            margin: 0,
            fontSize: "0.88rem",
            color: "var(--text-3)",
            maxWidth: 320,
            lineHeight: 1.6,
          }}
        >
          {isAuthenticated ?
            "You haven't added anything yet. Browse our collection and find something you'll love."
          : "Add items to your cart while browsing — they'll be saved here for you."
          }
        </p>
      </div>

      <Link
        href="/products"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "11px 24px",
          background: "var(--gold)",
          color: "var(--text-inv)",
          borderRadius: "12px",
          fontWeight: 700,
          fontSize: "0.88rem",
          textDecoration: "none",
          boxShadow: "0 4px 14px rgba(26,26,26,0.30)",
          transition: "all 0.15s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "var(--gold-mid)";
          e.currentTarget.style.transform = "translateY(-1px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "var(--gold)";
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        <ShoppingBag size={15} />
        Start Shopping
      </Link>

      {!isAuthenticated && (
        <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--text-3)" }}>
          <Link
            href="/sign-in"
            style={{
              color: "var(--gold)",
              fontWeight: 600,
              textDecoration: "underline",
            }}
          >
            Sign in
          </Link>{" "}
          to sync your cart across devices
        </p>
      )}
    </div>
  );
}
