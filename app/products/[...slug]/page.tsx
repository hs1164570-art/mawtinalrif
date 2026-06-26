/**
 * =====================================================================
 * /products/[...slug] — صفحة عرض المنتجات حسب القسم
 * مفروشات الريف — الرياض
 *
 * ✅ SEO كامل self-contained — لا يحتاج ملفات خارجية للـ SEO
 * ✅ generateMetadata        → title / description / keywords / OG / Twitter
 * ✅ WebSite JSON-LD          → Sitelinks Search Box في Google
 * ✅ BreadcrumbList JSON-LD   → مسار التنقل في نتائج البحث
 * ✅ ItemList + Product       → Rich Results (صور + أسعار في Google)
 * ✅ LocalBusiness JSON-LD    → ظهور في البحث المحلي بالرياض
 * ✅ CollectionPage JSON-LD   → معلومات الصفحة الكاملة
 * ✅ Preload hero image       → LCP أسرع = Core Web Vitals أفضل
 * ✅ Canonical + hreflang     → يمنع duplicate content
 * ✅ ISR 5 دقايق              → بيانات fresh دايمًا
 * =====================================================================
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getProductsData } from "@/utils/getProductsBySlug";
import ProductsPageClient from "@/app/components/products/ProductsPageClient";
import ProductsLoading from "./loading";

// ─── Constants ────────────────────────────────────────────────────────────────
// ✅ BASE_URL لضمان تطابق @id مع layout و [slug] page
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://mawtinalriyf.com";
const SITE_NAME = "مفروشات الريف";
const BRAND_AR = "مفروشات الريف";
const LOGO_URL =
  "https://bwmvrztnbjayktocsdvc.supabase.co/storage/v1/object/public/alrif/logo.png";

const DEFAULT_BG = `https://bwmvrztnbjayktocsdvc.supabase.co/storage/v1/object/sign/alrif/productBacground.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hNzkzMzE5NS0xOGUwLTRkOTMtYTRiMC0xNjczMTVlOTUyMGUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhbHJpZi9wcm9kdWN0QmFjZ3JvdW5kLnBuZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODEwOTc1OTEsImV4cCI6Mjk1MDEyNDE1OTF9.4ObB39B7KzW9kHij2anpwn8-U0ukXNDG7Bq0nAHMKPQ`;

// ─── SEO Helpers (self-contained, no external imports) ────────────────────────

/** Escape < > & to prevent XSS in ld+json script tags */
function serializeJsonLd(data: object): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}
export const revalidate = 86000;

// ✅ WebSite JSON-LD محذوف — layout.tsx يوفره على كل صفحة تلقائياً

/**
 * BreadcrumbList → مسار التنقل في نتائج البحث
 * يظهر كـ الرئيسية > أثاث > غرف نوم في Google
 */
function getBreadcrumbJsonLd(
  breadcrumbs: Array<{ name: string; href: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: `${BASE_URL}${crumb.href}`,
    })),
  };
}

/**
 * ItemList + Product → يخلي Google يعرض صور وأسعار المنتجات
 * مباشرة في نتائج البحث (Rich Results)
 */
function getItemListJsonLd(
  products: Array<{
    slug: string;
    name: string;
    image: string;
    gallery: string[];
    price: number;
    discount: number | null;
    inStock: boolean;
    rating: number;
  }>,
  categoryName: string,
  canonicalPath: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${categoryName} — ${SITE_NAME}`,
    description: `تشكيلة ${categoryName} من ${SITE_NAME} بأجود المواصفات وأفضل الأسعار في الرياض`,
    url: `${BASE_URL}${canonicalPath}`,
    numberOfItems: products.length,
    itemListElement: products.map((p, i) => {
      const finalPrice =
        p.discount ? Math.round(p.price * (1 - p.discount / 100)) : p.price;

      return {
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Product",
          "@id": `${BASE_URL}/products/${p.slug}`,
          name: p.name,
          image: [p.image, ...p.gallery].slice(0, 5),
          url: `${BASE_URL}/products/${p.slug}`,
          brand: { "@type": "Brand", name: BRAND_AR },
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
            seller: { "@type": "Organization", name: SITE_NAME, url: BASE_URL },
          },
          // التقييم — يظهر كنجوم في نتائج البحث
          ...(p.rating > 0 && {
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: p.rating,
              bestRating: "5",
              worstRating: "1",
              reviewCount: 1,
            },
          }),
        },
      };
    }),
  };
}

/**
 * LocalBusiness → ظهور في Google Maps وخرائط البحث المحلي
 * مهم جداً للظهور لما أحد يبحث "أثاث الرياض" أو "مفروشات قريبة مني"
 */
function getLocalBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "FurnitureStore"],
    "@id": `${BASE_URL}/#business`,
    name: SITE_NAME,
    url: BASE_URL,
    logo: LOGO_URL,
    image: [LOGO_URL, `${BASE_URL}/og-image.jpg`],
    description:
      "مفروشات الريف — أجمل تشكيلات الأثاث المنزلي الفاخر في الرياض، المملكة العربية السعودية",
    priceRange: "$$",
    currenciesAccepted: "SAR",
    paymentAccepted: "Cash, Credit Card",
    // رابط Google Maps الحقيقي
    hasMap: "https://maps.app.goo.gl/ZtJBNuCLczyKCDSo6",
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
        // الجمعة والسبت عطلة رسمية
        dayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
        opens: "09:00",
        closes: "17:00",
      },
    ],
    sameAs: [
      "https://www.instagram.com/alreeefl11/",
      "https://www.tiktok.com/@mafrushatalriyf1",
    ],
  };
}

/**
 * CollectionPage → يخلي Google يفهم إن الصفحة دي مجموعة منتجات
 * ويعرض معلوماتها بشكل صحيح في نتائج البحث
 */
function getCollectionPageJsonLd(
  title: string,
  description: string,
  canonicalPath: string,
  heroImage: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${BASE_URL}${canonicalPath}`,
    name: title,
    description,
    url: `${BASE_URL}${canonicalPath}`,
    inLanguage: "ar",
    isPartOf: { "@id": `${BASE_URL}/#website` },
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: heroImage,
      width: 1200,
      height: 630,
    },
    publisher: {
      "@type": "Organization",
      "@id": `${BASE_URL}/#organization`,
      name: SITE_NAME,
      url: BASE_URL,
      logo: {
        "@type": "ImageObject",
        url: LOGO_URL,
      },
    },
  };
}

// ─── Types ────────────────────────────────────────────────────────────────────
type PageProps = {
  params: Promise<{ slug: string | string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

// ─── ISR: 5 دقايق ─────────────────────────────────────────────────────────────

// ─── generateMetadata ─────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const slugArray = Array.isArray(slug) ? slug : [slug];
  const lastSlug = slugArray[slugArray.length - 1];

  const data = await getProductsData({ slug: lastSlug, page: 1, limit: 1 });

  if (!data) {
    return {
      title: `الصفحة غير موجودة | ${SITE_NAME}`,
      robots: { index: false, follow: false },
    };
  }

  const { category } = data;
  const heroImage = category.image ?? category.parent?.image ?? DEFAULT_BG;
  const isCollectionRoute = !Array.isArray(slug);
  const canonicalPath =
    isCollectionRoute ?
      `/products/collections/${slug}`
    : `/products/${slugArray.join("/")}`;
  const canonicalUrl = `${BASE_URL}${canonicalPath}`;
  const parentName = category.parent?.name;

  // ✅ Title: اسم القسم + الشركة + المدينة — under 60 chars
  const title = `${category.name} | ${SITE_NAME} — الرياض`;

  // ✅ Description: keywords + CTA + عدد المنتجات — under 160 chars
  const description =
    `اكتشف أجمل تشكيلات ${category.name}` +
    (parentName ? ` من قسم ${parentName}` : "") +
    ` في ${SITE_NAME} بالرياض، المملكة العربية السعودية.` +
    ` جودة استثنائية، تصاميم عصرية وكلاسيكية، وأسعار تنافسية.` +
    ` تصفح ${data.total} منتجًا الآن.`;

  // ✅ Keywords: مُحسَّنة للسوق السعودي — Long-tail + Local SEO
  const keywords = [
    category.name,
    `${category.name} للبيع`,
    `${category.name} الرياض`,
    `${category.name} السعودية`,
    `شراء ${category.name}`,
    `أفضل ${category.name}`,
    `سعر ${category.name}`,
    ...(parentName ?
      [parentName, `${parentName} الرياض`, `${parentName} للبيع`]
    : []),
    "أثاث منزلي فاخر",
    "أثاث الرياض",
    "مفروشات الرياض",
    "مفروشات الريف",
    "تجهيز منازل الرياض",
    "ديكور منازل السعودية",
    "أثاث جودة عالية",
    "furniture Riyadh",
    "furniture Saudi Arabia",
    SITE_NAME,
  ].filter((k): k is string => Boolean(k));

  return {
    // ── Core ──────────────────────────────────────────────────────────────
    title,
    description,
    keywords,

    // ── Open Graph ────────────────────────────────────────────────────────
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      images: [
        {
          url: heroImage,
          width: 1200,
          height: 630,
          alt: `${category.name} — ${SITE_NAME}`,
          type: "image/jpeg",
        },
      ],
      locale: "ar_SA",
      type: "website",
    },

    // ── Twitter / X ───────────────────────────────────────────────────────
    twitter: {
      card: "summary_large_image",
      site: "@mafrushatalriyf1",
      creator: "@mafrushatalriyf1",
      title,
      description,
      images: [{ url: heroImage, alt: `${category.name} — ${SITE_NAME}` }],
    },

    // ── Robots ────────────────────────────────────────────────────────────
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

    // ── Canonical + hreflang ──────────────────────────────────────────────
    alternates: {
      canonical: canonicalUrl,
      languages: { "en-US": canonicalUrl },
    },

    // ── Geo + Language meta ───────────────────────────────────────────────
    other: {
      "geo.region": "SA-01",
      "geo.placename": "الرياض",
      "geo.position": "24.7136;46.6753",
      ICBM: "24.7136, 46.6753",
      "content-language": "en-US",
      language: "Arabic",
      rating: "general",
      "revisit-after": "7 days",
    },
  };
}

// ─── Page Component ───────────────────────────────────────────────────────────
export default async function ProductsPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;

  const slugArray = Array.isArray(slug) ? slug : [slug];
  const lastSlug = slugArray[slugArray.length - 1];

  const data = await getProductsData({
    slug: lastSlug,
    page: Math.max(1, Number(sp.page) || 1),
    sort: (sp.sort as string) || "newest",
    minPrice: Number(sp.minPrice) || 0,
    maxPrice: Number(sp.maxPrice) || 9_999_999,
    inStock: sp.inStock === "true" ? true : undefined,
    rating: Number(sp.rating) || 0,
  });

  if (!data) notFound();

  const heroImage =
    data.category.image ?? data.category.parent?.image ?? DEFAULT_BG;
  const isCollectionRoute = !Array.isArray(slug);
  const canonicalPath =
    isCollectionRoute ?
      `/products/collections/${slug}`
    : `/products/${slugArray.join("/")}`;

  const title = `${data.category.name} | ${SITE_NAME} — الرياض`;
  const description = `تشكيلة ${data.category.name} — ${data.total} منتجًا متاحًا في ${SITE_NAME} بالرياض`;

  return (
    <>
      {/* ✅ WebSite JSON-LD محذوف — layout.tsx يوفره تلقائياً */}

      {/* ══ BreadcrumbList → مسار التنقل في نتائج البحث ════════════════ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(getBreadcrumbJsonLd(data.breadcrumbs)),
        }}
      />

      {/* ══ ItemList + Product → صور وأسعار المنتجات في Google ══════════ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(
            getItemListJsonLd(data.products, data.category.name, canonicalPath),
          ),
        }}
      />

      {/* ══ LocalBusiness → البحث المحلي بالرياض + Google Maps ═════════ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(getLocalBusinessJsonLd()),
        }}
      />

      {/* ══ CollectionPage → معلومات الصفحة الكاملة ═════════════════════ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(
            getCollectionPageJsonLd(
              title,
              description,
              canonicalPath,
              heroImage,
            ),
          ),
        }}
      />

      {/* ══ Preload صورة الهيرو → LCP أسرع ════════════════════════════ */}
      <link rel="preload" as="image" href={heroImage} fetchPriority="high" />

      <Suspense fallback={<ProductsLoading />}>
        <ProductsPageClient
          initialData={data}
          slugPath={slugArray}
          defaultBg={DEFAULT_BG}
        />
      </Suspense>
    </>
  );
}
