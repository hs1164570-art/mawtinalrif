import type { Metadata } from "next";
import { LoginForm } from "./_components/LoginForm";

export const metadata: Metadata = {
  title: "تسجيل الدخول | موطن الريف",
  description:
    "سجّل دخولك إلى موطن الريف واستكشف أرقى تشكيلات الأثاث والديكور الفاخر.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return <LoginForm />;
}
