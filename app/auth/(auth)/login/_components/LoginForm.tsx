"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginAction } from "@/app/actions/login_action";
import { loginSchema, LoginFormData } from "@/app/auth/utils/login";
import {
  AuthInput,
  SubmitButton,
  GoogleButton,
  AuthDivider,
  AuthHeading,
  AuthAlert,
} from "../../_components/AuthUI";

const ERROR_MESSAGES: Record<string, string> = {
  CredentialsSignin: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
  AccessDenied:
    "بريدك الإلكتروني لم يتم التحقق منه بعد. تحقق من بريدك — أرسلنا لك رابطاً جديداً.",
  SomethingWentWrong: "حدث خطأ غير متوقع. حاول مرة أخرى.",
};

export function LoginForm() {
  const router = useRouter();
  const [serverMsg, setServerMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginFormData) {
    setServerMsg(null);
    const lang = document.documentElement.lang ?? "ar";
    const result = await loginAction(data, lang);

    if (result.success) {
      router.push("/");
      router.refresh();
    } else {
      setServerMsg({
        type: "error",
        text: ERROR_MESSAGES[result.message] ?? result.message,
      });
    }
  }

  return (
    <section aria-labelledby="login-heading">
      <AuthHeading
        title="أهلاً بعودتك"
        subtitle="سجّل دخولك للوصول إلى حسابك وطلباتك."
      />

      <GoogleButton callbackUrl="/" />

      <AuthDivider />

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-5"
      >
        <AuthInput
          id="email"
          label="البريد الإلكتروني"
          type="email"
          autoComplete="email"
          placeholder="example@email.com"
          {...register("email")}
          error={errors.email?.message}
        />

        {/* Password row with inline forget-password link */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-sm font-medium text-amber-900"
            >
              كلمة المرور
            </label>
            <Link
              href="/forget-password"
              className="text-xs text-amber-700 hover:text-yellow-600 transition-colors duration-150 underline-offset-2 hover:underline"
            >
              نسيت كلمة المرور؟
            </Link>
          </div>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "password-error" : undefined}
            {...register("password")}
            className={[
              "w-full px-4 py-3 rounded-lg border bg-white/80 text-stone-900 text-sm",
              "placeholder:text-stone-400 transition-all duration-200 outline-none",
              errors.password ?
                "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
              : "border-amber-900/20 focus:border-amber-700 focus:ring-2 focus:ring-amber-700/10",
            ].join(" ")}
          />
          {errors.password && (
            <p
              id="password-error"
              role="alert"
              className="text-xs text-red-600 mt-0.5"
            >
              {errors.password.message}
            </p>
          )}
        </div>

        {serverMsg && (
          <AuthAlert type={serverMsg.type} message={serverMsg.text} />
        )}

        <SubmitButton loading={isSubmitting}>تسجيل الدخول</SubmitButton>
      </form>

      <p className="text-center text-sm text-stone-500 mt-6">
        ليس لديك حساب؟{" "}
        <Link
          href="/auth/register"
          className="text-amber-700 font-medium hover:text-yellow-600 transition-colors duration-150"
        >
          إنشاء حساب
        </Link>
      </p>
    </section>
  );
}
