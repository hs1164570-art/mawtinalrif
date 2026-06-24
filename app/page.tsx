/**
 * =====================================================================
 * app/page.tsx — الصفحة الرئيسية
 * مؤسسة موطن الريف للتجارة — الرياض
 *
 * ✅ generateMetadata        → title / description / keywords / OG / Twitter
 * ✅ WebPage JSON-LD          → بيانات الصفحة الرئيسية
 * ✅ LocalBusiness JSON-LD   → ظهور في Google Maps والبحث المحلي
 * ✅ Reviews JSON-LD          → تقييمات العملاء كـ Rich Snippets
 * ✅ AggregateRating JSON-LD  → متوسط التقييم مع النجوم في Google
 * ✅ ISR 2 دقيقة              → بيانات fresh دايمًا
 * =====================================================================
 */

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";
import ProductSections from "./components/homePage/ProductSections/index";
import { getHomeData } from "@/utils/home";
import { HOME_QUERY_KEY } from "./components/homePage/ProductSections/constants";
import getQueryClient from "@/lib/getQueryClient";
import { REVIEWS_QUERY_KEY, getReviews } from "@/hook/Getreviews";
import TestimonialsSection from "./components/homePage/TestimonialsSection";

// ─── Constants ────────────────────────────────────────────────────────────────
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://mawtinalriyf.com";
const SITE_NAME = "مفروشات  موطن الريف";
const ORG_NAME = "مؤسسة موطن الريف للتجارة";
const LOGO_URL =
  "https://bwmvrztnbjayktocsdvc.supabase.co/storage/v1/object/public/alrif/logo.png";

// ─── ISR: تجديد الكاش كل دقيقتين بدون re-build ──────────────────────────────
export const revalidate = 120;

// ─── JSON-LD Helper ───────────────────────────────────────────────────────────
function serializeJsonLd(data: object): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

// ─── Metadata ─────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  // ── Title ──────────────────────────────────────────────────────────────────
  // مُحسَّن للكلمات المفتاحية الأكثر بحثاً في الرياض
  title: "مفروشات الريف - أفضل أثاث في الرياض | موطن الريف",

  // ── Description ────────────────────────────────────────────────────────────
  // under 155 chars — action + keywords + location + differentiator
  description:
    "اكتشف أفضل تشكيلات الأثاث المنزلي الفاخر في الرياض. " +
    "غرف نوم، كنب، طاولات، وإكسسوارات بأسعار تنافسية وتوصيل سريع. " +
    "مفروشات الريف — حي الجزيرة، الطريق الدائري الشرقي.",

  // ── Keywords ────────────────────────────────────────────────────────────────
  keywords: [
    // Brand
    "مفروشات الريف",
    "موطن الريف",
    "مؤسسة موطن الريف",
    // High-volume Arabic
    "أثاث الرياض",
    "مفروشات الرياض",
    "أثاث منزلي الرياض",
    "أثاث فاخر الرياض",
    "أثاث السعودية",
    "مفروشات السعودية",
    // Category keywords
    "غرف نوم الرياض",
    "كنب الرياض",
    "طاولات طعام الرياض",
    "أثاث مكتبي الرياض",
    "ديكور منازل الرياض",
    "تجهيز منازل الرياض",
    // Intent keywords
    "شراء أثاث الرياض",
    "أسعار أثاث الرياض",
    "أفضل أثاث الرياض",
    "محلات أثاث الرياض",
    // Local SEO
    "أثاث حي الجزيرة الرياض",
    "أثاث الطريق الدائري الشرقي",
    // English
    "furniture Riyadh",
    "furniture Saudi Arabia",
    "home furniture Riyadh",
    "buy furniture Riyadh",
  ],

  // ── Canonical ──────────────────────────────────────────────────────────────
  alternates: {
    canonical: BASE_URL,
    languages: { "en-US": BASE_URL },
  },

  // ── Open Graph ─────────────────────────────────────────────────────────────
  openGraph: {
    type: "website",
    url: BASE_URL,
    siteName: SITE_NAME,
    locale: "ar_SA",
    title: "مفروشات الريف - أفضل أثاث في الرياض",
    description:
      "تسوّق الآن أفضل تشكيلات الأثاث المنزلي الفاخر في الرياض. " +
      "توصيل سريع، أسعار تنافسية، جودة استثنائية.",
    images: [
      {
        url: `${BASE_URL}/og-image.jpg`,
        secureUrl: `${BASE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} - أفضل أثاث في الرياض`,
      },
    ],
  },

  // ── Twitter / X ────────────────────────────────────────────────────────────
  twitter: {
    card: "summary_large_image",
    site: "@mafrushatalriyf1",
    creator: "@mafrushatalriyf1",
    title: "مفروشات الريف - أفضل أثاث في الرياض",
    description:
      "أفضل تشكيلات الأثاث المنزلي في الرياض. توصيل سريع وأسعار تنافسية.",
    images: [`${BASE_URL}/og-image.jpg`],
  },

  // ── Robots ─────────────────────────────────────────────────────────────────
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // ── Extra meta ─────────────────────────────────────────────────────────────
  other: {
    "geo.region": "SA-01",
    "geo.placename": "الرياض",
    "geo.position": "24.6565151;46.7939716",
    ICBM: "24.6565151, 46.7939716",
    "content-language": "en-US",
  },
};

// ─── Page Component ───────────────────────────────────────────────────────────
export default async function HomePage() {
  const queryClient = getQueryClient();

  // كلا الـ prefetch يعملان بالتوازي → أقل latency ممكن
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: HOME_QUERY_KEY,
      queryFn: getHomeData,
    }),
    queryClient.prefetchQuery({
      queryKey: REVIEWS_QUERY_KEY,
      queryFn: getReviews,
    }),
  ]);

  // ── Reviews data (zero extra fetch — from cache) ───────────────────────────
  const reviews =
    queryClient.getQueryData<Awaited<ReturnType<typeof getReviews>>>(
      REVIEWS_QUERY_KEY,
    ) ?? [];

  // ── AggregateRating ────────────────────────────────────────────────────────
  const avgRating =
    reviews.length > 0 ?
      (
        reviews.reduce((sum: number, r: any) => sum + r.rating, 0) /
        reviews.length
      ).toFixed(1)
    : null;

  // ── WebPage JSON-LD ───────────────────────────────────────────────────────
  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": BASE_URL,
    url: BASE_URL,
    name: "مفروشات الريف - أفضل أثاث في الرياض",
    description:
      "اكتشف أفضل تشكيلات الأثاث المنزلي الفاخر في الرياض من مفروشات الريف.",
    inLanguage: "ar",
    isPartOf: { "@id": `${BASE_URL}/#website` },
    about: { "@id": `${BASE_URL}/#business` },
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: `${BASE_URL}/og-image.jpg`,
      width: 1200,
      height: 630,
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: SITE_NAME,
          item: BASE_URL,
        },
      ],
    },
  };

  // ── LocalBusiness JSON-LD (Standalone for homepage) ───────────────────────
  // نكرره هنا مع AggregateRating مجمّع من التقييمات الحقيقية
  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "FurnitureStore"],
    "@id": `${BASE_URL}/#business`,
    name: ORG_NAME,
    alternateName: SITE_NAME,
    url: BASE_URL,
    logo: LOGO_URL,
    image: [LOGO_URL, `${BASE_URL}/og-image.jpg`],
    description:
      "مؤسسة موطن الريف للتجارة — أجمل تشكيلات الأثاث المنزلي الفاخر " +
      "في الرياض. حي الجزيرة، الطريق الدائري الشرقي الفرعي (بين مخرج 15 ومخرج 16).",
    email: "info@mawtinalriyf.com",
    telephone: "+966557211359",
    priceRange: "$$",
    currenciesAccepted: "SAR",
    paymentAccepted: "Cash, Credit Card",
    hasMap: "https://maps.app.goo.gl/ZtJBNuCLczyKCDSo6",
    address: {
      "@type": "PostalAddress",
      streetAddress: "3 حي الجزيرة، الطريق الدائري الشرقي الفرعي",
      addressLocality: "الرياض",
      postalCode: "12211",
      addressRegion: "منطقة الرياض",
      addressCountry: "SA",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 24.6565151,
      longitude: 46.7939716,
    },
    areaServed: {
      "@type": "City",
      name: "الرياض",
      addressCountry: "SA",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
        opens: "09:00",
        closes: "17:00",
      },
    ],
    // ✅ AggregateRating من تقييمات العملاء الحقيقية — يظهر كنجوم في Google
    ...(avgRating &&
      reviews.length >= 3 && {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: avgRating,
          bestRating: "5",
          worstRating: "1",
          reviewCount: reviews.length,
        },
      }),
    sameAs: [
      "https://www.instagram.com/alreeefl11/",
      "https://www.tiktok.com/@mafrushatalriyf1",
      "https://maps.app.goo.gl/ZtJBNuCLczyKCDSo6",
    ],
  };

  // ── Individual Reviews JSON-LD ─────────────────────────────────────────────
  const reviewsJsonLd =
    reviews.length > 0 ?
      {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "@id": `${BASE_URL}/#business`,
        name: ORG_NAME,
        review: reviews.map((r: any) => ({
          "@type": "Review",
          author: {
            "@type": "Person",
            name: r.name,
          },
          reviewRating: {
            "@type": "Rating",
            ratingValue: r.rating,
            bestRating: "5",
            worstRating: "1",
          },
          reviewBody: r.text,
          datePublished: r.time,
        })),
      }
    : null;

  // ── SpecialOffer / ItemList تشجيعي للـ Rich Results ──────────────────────
  const offerCatalogJsonLd = {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    "@id": `${BASE_URL}/#catalog`,
    name: `تشكيلة ${SITE_NAME} للأثاث المنزلي`,
    description:
      "تصفح أجمل تشكيلات الأثاث المنزلي الفاخر في الرياض. " +
      "غرف نوم، كنب، طاولات، وإكسسوارات.",
    url: BASE_URL,
    numberOfItems: 100,
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: { "@type": "Product", name: "غرف نوم" },
      },
      {
        "@type": "Offer",
        itemOffered: { "@type": "Product", name: "كنب وصالونات" },
      },
      {
        "@type": "Offer",
        itemOffered: { "@type": "Product", name: "طاولات طعام" },
      },
      {
        "@type": "Offer",
        itemOffered: { "@type": "Product", name: "أثاث مكتبي" },
      },
    ],
  };

  return (
    <>
      {/* ══ WebPage JSON-LD ══════════════════════════════════════════════ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(webPageJsonLd),
        }}
      />

      {/* ══ LocalBusiness + AggregateRating JSON-LD ══════════════════════ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(localBusinessJsonLd),
        }}
      />

      {/* ══ Individual Reviews JSON-LD ════════════════════════════════════ */}
      {reviewsJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(reviewsJsonLd),
          }}
        />
      )}

      {/* ══ OfferCatalog JSON-LD ═════════════════════════════════════════ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(offerCatalogJsonLd),
        }}
      />

      {/* ⚠️ div وليس main — layout يوفر <main> مسبقاً، nested main = HTML غير صالح */}
      <div
        id="main-content"
        className="min-h-screen bg-[var(--bg)]"
        dir="rtl"
        lang="ar"
      >
        {/* Skip to content — accessibility + SEO */}
        <a
          href="#products-section"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:right-4 focus:z-[100] focus:rounded-sm focus:bg-[var(--gold)] focus:px-4 focus:py-2 focus:text-white focus:font-bold focus:text-sm"
        >
          انتقل مباشرة للمنتجات
        </a>

        {/*
          HydrationBoundary واحد يخدم كل الـ client components —
          بيانات المنتجات والتقييمات كلها محقونة من السيرفر
        */}
        <HydrationBoundary state={dehydrate(queryClient)}>
          <ProductSections />
          <TestimonialsSection />
        </HydrationBoundary>
      </div>
    </>
  );
}
