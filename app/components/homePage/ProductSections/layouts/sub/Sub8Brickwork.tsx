/**
 * Layout 8 — Circular Brickwork (النسخة الدائرية الملكية)
 * هندسة متناوبة: كروت دائرية كبيرة وصغيرة لكسر الملل وتقديم Nav سريع وفخم
 */
import Image from "next/image";
import Link from "next/link";
import SubSectionHeader from "../../SubSectionHeader";
import type { HomeProduct, HomeSubSection } from "../../types";

export default function Sub8CircularBrickwork({
  section,
}: {
  section: HomeSubSection;
}) {
  const { subName, subSlug, parentName, parentSlug, products } = section;
  if (!products.length) return null;

  // جلب أول 8 منتجات مميزة (كما طلبت في الـ Circular Brickwork)
  const shown = products.slice(0, 8);

  return (
    <article
      className="relative py-12 md:py-20 bg-[var(--bg)]"
      aria-labelledby={`sub-heading-${subSlug}`}
    >
      {/* طبقة ضوئية ناعمة */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-tr from-[var(--border-strong)]/20 to-transparent rounded-full blur-[100px] md:blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 relative z-10 flex flex-col gap-10 md:gap-14">
        {/* هيدر القسم الراقي */}
        <SubSectionHeader
          subName={subName}
          subSlug={subSlug}
          parentName={parentName}
          parentSlug={parentSlug}
        />

        {/* حاوية الـ 4*4 الدائرية (Dual-Row Circular Navigator) */}
        {/* في الموبايل والكمبيوتر: grid ذكي من 4 أعمدة في صفين متوازيين بدقة */}
        <div className="grid grid-cols-4 grid-rows-2 gap-x-2 gap-y-4 md:gap-x-4 md:gap-y-6 w-full items-start">
          {shown.map((p, i) => {
            // كسر نمط الـ Grid بتغيير أحجام الدوائر بتناوب مدروس (اختياري، للجمال)
            // هنا نستخدم حجم ثابت لـ Uniform look، أو تغيير حجم خفيف جداً
            const isAlternate = i === 1 || i === 3 || i === 4 || i === 6;

            return (
              <Link
                key={p.slug}
                href={`/products/${p.slug}`}
                className={`flex flex-col items-center space-y-2 group transition-all duration-300 transform group-hover:scale-[1.03] ${
                  isAlternate ? "lg:translate-y-4" : ""
                }`}
              >
                {/* حاوية الدائرة الملكية (Aspect Square + rounded-full) */}
                <div className="relative w-full aspect-square rounded-full p-[3px] border border-[var(--gold)]/10 group-hover:border-[var(--gold)] transition-all duration-500 shadow-[0_4px_15px_rgba(0,0,0,0.01)] group-hover:shadow-[0_8px_25px_rgba(26,26,26,0.1)] overflow-hidden">
                  {/* الدائرة الداخلية المقصوصة بدقة */}
                  <div className="relative w-full h-full rounded-full overflow-hidden bg-[var(--bg-deep)]">
                    <Image
                      src={p.image}
                      alt={p.name}
                      fill
                      quality={80}
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                      loading="lazy"
                    />
                    {/* فلتر ناعم يفتح مع الهوفر */}
                    <div className="absolute inset-0 bg-[var(--gold)]/5 group-hover:bg-transparent transition-colors duration-500" />
                  </div>
                </div>

                {/* الاسم بالأسفل بخط راقي ومريح */}
                <span className="text-[var(--text-1)] text-[9px] md:text-sm font-medium tracking-wide text-center px-1 max-w-full line-clamp-1 transition-colors duration-300 group-hover:text-[var(--gold)]">
                  {p.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </article>
  );
}
