/**
 * Layout 6 — The Light IMAX Reel (نسخة النقاء البصري بدون خلفيات)
 * تصميم "نيو لوك" صريح: تم حذف كل الخلفيات المصطنعة، النصوص والأسعار تطفو مباشرة فوق كادر الصورة بنقاء بشري فاخر.
 */
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpLeft } from "lucide-react";
import type { HomeSubSection } from "../../types";

export default function Sub6Cinematic({
  section,
  isPriority,
}: {
  section: HomeSubSection;
  isPriority: boolean;
}) {
  const { subName, subSlug, parentName, products } = section;
  if (!products.length) return null;

  // جلب المنتجات (كادر العرض الرئيسي + الـ 4 كروت السينمائية المتفاوتة)
  const [cinema, ...rest] = products;
  const row = rest.slice(0, 4);

  return (
    <article
      className="relative bg-[#faf9f5] text-[#1c1b18] py-10 md:py-24 overflow-hidden border-t border-neutral-100"
      aria-labelledby={`sub-heading-${subSlug}`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 flex flex-col gap-5 md:gap-12">
        {/* ─── 1. الهيدر النصي النقي (يختفي تماماً في الموبايل) ─── */}
        <div className="hidden lg:flex flex-col md:flex-row justify-between items-baseline border-b border-neutral-200 pb-4 rtl text-right">
          <div>
            <span className="text-neutral-400 text-[10px] font-bold tracking-widest uppercase block mb-1">
              {parentName} // COLLECTION
            </span>
            <h2
              id={`sub-heading-${subSlug}`}
              className="text-[#111111] text-2xl md:text-4.5xl font-light tracking-tight"
            >
              {subName}
            </h2>
          </div>

          <Link
            href={`/categories/${subSlug}`}
            className="group flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-black transition-colors"
          >
            <span>استكشاف المعرض كاملاً</span>
            <ArrowLeft
              size={14}
              className="transition-transform group-hover:-translate-x-1"
            />
          </Link>
        </div>

        {/* ─── 2. الكادر السينمائي الرئيسي المتجاوب ─── */}
        <Link
          href={`/products/${cinema.slug}`}
          className="group block relative w-full aspect-[16/8] md:aspect-[21/9] overflow-hidden bg-neutral-100 shadow-[0_10px_40px_rgba(0,0,0,0.01)] rounded-xl md:rounded-none"
        >
          <Image
            src={cinema.image}
            alt={cinema.name}
            fill
            quality={95}
            className="object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.01]"
            priority={isPriority}
          />
          {/* ظل سينمائي خفيف جداً ناعم من الأسفل لضمان وضوح النصوص البيضاء الفاخرة */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

          {/* ─── بطاقة البيانات العائمة المفرغة والنقية (بدون أي خلفية) ─── */}
          {/* العناصر الآن تطفو بلون أبيض صريح فوق الصورة مباشرة في الزاوية اليمنى السفلية */}
          <div className="absolute bottom-3 right-4 left-4 md:left-auto md:bottom-6 md:right-8 text-right rtl flex items-end justify-between md:justify-start md:flex-col md:gap-1 text-white">
            {/* في الكمبيوتر فقط: الإصدار الرئيسي واسم المنتج بلون أبيض ملكي نقّي */}
            <div className="hidden md:flex flex-col gap-0.5">
              <span className="text-[9px] font-bold text-[#f3e1ce] tracking-wider uppercase block">
                الإصدار الرئيسي
              </span>
              <h3 className="text-sm font-light text-white line-clamp-1 mb-1">
                {cinema.name}
              </h3>
            </div>

            {/* في الموبايل والكمبيوتر: السعر النقي العائم + أيقونة CTA */}
            <div className="flex items-center gap-1.5 w-full md:w-auto justify-end">
              <span className="text-xs md:text-sm font-bold text-white tracking-wide">
                {cinema.price.toLocaleString("en-US")}ر.س
              </span>
              {/* سهم طائر ناعم في الموبايل للتوجيه البصري */}
              <span className="md:hidden text-white/80">
                <ArrowUpLeft size={13} />
              </span>
            </div>
          </div>
        </Link>

        {/* ─── 3. بكرة المنتجات ذات الأبعاد المتفاوتة ─── */}
        <div className="flex flex-nowrap lg:grid lg:grid-cols-4 gap-4 md:gap-6 overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 scrollbar-none snap-x snap-mandatory pt-1 md:pt-2">
          {row.map((p, index) => {
            const isAlternate = index % 2 === 1;

            return (
              <Link
                key={p.slug}
                href={`/products/${p.slug}`}
                className="group flex flex-col w-[190px] sm:w-[240px] lg:w-full shrink-0 snap-start snap-always bg-transparent"
              >
                <div
                  className={`relative w-full overflow-hidden bg-neutral-50 border border-neutral-200/40 transition-all duration-500 group-hover:border-neutral-300 ${
                    isAlternate ? "aspect-[3/4]" : "aspect-[4/5]"
                  }`}
                >
                  <Image
                    src={p.image}
                    alt={p.name}
                    fill
                    quality={95}
                    sizes="(max-width: 1024px) 190px, 300px"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                    loading="lazy"
                  />
                </div>

                <div className="pt-2.5 text-right rtl flex flex-col space-y-0.5 px-1">
                  <span className="text-[9px] font-mono text-neutral-400">
                    0{index + 1}
                  </span>
                  <h4 className="text-[#111111] text-[11px] sm:text-xs md:text-sm font-medium line-clamp-1 group-hover:text-[#846a24] transition-colors">
                    {p.name}
                  </h4>
                  <span className="text-[11px] sm:text-xs font-bold text-neutral-700">
                    {p.price.toLocaleString("en-US")}ر.س
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </article>
  );
}
