// lib/seo-helpers.ts
// مساعدات SEO قابلة للاستخدام في أي صفحة

import type { Metadata } from "next";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.mawtin-elrif.com";

/** سعر مُنسَّق للـ meta tags */
export const formatMetaPrice = (price: number) =>
  new Intl.NumberFormat("en-SA", {
    style: "currency",
    currency: "SAR",
    minimumFractionDigits: 0,
  }).format(price);

/** السعر الفعلي بعد الخصم */
export const getEffectivePrice = (price: number, discount: number | null) =>
  discount ? Math.round(price - (price * discount) / 100) : price;

/** بناء canonical URL للمنتج */
export const productCanonical = (slug: string) =>
  `${BASE_URL}/products/${slug}`;

/** بناء canonical URL للقسم */
export const categoryCanonical = (slug: string) =>
  `${BASE_URL}/categories/${slug}`;

/**
 * Open Graph image array جاهز لـ Next.js Metadata
 * يقبل صورة رئيسية + معرض صور
 */
export const buildOgImages = (
  mainImage: string,
  gallery: string[],
  altText: string,
) =>
  [mainImage, ...gallery].slice(0, 4).map((url, i) => ({
    url,
    secureUrl: url,
    width: 1200,
    height: 1200,
    alt: i === 0 ? altText : `${altText} - صورة ${i + 1}`,
  }));

/**
 * generateMetadata لصفحات المنتجات - يُستدعى من page.tsx
 * النوع: Riyadh / Saudi-targeted metadata
 */
export function buildProductMetadata({
  name,
  slug,
  description,
  price,
  discount,
  image,
  gallery,
  categoryName,
  parentCategoryName,
  inStock,
  rating,
  reviewCount,
  updatedAt,
  createdAt,
}: {
  name: string;
  slug: string;
  description: string | null;
  price: number;
  discount: number | null;
  image: string;
  gallery: string[];
  categoryName: string;
  parentCategoryName?: string;
  inStock: boolean;
  rating: number;
  reviewCount: number;
  updatedAt: Date;
  createdAt: Date;
}): Metadata {
  const effectivePrice = getEffectivePrice(price, discount);
  const url = productCanonical(slug);

  const title = `${name} | ${categoryName} - موطن الريف`;
  const desc =
    description?.slice(0, 155) ??
    `اشترِ ${name} من موطن الريف في الرياض، السعودية. ${
      inStock ? "متوفر للشراء الفوري" : "راجع البدائل"
    }. أسعار تنافسية وتوصيل سريع.`;

  const keywords = [
    name,
    `${name} الرياض`,
    `${name} السعودية`,
    categoryName,
    `${categoryName} الرياض`,
    ...(parentCategoryName ?
      [parentCategoryName, `${parentCategoryName} الرياض`]
    : []),
    "أثاث الرياض",
    "موطن الريف",
    "furniture Riyadh",
  ];

  return {
    title,
    description: desc,
    keywords,
    alternates: { canonical: url, languages: { "en-US": url } },

    openGraph: {
      type: "website",
      title,
      description: desc,
      url,
      siteName: "موطن الريف للأثاث",
      locale: "ar_SA",
      images: buildOgImages(image, gallery, name),
    },

    twitter: {
      card: "summary_large_image",
      site: "@mawtin_elrif",
      title,
      description: desc,
      images: { url: image, alt: name },
    },

    robots: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },

    other: {
      "product:price:amount": String(effectivePrice),
      "product:price:currency": "SAR",
      "product:availability": inStock ? "in stock" : "out of stock",
      "product:condition": "new",
      "product:brand": "موطن الريف",
      "product:retailer_item_id": slug,
      ...(reviewCount > 0 && {
        "product:rating:value": String(rating),
        "product:rating:scale": "5",
        "product:rating:count": String(reviewCount),
      }),
      "geo.region": "SA-01",
      "geo.placename": "الرياض",
      "geo.position": "24.7136;46.6753",
      ICBM: "24.7136, 46.6753",
      "content-language": "en-US",
      "article:modified_time": updatedAt.toISOString(),
      "article:published_time": createdAt.toISOString(),
    },
  };
}

/**
 * WebSite JSON-LD مع SearchAction - يُضاف في root layout
 * يُفعّل Sitelinks Search Box في Google
 */
export function getWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${BASE_URL}#website`,
    url: BASE_URL,
    name: "موطن الريف للأثاث",
    description: "متجر الأثاث الأول في الرياض، المملكة العربية السعودية",
    inLanguage: "ar",
    publisher: {
      "@type": "Organization",
      "@id": `${BASE_URL}#organization`,
      name: "موطن الريف للأثاث",
      url: BASE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/logo.png`,
        width: 200,
        height: 60,
      },
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        areaServed: "SA",
        availableLanguage: "Arabic",
      },
      address: {
        "@type": "PostalAddress",
        addressLocality: "الرياض",
        addressRegion: "منطقة الرياض",
        addressCountry: "SA",
      },
      sameAs: [
        "https://www.instagram.com/mawtin-elrif",
        "https://twitter.com/mawtin_elrif",
        "https://www.snapchat.com/add/mawtin-elrif",
      ],
    },
    // Sitelinks Searchbox - يُفعِّل Search Box في نتائج Google لاسم موقعك
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE_URL}/products?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}
