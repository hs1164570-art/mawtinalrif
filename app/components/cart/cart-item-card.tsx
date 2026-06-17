"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, AlertCircle } from "lucide-react";
import type { CartItem } from "@/utils";

interface CartItemCardProps {
  item: CartItem;
  onUpdateQty: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  isPending?: boolean;
}

function calcDiscountedPrice(price: number, discount: number | null) {
  if (!discount) return price;
  return price - Math.round((price * discount) / 100);
}

export function CartItemCard({
  item,
  onUpdateQty,
  onRemove,
  isPending = false,
}: CartItemCardProps) {
  const { product, quantity, id } = item;
  const discountedPrice = calcDiscountedPrice(product.price, product.discount);
  const lineTotal = discountedPrice * quantity;
  const maxQty = Math.min(product.countStock, 99);

  return (
    <article
      aria-label={`Cart item: ${product.name}`}
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border-md)",
        borderRadius: "16px",
        padding: "16px",
        display: "grid",
        gridTemplateColumns: "80px 1fr",
        gap: "14px",
        opacity: isPending ? 0.6 : 1,
        transition: "opacity 0.2s ease",
        boxShadow: "0 1px 4px rgba(90,60,20,0.05)",
      }}
    >
      {/* Image */}
      <Link href={`/products/${product.slug}`} tabIndex={-1} aria-hidden="true">
        <div
          style={{
            position: "relative",
            width: 80,
            height: 80,
            borderRadius: "10px",
            overflow: "hidden",
            background: "var(--bg-deep)",
            flexShrink: 0,
          }}
        >
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="80px"
            style={{ objectFit: "cover" }}
          />
          {!product.inStock && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.55)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "10px",
                color: "#fff",
                fontWeight: 700,
                letterSpacing: "0.05em",
              }}
            >
              OUT OF STOCK
            </div>
          )}
        </div>
      </Link>

      {/* Details */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          minWidth: 0,
        }}
      >
        {/* Name + remove */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "8px",
          }}
        >
          <Link
            href={`/products/${product.slug}`}
            style={{
              color: "var(--text-1)",
              fontWeight: 600,
              fontSize: "0.9rem",
              lineHeight: 1.3,
              textDecoration: "none",
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {product.name}
          </Link>
          <button
            onClick={() => onRemove(id)}
            disabled={isPending}
            aria-label={`Remove ${product.name} from cart`}
            style={{
              flexShrink: 0,
              width: 28,
              height: 28,
              border: "1px solid var(--border)",
              borderRadius: "8px",
              background: "transparent",
              color: "var(--text-3)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(185,28,28,0.08)";
              e.currentTarget.style.borderColor = "rgba(185,28,28,0.3)";
              e.currentTarget.style.color = "var(--red)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.color = "var(--text-3)";
            }}
          >
            <Trash2 size={13} />
          </button>
        </div>

        {/* Low stock warning */}
        {product.countStock <= 5 && product.inStock && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              color: "#c2410c",
              fontSize: "0.72rem",
              fontWeight: 500,
            }}
          >
            <AlertCircle size={11} />
            Only {product.countStock} left
          </div>
        )}

        {/* Price row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              color: "var(--gold)",
              fontWeight: 700,
              fontSize: "0.95rem",
            }}
          >
            ${discountedPrice.toFixed(2)}
          </span>
          {!!product.discount && (
            <span
              style={{
                color: "var(--text-3)",
                fontSize: "0.78rem",
                textDecoration: "line-through",
              }}
            >
              ${product.price.toFixed(2)}
            </span>
          )}
          {!!product.discount && (
            <span
              style={{
                background: "rgba(160,120,48,0.12)",
                color: "var(--gold)",
                fontSize: "0.68rem",
                fontWeight: 700,
                padding: "2px 6px",
                borderRadius: "99px",
                letterSpacing: "0.02em",
              }}
            >
              -{product.discount}%
            </span>
          )}
        </div>

        {/* Qty controls + line total */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* +/- stepper */}
          <div
            role="group"
            aria-label={`Quantity for ${product.name}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 0,
              border: "1px solid var(--border-md)",
              borderRadius: "10px",
              overflow: "hidden",
              background: "var(--bg)",
            }}
          >
            <button
              onClick={() => onUpdateQty(id, quantity - 1)}
              disabled={isPending || quantity <= 1}
              aria-label="Decrease quantity"
              style={{
                width: 30,
                height: 30,
                border: "none",
                background: "transparent",
                cursor: quantity <= 1 ? "not-allowed" : "pointer",
                color: quantity <= 1 ? "var(--border-strong)" : "var(--text-2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => {
                if (quantity > 1)
                  e.currentTarget.style.background = "var(--gold-bg)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              {quantity === 1 ?
                <Trash2 size={12} style={{ color: "var(--red)" }} />
              : <Minus size={12} />}
            </button>

            <span
              aria-live="polite"
              aria-atomic="true"
              style={{
                minWidth: 28,
                textAlign: "center",
                fontSize: "0.82rem",
                fontWeight: 700,
                color: "var(--text-1)",
                padding: "0 2px",
              }}
            >
              {quantity}
            </span>

            <button
              onClick={() => onUpdateQty(id, quantity + 1)}
              disabled={isPending || quantity >= maxQty || !product.inStock}
              aria-label="Increase quantity"
              style={{
                width: 30,
                height: 30,
                border: "none",
                background: "transparent",
                cursor: quantity >= maxQty ? "not-allowed" : "pointer",
                color:
                  quantity >= maxQty ? "var(--border-strong)" : "var(--text-2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => {
                if (quantity < maxQty)
                  e.currentTarget.style.background = "var(--gold-bg)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <Plus size={12} />
            </button>
          </div>

          {/* Line total */}
          <span
            style={{
              fontWeight: 700,
              fontSize: "0.92rem",
              color: "var(--text-1)",
            }}
          >
            ${lineTotal.toFixed(2)}
          </span>
        </div>
      </div>
    </article>
  );
}
