import type { Metadata } from "next";
import { ForgetPasswordForm } from "./_components/ForgetPasswordForm";

export const metadata: Metadata = {
  title: "نسيت كلمة المرور | موطن الريف",
  description: "أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور.",
  robots: { index: false, follow: false },
};

export default function ForgetPasswordPage() {
  return <ForgetPasswordForm />;
}
