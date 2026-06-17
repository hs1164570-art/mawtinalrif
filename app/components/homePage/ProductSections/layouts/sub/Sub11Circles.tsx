/**
 * Layout 11 — Circles
 * كل منتج دائرة — صورة مقطوعة في شكل دائري + اسم + سعر تحتها
 * مناسب للأقسام اللي تحتاج تصميم خفيف وعصري
 */
import Image from "next/image";
import Link from "next/link";
import SubSectionHeader from "../../SubSectionHeader";
import type { HomeProduct, HomeSubSection } from "../../types";

function CircleCard({ p, priority }: { p: HomeProduct; priority: boolean }) {
  const final =
    p.discount ? Math.round(p.price * (1 - p.discount / 100)) : p.price;

  return (
    <article className="group flex flex-col items-center gap-3 text-center">
      {/* Circle image */}
      <Link
        href={`/products/${p.slug}`}
        className="block relative focus-visible:outline-2 focus-visible:outline-[var(--gold)] focus-visible:outline-offset-4 rounded-full"
        aria-label={`عرض منتج ${p.name}`}
      >
        {/* Outer ring — gold on hover */}
        <div className="rounded-full p-[3px] bg-[var(--border-md)] group-hover:bg-[var(--gold)] transition-all duration-300 group-hover:shadow-[0_0_0_4px_var(--gold-bg)]">
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full overflow-hidden bg-[var(--bg-deep)]">
            <Image
              quality={95}
              src={p.image}
              alt={p.name}
              fill
              sizes="(max-width:640px) 112px, (max-width:768px) 128px, 144px"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              priority={priority}
              loading={priority ? "eager" : "lazy"}
            />
          </div>
        </div>

        {/* Discount badge */}
        {p.discount && p.discount > 0 && (
          <div className="absolute -top-1 -left-1 w-8 h-8 rounded-full bg-[var(--red)] text-white text-[9px] font-black flex items-center justify-center leading-none z-10">
            -{p.discount}%
          </div>
        )}

        {/* Low stock */}
        {p.countStock > 0 && p.countStock <= 5 && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-[var(--text-2)] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap z-10">
            آخر {p.countStock}
          </div>
        )}
      </Link>

      {/* Name */}
      <Link
        href={`/products/${p.slug}`}
        className="text-[var(--text-1)] font-bold text-xs sm:text-sm leading-snug line-clamp-2 hover:text-[var(--gold)] transition-colors max-w-[130px]"
      >
        {p.name}
      </Link>

      {/* Price */}
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-[var(--gold)] font-black text-sm">
          {final.toLocaleString("en-US")} ج
        </span>
        {p.discount && p.discount > 0 && (
          <span className="text-[var(--text-3)] text-[10px] line-through">
            {p.price.toLocaleString("en-US")} ج
          </span>
        )}
      </div>
    </article>
  );
}

export default function Sub11Circles({
  section,
  isPriority,
}: {
  section: HomeSubSection;
  isPriority: boolean;
}) {
  const { subName, subSlug, parentName, parentSlug, products } = section;
  if (!products.length) return null;
  const shown = products.slice(0, 8);

  return (
    <article
      className="py-10 md:py-14 bg-[var(--surface)]"
      aria-labelledby={`sub-heading-${subSlug}`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <SubSectionHeader
          subName={subName}
          subSlug={subSlug}
          parentName={parentName}
          parentSlug={parentSlug}
        />

        {/* Decorative line */}
        <div
          aria-hidden="true"
          className="h-px bg-gradient-to-l from-transparent via-[var(--border-strong)] to-transparent mb-8"
        />

        {/* Circles grid */}
        <div
          className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 gap-y-8 gap-x-4 justify-items-center"
          role="list"
          aria-label={`منتجات ${subName}`}
        >
          {shown.map((p, i) => (
            <div key={p.slug} role="listitem">
              <CircleCard p={p} priority={isPriority && i < 4} />
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
