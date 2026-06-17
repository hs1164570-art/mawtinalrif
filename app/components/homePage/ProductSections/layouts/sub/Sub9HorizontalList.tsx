/**
 * Layout 9 — Luxury Dual-Row Horizontal Explorer (النسخة الملكية المبتكرة للصفين)
 * ريسبونسيف ساحر: يعرض الـ 8 منتجات على صفين متوازيين مع سحب أفقي ناعم للموبايل وGrid فخم للكمبيوتر
 */
import Image from "next/image";
import Link from "next/link";
import SubSectionHeader from "../../SubSectionHeader";
import type { HomeProduct, HomeSubSection } from "../../types";

function LuxuryMinimalCard({
  p,
  priority,
}: {
  p: HomeProduct;
  priority: boolean;
}) {
  const finalPrice =
    p.discount ? Math.round(p.price * (1 - p.discount / 100)) : p.price;

  return (
    <article className="group flex flex-col w-[200px] sm:w-[240px] md:w-full shrink-0 snap-start snap-always bg-transparent">
      {/* 1. حاوية الصورة العمودية الفاخرة */}
      <Link
        href={`/products/${p.slug}`}
        className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden border border-[#846a24]/10 hover:border-[#846a24]/20 transition-all duration-500 bg-[#ebe7df] block"
      >
        <Image
          quality={95}
          src={p.image}
          alt={p.name}
          fill
          sizes="(max-width:640px) 200px, 280px"
          className="object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.03]"
          priority={priority}
          loading={priority ? "eager" : "lazy"}
        />

        {/* طبقة حماية ضوئية تفاعلية تفصل الصورة بنعومة */}
        <div className="absolute inset-0 bg-[#846a24]/0 group-hover:bg-[#846a24]/5 transition-colors duration-500" />
      </Link>

      {/* 2. تفاصيل المنتج النظيفة بالأسفل بدون دوشة أزرار أو نجوم */}
      <div className="pt-3 px-1 flex flex-col space-y-1 text-right rtl">
        <Link
          href={`/products/${p.slug}`}
          className="text-[#2c2212] font-bold text-xs sm:text-sm md:text-base line-clamp-1 hover:text-[#846a24] transition-colors duration-200"
        >
          {p.name}
        </Link>

        {/* الأسعار بخط فخم وهادئ */}
        <div className="flex items-baseline justify-start gap-2">
          <span className="text-[#846a24] font-black text-sm sm:text-base">
            {finalPrice.toLocaleString("en-US")}{" "}
            <span className="text-[10px] sm:text-xs font-bold">ج.م</span>
          </span>
          {p.discount && p.discount > 0 && (
            <span className="text-neutral-400 text-xs line-through font-light opacity-80">
              {p.price.toLocaleString("en-US")} ج
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

export default function Sub9HorizontalList({
  section,
  isPriority,
}: {
  section: HomeSubSection;
  isPriority: boolean;
}) {
  const { subName, subSlug, parentName, parentSlug, products } = section;
  if (!products.length) return null;

  // جلب الـ 8 منتجات بالكامل من قاعدة البيانات لتوزيعها على صفين
  const shown = products.slice(0, 8);

  return (
    <article
      className="py-12 md:py-18 bg-[#fdfbf7]"
      aria-labelledby={`sub-heading-${subSlug}`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 flex flex-col gap-6 md:gap-8">
        {/* هيدر القسم الراقي */}
        <SubSectionHeader
          subName={subName}
          subSlug={subSlug}
          parentName={parentName}
          parentSlug={parentSlug}
        />

        {/* ─── حاوية الصفين الذكية (The Responsive Dual-Row Matrix) ─── */}
        {/* في الموبايل: grid-rows-2 مع grid-flow-col وتفعيل السحب الأفقي لمنع المنتجات من النزول تحت الشاشة.
          في الكمبيوتر: grid-cols-4 للـ 8 منتجات لتظهر بالتساوي في صفين مثاليين وثابتين.
        */}
        <div className="grid grid-rows-2 grid-flow-col lg:grid-flow-row lg:grid-cols-4 gap-x-4 gap-y-6 md:gap-x-6 md:gap-y-10 overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 scrollbar-none snap-x snap-mandatory">
          {shown.map((p, i) => (
            <LuxuryMinimalCard
              key={p.slug}
              p={p}
              priority={isPriority && i < 2}
            />
          ))}
        </div>
      </div>
    </article>
  );
}
