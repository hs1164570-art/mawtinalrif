/**
 * =====================================================================
 * app/consultation/page.tsx — صفحة الاستشارة المجانية / التواصل
 * مؤسسة موطن الريف للتجارة — الرياض
 *
 * ✅ generateMetadata        → title / description / keywords / OG / Twitter
 * ✅ ContactPage JSON-LD     → Google يعرف إنها صفحة تواصل
 * ✅ Service JSON-LD         → الاستشارة المجانية كـ خدمة مُهيكلة
 * ✅ LocalBusiness JSON-LD   → NAP كامل + contactPoint
 * ✅ BreadcrumbList JSON-LD  → مسار التنقل في نتائج البحث
 * ✅ Canonical + hreflang    → يمنع duplicate content
 * ✅ Geo meta tags           → Local SEO targeting الرياض
 * ✅ serializeJsonLd         → XSS-safe escaping
 * =====================================================================
 */

import type { Metadata } from "next";
import { ConsultationClient } from "./ConsultationClient";

// ─── Constants ────────────────────────────────────────────────────────────────
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://mawtinalriyf.com";
const PAGE_URL = `${BASE_URL}/consultation`;
const SITE_NAME = "مفروشات الريف";
const ORG_NAME = "مؤسسة موطن الريف للتجارة";
const LOGO_URL =
  "https://bwmvrztnbjayktocsdvc.supabase.co/storage/v1/object/public/alrif/logo.png";

// ─── JSON-LD Helper ───────────────────────────────────────────────────────────
function serializeJsonLd(data: object): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

// ─── Metadata ─────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  // ✅ Title: keyword + brand + geo — under 60 chars
  title: "استشارة مجانية في الأثاث والتصميم | موطن الريف الرياض",

  // ✅ Description: CTA + service + location — under 155 chars
  description:
    "احجز استشارتك المجانية الآن مع خبراء الأثاث والتصميم الداخلي في موطن الريف بالرياض. " +
    "نساعدك تختار الأثاث المناسب لمنزلك بأفضل الأسعار. اتصل بنا أو واتساب.",

  // ✅ Keywords: intent-based + local SEO
  keywords: [
    // Primary intent
    "استشارة أثاث مجانية الرياض",
    "استشارة تصميم داخلي الرياض",
    "حجز استشارة أثاث",
    "خبراء أثاث الرياض",
    // Contact intent
    "تواصل موطن الريف",
    "رقم موطن الريف",
    "واتساب موطن الريف",
    "اتصل موطن الريف",
    // Service keywords
    "تصميم داخلي مجاني الرياض",
    "خدمة عملاء أثاث الرياض",
    "استشارة مفروشات الرياض",
    "أفضل أثاث الرياض",
    // Brand
    "مفروشات الريف",
    "موطن الريف",
    "مؤسسة موطن الريف",
    // English
    "free furniture consultation Riyadh",
    "interior design consultation Riyadh",
    "contact furniture store Riyadh",
  ],

  // ✅ Canonical
  alternates: {
    canonical: PAGE_URL,
    languages: { "ar-SA": PAGE_URL },
  },

  // ✅ Open Graph — لما حد يشارك الرابط على واتساب أو تويتر
  openGraph: {
    type: "website",
    url: PAGE_URL,
    siteName: SITE_NAME,
    locale: "ar_SA",
    title: "استشارة مجانية في الأثاث والتصميم | موطن الريف الرياض",
    description:
      "احجز استشارتك المجانية مع خبراء الأثاث والتصميم الداخلي في موطن الريف بالرياض. " +
      "نساعدك تختار الأثاث المناسب لمنزلك.",
    images: [
      {
        url: `${BASE_URL}/og-consultation.jpg`,
        secureUrl: `${BASE_URL}/og-consultation.jpg`,
        width: 1200,
        height: 630,
        alt: "احجز استشارة مجانية — مفروشات الريف الرياض",
      },
    ],
  },

  // ✅ Twitter / X
  twitter: {
    card: "summary_large_image",
    site: "@mafrushatalriyf1",
    creator: "@mafrushatalriyf1",
    title: "استشارة مجانية في الأثاث والتصميم | موطن الريف الرياض",
    description: "احجز استشارتك المجانية مع خبراء الأثاث في الرياض.",
    images: [`${BASE_URL}/og-consultation.jpg`],
  },

  // ✅ Robots
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

  // ✅ Geo + Language meta
  other: {
    "geo.region": "SA-01",
    "geo.placename": "الرياض",
    "geo.position": "24.6565151;46.7939716",
    ICBM: "24.6565151, 46.7939716",
    "content-language": "ar-SA",
  },
};
export const revalidate = 86000;

// ─── JSON-LD Schemas ──────────────────────────────────────────────────────────

/**
 * ContactPage — يخلي Google يعرف إنها صفحة تواصل
 * يظهر في نتائج البحث كـ "صفحة التواصل" مباشرة
 */
const contactPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  "@id": PAGE_URL,
  url: PAGE_URL,
  name: "استشارة مجانية — موطن الريف",
  description:
    "احجز استشارتك المجانية مع خبراء الأثاث والتصميم الداخلي في موطن الريف بالرياض.",
  inLanguage: "ar",
  isPartOf: { "@id": `${BASE_URL}/#website` },
  about: { "@id": `${BASE_URL}/#business` },
  breadcrumb: { "@id": `${PAGE_URL}#breadcrumb` },
};

/**
 * Service — الاستشارة المجانية كخدمة مُهيكلة
 * يخلي Google يعرف التفاصيل ويعرضها في نتائج البحث
 */
const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": `${PAGE_URL}#service`,
  name: "استشارة مجانية في الأثاث والتصميم الداخلي",
  alternateName: "خدمة الاستشارة المجانية — موطن الريف",
  description:
    "استشارة مجانية مع خبراء الأثاث والتصميم الداخلي في موطن الريف. " +
    "نساعدك في اختيار الأثاث المناسب لمنزلك بأفضل الأسعار في الرياض.",
  url: PAGE_URL,
  serviceType: "استشارة أثاث وتصميم داخلي",
  category: "Interior Design Consultation",
  provider: {
    "@type": "FurnitureStore",
    "@id": `${BASE_URL}/#business`,
    name: ORG_NAME,
    url: BASE_URL,
  },
  areaServed: {
    "@type": "City",
    name: "الرياض",
    addressCountry: "SA",
  },
  // الاستشارة مجانية
  offers: {
    "@type": "Offer",
    name: "استشارة مجانية",
    price: "0",
    priceCurrency: "SAR",
    availability: "https://schema.org/InStock",
    validFrom: new Date().toISOString().split("T")[0],
    seller: {
      "@type": "Organization",
      name: ORG_NAME,
      url: BASE_URL,
    },
  },
  // طرق التواصل للحجز
  availableChannel: [
    {
      "@type": "ServiceChannel",
      serviceUrl: PAGE_URL,
      servicePhone: "+966557211359",
      availableLanguage: "Arabic",
    },
    {
      "@type": "ServiceChannel",
      serviceUrl: "https://wa.me/966501655033",
      servicePhone: "+966557211359",
      name: "WhatsApp",
      availableLanguage: "Arabic",
    },
  ],
  hoursAvailable: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
    opens: "09:00",
    closes: "17:00",
  },
};

/**
 * LocalBusiness — NAP كامل لصفحة التواصل
 * أهم حاجة للـ Local SEO — Google تتحقق إن NAP متسق في كل الصفحات
 */
const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "FurnitureStore"],
  "@id": `${BASE_URL}/#business`,
  name: ORG_NAME,
  url: BASE_URL,
  logo: LOGO_URL,
  telephone: "+966557211359",
  email: "info@mawtinalriyf.com",
  priceRange: "$$",
  hasMap: "https://maps.app.goo.gl/ZtJBNuCLczyKCDSo6",
  address: {
    "@type": "PostalAddress",
    streetAddress:
      "حي الجزيرة، الطريق الدائري الشرقي الفرعي بجوار إي هوم وفوال الطايف",
    addressLocality: "الرياض",
    postalCode: "12211",
    addressRegion: "SA-01",
    addressCountry: "SA",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 24.6565151,
    longitude: 46.7939716,
  },
  contactPoint: [
    {
      "@type": "ContactPoint",
      telephone: "+966557211359",
      contactType: "customer service",
      availableLanguage: "Arabic",
      areaServed: "SA",
    },
    {
      "@type": "ContactPoint",
      telephone: "966557211359",
      contactType: "customer service",
      contactOption: "TollFree",
      availableLanguage: "Arabic",
      areaServed: "SA",
    },
    {
      "@type": "ContactPoint",
      telephone: "+966557211359",
      contactType: "sales",
      availableLanguage: "Arabic",
      areaServed: "SA",
    },
  ],
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
      opens: "09:00",
      closes: "17:00",
    },
  ],
  sameAs: [
    "https://www.instagram.com/alreeefl11/",
    "https://www.tiktok.com/@mafrushatalriyf1",
    "https://maps.app.goo.gl/ZtJBNuCLczyKCDSo6",
  ],
};

/**
 * BreadcrumbList — مسار التنقل في نتائج البحث
 * الرئيسية ← الاستشارة المجانية
 */
const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "@id": `${PAGE_URL}#breadcrumb`,
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: SITE_NAME,
      item: BASE_URL,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "استشارة مجانية",
      item: PAGE_URL,
    },
  ],
};

// ─── Page Component ───────────────────────────────────────────────────────────
export default function ConsultationPage() {
  return (
    <>
      {/* ══ ContactPage JSON-LD ══════════════════════════════════════════ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(contactPageJsonLd),
        }}
      />

      {/* ══ Service JSON-LD → الاستشارة المجانية كخدمة مُهيكلة ══════════ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(serviceJsonLd),
        }}
      />

      {/* ══ LocalBusiness JSON-LD → NAP كامل ════════════════════════════ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(localBusinessJsonLd),
        }}
      />

      {/* ══ BreadcrumbList JSON-LD ═══════════════════════════════════════ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(breadcrumbJsonLd),
        }}
      />

      {/* Cairo — premium Arabic typeface */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        body, html {
          font-family: 'Cairo', Segoe UI, Tahoma, Arial, sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        ::selection {
          background: rgba(201,169,110,0.25);
          color: #1a1a1a;
        }

        ::-webkit-scrollbar       { width: 6px; }
        ::-webkit-scrollbar-track { background: #f1f3f5; }
        ::-webkit-scrollbar-thumb { background: #c9a96e; border-radius: 3px; }

        input::placeholder,
        textarea::placeholder {
          color: rgba(255,255,255,0.3);
          font-family: 'Cairo', sans-serif;
        }

        select option { font-family: 'Cairo', sans-serif; }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      {/* ⚠️ div وليس main — layout يوفر <main> مسبقاً */}
      <div id="consultation-page" dir="rtl" lang="ar">
        <ConsultationClient />
      </div>
    </>
  );
}
