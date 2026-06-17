// app/layout.tsx  ← merge هذا الجزء في layout الحالي عندك
// هذا الملف يحتوي على الـ metadata الأساسية للموقع كله

import type { Metadata, Viewport } from "next";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.mawtin-elrif.com";

// ─── Site-wide default metadata ───────────────────────────────────────────────
// تُورَّث في كل صفحة وتُستبدل جزئياً بـ generateMetadata في كل صفحة
export const siteMetadata: Metadata = {
  // ── Core ──────────────────────────────────────────────────────────────────
  metadataBase: new URL(BASE_URL),
  title: {
    // %s = page title  | default إذا لم يُحدَّد
    template: "%s | موطن الريف للأثاث",
    default: "موطن الريف للأثاث - أفضل أثاث في الرياض",
  },
  description:
    "موطن الريف - متجر الأثاث الأول في الرياض، المملكة العربية السعودية. تشكيلة واسعة من الأثاث الراقي بأفضل الأسعار مع توصيل سريع في الرياض.",

  // ── Keywords site-wide (تُكمّل بكلمات مفتاحية خاصة بكل صفحة) ───────────
  keywords: [
    "أثاث الرياض",
    "أثاث السعودية",
    "موطن الريف",
    "furniture Riyadh",
    "furniture Saudi Arabia",
    "أثاث منزلي الرياض",
    "غرف نوم الرياض",
    "كنب الرياض",
    "طاولات الرياض",
  ],

  // ── Author / Publisher ────────────────────────────────────────────────────
  authors: [{ name: "موطن الريف", url: BASE_URL }],
  creator: "موطن الريف",
  publisher: "موطن الريف للأثاث",

  // ── Canonical (overridden per page) ──────────────────────────────────────
  alternates: {
    canonical: BASE_URL,
    languages: { "en-US": BASE_URL },
  },

  // ── Open Graph ────────────────────────────────────────────────────────────
  openGraph: {
    type: "website",
    locale: "ar_SA",
    url: BASE_URL,
    siteName: "موطن الريف للأثاث",
    title: "موطن الريف للأثاث - أفضل أثاث في الرياض",
    description:
      "تسوّق الآن أفضل الأثاث المنزلي في الرياض. توصيل سريع وأسعار تنافسية.",
    images: [
      {
        url: `${BASE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "موطن الريف للأثاث - الرياض",
        secureUrl: `${BASE_URL}/og-image.jpg`,
      },
    ],
  },

  // ── Twitter / X ───────────────────────────────────────────────────────────
  twitter: {
    card: "summary_large_image",
    site: "@mawtin_elrif",
    creator: "@mawtin_elrif",
    title: "موطن الريف للأثاث",
    description: "أفضل أثاث منزلي في الرياض، السعودية",
    images: [`${BASE_URL}/og-image.jpg`],
  },

  // ── Robots default ────────────────────────────────────────────────────────
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

  // ── App icons ─────────────────────────────────────────────────────────────
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon.ico",
  },

  // ── Manifest ──────────────────────────────────────────────────────────────
  manifest: "/manifest.json",

  // ── Verification (Google Search Console + Bing) ───────────────────────────
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? "",
    // yandex: "",
    // bing: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION ?? "",
  },

  // ── App capability ────────────────────────────────────────────────────────
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "موطن الريف",
  },

  // ── Format detection ──────────────────────────────────────────────────────
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  // ── Misc meta ─────────────────────────────────────────────────────────────
  other: {
    "geo.region": "SA-01", // ISO 3166-2: Riyadh Region
    "geo.placename": "الرياض",
    "geo.position": "24.7136;46.6753",
    ICBM: "24.7136, 46.6753",
    "content-language": "en-US",
    language: "Arabic",
    rating: "general",
    "revisit-after": "7 days",
    "theme-color": "#a07830",
  },
};

// ─── Viewport (separate export - Next.js 15 requirement) ──────────────────────
export const siteViewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5, // allow zoom for accessibility
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#a07830" },
    { media: "(prefers-color-scheme: dark)", color: "#7a5820" },
  ],
  colorScheme: "light",
};
