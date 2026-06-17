"use client";
// app/checkout/_components/Step1Shipping.tsx

import { MutableRefObject } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import DOMPurify from "dompurify";
import type { CheckoutItem, PendingOrderResult } from "../types";
import { SAUDI_REGIONS } from "../types";

// ── Zod schema ─────────────────────────────────────────────────────────────
const schema = z.object({
  phoneNumber: z
    .string()
    .min(1, "رقم الهاتف مطلوب")
    .regex(/^\+?[0-9]{7,15}$/, "يجب أن يكون الرقم بين 7 و 15 رقمًا"),
  region: z.enum(SAUDI_REGIONS, {
    errorMap: () => ({ message: "يرجى اختيار المنطقة" }),
  }),
  street: z
    .string()
    .max(200, "الحد الأقصى 200 حرف")
    .optional()
    .or(z.literal("")),
  coupon: z
    .string()
    .trim()
    .max(50, "الحد الأقصى 50 حرف")
    .optional()
    .or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

// ── Helpers ────────────────────────────────────────────────────────────────
const sanitize = (s: string): string =>
  DOMPurify.sanitize(s.trim(), { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });

// ── Shared style helpers ───────────────────────────────────────────────────
const baseInputStyle: React.CSSProperties = {
  background: "var(--surface-2)",
  border: "1px solid var(--border-md)",
  color: "var(--text-1)",
  outline: "none",
  width: "100%",
  borderRadius: "0.75rem",
  padding: "0.75rem 1rem",
  fontSize: "0.875rem",
  transition: "border-color 0.18s, box-shadow 0.18s",
};

const errorInputStyle: React.CSSProperties = {
  ...baseInputStyle,
  border: "1px solid var(--red)",
};

const lockedInputStyle: React.CSSProperties = {
  ...baseInputStyle,
  background: "var(--bg-deep)",
  color: "var(--text-3)",
  cursor: "not-allowed",
  opacity: 0.85,
};

// ── Component ──────────────────────────────────────────────────────────────
interface Props {
  items: CheckoutItem[];
  isSubmitting: MutableRefObject<boolean>;
  onSuccess: (order: PendingOrderResult) => void;
}

export default function Step1Shipping({
  items,
  isSubmitting,
  onSuccess,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting: formBusy },
    setFocus,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      phoneNumber: "",
      region: undefined,
      street: "",
      coupon: "",
    },
  });

  // ── Submit handler ──────────────────────────────────────────────────────
  const onSubmit = async (values: FormValues) => {
    if (isSubmitting.current) return; // Double-submission guard
    isSubmitting.current = true;

    try {
      const payload = {
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
        phoneNumber: sanitize(values.phoneNumber),
        country: "المملكة العربية السعودية", // Hardcoded — only supported country
        region: sanitize(values.region),
        ...(values.street?.trim() ? { street: sanitize(values.street) } : {}),
        ...(values.coupon?.trim() ? { coupon: sanitize(values.coupon) } : {}),
      };

      const res = await fetch("/api/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Extra CSRF layer: browsers won't send this header cross-origin
          "X-Requested-With": "XMLHttpRequest",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data?.message ?? "حدث خطأ، حاول مرة أخرى");
        isSubmitting.current = false;
        return;
      }

      onSuccess({
        paypalOrderId: data.paypalOrderId,
        totalPrice: data.totalPrice,
      });
    } catch {
      toast.error("تعذّر الاتصال بالخادم، تحقق من اتصالك بالإنترنت");
      isSubmitting.current = false;
    }
  };

  const busy = formBusy || isSubmitting.current;

  return (
    <section
      className="rounded-2xl overflow-hidden"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border-md)",
        boxShadow: "var(--shadow-sm)",
      }}
      aria-labelledby="shipping-heading"
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
          1
        </span>
        <h1
          id="shipping-heading"
          className="text-base font-bold"
          style={{ color: "var(--text-1)" }}
        >
          بيانات الشحن
        </h1>
      </div>

      {/* Form body */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="px-6 py-6 space-y-5"
      >
        {/* ── Phone number ─────────────────────────────────────────── */}
        <div>
          <label
            htmlFor="phoneNumber"
            className="block text-xs font-semibold mb-1.5"
            style={{ color: "var(--text-2)" }}
          >
            رقم الهاتف
            <span style={{ color: "var(--red)" }} aria-hidden="true">
              {" "}
              *
            </span>
          </label>

          <div className="relative">
            {/* SA flag prefix */}
            <div
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none select-none text-sm gap-1.5"
              aria-hidden="true"
              style={{ color: "var(--text-3)" }}
            >
              <span>🇸🇦</span>
              <span style={{ color: "var(--border-strong)" }}>|</span>
            </div>
            <input
              id="phoneNumber"
              type="tel"
              autoComplete="tel"
              dir="ltr"
              placeholder="+966 5X XXX XXXX"
              style={{
                ...(errors.phoneNumber ? errorInputStyle : baseInputStyle),
                paddingRight: "4.5rem",
              }}
              aria-required="true"
              aria-invalid={!!errors.phoneNumber}
              aria-describedby={
                errors.phoneNumber ? "phoneNumber-err" : undefined
              }
              {...register("phoneNumber")}
            />
          </div>

          {errors.phoneNumber && (
            <p
              id="phoneNumber-err"
              role="alert"
              className="mt-1.5 text-[11px] flex items-center gap-1"
              style={{ color: "var(--red)" }}
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
              {errors.phoneNumber.message}
            </p>
          )}
        </div>

        {/* ── Country — locked ─────────────────────────────────────── */}
        <div>
          <label
            htmlFor="country-display"
            className="block text-xs font-semibold mb-1.5"
            style={{ color: "var(--text-2)" }}
          >
            الدولة
          </label>
          <div className="relative">
            <input
              id="country-display"
              type="text"
              value="المملكة العربية السعودية 🇸🇦"
              readOnly
              disabled
              style={lockedInputStyle}
              aria-label="الدولة: المملكة العربية السعودية (متوفر حاليًا)"
            />
            <div
              className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none"
              aria-hidden="true"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ color: "var(--text-3)" }}
              >
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
          </div>
          <p className="mt-1 text-[11px]" style={{ color: "var(--text-3)" }}>
            التوصيل متاح داخل المملكة فقط حاليًا
          </p>
        </div>

        {/* ── Region select ─────────────────────────────────────────── */}
        <div>
          <label
            htmlFor="region"
            className="block text-xs font-semibold mb-1.5"
            style={{ color: "var(--text-2)" }}
          >
            المنطقة الإدارية
            <span style={{ color: "var(--red)" }} aria-hidden="true">
              {" "}
              *
            </span>
          </label>

          <div className="relative">
            <select
              id="region"
              style={{
                ...(errors.region ? errorInputStyle : baseInputStyle),
                paddingLeft: "2.25rem",
                appearance: "none",
                WebkitAppearance: "none",
                cursor: "pointer",
              }}
              defaultValue=""
              aria-required="true"
              aria-invalid={!!errors.region}
              aria-describedby={errors.region ? "region-err" : undefined}
              {...register("region")}
            >
              <option value="" disabled>
                — اختر المنطقة —
              </option>
              {SAUDI_REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>

            {/* Chevron icon */}
            <div
              className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"
              aria-hidden="true"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                style={{ color: "var(--text-3)" }}
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
          </div>

          {errors.region && (
            <p
              id="region-err"
              role="alert"
              className="mt-1.5 text-[11px] flex items-center gap-1"
              style={{ color: "var(--red)" }}
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
              {errors.region.message}
            </p>
          )}
        </div>

        {/* ── Street / address detail (optional) ──────────────────── */}
        <div>
          <label
            htmlFor="street"
            className="block text-xs font-semibold mb-1.5"
            style={{ color: "var(--text-2)" }}
          >
            الشارع / تفاصيل العنوان
            <span
              className="font-normal mr-1"
              style={{ color: "var(--text-3)", fontSize: "0.7rem" }}
            >
              (اختياري)
            </span>
          </label>

          <textarea
            id="street"
            rows={2}
            autoComplete="street-address"
            placeholder="مثال: حي النخيل، شارع الأمير محمد، مقابل المسجد الكبير"
            style={{
              ...(errors.street ? errorInputStyle : baseInputStyle),
              resize: "none",
              lineHeight: 1.6,
            }}
            aria-describedby={errors.street ? "street-err" : undefined}
            {...register("street")}
          />

          {errors.street && (
            <p
              id="street-err"
              role="alert"
              className="mt-1.5 text-[11px] flex items-center gap-1"
              style={{ color: "var(--red)" }}
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
              {errors.street.message}
            </p>
          )}
        </div>

        {/* ── Coupon code (optional) ───────────────────────────────── */}
        <div>
          <label
            htmlFor="coupon"
            className="block text-xs font-semibold mb-1.5"
            style={{ color: "var(--text-2)" }}
          >
            كود الخصم
            <span
              className="font-normal mr-1"
              style={{ color: "var(--text-3)", fontSize: "0.7rem" }}
            >
              (اختياري)
            </span>
          </label>

          <div className="relative">
            <div
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none"
              aria-hidden="true"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ color: "var(--gold)" }}
              >
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                <line x1="7" y1="7" x2="7.01" y2="7" />
              </svg>
            </div>
            <input
              id="coupon"
              type="text"
              autoCapitalize="characters"
              placeholder="أدخل كود الخصم"
              style={{
                ...(errors.coupon ? errorInputStyle : baseInputStyle),
                paddingRight: "2.75rem",
                fontFamily: "monospace",
                letterSpacing: "0.05em",
              }}
              {...register("coupon")}
            />
          </div>

          {errors.coupon && (
            <p
              id="coupon-err"
              role="alert"
              className="mt-1.5 text-[11px] flex items-center gap-1"
              style={{ color: "var(--red)" }}
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
              {errors.coupon.message}
            </p>
          )}

          <p className="mt-1 text-[11px]" style={{ color: "var(--text-3)" }}>
            سيُطبَّق الخصم على المجموع الكلي عند الانتقال للدفع
          </p>
        </div>

        {/* ── Submit ───────────────────────────────────────────────── */}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all duration-200 mt-2"
          style={{
            background: busy ? "var(--border-strong)" : "var(--gold)",
            color: "var(--text-inv)",
            padding: "0.875rem 1.5rem",
            cursor: busy ? "not-allowed" : "pointer",
            boxShadow: busy ? "none" : "var(--shadow-md)",
            transform: busy ? "none" : undefined,
          }}
          aria-busy={busy}
        >
          {busy ?
            <>
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
              جارٍ المعالجة...
            </>
          : <>
              المتابعة للدفع
              {/* Left-pointing arrow = "forward" in RTL */}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                aria-hidden="true"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </>
          }
        </button>
      </form>
    </section>
  );
}
