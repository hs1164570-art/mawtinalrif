import type { Metadata } from "next";
import { RegisterForm } from "./_components/RegisterForm";

export const metadata: Metadata = {
  title: "إنشاء حساب | موطن الريف",
  description:
    "أنشئ حسابك في موطن الريف وتمتع بتجربة تسوق استثنائية لأفخم الأثاث والديكور.",
  robots: { index: false, follow: false },
};

export default function RegisterPage() {
  return <RegisterForm />;
}
