/**
 * Layout 4 — Scroll Reel
 * صف أفقي واحد scrollable — كروت بنسبة عمودية
 */
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ProductCard from "../../ProductCard";
import SubSectionHeader from "../../SubSectionHeader";
import type { HomeSubSection } from "../../types";

export default function Sub4ScrollReel({
  section,
  isPriority,
}: {
  section: HomeSubSection;
  isPriority: boolean;
}) {
  const { subName, subSlug, parentName, parentSlug, products } = section;
  if (!products.length) return null;

  return (
    <article
      className="py-10 md:py-14 bg-[var(--bg)]"
      aria-labelledby={`sub-heading-${subSlug}`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <SubSectionHeader
          subName={subName}
          subSlug={subSlug}
          parentName={parentName}
          parentSlug={parentSlug}
        />
      </div>

      {/* Full-bleed scroll container */}
      <div
        className="flex gap-4 overflow-x-auto px-4 md:px-8 lg:px-[calc((100vw-80rem)/2+2rem)] pb-3 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="list"
        aria-label={`منتجات ${subName}`}
      >
        {products.map((p, i) => (
          <div
            key={p.slug}
            role="listitem"
            className="snap-start shrink-0 w-[70%] sm:w-[44%] md:w-[30%] lg:w-[22%]"
          >
            <ProductCard product={p} priority={isPriority && i < 3} size="md" />
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 mt-6 flex justify-center">
        <Link
          href={`/categories/${subSlug}`}
          className="inline-flex items-center gap-2 px-7 py-2.5 border border-[var(--gold)] text-[var(--gold)] font-bold text-sm hover:bg-[var(--gold)] hover:text-white transition-all duration-200 group focus-visible:outline-2 focus-visible:outline-[var(--gold)]"
          aria-label={`عرض المزيد من ${subName}`}
        >
          عرض المزيد
          <ArrowLeft
            size={14}
            className="transition-transform group-hover:-translate-x-1"
            aria-hidden="true"
          />
        </Link>
      </div>
    </article>
  );
}
