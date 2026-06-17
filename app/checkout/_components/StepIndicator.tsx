"use client";
// app/checkout/_components/StepIndicator.tsx

import type { CheckoutStep } from "../types";

const STEPS: { label: string; n: CheckoutStep }[] = [
  { label: "بيانات الشحن", n: 1 },
  { label: "الدفع",        n: 2 },
  { label: "تأكيد الطلب", n: 3 },
];

export default function StepIndicator({ current }: { current: CheckoutStep }) {
  return (
    <nav aria-label="خطوات إتمام الطلب">
      <ol
        role="list"
        className="flex items-center justify-center"
      >
        {STEPS.map(({ label, n }, idx) => {
          const done   = current > n;
          const active = current === n;

          return (
            <li key={n} className="flex items-center">
              {/* Circle + label */}
              <div className="flex flex-col items-center gap-1.5">
                <div
                  role="listitem"
                  aria-current={active ? "step" : undefined}
                  aria-label={`الخطوة ${n}: ${label}${done ? " — مكتملة" : active ? " — الحالية" : ""}`}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold select-none transition-all duration-300"
                  style={{
                    background:
                      done || active ? "var(--gold)" : "var(--bg-deep)",
                    color:
                      done || active ? "var(--text-inv)" : "var(--text-3)",
                    border: `2px solid ${done || active ? "var(--gold)" : "var(--border-md)"}`,
                    boxShadow: active ? "0 0 0 4px var(--gold-bg)" : "none",
                    transform: active ? "scale(1.08)" : "scale(1)",
                  }}
                >
                  {done ? (
                    /* Checkmark */
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" aria-hidden="true">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  ) : (
                    n
                  )}
                </div>

                <span
                  className="text-[11px] sm:text-xs font-medium whitespace-nowrap transition-colors duration-300"
                  style={{
                    color: active
                      ? "var(--gold)"
                      : done
                      ? "var(--text-2)"
                      : "var(--text-3)",
                  }}
                >
                  {label}
                </span>
              </div>

              {/* Connector line between steps */}
              {idx < STEPS.length - 1 && (
                <div
                  aria-hidden="true"
                  className="mx-2 sm:mx-3 mb-5 rounded-full transition-all duration-500"
                  style={{
                    height: 2,
                    width: "clamp(2.5rem, 8vw, 6rem)",
                    background: current > n ? "var(--gold)" : "var(--border-md)",
                  }}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
