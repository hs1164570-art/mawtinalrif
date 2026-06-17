/**
 * Layout 10 — Spotlight
 * منتج مركزي كبير + عمودين من الكروت الصغيرة على الجانبين
 */
import Image from "next/image";
import Link from "next/link";
import ProductCard from "../../ProductCard";
import SubSectionHeader from "../../SubSectionHeader";
import type { HomeSubSection } from "../../types";

export default function Sub10Spotlight({
  section,
  isPriority,
}: {
  section: HomeSubSection;
  isPriority: boolean;
}) {
  const { subName, subSlug, parentName, parentSlug, products } = section;
  if (!products.length) return null;

  const [center, r1, r2, l1, l2] = products;
  const rightCol = [r1, r2].filter(Boolean);
  const leftCol = [l1, l2].filter(Boolean);
  const discounted =
    center.discount ?
      Math.round(center.price * (1 - center.discount / 100))
    : center.price;

  return (
    <article
      className="py-10 md:py-14 bg-[var(--bg-deep)]"
      aria-labelledby={`sub-heading-${subSlug}`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <SubSectionHeader
          subName={subName}
          subSlug={subSlug}
          parentName={parentName}
          parentSlug={parentSlug}
        />

        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr] gap-4 items-start">
          {/* Right col */}
          <div className="hidden md:flex flex-col gap-4">
            {rightCol.map(
              (p) => p && <ProductCard key={p.slug} product={p} size="sm" />,
            )}
          </div>

          {/* Center spotlight */}
          <div className="group relative overflow-hidden border-2 border-[var(--gold)] hover:shadow-[0_16px_56px_rgba(160,120,48,0.22)] transition-all duration-300">
            {/* Gold corner accent */}
            <div
              aria-hidden="true"
              className="absolute top-0 left-0 right-0 h-[3px] bg-[var(--gold)] z-10"
            />

            {center.discount && center.discount > 0 && (
              <div className="absolute top-4 right-4 z-20 bg-[var(--red)] text-white text-[10px] font-black px-3 py-1">
                -{center.discount}%
              </div>
            )}
            <Link
              href={`/products/${center.slug}`}
              className="block focus-visible:outline-2 focus-visible:outline-[var(--gold)]"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-[var(--bg)]">
                <Image
                  quality={95}
                  src={center.image}
                  alt={center.name}
                  fill
                  sizes="(max-width:768px) 100vw, 40vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  priority={isPriority}
                  loading={isPriority ? "eager" : "lazy"}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <p className="text-[var(--gold-bright)] text-[10px] font-black tracking-widest mb-1.5 flex items-center gap-1.5">
                  <span>◆</span> الأكثر مبيعًا
                </p>
                <h3 className="text-white font-black text-xl leading-snug mb-2 drop-shadow line-clamp-2">
                  {center.name}
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-[var(--gold-bright)] font-black text-2xl">
                    {discounted.toLocaleString("en-US")} ج
                  </span>
                  {center.discount && center.discount > 0 && (
                    <span className="text-white/50 line-through text-sm">
                      {center.price.toLocaleString("en-US")} ج
                    </span>
                  )}
                </div>
              </div>
            </Link>
          </div>

          {/* Left col */}
          <div className="hidden md:flex flex-col gap-4">
            {leftCol.map(
              (p) => p && <ProductCard key={p.slug} product={p} size="sm" />,
            )}
          </div>

          {/* Mobile: show side cards below */}
          <div className="grid grid-cols-2 gap-3 md:hidden col-span-1">
            {[...rightCol, ...leftCol].map(
              (p) => p && <ProductCard key={p.slug} product={p} size="sm" />,
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
