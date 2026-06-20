/**
 * Layout 2 — Luxury Asymmetric Grid (تحويل كامل لروح الفخامة غير المتماثلة)
 * تصميم ريسبونسيف مبهر: نصوص ملكية مع توزيع صور "طايرة" متداخلة بدقة
 */
import Image from "next/image";
import Link from "next/link";
import SubSectionHeader from "../../SubSectionHeader";
import type { HomeSubSection } from "../../types";

export default function Sub2EqualGrid({
  section,
  isPriority,
}: {
  section: HomeSubSection;
  isPriority: boolean;
}) {
  const { subName, subSlug, parentName, parentSlug, products } = section;
  if (!products.length) return null;

  // هناخد أول 3 أو 4 منتجات بالظبط عشان نظبط بيهم الهيكل الطاير النظيف
  const shownProducts = products.slice(0, 3);

  return (
    <article
      className="relative py-16 md:py-24 bg-[var(--bg)] overflow-hidden"
      aria-labelledby={`sub-heading-${subSlug}`}
    >
      {/* ─── الخلفية الضوئية الناعمة (Glow Effect) لتعزيز الإحساس بالفخامة ─── */}
      <div className="absolute top-1/4 right-0 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-gradient-to-bl from-[var(--border-strong)]/30 to-[var(--border)]/10 rounded-full blur-[100px] md:blur-[150px] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        {/* هيدر القسم المطور */}
        <div className="mb-10 md:mb-16">
          <SubSectionHeader
            subName={subName}
            subSlug={subSlug}
            parentName={parentName}
            parentSlug={parentSlug}
          />
        </div>

        {/* ─── حاوية الريسبونسيف السحرية ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* 1. الجزء الأيمن: النصوص الملكية الفاخرة (تظهر أولاً في الموبايل فوق الشبكة) */}
          <div className="lg:col-span-5 flex flex-col items-start text-right space-y-4 md:space-y-6 order-1 lg:order-2 rtl">
            <span className="text-[var(--gold)] text-xs md:text-sm tracking-widest font-semibold uppercase bg-[var(--gold)]/5 px-3 py-1 rounded-full">
              تشكيلة حصرية
            </span>

            <h3 className="text-[var(--text-1)] text-2xl md:text-4xl lg:text-5xl font-black leading-[1.3]">
              تصميم يليق بالمساحة وتنفيذ يكتمل{" "}
              <span className="text-[var(--gold)]">بالفخامة</span>
            </h3>

            <p className="text-neutral-500 text-sm md:text-base leading-relaxed max-w-xl font-light">
              نبدأ من فهم أبعاد قطع الأثاث والديكور الفاخرة، لتتناغم مع تفاصيل
              منزلك وتمنحك حضوراً دافئاً وتجربة بصرية فريدة لا تتكرر.
            </p>

            <Link
              href={`/collections/${subSlug}`}
              className="inline-flex items-center gap-2 text-[var(--text-1)] font-bold text-sm md:text-base group pt-2 pointer-events-auto"
            >
              <span className="border-b-2 border-[var(--text-1)] pb-1 group-hover:border-[var(--gold)] transition-colors duration-300">
                اكتشف المجموعة كاملة
              </span>
              <svg
                className="w-4 h-4 transform transition-transform duration-300 group-hover:translate-x-[-4px] text-[var(--gold)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M14 5l-7 7 7 7"
                />
              </svg>
            </Link>
          </div>

          {/* 2. الجزء الأيسر: شبكة الكروت الطايرة والغير متماثلة (المبهرة ريسبونسيف) */}
          <div className="lg:col-span-7 grid grid-cols-2 gap-4 md:gap-6 items-center order-2 lg:order-1 pt-6 lg:pt-0">
            {/* العمود الأول من الشبكة: مزاح لأسفل في الكمبيوتر ولأعلى في الموبايل ليعطي حركة كسر نمط ممتازة */}
            <div className="flex flex-col gap-4 md:gap-6 translate-y-4 md:translate-y-12">
              {shownProducts.slice(0, 2).map((p, i) => (
                <Link
                  key={p.slug}
                  href={`/products/${p.slug}`}
                  className="group relative w-full aspect-[3/4] rounded-[2rem] overflow-hidden bg-white border border-[var(--gold)]/5 shadow-[0_15px_40px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_50px_rgba(26,26,26,0.08)] transition-all duration-700 block"
                >
                  <Image
                    src={p.image}
                    alt={p.name}
                    fill
                    quality={95}
                    priority={isPriority && i === 0}
                    className="object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.03]"
                    sizes="(max-width: 768px) 45vw, 30vw"
                  />
                  {/* شريط ذكي يظهر عند الهوفر فقط ليعطي فخامة بدون زحمة */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 p-4 flex flex-col justify-end">
                    <p className="text-white font-bold text-sm text-right">
                      {p.name}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            {/* العمود الثاني من الشبكة: مزاح لأعلى في الكمبيوتر ليعطي عمق الـ Asymmetric */}
            <div className="flex flex-col gap-4 md:gap-6 -translate-y-4 md:-translate-y-12">
              {shownProducts.slice(2, 3).map((p) => (
                <Link
                  key={p.slug}
                  href={`/products/${p.slug}`}
                  className="group relative w-full aspect-[3/4] rounded-[2rem] overflow-hidden bg-white border border-[var(--gold)]/5 shadow-[0_15px_40px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_50px_rgba(26,26,26,0.08)] transition-all duration-700 block"
                >
                  <Image
                    src={p.image}
                    alt={p.name}
                    fill
                    quality={95}
                    className="object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.03]"
                    sizes="(max-width: 768px) 45vw, 30vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 p-4 flex flex-col justify-end">
                    <p className="text-white font-bold text-sm text-right">
                      {p.name}
                    </p>
                  </div>
                </Link>
              ))}

              {/* في حال كان الكارت الثالث وحيد، نضع حاوية جمالية فارغة أو كارت دمي للحفاظ على توازن التصميم في الشاشات الكبيرة */}
              <div className="hidden md:block w-full aspect-[3/4] rounded-[2rem] border-2 border-dashed border-[var(--gold)]/10 bg-[var(--gold)]/[0.01] flex items-center justify-center p-6 text-center">
                <p className="text-[var(--gold)]/40 text-xs font-medium tracking-wide">
                  Mawtin alryf Premium Editorial Layout
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
