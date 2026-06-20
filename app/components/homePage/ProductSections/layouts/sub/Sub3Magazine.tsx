"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { HomeSubSection } from "../../types";
import SubSectionHeader from "../../SubSectionHeader";

export default function Sub3Duo({
  section,
  isPriority,
}: {
  section: HomeSubSection;
  isPriority: boolean;
}) {
  const { subName, subSlug, parentName, parentSlug, products } = section;
  const cards = products.slice(0, 2);
  if (!cards.length) return null;

  return (
    <article
      className="py-6 md:py-10 bg-gradient-to-b from-[var(--bg)] to-[var(--bg-deep)]"
      aria-labelledby={`sub-heading-${subSlug}`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <SubSectionHeader
          subName={subName}
          subSlug={subSlug}
          parentName={parentName}
          parentSlug={parentSlug}
        />

        {/* الإطار الواحد: الصورتين لازقين في بعض من غير أي gap، ظهور بـ fade+slide مرة واحدة */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: [0.2, 1, 0.3, 1] }}
          className="grid grid-cols-2 overflow-hidden rounded-2xl shadow-sm mt-6 md:mt-8"
        >
          {cards.map((p, i) => (
            <Link
              key={p.slug}
              href={`/products/${p.slug}`}
              className="group/card relative aspect-[4/3] md:aspect-[16/10] overflow-hidden"
            >
              <Image
                src={p.image}
                alt={p.name}
                fill
                quality={95}
                sizes="(max-width:768px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.2,1,0.3,1)] group-hover/card:scale-[1.06]"
                priority={isPriority && i === 0}
              />

              {/* ريبون الخصم */}
              {p.discount && p.discount > 0 && (
                <div className="absolute top-0 right-5 bg-[var(--gold)] text-[var(--text-inv)] text-[11px] font-bold tracking-wide px-3 py-1.5 rounded-b-md shadow-sm">
                  خصم {p.discount}%
                </div>
              )}
            </Link>
          ))}
        </motion.div>

        {/* كابشن نظيف تحت كل نص من الإطار، بنفس عرض الأعمدة فوق */}
        <div className="grid grid-cols-2 mt-3 md:mt-4">
          {cards.map((p) => {
            const discounted =
              p.discount ?
                Math.round(p.price * (1 - p.discount / 100))
              : p.price;
            return (
              <div key={p.slug} className="px-1 md:px-2">
                <span className="text-[var(--text-1)] font-bold text-sm md:text-base block truncate">
                  {p.name}
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  {p.discount && p.discount > 0 && (
                    <span className="text-[var(--text-3)] text-xs line-through">
                      {p.price.toLocaleString("en-US")} ر.س
                    </span>
                  )}
                  <span className="text-[var(--gold)] font-black text-sm md:text-base">
                    {discounted.toLocaleString("en-US")} ر.س
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </article>
  );
}
