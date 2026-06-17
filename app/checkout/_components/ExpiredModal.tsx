"use client";
// app/checkout/_components/ExpiredModal.tsx

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  onRestart: () => void;
}

export default function ExpiredModal({ onRestart }: Props) {
  const btnRef = useRef<HTMLButtonElement>(null);

  // ── Lock body scroll while modal is open ──────────────────────────────
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Auto-focus the primary action button
    btnRef.current?.focus();
    return () => { document.body.style.overflow = prev; };
  }, []);

  // ── Trap focus inside modal ────────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      // Escape = restart (only sensible action for user)
      onRestart();
    }
    if (e.key === "Tab") {
      // Only one focusable element — nothing to cycle through
      e.preventDefault();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(10,5,0,0.6)", backdropFilter: "blur(6px)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="expired-title"
        aria-describedby="expired-desc"
        onKeyDown={handleKeyDown}
      >
        <motion.div
          className="max-w-sm w-full rounded-2xl overflow-hidden"
          dir="rtl"
          style={{
            background: "var(--surface)",
            boxShadow:  "var(--shadow-lg)",
            border:     "1px solid var(--border-md)",
          }}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.25, ease: [0.34, 1.2, 0.64, 1] }}
        >
          {/* Top accent bar */}
          <div
            className="h-1 w-full"
            style={{ background: "linear-gradient(90deg, var(--gold), var(--gold-bright))" }}
            aria-hidden="true"
          />

          <div className="p-8 text-center">
            {/* Warning icon */}
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{
                background: "#fef2f2",
                border:     "2px solid #fca5a5",
              }}
              aria-hidden="true"
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ color: "var(--red)" }}
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>

            <h2
              id="expired-title"
              className="text-lg font-bold mb-2"
              style={{ color: "var(--text-1)" }}
            >
              انتهت صلاحية الجلسة
            </h2>

            <p
              id="expired-desc"
              className="text-sm leading-relaxed mb-7"
              style={{ color: "var(--text-3)" }}
            >
              انتهت صلاحية جلسة الطلب (30 دقيقة).
              <br />
              يرجى إعادة المحاولة من البداية لإتمام عملية الشراء.
            </p>

            {/* Primary CTA */}
            <button
              ref={btnRef}
              type="button"
              onClick={onRestart}
              className="w-full rounded-xl font-bold text-sm py-3.5 flex items-center justify-center gap-2 transition-all duration-200"
              style={{
                background: "var(--gold)",
                color:      "var(--text-inv)",
                boxShadow:  "var(--shadow-md)",
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M23 4v6h-6M1 20v-6h6"/>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
              </svg>
              إعادة الشراء
            </button>

            <p
              className="mt-4 text-[11px]"
              style={{ color: "var(--text-3)" }}
            >
              سيتم نقلك لإعادة إدخال بيانات الشحن
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
