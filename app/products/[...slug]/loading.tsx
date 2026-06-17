/**
 * loading.tsx — حالة التحميل لصفحة عرض المنتجات حسب القسم
 *
 * Skeleton/Pulse على بس على اللي مجهول وقت التحميل:
 *   1) صورة الهيرو فوق
 *   2) شبكة المنتجات
 * أي حاجة تانية (تصفية، شريط الترتيب) مش موجودة في الملف ده أصلاً.
 *
 * الألوان مأخوذة من سكرين شوت التصميم بتاعك:
 *   #F8F4EB → خلفية الصفحة
 *   #ECE3D1 → لون الـ skeleton (الجزء اللي بينبض)
 * لو عندك ألوان جاهزة في tailwind.config (مثلاً bg-cream أو
 * bg-skeleton) استبدل القيم دي بيها على طول.
 */

export default function ProductsLoading() {
  return (
    <div dir="rtl" className="min-h-screen bg-[#F8F4EB]">
      {/* ── صورة الهيرو ── */}
      <div className="h-[230px] w-full animate-pulse bg-[#ECE3D1] sm:h-[300px] lg:h-[380px]" />

      {/* ── شبكة المنتجات ── */}
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-8 sm:grid-cols-3 sm:px-6 lg:grid-cols-4 lg:px-8">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i}>
            <div className="aspect-[3/2] w-full animate-pulse rounded-2xl bg-[#ECE3D1]" />
            <div className="mt-2.5 space-y-1.5">
              <div className="h-3 w-16 animate-pulse rounded bg-[#ECE3D1]" />
              <div className="h-4 w-[80%] animate-pulse rounded bg-[#ECE3D1]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
