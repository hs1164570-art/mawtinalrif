/**
 * loading.tsx — حالة التحميل لصفحة عرض المنتجات حسب القسم
 *
 * Skeleton/Pulse على بس على اللي مجهول وقت التحميل:
 * 1) صورة الهيرو فوق
 * 2) شبكة المنتجات
 *
 * تم تحديث الألوان بالكامل لتعمل من خلال الـ CSS Variables الخاصة بالنظام الجديد.
 */

export default function ProductsLoading() {
  return (
    <div dir="rtl" className="min-h-screen" style={{ background: "var(--bg)" }}>
      {/* ── صورة الهيرو ── */}
      <div
        className="h-[230px] w-full animate-pulse sm:h-[300px] lg:h-[380px]"
        style={{ background: "var(--bg-deep)" }}
      />

      {/* ── شبكة المنتجات ── */}
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-8 sm:grid-cols-3 sm:px-6 lg:grid-cols-4 lg:px-8">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i}>
            {/* كارت المنتج Skeleton */}
            <div
              className="aspect-[3/2] w-full animate-pulse rounded-2xl"
              style={{ background: "var(--bg-deep)" }}
            />
            {/* تفاصيل النص الهيكلية */}
            <div className="mt-2.5 space-y-1.5">
              <div
                className="h-3 w-16 animate-pulse rounded"
                style={{ background: "var(--bg-deep)" }}
              />
              <div
                className="h-4 w-[80%] animate-pulse rounded"
                style={{ background: "var(--bg-deep)" }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
