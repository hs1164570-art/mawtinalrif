// components/GoogleAnalyticsTag.tsx
// Loads the GA4 gtag.js snippet so the live site actually sends data to your
// GA4 property (NEXT_PUBLIC_GA_MEASUREMENT_ID, e.g. "G-XXXXXXX"). This is a
// separate concern from lib/ga4-client.ts: this script is how GA4 *collects*
// data from visitors; the Data API in lib/ga4-client.ts is how this
// dashboard *reads* the aggregated results back out.
"use client";

import Script from "next/script";

export function GoogleAnalyticsTag() {
  const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  if (!GA_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </>
  );
}
