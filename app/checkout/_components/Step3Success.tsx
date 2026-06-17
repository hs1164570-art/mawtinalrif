"use client";
// app/checkout/_components/Step3Success.tsx
// Loaded lazily — safe to import canvas-confetti here

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { CheckoutItem } from "../types";

interface Props {
  orderId: string;
  items: CheckoutItem[];
}

const fmt = (cents: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "SAR",
    minimumFractionDigits: 2,
  }).format(cents / 100);

export default function Step3Success({ orderId, items }: Props) {
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

  // ── Fire confetti on mount ────────────────────────────────────────────
  useEffect(() => {
    let active = true;

    const fire = async () => {
      const { default: confetti } = await import("canvas-confetti");
      if (!active) return;

      // Central burst
      confetti({
        particleCount: 140,
        spread: 70,
        origin: { y: 0.55 },
        colors: ["#a07830", "#d0a820", "#b89040", "#f8f4ec", "#fffdf8"],
        scalar: 1.1,
      });

      // Side cannons after 350 ms
      await new Promise((r) => setTimeout(r, 350));
      if (!active) return;

      confetti({
        particleCount: 70,
        angle: 60,
        spread: 50,
        origin: { x: 0, y: 0.65 },
        colors: ["#a07830", "#d0a820", "#ffffff"],
      });
      confetti({
        particleCount: 70,
        angle: 120,
        spread: 50,
        origin: { x: 1, y: 0.65 },
        colors: ["#a07830", "#d0a820", "#ffffff"],
      });
    };

    fire().catch(console.error);
    return () => {
      active = false;
    };
  }, []);

  return (
    <main
      dir="rtl"
      className="max-w-xl mx-auto px-4 sm:px-6 py-12 sm:py-16"
      aria-labelledby="success-heading"
    >
      {/* ── Success icon ──────────────────────────────────────────── */}
      <motion.div
        className="flex flex-col items-center text-center mb-8"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
          style={{
            background: "var(--gold-bg)",
            border: "2.5px solid var(--gold)",
            boxShadow: "0 0 0 6px var(--gold-bg)",
          }}
        >
          <svg
            width="34"
            height="34"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            style={{ color: "var(--gold)" }}
            aria-hidden="true"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>

        <h1
          id="success-heading"
          className="text-2xl sm:text-3xl font-bold mb-2"
          style={{ color: "var(--text-1)" }}
        >
          تم استلام طلبك! 🎉
        </h1>
        <p className="text-sm mb-4" style={{ color: "var(--text-3)" }}>
          شكرًا لثقتك بشركة الريف. سيتم التواصل معك قريبًا لتأكيد الطلب.
        </p>

        {/* Order ID badge */}
        <div
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2"
          style={{
            background: "var(--gold-bg)",
            border: "1px solid var(--border-md)",
          }}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ color: "var(--gold)" }}
            aria-hidden="true"
          >
            <path d="M9 17H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3" />
            <rect x="9" y="11" width="13" height="10" rx="2" />
            <path d="M13 15.5h5M13 18.5h3" />
          </svg>
          <span className="text-xs" style={{ color: "var(--text-3)" }}>
            رقم الطلب:
          </span>
          <code
            className="text-xs font-bold tracking-wide"
            style={{ color: "var(--gold)", fontFamily: "monospace" }}
          >
            {orderId}
          </code>
        </div>
      </motion.div>

      {/* ── Order items recap ─────────────────────────────────────── */}
      <motion.div
        className="rounded-2xl overflow-hidden mb-6"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border-md)",
          boxShadow: "var(--shadow-sm)",
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.35 }}
      >
        <div
          className="px-5 py-3.5 flex items-center justify-between"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <h2
            className="text-sm font-semibold"
            style={{ color: "var(--text-1)" }}
          >
            المنتجات المطلوبة
          </h2>
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{ background: "var(--gold-bg)", color: "var(--gold)" }}
          >
            {items.length} {items.length === 1 ? "منتج" : "منتجات"}
          </span>
        </div>

        <ul className="divide-y" style={{ borderColor: "var(--border)" }}>
          {items.map((item) => (
            <li
              key={item.productId}
              className="flex items-center justify-between px-5 py-3 gap-3 text-sm"
            >
              <span
                className="flex-1 truncate"
                style={{ color: "var(--text-1)" }}
              >
                {item.name}
              </span>
              <span style={{ color: "var(--text-3)", fontSize: "0.75rem" }}>
                × {item.quantity}
              </span>
              <span
                className="font-semibold flex-shrink-0"
                style={{ color: "var(--gold)" }}
              >
                {fmt(item.price * item.quantity)}
              </span>
            </li>
          ))}
        </ul>

        <div
          className="px-5 py-3.5 flex items-center justify-between"
          style={{
            borderTop: "1px solid var(--border-md)",
            background: "var(--gold-bg)",
          }}
        >
          <span
            className="text-sm font-bold"
            style={{ color: "var(--text-1)" }}
          >
            الإجمالي
          </span>
          <span className="text-lg font-bold" style={{ color: "var(--gold)" }}>
            {fmt(total)}
          </span>
        </div>
      </motion.div>

      {/* ── CTA buttons ──────────────────────────────────────────── */}
      <motion.div
        className="flex flex-col sm:flex-row gap-3"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.3 }}
      >
        <Link
          href="/orders"
          className="flex-1 flex items-center justify-center gap-2 rounded-xl font-bold text-sm py-3.5 transition-all duration-200"
          style={{
            background: "var(--gold)",
            color: "var(--text-inv)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M5 12h14M5 12l4-4M5 12l4 4" />
          </svg>
          تتبّع طلبي
        </Link>

        <Link
          href="/"
          className="flex-1 flex items-center justify-center gap-2 rounded-xl font-medium text-sm py-3.5 transition-all duration-200"
          style={{
            background: "var(--bg-deep)",
            color: "var(--text-2)",
            border: "1px solid var(--border-md)",
          }}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          العودة للرئيسية
        </Link>
      </motion.div>
    </main>
  );
}
