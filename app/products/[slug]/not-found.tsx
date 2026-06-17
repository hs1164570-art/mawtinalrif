import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "المنتج غير موجود | موطن الريف",
  description: "المنتج الذي تبحث عنه غير موجود أو تم حذفه.",
  // CRITICAL: noindex حتى لا تُفهرس صفحات 404
  robots: { index: false, follow: false },
};

export default function ProductNotFound() {
  return (
    <main
      className="min-h-[60vh] flex flex-col items-center justify-center px-4 bg-[#fdfaf6]"
      dir="rtl"
      lang="ar"
    >
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4" aria-hidden="true">🪑</div>
        <h1 className="text-2xl font-bold text-[#181008] mb-3">
          المنتج غير موجود
        </h1>
        <p className="text-[#483820] text-sm mb-8">
          المنتج الذي تبحث عنه غير موجود أو تم حذفه. تصفّح منتجاتنا
          الأخرى للعثور على ما يناسبك.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/products"
            className="px-6 py-2.5 rounded-xl bg-[#a07830] text-white text-sm font-semibold hover:bg-[#8a6628] transition-colors"
          >
            تصفّح كل المنتجات
          </Link>
          <Link
            href="/"
            className="px-6 py-2.5 rounded-xl border border-[rgba(90,60,20,0.2)] text-[#483820] text-sm font-semibold hover:bg-[#fdf9f4] transition-colors"
          >
            العودة للرئيسية
          </Link>
        </div>
      </div>
    </main>
  );
}
