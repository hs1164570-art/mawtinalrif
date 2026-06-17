import type { Metadata } from "next";
import { ResetPasswordForm } from "./_components/ResetPasswordForm";

export const metadata: Metadata = {
  title: "إعادة تعيين كلمة المرور | موطن الريف",
  description: "أدخل كلمة المرور الجديدة لإعادة تعيين حسابك في موطن الريف.",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
