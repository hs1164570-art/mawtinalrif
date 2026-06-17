import type { Metadata } from "next";
import Link from "next/link";
import { verifyToken } from "@/app/actions/verify_action";

export const metadata: Metadata = {
  title: "تأكيد البريد الإلكتروني | موطن الريف",
  description: "جارٍ التحقق من بريدك الإلكتروني وتفعيل حسابك في موطن الريف.",
  robots: { index: false, follow: false },
};

interface Props {
  params: Promise<{ token: string }>;
}

export default async function VerifyTokenPage({ params }: Props) {
  const { token } = await params;
  const result = await verifyToken(token);
  const ok = result.success;

  return (
    <section
      aria-labelledby="verify-result-heading"
      className="flex flex-col items-center text-center"
    >
      {/* Status icon */}
      <span
        className={[
          "inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 text-3xl",
          ok ?
            "bg-amber-100 border border-amber-300/50"
          : "bg-red-50 border border-red-200",
        ].join(" ")}
        aria-hidden="true"
      >
        {ok ? "✓" : "✕"}
      </span>

      <h1
        id="verify-result-heading"
        className="text-3xl font-semibold text-stone-900 mb-3 font-[family-name:var(--font-cormorant)]"
      >
        {ok ? "تم التحقق بنجاح!" : "رابط غير صالح"}
      </h1>

      {/* gold rule */}
      <div className="w-8 h-0.5 bg-gradient-to-l from-amber-800 to-yellow-500 mb-6 rounded-full" />

      <p className="text-sm text-stone-500 leading-relaxed max-w-sm mb-8">
        {ok ?
          "تم تفعيل حسابك بنجاح. يمكنك الآن تسجيل الدخول والتسوق في موطن الريف."
        : result.message === "token is expierd" ?
          "انتهت صلاحية رابط التحقق. سجّل الدخول لنرسل لك رابطاً جديداً."
        : "الرابط غير صالح أو مستخدم مسبقاً."}
      </p>

      <Link
        href="/auth/login"
        className="
          inline-flex items-center justify-center px-6 py-3 rounded-lg
          bg-gradient-to-l from-amber-800 to-amber-600 text-white text-sm font-medium
          shadow-[0_4px_16px_rgba(146,64,14,0.28)]
          hover:from-amber-700 hover:to-yellow-600
          hover:shadow-[0_6px_24px_rgba(146,64,14,0.42)]
          transition-all duration-300
        "
      >
        {ok ? "تسجيل الدخول الآن" : "العودة إلى تسجيل الدخول"}
      </Link>
    </section>
  );
}
