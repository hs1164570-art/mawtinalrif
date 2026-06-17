"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQueryState } from "nuqs";
import { z } from "zod";
import { resetPassword } from "@/app/actions/reset-password_action";
import { passwordSchema } from "@/app/auth/utils/forget_reset_Password";
import {
  AuthInput,
  SubmitButton,
  AuthHeading,
  AuthAlert,
} from "../../_components/AuthUI";

const resetSchema = passwordSchema
  .extend({ confirmPassword: z.string() })
  .refine((d) => d.password === d.confirmPassword, {
    message: "كلمتا المرور غير متطابقتين.",
    path: ["confirmPassword"],
  });

type ResetForm = z.infer<typeof resetSchema>;

const TOKEN_ERRORS: Record<string, string> = {
  "token is expierd": "انتهت صلاحية الرابط. يرجى طلب رابط جديد.",
  "token not found": "الرابط غير صالح أو مستخدم مسبقاً.",
};

export function ResetPasswordForm() {
  const router = useRouter();
  const [token] = useQueryState("token");
  const [serverMsg, setServerMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetForm>({ resolver: zodResolver(resetSchema) });

  async function onSubmit(data: ResetForm) {
    setServerMsg(null);
    const result = await resetPassword(token, data.password);

    if (result.success) {
      setServerMsg({
        type: "success",
        text: "تم تغيير كلمة المرور. …",
      });
      setTimeout(() => router.push("/login"), 800);
    } else {
      setServerMsg({
        type: "error",
        text: TOKEN_ERRORS[result.message] ?? result.message,
      });
    }
  }

  /* ── No token in URL ── */
  if (!token) {
    return (
      <section className="flex flex-col items-center text-center">
        <span
          className="inline-flex items-center justify-center w-16 h-16 rounded-full
            bg-red-50 border border-red-200 mb-6 text-3xl"
          aria-hidden="true"
        >
          🔗
        </span>
        <h1 className="text-2xl font-semibold text-stone-900 mb-3 font-[family-name:var(--font-cormorant)]">
          رابط غير صالح
        </h1>
        <div className="w-8 h-0.5 bg-gradient-to-l from-amber-800 to-yellow-500 mb-5 rounded-full" />
        <p className="text-sm text-stone-500 mb-6 max-w-xs leading-relaxed">
          هذا الرابط لا يحتوي على رمز التحقق. يرجى استخدام الرابط المُرسل إلى
          بريدك.
        </p>
        <Link
          href="auth/forget-password"
          className="text-sm text-amber-700 font-medium hover:text-yellow-600 transition-colors duration-150"
        >
          طلب رابط جديد
        </Link>
      </section>
    );
  }

  return (
    <section aria-labelledby="reset-heading">
      <AuthHeading
        title="إعادة تعيين كلمة المرور"
        subtitle="أدخل كلمة المرور الجديدة لتأمين حسابك."
      />

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-5"
      >
        <AuthInput
          id="new-password"
          label="كلمة المرور الجديدة"
          type="password"
          autoComplete="new-password"
          placeholder="8 أحرف على الأقل"
          {...register("password")}
          error={errors.password?.message}
        />

        <AuthInput
          id="confirm-new-password"
          label="تأكيد كلمة المرور"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          {...register("confirmPassword")}
          error={errors.confirmPassword?.message}
        />

        {serverMsg && (
          <AuthAlert type={serverMsg.type} message={serverMsg.text} />
        )}

        <SubmitButton loading={isSubmitting}>
          حفظ كلمة المرور الجديدة
        </SubmitButton>
      </form>

      <p className="text-center text-sm text-stone-500 mt-6">
        <Link
          href="/auth/login"
          className="text-amber-700 font-medium hover:text-yellow-600 transition-colors duration-150"
        >
          العودة إلى تسجيل الدخول
        </Link>
      </p>
    </section>
  );
}
