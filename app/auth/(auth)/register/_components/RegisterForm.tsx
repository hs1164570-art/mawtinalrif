"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerAction } from "@/app/actions/register_action";
import {
  registerSchema,
  type RegisterFormData,
} from "@/app/auth/utils/register";
import {
  AuthInput,
  SubmitButton,
  GoogleButton,
  AuthDivider,
  AuthHeading,
  AuthAlert,
} from "../../_components/AuthUI";

export function RegisterForm() {
  const router = useRouter();
  const [serverMsg, setServerMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(data: RegisterFormData) {
    setServerMsg(null);
    const lang = document.documentElement.lang ?? "ar";
    const result = await registerAction(data, lang);

    if (result.success) {
      router.push("auth/verify");
    } else {
      setServerMsg({ type: "error", text: result.message });
    }
  }

  return (
    <section aria-labelledby="register-heading">
      <AuthHeading
        title="إنشاء حساب جديد"
        subtitle="انضم إلى موطن الريف واستكشف أرقى تشكيلات الأثاث الفاخر."
      />

      <GoogleButton callbackUrl="/" />

      <AuthDivider />

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-5"
      >
        <AuthInput
          id="name"
          label="الاسم الكامل"
          type="text"
          autoComplete="name"
          placeholder="محمد أحمد"
          {...register("name")}
          error={errors.name?.message}
        />

        <AuthInput
          id="reg-email"
          label="البريد الإلكتروني"
          type="email"
          autoComplete="email"
          placeholder="example@email.com"
          {...register("email")}
          error={errors.email?.message}
        />

        <AuthInput
          id="reg-password"
          label="كلمة المرور"
          type="password"
          autoComplete="new-password"
          placeholder="8 أحرف على الأقل"
          {...register("password")}
          error={errors.password?.message}
        />

        <AuthInput
          id="confirmPassword"
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

        <SubmitButton loading={isSubmitting}>إنشاء الحساب</SubmitButton>

        <p className="text-xs text-stone-400 text-center leading-relaxed">
          بإنشاء حساب فأنت توافق على{" "}
          <Link
            href="/terms"
            className="text-amber-700 hover:underline underline-offset-2"
          >
            شروط الاستخدام
          </Link>{" "}
          و{" "}
          <Link
            href="/privacy"
            className="text-amber-700 hover:underline underline-offset-2"
          >
            سياسة الخصوصية
          </Link>
        </p>
      </form>

      <p className="text-center text-sm text-stone-500 mt-6">
        لديك حساب بالفعل؟{" "}
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
