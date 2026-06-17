import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";
import { Cormorant_Garamond, Noto_Naskh_Arabic } from "next/font/google";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-cormorant",
  display: "swap",
});

const notoArabic = Noto_Naskh_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-arabic",
  display: "swap",
});

// 📌 هنا تم إرجاع الرابط الأصلي الصحيح تماماً بدون أي تغيير
const AUTH_IMAGE =
  "https://bwmvrztnbjayktocsdvc.supabase.co/storage/v1/object/sign/alrif/alrifl%20-auth-image.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hNzkzMzE5NS0xOGUwLTRkOTMtYTRiMC0xNjczMTVlOTUyMGUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhbHJpZi9hbHJpZmwgLWF1dGgtaW1hZ2UucG5nIiwiaWF0IjoxNzgwOTkwNzM1LCJleHAiOjY1Nzk5MDcwNzM1fQ.sC2Z_nuFZtXp8I8TJzKDTtn8pqnnACArdPSG4xh8awQ";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${cormorant.variable} ${notoArabic.variable} min-h-screen flex bg-[#FAF8F5]`}
      dir="rtl"
    >
      {/* ─── قسم الفورم والنصوص (يمين) ─────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        {/* شريط الشعار العلوي */}
        <div className="px-8 pt-8 pb-2 flex items-center gap-4">
          <Link
            href="/"
            aria-label="العودة إلى الرئيسية"
            className="flex flex-col leading-none group shrink-0"
          >
            <span className="text-stone-800 text-2xl font-bold tracking-wide font-[family-name:var(--font-arabic)] transition-colors duration-200 group-hover:text-stone-600">
              موطن الريف
            </span>
            <span className="text-stone-400 text-[10px] tracking-[0.25em] uppercase mt-1 group-hover:text-stone-500 transition-colors duration-200">
              Mawten Al-Reef
            </span>
          </Link>

          {/* خط ديكوري ناعم بلون ترابي خفيف جداً */}
          <div className="hidden sm:block flex-1 h-px bg-gradient-to-l from-stone-200 to-transparent" />
        </div>

        {/* منطقة النوافذ والأشكال (المحتوى المتغير) */}
        <div className="flex-1 flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-[420px]">{children}</div>
        </div>

        {/* تذييل الصفحة الهادئ */}
        <footer className="text-center text-xs text-stone-400 pb-6 px-4">
          © {new Date().getFullYear()} موطن الريف. جميع الحقوق محفوظة.
        </footer>
      </main>

      {/* ─── قسم الصورة الجانبية الكبيرة (يسار) ──────────────────────────────── */}
      <aside
        className="hidden lg:block lg:w-[48%] xl:w-[50%] relative"
        aria-hidden="true"
      >
        <div className="sticky top-0 h-screen overflow-hidden">
          {/* الصورة الأساسية للأثاث */}
          <Image
            src={AUTH_IMAGE}
            alt=""
            fill
            sizes="(min-width: 1280px) 50vw, 48vw"
            quality={100}
            priority
            className="object-cover object-center"
          />

          {/* تدرج ظلي دافئ وناعم جداً أسفل الصورة ليظهر النص بوضوح */}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-stone-900/10 to-transparent" />

          {/* فاصل حافة دقيق وأنيق للغاية بلون بيج دافئ */}
          <div className="absolute top-0 right-0 bottom-0 w-px bg-gradient-to-b from-transparent via-stone-300/30 to-transparent" />

          {/* شعار السلوجان (العبارة الملهمة) */}
          <div className="absolute bottom-12 inset-x-0 text-center px-8">
            <p className="text-white/95 text-2xl font-light tracking-wide font-[family-name:var(--font-arabic)] shadow-sm">
              أناقة تسكن كل زاوية
            </p>
            <div className="w-8 h-0.5 bg-stone-300/60 mx-auto mt-4" />
          </div>
        </div>
      </aside>
    </div>
  );
}
