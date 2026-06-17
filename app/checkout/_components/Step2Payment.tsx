"use client";
// app/checkout/_components/Step2Payment.tsx

import { MutableRefObject, useState } from "react";
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { toast } from "sonner";
import type { PendingOrderResult } from "../types";

interface Props {
  pendingOrder: PendingOrderResult;
  isSubmitting: MutableRefObject<boolean>;
  onSuccess: (orderId: string) => void;
  onExpired: () => void;
  onBack: () => void;
}

const fmt = (cents: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "SAR",
    minimumFractionDigits: 2,
  }).format(cents / 100);

export default function Step2Payment({
  pendingOrder,
  isSubmitting,
  onSuccess,
  onExpired,
  onBack,
}: Props) {
  const [{ isPending: paypalLoading }] = usePayPalScriptReducer();
  const [paypalError, setPaypalError] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);

  // ── Capture handler ────────────────────────────────────────────────────
  const handleApprove = async (paypalOrderId: string) => {
    if (isSubmitting.current) return; // Double-submission guard
    isSubmitting.current = true;
    setCapturing(true);
    setPaypalError(null);

    try {
      const res = await fetch("/api/order/capture", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        credentials: "include",
        body: JSON.stringify({ paypalOrderId }),
      });

      const data = await res.json();

      // ── Handle specific 400: session expired ──────────────────────
      if (
        res.status === 400 &&
        data?.message ===
          "Order session expired. Please start your order again."
      ) {
        onExpired();
        return;
      }

      // ── Handle 409: stock changed during payment ──────────────────
      if (res.status === 409) {
        setPaypalError(
          data?.message ?? "بعض المنتجات نفدت من المخزون، يرجى مراجعة سلتك",
        );
        isSubmitting.current = false;
        setCapturing(false);
        return;
      }

      // ── Other server errors ───────────────────────────────────────
      if (!res.ok) {
        setPaypalError(
          data?.message ?? "حدث خطأ في معالجة الدفع، يرجى المحاولة مجددًا",
        );
        isSubmitting.current = false;
        setCapturing(false);
        return;
      }

      onSuccess(data.orderId);
    } catch {
      setPaypalError("تعذّر الاتصال بالخادم، تحقق من اتصالك بالإنترنت");
      isSubmitting.current = false;
      setCapturing(false);
    }
  };

  return (
    <section
      className="rounded-2xl overflow-hidden"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border-md)",
        boxShadow: "var(--shadow-sm)",
      }}
      aria-labelledby="payment-heading"
    >
      {/* Card header */}
      <div
        className="px-6 py-4 flex items-center gap-3"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <span
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
          style={{ background: "var(--gold)", color: "var(--text-inv)" }}
          aria-hidden="true"
        >
          2
        </span>
        <h1
          id="payment-heading"
          className="text-base font-bold"
          style={{ color: "var(--text-1)" }}
        >
          طريقة الدفع
        </h1>
      </div>

      <div className="px-6 py-6 space-y-5">
        {/* Order total summary */}
        <div
          className="flex items-center justify-between rounded-xl px-4 py-3.5"
          style={{
            background: "var(--gold-bg)",
            border: "1px solid var(--border-md)",
          }}
        >
          <div>
            <p
              className="text-xs font-medium"
              style={{ color: "var(--text-3)" }}
            >
              إجمالي طلبك
            </p>
            <p
              className="text-xl font-bold mt-0.5"
              style={{ color: "var(--gold)" }}
            >
              {fmt(pendingOrder.totalPrice)}
            </p>
          </div>
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            style={{ color: "var(--gold-mid)", opacity: 0.6 }}
            aria-hidden="true"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>

        {/* ── PayPal section ─────────────────────────────────────── */}
        {/*
         * aria-live="polite" → screen readers announce status changes
         * (loading → button ready / error message)
         */}
        <div
          role="region"
          aria-live="polite"
          aria-label="قسم الدفع بواسطة باي بال"
          className="rounded-xl p-5 space-y-4"
          style={{
            border: "1px solid var(--border-md)",
            background: "var(--surface-2)",
          }}
        >
          {/* PayPal logo row */}
          <div className="flex items-center gap-3">
            <div
              className="rounded-lg px-3 py-1.5 flex items-center"
              style={{ background: "#003087" }}
            >
              {/* Inline PayPal wordmark — no external image request */}
              <svg
                height="18"
                viewBox="0 0 101 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="PayPal"
                role="img"
              >
                <path
                  d="M12.237 2.843c-1.38-.935-3.16-1.403-5.343-1.403H1.09C.49 1.44 0 1.93 0 2.53L0 29.47c0 .6.49 1.09 1.09 1.09h4.093c.6 0 1.09-.49 1.09-1.09V22.27h2.97c5.487 0 8.643-2.653 8.643-7.48 0-2.683-.815-4.712-2.448-6.03A8.43 8.43 0 0012.237 2.843z"
                  fill="#009cde"
                />
                <path
                  d="M34.67 2.843c-1.38-.935-3.16-1.403-5.343-1.403h-5.804c-.6 0-1.09.49-1.09 1.09v26.94c0 .6.49 1.09 1.09 1.09h4.093c.6 0 1.09-.49 1.09-1.09V22.27h2.97c5.487 0 8.643-2.653 8.643-7.48 0-2.683-.815-4.712-2.448-6.03A8.43 8.43 0 0034.67 2.843z"
                  fill="#012169"
                />
              </svg>
            </div>
            <p
              className="text-sm font-medium"
              style={{ color: "var(--text-2)" }}
            >
              ادفع بأمان عبر باي بال
            </p>
          </div>

          {/* Error alert */}
          {paypalError && (
            <div
              role="alert"
              aria-live="assertive"
              className="flex items-start gap-2 rounded-lg px-3.5 py-3 text-sm"
              style={{
                background: "#fef2f2",
                border: "1px solid #fca5a5",
                color: "var(--red)",
              }}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="flex-shrink-0 mt-0.5"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{paypalError}</span>
            </div>
          )}

          {/* Loading skeleton */}
          {paypalLoading && (
            <div
              className="rounded-lg h-12 animate-pulse"
              style={{ background: "var(--bg-deep)" }}
              aria-label="جارٍ تحميل أزرار الدفع..."
            />
          )}

          {/* Capturing overlay */}
          {capturing && (
            <div
              className="rounded-lg flex items-center justify-center gap-2.5 py-4 text-sm font-medium"
              style={{ background: "var(--gold-bg)", color: "var(--gold)" }}
              aria-live="polite"
            >
              <svg
                className="animate-spin"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              جارٍ تأكيد الدفع وحفظ طلبك...
            </div>
          )}

          {/* PayPal Buttons — hidden while capturing to prevent double-click */}
          {!paypalLoading && !capturing && (
            <PayPalButtons
              style={{
                layout: "vertical",
                color: "gold",
                shape: "rect",
                label: "pay",
                height: 44,
              }}
              // Return the already-created paypalOrderId (created server-side in Step 1)
              createOrder={async () => pendingOrder.paypalOrderId}
              onApprove={async (data) => handleApprove(data.orderID)}
              onCancel={() => {
                isSubmitting.current = false;
                toast.info("تم إلغاء عملية الدفع");
              }}
              onError={(err) => {
                console.error("[PayPal SDK error]", err);
                setPaypalError("حدث خطأ في باي بال، يرجى المحاولة مرة أخرى");
                isSubmitting.current = false;
                setCapturing(false);
              }}
              disabled={capturing || isSubmitting.current}
            />
          )}

          {/* Fine print */}
        </div>

        {/* ── Back button ───────────────────────────────────────────── */}
        <button
          type="button"
          onClick={onBack}
          disabled={capturing}
          className="flex items-center gap-2 text-xs transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ color: "var(--text-3)" }}
          aria-label="العودة إلى خطوة بيانات الشحن"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            aria-hidden="true"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
          العودة لبيانات الشحن
        </button>
      </div>
    </section>
  );
}
