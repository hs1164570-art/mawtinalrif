/**
 * =====================================================================
 * app/layout.tsx — Root Layout
 * مؤسسة موطن الريف للتجارة — الرياض
 *
 * ✅ Metadata + Viewport     → site-wide SEO يُورَّث في كل صفحة
 * ✅ WebSite JSON-LD          → Sitelinks Search Box في Google
 * ✅ Organization JSON-LD     → بيانات المؤسسة الرسمية
 * ✅ FurnitureStore JSON-LD   → ظهور في البحث المحلي + Google Maps
 * ✅ Geo meta tags            → Local SEO targeting الرياض
 * ✅ Favicon + Icons          → تجربة مستخدم احترافية
 * ✅ Arabic font + RTL        → يقول لـ Google إن المحتوى عربي
 * ✅ Google Ads Tag           → تتبع التحويلات في Google Ads
 * =====================================================================
 */

import type { Metadata, Viewport } from "next";
import { GoogleAnalyticsTag } from "./admin/statistics/googleGA4/components/GoogleAnalyticsTag";
import { Inter, Cairo } from "next/font/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "@/app/globals.css";
import { SessionProvider } from "next-auth/react";
import QueryProvider from "@/providers/queryProviders";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import Navbar from "./components/layout/navbar";
import Footer from "./components/homePage/Footer";
import { auth } from "@/auth";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { DOMAIN } from "@/lib/constants";
import redisClient from "@/lib/redisClient";
import getQueryClient from "@/lib/getQueryClient";
import { categoriesQueryOptions } from "../utils/categories";
import type { RootCategory } from "@/utils/category";
import {
  announcementQueryOptions,
  AnnouncementBarItem,
} from "@/utils/announcementQueryOptions";
import AnnouncementBar from "./components/layout/AnnouncementBar";
import { getActiveAnnouncements } from "@/utils/GetBars";
import ContactSpeedDial from "./components/homePage/FloatBtn";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";

// ─── Fonts ────────────────────────────────────────────────────────────────────
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const cairo = Cairo({
  subsets: ["arabic"],
  variable: "--font-cairo",
  display: "swap",
});

// ─── Constants ────────────────────────────────────────────────────────────────
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://mawtinalriyf.com";
const SITE_NAME = "مفروشات الريف";
const ORG_NAME = "مؤسسة موطن الريف للتجارة";
const LOGO_URL =
  "https://bwmvrztnbjayktocsdvc.supabase.co/storage/v1/object/public/alrif/logo.png";

// ─── Viewport (Next.js 15 — يجب أن يكون export منفصل) ───────────────────────
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#a07830" },
    { media: "(prefers-color-scheme: dark)", color: "#7a5820" },
  ],
  colorScheme: "light",
};

// ─── Site-wide Metadata ───────────────────────────────────────────────────────
// تُورَّث تلقائياً في كل صفحة — وتُستبدل جزئياً بـ generateMetadata في كل صفحة
export const metadata: Metadata = {
  // ── Metadata Base ──────────────────────────────────────────────────────────
  // مهم جداً — يجعل كل الـ relative URLs في metadata تعمل صح
  metadataBase: new URL(BASE_URL),

  // ── Title Template ─────────────────────────────────────────────────────────
  // %s = عنوان الصفحة، default = لما الصفحة ما تحدد title
  title: {
    template: "%s | مفروشات الريف",
    default: "مفروشات الريف - أفضل أثاث في الرياض | موطن الريف",
  },

  // ── Description ────────────────────────────────────────────────────────────
  description:
    "مفروشات الريف — أفضل متجر أثاث في الرياض، المملكة العربية السعودية. " +
    "تشكيلة واسعة من الأثاث المنزلي الفاخر بأسعار تنافسية مع توصيل سريع. " +
    "حي الجزيرة، الطريق الدائري الشرقي، الرياض 12211.",

  // ── Keywords site-wide ─────────────────────────────────────────────────────
  keywords: [
    "أثاث الرياض",
    "مفروشات الرياض",
    "أثاث السعودية",
    "مفروشات الريف",
    "موطن الريف",
    "أثاث منزلي الرياض",
    "غرف نوم الرياض",
    "كنب الرياض",
    "طاولات الرياض",
    "أثاث فاخر الرياض",
    "تجهيز منازل الرياض",
    "ديكور منازل السعودية",
    "furniture Riyadh",
    "furniture Saudi Arabia",
    "home furniture Riyadh",
  ],

  // ── Author / Publisher ─────────────────────────────────────────────────────
  authors: [{ name: ORG_NAME, url: BASE_URL }],
  creator: ORG_NAME,
  publisher: ORG_NAME,

  // ── Open Graph
  // ⚠️ لا يوجد canonical هنا — كل صفحة تضع canonical الخاص بها عبر generateMetadata
  // وضع canonical في layout يجعل Google تعتبر كل الصفحات duplicate للـ homepage ─────────────────────────────────────────────────────────────
  openGraph: {
    type: "website",
    locale: "ar_SA",
    url: BASE_URL,
    siteName: SITE_NAME,
    title: "مفروشات الريف - أفضل أثاث في الرياض",
    description:
      "تسوّق الآن أفضل الأثاث المنزلي في الرياض. " +
      "توصيل سريع وأسعار تنافسية. حي الجزيرة، الطريق الدائري الشرقي.",
    images: [
      {
        url: `${BASE_URL}/og-image.jpg`,
        secureUrl: `${BASE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "مفروشات الريف - أفضل أثاث في الرياض",
      },
    ],
  },

  // ── Twitter / X ────────────────────────────────────────────────────────────
  twitter: {
    card: "summary_large_image",
    site: "@mafrushatalriyf1",
    creator: "@mafrushatalriyf1",
    title: "مفروشات الريف - أفضل أثاث في الرياض",
    description: "أفضل أثاث منزلي في الرياض، السعودية",
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

  // ── Icons ──────────────────────────────────────────────────────────────────
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      {
        url: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: [
      // الربط ده هيحل مشكلة الـ 404 للآيفون تماماً
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },

  // ── Manifest ───────────────────────────────────────────────────────────────
  manifest: "/manifest.json",

  // ── Google Search Console Verification ────────────────────────────────────
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? "",
  },

  // ── PWA ────────────────────────────────────────────────────────────────────
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "مفروشات الريف",
  },

  // ── Format Detection ───────────────────────────────────────────────────────
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  // ── Extra Meta Tags ────────────────────────────────────────────────────────
  other: {
    // Geo — Local SEO targeting الرياض (ISO 3166-2: Riyadh Region)
    "geo.region": "SA-01",
    "geo.placename": "الرياض",
    "geo.position": "24.6565151;46.7939716",
    ICBM: "24.6565151, 46.7939716",
    // Language
    "content-language": "en-US",
    language: "Arabic",
    // General
    rating: "general",
    "revisit-after": "7 days",
    "theme-color": "#a07830",
    // Business contact
    "contact:phone": "+966557211359",
    "contact:email": "info@mawtinalriyf.com",
  },
};

// ─── JSON-LD Helpers (self-contained) ────────────────────────────────────────

function serializeJsonLd(data: object): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

/**
 * WebSite JSON-LD + SearchAction
 * → يُفعِّل Sitelinks Search Box في Google
 */
function getWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${BASE_URL}/#website`,
    url: BASE_URL,
    name: SITE_NAME,
    description: "متجر الأثاث الأول في الرياض، المملكة العربية السعودية",
    inLanguage: "ar",
    publisher: { "@id": `${BASE_URL}/#organization` },
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
 * Organization + FurnitureStore (LocalBusiness)
 * → يُظهر بيانات المؤسسة في Google Knowledge Panel
 * → ظهور في Google Maps لما يبحثوا "أثاث الرياض" أو "مفروشات قريبة مني"
 */
function getOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      // ── Organization ──────────────────────────────────────────────────
      {
        "@type": "Organization",
        "@id": `${BASE_URL}/#organization`,
        name: ORG_NAME,
        alternateName: [SITE_NAME, "موطن الريف", "مفروشات الريف"],
        url: BASE_URL,
        logo: {
          "@type": "ImageObject",
          "@id": `${BASE_URL}/#logo`,
          url: LOGO_URL,
          contentUrl: LOGO_URL,
          width: 200,
          height: 60,
          caption: SITE_NAME,
        },
        image: LOGO_URL,
        email: "info@mawtinalriyf.com",
        telephone: "+966557211359",
        contactPoint: [
          {
            "@type": "ContactPoint",
            telephone: "+966557211359",
            contactType: "customer support",
            areaServed: "SA",
            availableLanguage: "Arabic",
          },
          {
            "@type": "ContactPoint",
            telephone: "+966557211359",
            contactType: "sales",
            contactOption: "TollFree",
            areaServed: "SA",
            availableLanguage: "Arabic",
          },
        ],
        address: {
          "@type": "PostalAddress",
          streetAddress: "3 حي الجزيرة، الطريق الدائري الشرقي الفرعي",
          addressLocality: "الرياض",
          postalCode: "12211",
          addressRegion: "منطقة الرياض",
          addressCountry: "SA",
        },
        sameAs: [
          "https://www.instagram.com/alreeefl11/",
          "https://www.tiktok.com/@mafrushatalriyf1",
          "https://maps.app.goo.gl/ZtJBNuCLczyKCDSo6",
        ],
        foundingDate: "2020",
        areaServed: {
          "@type": "City",
          name: "الرياض",
          addressCountry: "SA",
        },
      },

      // ── FurnitureStore (LocalBusiness) ────────────────────────────────
      {
        "@type": ["LocalBusiness", "FurnitureStore"],
        "@id": `${BASE_URL}/#business`,
        name: ORG_NAME,
        alternateName: SITE_NAME,
        url: BASE_URL,
        logo: LOGO_URL,
        image: [LOGO_URL, `${BASE_URL}/og-image.jpg`],
        description:
          "مؤسسة موطن الريف للتجارة — أجمل تشكيلات الأثاث المنزلي الفاخر " +
          "في الرياض، المملكة العربية السعودية. حي الجزيرة، الطريق الدائري الشرقي.",
        email: "info@mawtinalriyf.com",
        telephone: "+966557211359",
        priceRange: "$$",
        currenciesAccepted: "SAR",
        paymentAccepted: "Cash, Credit Card",
        // ✅ رابط Google Maps الحقيقي — مهم جداً للـ Local SEO
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
        sameAs: [
          "https://www.instagram.com/alreeefl11/",
          "https://www.tiktok.com/@mafrushatalriyf1",
          "https://maps.app.goo.gl/ZtJBNuCLczyKCDSo6",
        ],
        parentOrganization: { "@id": `${BASE_URL}/#organization` },
      },
    ],
  };
}

// ─── Root Layout ──────────────────────────────────────────────────────────────
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (process.env.NEXT_PHASE !== "phase-production-build") {
    try {
      redisClient
        .hIncrBy("stats:total:allStats", "totalVisits", 1)
        .catch((err) => console.error("Redis Incr Error:", err));
    } catch (e) {
      console.error("Redis incre totalvisits err Error:", e);
    }
  }

  const session = await auth();

  const userData =
    session?.user ?
      {
        name: session.user.name ?? null,
        email: session.user.email ?? null,
        image: session.user.image ?? null,
        id: session.user.id ?? null,
      }
    : null;

  const isAdmin =
    !!session?.user && (session.user as { role?: string }).role === "ADMIN";

  // ── Prefetch categories ───────────────────────────────────────────────
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: categoriesQueryOptions.queryKey,
    queryFn: async (): Promise<RootCategory[]> => {
      try {
        const res = await fetch(`${DOMAIN}/api/categories`, {
          next: { revalidate: 3600 },
        });
        if (!res.ok) return [];
        return res.json();
      } catch {
        return [];
      }
    },
  });

  // ── Prefetch Announcements ────────────────────────────────────────────
  await queryClient.prefetchQuery({
    queryKey: announcementQueryOptions.queryKey,
    queryFn: async () => getActiveAnnouncements(),
  });

  return (
    <html lang="ar" dir="rtl" className={`${inter.variable} ${cairo.variable}`}>
      <head>
        {/* ══ WebSite JSON-LD → Sitelinks Search Box ══════════════════════ */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(getWebsiteJsonLd()),
          }}
        />
        {/* ══ Organization + FurnitureStore JSON-LD ════════════════════════ */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(getOrganizationJsonLd()),
          }}
        />

        {/* ══ Google Ads Tag ════════════════════════════════════════════════ */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-18262833732"
          strategy="afterInteractive"
        />
        <Script id="google-ads-tag" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-18262833732');
          `}
        </Script>
      </head>

      <body className="font-arabic antialiased flex flex-col min-h-screen">
        <GoogleAnalyticsTag />
        <QueryProvider>
          <SessionProvider>
            <NuqsAdapter>
              <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={true}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
              />

              <HydrationBoundary state={dehydrate(queryClient)}>
                <AnnouncementBar />
                <Navbar user={userData} isAdmin={isAdmin} />
                <main className="flex-1">{children}</main>

                <ContactSpeedDial />
                <Footer />
              </HydrationBoundary>
              {/* vercel */}
              <Analytics />
              <SpeedInsights />
              {/* end vercel */}
              <ReactQueryDevtools
                initialIsOpen={false}
                buttonPosition="bottom-right"
              />
            </NuqsAdapter>
          </SessionProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
