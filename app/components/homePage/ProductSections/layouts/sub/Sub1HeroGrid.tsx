/**
 * Layout 1 — Hero + Grid (النسخة الشريطية الملكية الفاخرة المطابقة للتصميم المتناسق)
 * بنر أب رئيسي + 3 أطفال مدمج بداخلهم العناوين والأزرار بالكامل بشكل Luxury.
 */
import Image from "next/image";
import Link from "next/link";
import SubSectionHeader from "../../SubSectionHeader";
import type { HomeSubSection } from "../../types";

export default function Sub1HeroGrid({
  section,
  isPriority,
}: {
  section: HomeSubSection;
  isPriority: boolean;
}) {
  const { subName, subSlug, parentName, parentSlug, products } = section;
  if (!products.length) return null;

  // تقسيم المنتجات: الأول هو الأب الفخم، والثلاثة المتبقين هم الأطفال
  const [hero, ...rest] = products;
  const childrenBanners = rest.slice(0, 3);

  return (
    <article
      className="py-6 md:py-12 bg-[#fdfbf7]"
      aria-labelledby={`sub-heading-${subSlug}`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 flex flex-col gap-6">
        {/* هيدر القسم النظيف */}
        <SubSectionHeader
          subName={subName}
          subSlug={subSlug}
          parentName={parentName}
          parentSlug={parentSlug}
        />

        {/* ─── 1. البنر الأب الرئيسي (النصوص والـ CTA داخل الصورة بالكامل) ─── */}
        <Link
          href={`/products/${hero.slug}`}
          className="relative w-full aspect-[16/8] md:aspect-[21/7] rounded-2xl overflow-hidden border border-[#846a24]/10 hover:border-[#846a24]/20 transition-all duration-700 group block bg-[#ebe7df]"
        >
          {/* الصورة الأساسية */}
          <Image
            src={hero.image}
            alt={hero.name}
            fill
            quality={95}
            priority={isPriority}
            className="object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.02]"
          />

          {/* طبقة حماية وإضاءة ناعمة جداً للحفاظ على ألوان الصورة الأصلية وتدرج خفيف للنصوص */}
          <div className="absolute inset-0 bg-gradient-to-l from-black/40 via-transparent to-transparent md:from-black/50" />

          {/* محتوى النص والزرار داخل البنر الفخم */}
          <div className="absolute inset-y-0 right-6 md:right-12 flex flex-col justify-center items-start max-w-[60%] z-10 pointer-events-none text-right">
            <h3 className="text-[#f4f1ea] font-black text-base md:text-3xl lg:text-4xl leading-tight mb-3 md:mb-5 drop-shadow-md">
              {hero.name}
            </h3>
            {/* زر تسوق فخم مطابق لبراندات الأثاث الـ Luxury */}
            <span className="inline-block bg-[#1b1a1a]/90 hover:bg-[#1b1a1a] text-[#f4f1ea] text-[10px] md:text-xs font-medium px-4 py-2 md:px-6 md:py-3 rounded-full border border-[#c9ba89]/20 backdrop-blur-md shadow-lg transition-all duration-300 transform group-hover:scale-[1.03]">
              تسوق الآن
            </span>
          </div>
        </Link>

        {/* ─── 2. الأطفال الثلاثة: تلم الأطوال والعناوين بالداخل جوه الصورة ─── */}
        <div className="grid grid-cols-3 gap-3 md:gap-5 w-full">
          {childrenBanners.map((p) => {
            return (
              <Link
                key={p.slug}
                href={`/products/${p.slug}`}
                // aspect-[4/3] صغّر الطول الرأسي وخلى الكروت تلم وبقت متناسقة وراقية جداً
                className="relative flex flex-col w-full aspect-[4/3] rounded-2xl overflow-hidden group border border-[#846a24]/5 hover:border-[#846a24]/15 transition-all duration-500 bg-[#fbfbfd]"
              >
                {/* حاوية الصورة الفاخرة */}
                <div className="relative w-full h-full overflow-hidden">
                  <Image
                    quality={95}
                    src={p.image}
                    alt={p.name}
                    fill
                    sizes="(max-width: 640px) 33vw, 33vw"
                    className="object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.04]"
                    loading="lazy"
                  />

                  {/* تدرج أسود ناعم ومخفي في الأسفل ليظهر فقط عند الحاجة ويضمن وضوح الخط بنسبة 100% */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                {/* العناوين والأزرار مدمجة بالكامل تحت جوه الكارت بطريقة فخمة وانسيابية */}
                <div className="absolute bottom-0 right-0 left-0 p-3 md:p-5 flex items-center justify-between gap-2 z-10 w-full">
                  <p className="text-[#f4f1ea] font-bold text-[11px] sm:text-xs md:text-base lg:text-lg line-clamp-1 transition-colors duration-300 group-hover:text-[#c9ba89] drop-shadow-md">
                    {p.name}
                  </p>

                  {/* زر صغير وتفاعلي مخفي جزئياً على الموبايل ويظهر بأناقة */}
                  <span className="hidden sm:inline-block bg-[#f4f1ea]/10 group-hover:bg-[#f4f1ea] text-[#f4f1ea] group-hover:text-[#1b1a1a] text-[10px] md:text-xs font-semibold px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-[#f4f1ea]/20 backdrop-blur-sm transition-all duration-300">
                    تسوق
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
