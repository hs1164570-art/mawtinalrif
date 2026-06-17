import Image from "next/image";
import Link from "next/link";
import { Noto_Naskh_Arabic, IBM_Plex_Sans_Arabic } from "next/font/google";

// الخطوط الأصلية الفخمة بتاعتك
const naskh = Noto_Naskh_Arabic({
  subsets: ["arabic"],
  weight: ["500", "600"],
  variable: "--font-naskh",
  display: "swap",
});

const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-arabic",
  display: "swap",
});

const BG_URL =
  "https://bwmvrztnbjayktocsdvc.supabase.co/storage/v1/object/public/alrif/1000110665.png";

const BLUR_DATA_URL =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAA0JCgsKCA0LCgsODg0PEyAVExISEyccHhcgLikxMC4pLSwzOko+MzZGNywtQFdBRkxOUlNSMj5aYVpQYEpRUk//2wBDAQ4ODhMREyYVFSZPNS01T09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0//wAARCAALABADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwCh4WsI5LCQyoQS46jqMVq6vpdoLe3G370oB2+9cna311Bf29tFO6w7/uiuyVjKFEh3YcYzXKzpR//Z";

const TEXT_GOLD = "#E6C194";
const LIGHT_CREAM = "#F9F6F0";
const PRIMARY_BUTTON = "#3D2513";

const content = {
  wordmark: "موطن الريف",
  error: "عذراً.. خطأ 404",
  title: "لم نعثر على هذه الصفحة",
  description:
    "قد يكون الرابط غير صحيح أو تم نقل المحتوى إلى مكان آخر. يمكنك تصفّح المجموعة من خلال الروابط أدناه.",
  home: "الصفحة الرئيسية",
};

export default function NotFound() {
  return (
    <div
      className={`${naskh.variable} ${plexArabic.variable} is-not-found-page relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#1A0F08]`}
    >
      {/* حقن حركات الإنيميشن وكود إخفاء الناف بار والفوتر */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          /* 1. إنيميشن الظهور التدريجي للنصوص */
          @keyframes stateFadeUp { 
            from { opacity: 0; transform: translateY(12px); } 
            to { opacity: 1; transform: translateY(0); } 
          }

          /* 2. 🕺 إنيميشن الرقص والاهتزاز لـ 404 */
          @keyframes danceAndBounce {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            20% { transform: translateY(-8px) rotate(-3deg); }
            40% { transform: translateY(2px) rotate(3deg); }
            60% { transform: translateY(-4px) rotate(-1.5deg); }
            80% { transform: translateY(1px) rotate(1.5deg); }
          }

          /* 🎯 3. الخرسانة: إخفاء الناف بار والفوتر في الأب فوراً عند ريندير هذه الصفحة */
          body:has(.is-not-found-page) nav,
          body:has(.is-not-found-page) header,
          body:has(.is-not-found-page) footer {
            display: none !important;
          }
        `,
        }}
      />

      {/* الصورة الأصلية الفخمة */}
      <Image
        src={BG_URL}
        alt="خلفية موطن الريف"
        fill
        priority
        sizes="100vw"
        quality={95}
        placeholder="blur"
        blurDataURL={BLUR_DATA_URL}
        className="object-cover"
      />

      {/* الـ Overlay السحري */}
      <div
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
        aria-hidden="true"
      />

      {/* التدرج الحوافي الداكن */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,0,0,0.2) 30%, rgba(26,15,8,0.85) 100%)",
        }}
        aria-hidden="true"
      />

      {/* محتوى الصفحة بالكامل */}
      <div className="relative z-10 flex w-full max-w-lg flex-col items-center px-6 text-center">
        {/* اللوجو أو اسم البراند */}
        <span
          style={{
            fontFamily: "var(--font-plex-arabic)",
            color: TEXT_GOLD,
            animation: "stateFadeUp 0.5s ease-out both",
          }}
          className="text-xs font-semibold tracking-[0.25em] uppercase"
        >
          {content.wordmark}
        </span>

        {/* 🕺 رقم الـ 404 بيرقص ويهتز بشكل دوري فخم وممتع */}
        <div
          style={{
            fontFamily: "var(--font-naskh)",
            color: TEXT_GOLD,
            animation:
              "stateFadeUp 0.5s ease-out 0.1s both, danceAndBounce 2.5s ease-in-out infinite",
            display: "inline-block",
          }}
          className="mt-8 text-7xl font-bold tracking-wider opacity-95 sm:text-8xl select-none cursor-default"
        >
          404
        </div>

        {/* عنوان الخطأ */}
        <h1
          style={{
            fontFamily: "var(--font-naskh)",
            color: LIGHT_CREAM,
            animation: "stateFadeUp 0.6s ease-out 0.18s both",
          }}
          className="mt-4 text-2xl font-medium leading-tight sm:text-4xl"
        >
          {content.title}
        </h1>

        {/* وصف توضيحي للمستخدم */}
        <p
          style={{
            fontFamily: "var(--font-plex-arabic)",
            color: LIGHT_CREAM,
            animation: "stateFadeUp 0.6s ease-out 0.3s both",
          }}
          className="mt-4 max-w-md text-sm leading-relaxed sm:text-base opacity-85"
        >
          {content.description}
        </p>

        {/* الأزرار التفاعلية */}
        <div
          style={{
            fontFamily: "var(--font-plex-arabic)",
            animation: "stateFadeUp 0.6s ease-out 0.4s both",
          }}
          className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          <Link
            href="/"
            style={{ backgroundColor: PRIMARY_BUTTON, color: LIGHT_CREAM }}
            className="w-full sm:w-auto rounded-full px-8 py-3 text-sm font-medium transition-all hover:brightness-125 hover:shadow-lg active:scale-[0.98] text-center"
          >
            {content.home}
          </Link>
        </div>
      </div>
    </div>
  );
}
