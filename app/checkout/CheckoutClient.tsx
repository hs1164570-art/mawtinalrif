"use client";
// app/checkout/CheckoutClient.tsx

import { useState, useRef, useCallback, lazy, Suspense } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { Toaster } from "sonner";
import type { CheckoutItem, CheckoutStep, PendingOrderResult } from "./types";
import StepIndicator from "./_components/StepIndicator";
import OrderSummary from "./_components/OrderSummary";
import Step1Shipping from "./_components/Step1Shipping";
import Step2Payment from "./_components/Step2Payment";
import ExpiredModal from "./_components/ExpiredModal";

// Lazy-load heavy success screen (carries canvas-confetti)
const Step3Success = dynamic(() => import("./_components/Step3Success"), {
  ssr: false,
  loading: () => null,
});

interface Props {
  items: CheckoutItem[];
  paypalClientId: string;
}

const stepVariants = {
  enter: { opacity: 0, y: 14, scale: 0.99 },
  center: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -10, scale: 0.99 },
};

export default function CheckoutClient({ items, paypalClientId }: Props) {
  const [step, setStep] = useState<CheckoutStep>(1);
  const [pendingOrder, setPendingOrder] = useState<PendingOrderResult | null>(
    null,
  );
  const [completedOrderId, setCompletedOrderId] = useState<string | null>(null);
  const [showExpiredModal, setShowExpiredModal] = useState(false);

  /**
   * Mutable ref — prevents double-submission across async boundaries
   * without triggering a re-render on every mutation.
   */
  const isSubmitting = useRef(false);

  const toStep2 = useCallback((order: PendingOrderResult) => {
    setPendingOrder(order);
    setStep(2);
    isSubmitting.current = false;
  }, []);

  const toStep3 = useCallback((orderId: string) => {
    setCompletedOrderId(orderId);
    setStep(3);
    isSubmitting.current = false;
  }, []);

  const onExpired = useCallback(() => {
    setShowExpiredModal(true);
    isSubmitting.current = false;
  }, []);

  const onRestart = useCallback(() => {
    setShowExpiredModal(false);
    setPendingOrder(null);
    setStep(1);
    isSubmitting.current = false;
  }, []);

  const goBack = useCallback(() => {
    setStep(1);
    isSubmitting.current = false;
  }, []);

  return (
    <PayPalScriptProvider
      options={{
        clientId: paypalClientId,
        currency: "USD",
        intent: "capture",
        // Only PayPal wallet is available — suppress all other funding sources
        disableFunding:
          "card,credit,venmo,paylater,bancontact,blik,eps,giropay,ideal,mercadopago,mybank,p24,sepa,sofort,trustly",
        locale: "ar_SA",
      }}
    >
      {/* Global toast container, RTL-aware */}
      <Toaster position="top-center" richColors dir="rtl" />

      <div dir="rtl" style={{ background: "var(--bg)", minHeight: "100vh" }}>
        {/* ── Top bar ─────────────────────────────────────────────────── */}
        <header
          style={{
            background: "var(--surface)",
            borderBottom: "1px solid var(--border)",
            boxShadow: "var(--shadow-sm)",
            position: "sticky",
            top: 0,
            zIndex: 30,
          }}
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
            <span
              className="text-base sm:text-lg font-bold tracking-tight"
              style={{ color: "var(--gold)" }}
            >
              موطن الريف
            </span>

            <span
              className="text-xs sm:text-sm flex items-center gap-1.5"
              style={{ color: "var(--text-3)" }}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                aria-hidden="true"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              دفع آمن ومشفّر
            </span>
          </div>
        </header>

        {/* ── Step Indicator ──────────────────────────────────────────── */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-7 pb-4">
          <StepIndicator current={step} />
        </div>

        {/* ── Main content ────────────────────────────────────────────── */}
        {step < 3 ?
          <main className="max-w-5xl mx-auto px-4 sm:px-6 pb-24">
            <div className="flex flex-col lg:grid lg:grid-cols-[1fr_356px] gap-6 lg:gap-8 lg:items-start">
              {/* Form column */}
              <div className="min-w-0">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={step}
                    variants={stepVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                  >
                    {step === 1 && (
                      <Step1Shipping
                        items={items}
                        isSubmitting={isSubmitting}
                        onSuccess={toStep2}
                      />
                    )}

                    {step === 2 && pendingOrder && (
                      <Step2Payment
                        pendingOrder={pendingOrder}
                        isSubmitting={isSubmitting}
                        onSuccess={toStep3}
                        onExpired={onExpired}
                        onBack={goBack}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Summary sidebar */}
              <aside className="order-first lg:order-none">
                <OrderSummary
                  items={items}
                  overrideTotal={
                    step === 2 ? pendingOrder?.totalPrice : undefined
                  }
                />
              </aside>
            </div>
          </main>
        : /* Success screen — lazy loaded */
          <Step3Success orderId={completedOrderId!} items={items} />
        }
      </div>

      {/* Session-expired modal — full-page, not a toast */}
      {showExpiredModal && <ExpiredModal onRestart={onRestart} />}
    </PayPalScriptProvider>
  );
}
