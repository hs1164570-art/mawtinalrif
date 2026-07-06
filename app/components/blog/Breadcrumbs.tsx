// ─── components/blog/Breadcrumbs.tsx ────────────────────────────────────────
// Server Component — renders:
//   1. Semantic <nav aria-label="breadcrumb"> with RTL layout
//   2. JSON-LD BreadcrumbList schema (injected inline, valid anywhere in <body>)
//
// Usage:
//   // Single post:
//   <Breadcrumbs items={[
//     { label: 'الديكور', href: '/blog/category/decor' },
//     { label: post.title },                             // no href = current page
//   ]} />
//
//   // Category:
//   <Breadcrumbs items={[{ label: category.name }]} />
//
// Home > المدونة are always prepended automatically.

import Link from "next/link";
import { BreadcrumbJsonLd } from "./JsonLd";
import type { BreadcrumbItem } from "@/utils/blog/types";
import { BLOG_CONFIG } from "@/utils/blog/config";

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

const HOME_ITEMS: BreadcrumbItem[] = [
  { label: "الرئيسية", href: "/" },
  { label: "المدونة", href: BLOG_CONFIG.basePath },
];

export function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  const allItems: BreadcrumbItem[] = [...HOME_ITEMS, ...items];

  return (
    <>
      {/* JSON-LD — always include the full hierarchy */}
      <BreadcrumbJsonLd items={allItems} />

      {/* Visible breadcrumb nav */}
      <nav aria-label="breadcrumb" dir="rtl" className={`w-full ${className}`}>
        <ol
          className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm"
          itemScope
          itemType="https://schema.org/BreadcrumbList"
        >
          {allItems.map((item, index) => {
            const isLast = index === allItems.length - 1;
            const isCurrent = isLast;

            return (
              <li
                key={index}
                className="flex items-center gap-x-1.5"
                itemProp="itemListElement"
                itemScope
                itemType="https://schema.org/ListItem"
              >
                {/* Separator — hidden from screen readers */}
                {index > 0 && <ChevronSeparator />}

                {/* Breadcrumb label */}
                {item.href && !isCurrent ?
                  <Link
                    href={item.href}
                    itemProp="item"
                    className="
                      text-[var(--text-3)] hover:text-[var(--text-1)]
                      transition-colors duration-150 underline-offset-2
                      hover:underline whitespace-nowrap
                    "
                  >
                    <span itemProp="name">{item.label}</span>
                  </Link>
                : <span
                    itemProp="name"
                    aria-current={isCurrent ? "page" : undefined}
                    className={`
                      whitespace-nowrap max-w-[200px] truncate
                      ${
                        isCurrent ?
                          "text-[var(--text-1)] font-medium"
                        : "text-[var(--text-3)]"
                      }
                    `}
                    title={item.label}
                  >
                    {item.label}
                  </span>
                }

                <meta itemProp="position" content={String(index + 1)} />
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}

// ─── Separator icon ───────────────────────────────────────────────────────────
// Chevron-left for RTL (pointing right visually in RTL context)

function ChevronSeparator() {
  return (
    <svg
      aria-hidden="true"
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      className="flex-shrink-0 text-[var(--text-3)] rotate-180 rtl:rotate-0"
    >
      <path
        d="M5.5 3.5L8.5 7L5.5 10.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
