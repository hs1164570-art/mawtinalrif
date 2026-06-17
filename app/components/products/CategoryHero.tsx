"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { CategoryBreadcrumb } from "@/utils/products";

interface Props {
  image: string;
  categoryName: string;
  parentName?: string;
  breadcrumbs: CategoryBreadcrumb[];
  total: number;
}

export default function CategoryHero({
  image,
  categoryName,
  parentName,
  breadcrumbs,
  total,
}: Props) {
  return (
    /*
     * ✅ <header> semantic — يفهمه الـ crawlers
     * ✅ role="banner" لـ accessibility
     */
    <header
      className="relative w-full h-56 md:h-72 lg:h-80 overflow-hidden"
      role="banner"
      aria-label={`قسم ${categoryName}`}
    >
      {/* ✅ Next/Image — WebP تلقائي + lazy load + LCP أسرع */}
      <Image
        src={image}
        alt={`${categoryName} — مؤسسة الريف للأثاث`}
        fill
        priority // ✅ preload لأنها فوق الـ fold
        sizes="100vw"
        className="object-cover object-center"
        quality={100}
      />

      {/* gradient overlay — يخلي النص قابل للقراءة ويحسن الـ accessibility */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(18,10,4,0.72) 0%, rgba(18,10,4,0.28) 55%, rgba(18,10,4,0.08) 100%)",
        }}
        aria-hidden="true"
      />

      <div className="absolute inset-0 flex flex-col justify-end px-4 sm:px-6 lg:px-10 pb-6 md:pb-8">
        <nav
          aria-label="مسار التنقل"
          itemScope
          itemType="https://schema.org/BreadcrumbList"
          className="mb-3"
        >
          <ol className="flex items-center flex-wrap gap-1 text-xs text-white/70">
            {breadcrumbs.map((crumb, i) => {
              const isLast = i === breadcrumbs.length - 1;
              return (
                <li
                  key={crumb.href}
                  className="flex items-center gap-1"
                  itemScope
                  itemProp="itemListElement"
                  itemType="https://schema.org/ListItem"
                >
                  {isLast ?
                    <span
                      className="text-[var(--gold-bright)] font-medium"
                      itemProp="name"
                      aria-current="page"
                    >
                      {crumb.name}
                    </span>
                  : <>
                      <Link
                        href={crumb.href}
                        className="hover:text-white transition-colors"
                        itemProp="item"
                      >
                        <span itemProp="name">{crumb.name}</span>
                      </Link>
                      <ChevronLeft
                        className="w-3 h-3 opacity-50 rotate-180"
                        aria-hidden="true"
                      />
                    </>
                  }
                  <meta itemProp="position" content={String(i + 1)} />
                </li>
              );
            })}
          </ol>
        </nav>

        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight mb-2">
          {categoryName}
        </h1>

        <p className="text-sm text-white/60">
          {total > 0 ?
            <>
              <span className="text-[var(--gold-bright)] font-semibold">
                {total}
              </span>{" "}
              منتجًا في هذا القسم
            </>
          : "لا توجد منتجات حاليًا في هذا القسم"}
          {parentName && (
            <>
              {" "}
              &nbsp;—&nbsp; <span className="text-white/50">{parentName}</span>
            </>
          )}
        </p>
      </div>
    </header>
  );
}
