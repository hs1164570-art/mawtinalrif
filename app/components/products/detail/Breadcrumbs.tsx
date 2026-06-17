import Link from "next/link";
import { ChevronLeft, Home } from "lucide-react";
import type { ProductDetail } from "@/utils/product";

interface Props {
  product: ProductDetail;
}

export default function Breadcrumbs({ product }: Props) {
  const crumbs = [
    { label: "الرئيسية", href: "/" },
    ...(product.category.parent ?
      [
        {
          label: product.category.parent.name,
          href: `/products/${product.category.parent.slug}`,
        },
        {
          label: product.category.name,
          href: `/products/${product.category.slug}`,
        },
      ]
    : [
        {
          label: product.category.name,
          href: `/products/${product.category.slug}`,
        },
      ]),
    { label: product.name, href: null },
  ];

  return (
    <nav aria-label="مسار التنقل" className="w-full">
      <ol
        className="flex items-center flex-wrap gap-1 text-sm text-[#806840]"
        itemScope
        itemType="https://schema.org/BreadcrumbList"
      >
        {crumbs.map((crumb, i) => (
          <li
            key={i}
            className="flex items-center gap-1"
            itemProp="itemListElement"
            itemScope
            itemType="https://schema.org/ListItem"
          >
            {i > 0 && (
              <ChevronLeft
                className="w-3.5 h-3.5 text-[#c5a87a] flex-shrink-0"
                aria-hidden="true"
              />
            )}

            {crumb.href ?
              <Link
                href={crumb.href}
                className="flex items-center gap-1 hover:text-[#a07830] transition-colors duration-150 whitespace-nowrap"
                itemProp="item"
              >
                {i === 0 && <Home className="w-3.5 h-3.5" aria-hidden="true" />}
                <span itemProp="name">{crumb.label}</span>
              </Link>
            : <span
                className="text-[#483820] font-medium truncate max-w-[180px] sm:max-w-xs"
                aria-current="page"
                itemProp="name"
              >
                {crumb.label}
              </span>
            }

            <meta itemProp="position" content={String(i + 1)} />
          </li>
        ))}
      </ol>
    </nav>
  );
}
