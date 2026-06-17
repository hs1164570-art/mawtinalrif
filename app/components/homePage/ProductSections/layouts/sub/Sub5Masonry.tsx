/**
 * Layout 5 — Luxury Editorial Collage (النسخة الإبداعية الذكية ريسبونسيف)
 * حل مشكلة السكرول الطويل: كارت رئيسي، وتحته كروت الأطفال بسحب أفقي ناعم في الموبايل، وStaggered Grid فخم في الكمبيوتر.
 */
import Image from "next/image";
import Link from "next/link";
import SubSectionHeader from "../../SubSectionHeader";
import type { HomeSubSection } from "../../types";

export default function Sub5Masonry({
  section,
  isPriority,
}: {
  section: HomeSubSection;
  isPriority: boolean;
}) {
  const { subName, subSlug, parentName, parentSlug, products } = section;
  if (!products.length) return null;

  // تقسيم المنتجات: كارت قائد فاخر، و3 كروت أطفال بالتوزيع الهندسي
  const [tall, ...stacked] = products;
  const stackItems = stacked.slice(0, 3);

  return (
    <article
      className="relative py-12 md:py-28 bg-[#fdfbf7] overflow-hidden"
      aria-labelledby={`sub-heading-${subSlug}`}
    >
      {/* خلفية ضوئية ذهبية ناعمة */}
      <div className="absolute -bottom-10 left-0 w-[250px] md:w-[500px] h-[250px] md:h-[500px] bg-gradient-to-tr from-[#f5ebd7]/40 to-transparent rounded-full blur-[80px] md:blur-[120px] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 relative z-10 flex flex-col gap-8 md:gap-16">
        {/* هيدر القسم الراقي */}
        <SubSectionHeader
          subName={subName}
          subSlug={subSlug}
          parentName={parentName}
          parentSlug={parentSlug}
        />

        {/* الكولاج المبتكر المتجاوب */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-stretch">
          {/* ─── العمود الأول: الكارت القائد الفاخر (يظهر بكامل العرض في الموبايل وفوق الكروت) ─── */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <Link
              href={`/products/${tall.slug}`}
              className="group relative w-full aspect-[4/5] lg:h-full rounded-[2rem] md:rounded-[2.5rem] overflow-hidden border border-[#846a24]/10 shadow-[0_15px_35px_rgba(0,0,0,0.01)] hover:shadow-[0_25px_60px_rgba(132,106,36,0.08)] transition-all duration-700 block bg-[#ebe7df]"
            >
              <Image
                src={tall.image}
                alt={tall.name}
                fill
                quality={95}
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.02]"
                priority={isPriority}
              />
              <div className="absolute inset-0 bg-black/[0.02]" />

              {/* بطاقة عائمة زجاجية */}
              <div className="absolute bottom-4 inset-x-4 bg-white/70 backdrop-blur-md p-3.5 md:p-4 rounded-[1.5rem] md:rounded-[1.8rem] border border-white/40 flex justify-between items-center">
                <div className="flex flex-col text-right">
                  <span className="text-[#846a24] text-[9px] md:text-[10px] font-bold tracking-widest mb-0.5 uppercase">
                    القطعة الرئيسية
                  </span>
                  <p className="text-[#2c2212] font-black text-xs md:text-base line-clamp-1">
                    {tall.name}
                  </p>
                </div>
                <span className="bg-black text-white p-2 md:p-2.5 rounded-full shadow-md">
                  <svg
                    className="w-3.5 h-3.5 md:w-4 md:h-4 transform rotate-180"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </span>
              </div>
            </Link>
          </div>

          {/* ─── العمود الثاني: كروت الأطفال (السحر الريسبونسيف هنا) ─── */}
          {/* في الموبايل: flex وبدون wrap مع تفعيل السحب الأفقي (Scroll) لمنع النزول الرأسي نهائياً.
              في الكمبيوتر: grid-cols-2 وتنشيط الـ Staggered Layout الفخم. */}
          <div className="lg:col-span-7 flex flex-nowrap lg:grid lg:grid-cols-2 gap-4 lg:gap-8 overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 scrollbar-none snap-x snap-mandatory pt-2 lg:pt-0">
            {/* الكارت الفرعي الأول */}
            {stackItems[0] && (
              <Link
                href={`/products/${stackItems[0].slug}`}
                className="group relative w-[75%] sm:w-[48%] lg:w-full aspect-[3/4] rounded-[2rem] overflow-hidden bg-white border border-[#846a24]/5 shadow-[0_15px_40px_rgba(0,0,0,0.02)] transition-all duration-700 block shrink-0 snap-start snap-always"
              >
                <Image
                  src={stackItems[0].image}
                  alt={stackItems[0].name}
                  fill
                  quality={95}
                  sizes="(max-width: 1024px) 75vw, 30vw"
                  className="object-cover transition-transform duration-1000 group-hover:scale-[1.03]"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-500 p-4 flex flex-col justify-end text-right">
                  <p className="text-white font-bold text-xs md:text-sm">
                    {stackItems[0].name}
                  </p>
                </div>
              </Link>
            )}

            {/* الكارت الفرعي الثاني والثالث: يوضعان داخل حاوية مدمجة */}
            {/* في الكمبيوتر نرفعهما لأعلى `lg:-translate-y-12`، وفي الموبايل نلغي الـ flex ونخليهم جنب بعض طبيعي */}
            <div className="flex flex-nowrap lg:flex-col gap-4 lg:gap-8 lg:-translate-y-12 shrink-0 lg:shrink">
              {stackItems.slice(1, 3).map((p) => (
                <Link
                  key={p.slug}
                  href={`/products/${p.slug}`}
                  className="group relative w-[235px] sm:w-[280px] lg:w-full aspect-[3/4] rounded-[2rem] overflow-hidden bg-white border border-[#846a24]/5 shadow-[0_15px_40px_rgba(0,0,0,0.02)] transition-all duration-700 block shrink-0 snap-start snap-always"
                >
                  <Image
                    src={p.image}
                    alt={p.name}
                    fill
                    quality={95}
                    sizes="(max-width: 1024px) 75vw, 30vw"
                    className="object-cover transition-transform duration-1000 group-hover:scale-[1.03]"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-500 p-4 flex flex-col justify-end text-right">
                    <p className="text-white font-bold text-xs md:text-sm">
                      {p.name}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
