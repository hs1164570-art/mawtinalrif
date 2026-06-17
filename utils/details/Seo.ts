// ─── SEO utilities — product detail page ────────────────────────────────────
// كل الـ helpers الخاصة بـ SEO صفحة المنتج (الرياض / السعودية)

import type { Metadata } from "next";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.mawtin-elrif.com";

export const BRAND_AR = "موطن الريف";
export const SITE_NAME = "موطن الريف للأثاث";

// ─── Price helpers ───────────────────────────────────────────────────────────

/** السعر الفعلي بعد الخصم */
export const getEffectivePrice = (price: number, discount: number | null) =>
  discount ? Math.round(price - (price * discount) / 100) : price;

/** سعر مُنسَّق للعرض - ريال سعودي */
export const formatSAR = (n: number) => `${n.toLocaleString("en-SA")} ر.س`;

/** سعر مُنسَّق للـ meta tags */
export const formatMetaPrice = (price: number) =>
  new Intl.NumberFormat("en-SA", {
    style: "currency",
    currency: "SAR",
    minimumFractionDigits: 0,
  }).format(price);

// ─── URL helpers ─────────────────────────────────────────────────────────────

export const productCanonical = (slug: string) =>
  `${BASE_URL}/products/${slug}`;

export const categoryCanonical = (slug: string) =>
  `${BASE_URL}/categories/${slug}`;

// ─── OG Images ───────────────────────────────────────────────────────────────

/**
 * Open Graph image array جاهز لـ Next.js Metadata
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

// ─── generateMetadata builder ────────────────────────────────────────────────

/**
 * بناء metadata كامل لصفحة المنتج
 * مُحسَّن للسوق السعودي ومحركات البحث في الرياض
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
  productId,
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
  productId: string;
  updatedAt: Date;
  createdAt: Date;
}): Metadata {
  const effectivePrice = getEffectivePrice(price, discount);
  const url = productCanonical(slug);

  // Title: keyword-rich, under 60 chars
  const title = `${name} | ${categoryName} - ${BRAND_AR}`;

  // Description: action + product + location + brand, under 155 chars
  const fallbackDesc = `اشترِ ${name} من ${BRAND_AR} في الرياض، السعودية. ${
    inStock ? "متوفر للشراء الفوري" : "راجع البدائل المتاحة"
  }. أفضل أثاث في الرياض.`;

  const seoDesc =
    description ?
      description.length > 155 ?
        description.slice(0, 152) + "…"
      : description
    : fallbackDesc.slice(0, 155);

  // Keywords: product + category + location
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
    "furniture Saudi Arabia",
  ];

  return {
    title,
    description: seoDesc,
    keywords,

    alternates: {
      canonical: url,
      languages: { "en-US": url },
    },

    openGraph: {
      type: "website",
      title,
      description: seoDesc,
      url,
      siteName: SITE_NAME,
      locale: "ar_SA",
      images: buildOgImages(image, gallery, name),
    },

    twitter: {
      card: "summary_large_image",
      site: "@mawtin_elrif",
      creator: "@mawtin_elrif",
      title,
      description: seoDesc,
      images: { url: image, alt: name },
    },

    robots: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
      googleBot: {
        index: true,
        follow: true,
        noimageindex: false,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },

    other: {
      // Product / Facebook Product Catalog
      "product:price:amount": String(effectivePrice),
      "product:price:currency": "SAR",
      "product:availability": inStock ? "in stock" : "out of stock",
      "product:condition": "new",
      "product:brand": BRAND_AR,
      "product:retailer_item_id": productId,
      "product:category": categoryName,

      // Review signals (if any)
      ...(reviewCount > 0 && {
        "product:rating:value": String(rating),
        "product:rating:scale": "5",
        "product:rating:count": String(reviewCount),
      }),

      // Geo targeting — Riyadh Region ISO 3166-2
      "geo.region": "SA-01",
      "geo.placename": "الرياض",
      "geo.position": "24.7136;46.6753",
      ICBM: "24.7136, 46.6753",

      // Language
      "content-language": "en-US",

      // Freshness signals for Google
      "article:modified_time": updatedAt.toISOString(),
      "article:published_time": createdAt.toISOString(),
    },
  };
}

// ─── JSON-LD builders ────────────────────────────────────────────────────────

/**
 * WebSite JSON-LD + SearchAction
 * يُضاف في root layout — يُفعِّل Sitelinks Search Box في Google
 */
export function getWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${BASE_URL}#website`,
    url: BASE_URL,
    name: SITE_NAME,
    description: "متجر الأثاث الأول في الرياض، المملكة العربية السعودية",
    inLanguage: "ar",
    publisher: {
      "@type": "Organization",
      "@id": `${BASE_URL}#organization`,
      name: SITE_NAME,
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
    // Sitelinks Searchbox
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

/**
 * بناء Product JSON-LD Schema كامل
 * يُستخدم في ProductJsonLd component
 */
export function buildProductJsonLd({
  product,
  effectivePrice,
  totalComments,
}: {
  product: {
    id: string;
    name: string;
    description: string | null;
    image: string;
    gallery: string[];
    rating: number;
    inStock: boolean;
    slug: string;
    category: {
      name: string;
      slug: string;
      parent: { name: string; slug: string } | null;
    };
  };
  effectivePrice: number;
  totalComments: number;
}) {
  const url = productCanonical(product.slug);
  const allImages = [product.image, ...product.gallery];

  const breadcrumbItems = [
    {
      "@type": "ListItem",
      position: 1,
      item: { "@id": BASE_URL, name: BRAND_AR },
    },
    ...(product.category.parent ?
      [
        {
          "@type": "ListItem",
          position: 2,
          item: {
            "@id": categoryCanonical(product.category.parent.slug),
            name: product.category.parent.name,
          },
        },
        {
          "@type": "ListItem",
          position: 3,
          item: {
            "@id": categoryCanonical(product.category.slug),
            name: product.category.name,
          },
        },
        {
          "@type": "ListItem",
          position: 4,
          item: { "@id": url, name: product.name },
        },
      ]
    : [
        {
          "@type": "ListItem",
          position: 2,
          item: {
            "@id": categoryCanonical(product.category.slug),
            name: product.category.name,
          },
        },
        {
          "@type": "ListItem",
          position: 3,
          item: { "@id": url, name: product.name },
        },
      ]),
  ];

  return {
    "@context": "https://schema.org",
    "@graph": [
      // Product
      {
        "@type": "Product",
        "@id": `${url}#product`,
        name: product.name,
        image: allImages,
        description:
          product.description ??
          `${product.name} - أثاث عالي الجودة من ${BRAND_AR} في الرياض`,
        sku: product.id,
        brand: { "@type": "Brand", name: BRAND_AR, url: BASE_URL },
        category: product.category.name,
        offers: {
          "@type": "Offer",
          "@id": `${url}#offer`,
          url,
          price: effectivePrice,
          priceCurrency: "SAR",
          availability:
            product.inStock ?
              "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
          itemCondition: "https://schema.org/NewCondition",
          seller: { "@type": "Organization", name: BRAND_AR, url: BASE_URL },
          areaServed: { "@type": "City", name: "الرياض" },
          priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          hasMerchantReturnPolicy: {
            "@type": "MerchantReturnPolicy",
            applicableCountry: "SA",
            returnPolicyCategory:
              "https://schema.org/MerchantReturnFiniteReturnWindow",
            merchantReturnDays: 7,
            returnMethod: "https://schema.org/ReturnByMail",
            returnFees: "https://schema.org/FreeReturn",
          },
          shippingDetails: {
            "@type": "OfferShippingDetails",
            shippingRate: {
              "@type": "MonetaryAmount",
              value: 0,
              currency: "SAR",
            },
            shippingDestination: {
              "@type": "DefinedRegion",
              addressCountry: "SA",
              addressRegion: "الرياض",
            },
            deliveryTime: {
              "@type": "ShippingDeliveryTime",
              handlingTime: {
                "@type": "QuantitativeValue",
                minValue: 1,
                maxValue: 2,
                unitCode: "DAY",
              },
              transitTime: {
                "@type": "QuantitativeValue",
                minValue: 2,
                maxValue: 5,
                unitCode: "DAY",
              },
            },
          },
        },
        ...(totalComments > 0 && {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            bestRating: 5,
            worstRating: 1,
            reviewCount: totalComments,
          },
        }),
      },

      // BreadcrumbList
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: breadcrumbItems,
      },

      // WebPage
      {
        "@type": "WebPage",
        "@id": url,
        url,
        name: `${product.name} | ${SITE_NAME} - الرياض`,
        description:
          product.description?.slice(0, 160) ??
          `اشترِ ${product.name} من ${BRAND_AR} في الرياض`,
        inLanguage: "ar",
        breadcrumb: { "@id": `${url}#breadcrumb` },
        mainEntity: { "@id": `${url}#product` },
        isPartOf: {
          "@type": "WebSite",
          "@id": `${BASE_URL}#website`,
          name: SITE_NAME,
          url: BASE_URL,
        },
      },

      // FurnitureStore (LocalBusiness - Riyadh)
      {
        "@type": ["Organization", "FurnitureStore"],
        "@id": `${BASE_URL}#organization`,
        name: SITE_NAME,
        url: BASE_URL,
        logo: `${BASE_URL}/logo.png`,
        telephone: "+966-11-000-0000",
        priceRange: "$$",
        currenciesAccepted: "SAR",
        paymentAccepted: "Credit Card, Cash",
        address: {
          "@type": "PostalAddress",
          addressLocality: "الرياض",
          addressRegion: "منطقة الرياض",
          addressCountry: "SA",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: 24.7136,
          longitude: 46.6753,
        },
        areaServed: { "@type": "City", name: "الرياض" },
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday"],
            opens: "09:00",
            closes: "22:00",
          },
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Thursday", "Friday"],
            opens: "14:00",
            closes: "23:00",
          },
        ],
        sameAs: [
          "https://www.instagram.com/mawtin-elrif",
          "https://twitter.com/mawtin_elrif",
          "https://www.snapchat.com/add/mawtin-elrif",
        ],
      },
    ],
  };
}
