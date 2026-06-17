"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { z } from "zod";
import { forgetPassword } from "@/app/actions/forget-password_action";
import { emailschema } from "../../../utils/forget_reset_Password";
import {
  AuthInput,
  SubmitButton,
  AuthHeading,
  AuthAlert,
} from "../../_components/AuthUI";

type EmailForm = z.infer<typeof emailschema>;

export function ForgetPasswordForm() {
  const [serverMsg, setServerMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EmailForm>({ resolver: zodResolver(emailschema) });

  async function onSubmit(data: EmailForm) {
    setServerMsg(null);
    const lang = document.documentElement.lang ?? "ar";
    const result = await forgetPassword(data.email, lang);

    if (result.success) {
      setSent(true);
    } else {
      setServerMsg({ type: "error", text: result.message });
    }
  }

  /* ── Sent state ── */
  if (sent) {
    return (
      <section
        aria-labelledby="forget-sent-heading"
        className="flex flex-col items-center text-center"
      >
        {/* Icon ring */}
        <span
          className="inline-flex items-center justify-center w-16 h-16 rounded-full
            bg-amber-100 border border-amber-300/50 mb-6 text-3xl"
          aria-hidden="true"
        >
          ✉️
        </span>

        <h1
          id="forget-sent-heading"
          className="text-3xl font-semibold text-stone-900 mb-3 font-[family-name:var(--font-cormorant)]"
        >
          تحقق من بريدك
        </h1>

        {/* gold rule */}
        <div className="w-8 h-0.5 bg-gradient-to-l from-amber-800 to-yellow-500 mb-5 rounded-full" />

        <p className="text-sm text-stone-500 max-w-xs leading-relaxed mb-6">
          أرسلنا رابط إعادة التعيين إلى بريدك الإلكتروني. الرابط صالح لمدة ساعة.
        </p>

        <Link
          href="/auth/login"
          className="text-sm text-amber-700 font-medium hover:text-yellow-600 transition-colors duration-150"
        >
          العودة إلى تسجيل الدخول
        </Link>
      </section>
    );
  }

  /* ── Form state ── */
  return (
    <section aria-labelledby="forget-heading">
      <AuthHeading
        title="نسيت كلمة المرور؟"
        subtitle="أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة التعيين."
      />

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-5"
      >
        <AuthInput
          id="forget-email"
          label="البريد الإلكتروني"
          type="email"
          autoComplete="email"
          placeholder="example@email.com"
          {...register("email")}
          error={errors.email?.message}
        />

        {serverMsg && (
          <AuthAlert type={serverMsg.type} message={serverMsg.text} />
        )}

        <SubmitButton loading={isSubmitting}>إرسال رابط الاسترداد</SubmitButton>
      </form>

      <p className="text-center text-sm text-stone-500 mt-6">
        تذكرت كلمة المرور؟{" "}
        <Link
          href="/auth/login"
          className="text-amber-700 font-medium hover:text-yellow-600 transition-colors duration-150"
        >
          تسجيل الدخول
        </Link>
      </p>
    </section>
  );
}
