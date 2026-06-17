import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "تحقق من بريدك | موطن الريف",
  description: "تم إرسال رابط التحقق. تحقق من بريدك الإلكتروني لتفعيل حسابك.",
  robots: { index: false, follow: false },
};

const STEPS = [
  "افتح بريدك الإلكتروني",
  "ابحث عن رسالة من موطن الريف",
  'انقر على زر "تفعيل الحساب"',
];

export default function VerifyPage() {
  return (
    <section
      aria-labelledby="verify-heading"
      className="flex flex-col items-center text-center"
    >
      {/* Envelope icon */}
      <span
        className="inline-flex items-center justify-center w-16 h-16 rounded-full
          bg-amber-100 border border-amber-300/50 mb-6 text-3xl"
        aria-hidden="true"
      >
        ✉️
      </span>

      <h1
        id="verify-heading"
        className="text-3xl font-semibold text-stone-900 mb-3 font-[family-name:var(--font-cormorant)]"
      >
        تحقق من بريدك الإلكتروني
      </h1>

      {/* gold rule */}
      <div className="w-8 h-0.5 bg-gradient-to-l from-amber-800 to-yellow-500 mb-6 rounded-full" />

      <p className="text-sm text-stone-500 leading-relaxed max-w-sm mb-2">
        أرسلنا رابط التحقق إلى بريدك الإلكتروني. افتح بريدك وانقر على الرابط
        لتفعيل حسابك.
      </p>
      <p className="text-xs text-stone-400 mb-8">
        إذا لم تجده في صندوق الوارد، تحقق من مجلد البريد غير المرغوب فيه.
      </p>

      {/* Steps */}
      <ol
        aria-label="خطوات التحقق"
        className="w-full max-w-xs text-right space-y-3 mb-8"
      >
        {STEPS.map((step, i) => (
          <li
            key={i}
            className="flex items-center gap-3 text-sm text-stone-700"
          >
            <span
              className="shrink-0 w-6 h-6 rounded-full bg-amber-100 border border-amber-300/60
                flex items-center justify-center text-xs font-semibold text-amber-800"
              aria-hidden="true"
            >
              {i + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>

      <Link
        href="/auth/login"
        className="text-sm text-amber-700 font-medium hover:text-yellow-600 transition-colors duration-150"
      >
        العودة إلى تسجيل الدخول
      </Link>
    </section>
  );
}
