/**
 * =====================================================================
 *  SEO JSON-LD — مؤسسة الريف للأثاث
 *  مهم جدًا لـ Google Rich Results والظهور في الأول
 * =====================================================================
 */

import {
  CategoryBreadcrumb,
  ProductCardData,
  CategoryData,
} from "@/utils/products";

const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://alrif.sa";
const SITE_NAME = "مؤسسة الريف للأثاث";

// ─── 1. BreadcrumbList ────────────────────────────────────────────────────────
// يخلي Google يعرض مسار التنقل في نتيجة البحث
export function breadcrumbJsonLd(breadcrumbs: CategoryBreadcrumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: `${SITE_URL}${crumb.href}`,
    })),
  };
}

// ─── 2. ItemList + Product (Rich Snippets) ───────────────────────────────────
// يخلي Google يعرض صور المنتجات وأسعارها في نتائج البحث مباشرة
export function itemListJsonLd(
  products: ProductCardData[],
  category: CategoryData,
  canonicalUrl: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${category.name} — ${SITE_NAME}`,
    description: `تشكيلة ${category.name} من ${SITE_NAME} بأجود المواصفات وأفضل الأسعار في الرياض`,
    url: `${SITE_URL}${canonicalUrl}`,
    numberOfItems: products.length,
    itemListElement: products.map((p, i) => {
      const finalPrice =
        p.discount ? Math.round(p.price * (1 - p.discount / 100)) : p.price;
      return {
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Product",
          "@id": `${SITE_URL}/product/${p.slug}`,
          name: p.name,
          image: [p.image, ...p.gallery].slice(0, 5),
          url: `${SITE_URL}/product/${p.slug}`,
          brand: {
            "@type": "Brand",
            name: SITE_NAME,
          },
          offers: {
            "@type": "Offer",
            price: finalPrice,
            priceCurrency: "SAR",
            priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0],
            availability:
              p.inStock ?
                "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
            itemCondition: "https://schema.org/NewCondition",
            seller: {
              "@type": "Organization",
              name: SITE_NAME,
              url: SITE_URL,
            },
          },
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: p.rating,
            bestRating: "5",
            worstRating: "1",
            reviewCount: 1, // حدّث بعدين لما تجيب عدد الريفيوز الحقيقي
          },
        },
      };
    }),
  };
}

// ─── 3. LocalBusiness (ده مهم جدًا للظهور في البحث المحلي بالرياض) ──────────
export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "FurnitureStore"],
    "@id": `${SITE_URL}/#business`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    image: `${SITE_URL}/og-image.jpg`,
    description:
      "مؤسسة الريف للأثاث — أجمل تشكيلات الأثاث المنزلي الفاخر في الرياض، المملكة العربية السعودية",
    priceRange: "$$",
    currenciesAccepted: "SAR",
    paymentAccepted: "Cash, Credit Card, PayPal",
    address: {
      "@type": "PostalAddress",
      addressLocality: "الرياض",
      addressRegion: "منطقة الرياض",
      addressCountry: "SA",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "24.7136",
      longitude: "46.6753",
    },
    areaServed: {
      "@type": "City",
      name: "الرياض",
      addressCountry: "SA",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Saturday",
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
        ],
        opens: "09:00",
        closes: "22:00",
      },
    ],
    sameAs: [
      "https://www.instagram.com/alrif_furniture",
      "https://twitter.com/alrif_furniture",
    ],
  };
}

// ─── 4. WebPage ──────────────────────────────────────────────────────────────
export function webPageJsonLd(
  title: string,
  description: string,
  canonicalUrl: string,
  heroImage: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${SITE_URL}${canonicalUrl}`,
    name: title,
    description,
    url: `${SITE_URL}${canonicalUrl}`,
    inLanguage: "ar",
    isPartOf: {
      "@id": `${SITE_URL}/#website`,
    },
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: heroImage,
      width: 1200,
      height: 630,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.png`,
      },
    },
  };
}

// ─── helper: stringify + escape كل الـ JSON-LD ───────────────────────────────
export function serializeJsonLd(data: object) {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}
