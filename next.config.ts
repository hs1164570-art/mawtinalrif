import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";

const withAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const cspHeader = `
default-src 'self';
script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.paypal.com https://www.sandbox.paypal.com https://js.stripe.com https://www.gstatic.com https://*.vercel-scripts.com https://www.googletagmanager.com https://*.google-analytics.com https://*.analytics.google.com https://www.googleadservices.com https://googleads.g.doubleclick.net https://*.google.com https://*.google.com.eg https://*.googlesyndication.com https://*.doubleclick.net;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
img-src 'self' blob: data: https://bwmvrztnbjayktocsdvc.supabase.co https://*.supabase.co https://res.cloudinary.com https://images.unsplash.com https://images.pexels.com https://source.unsplash.com avatars.githubusercontent.com lh3.googleusercontent.com via.placeholder.com placehold.co picsum.photos https://*.picsum.photos https://www.paypalobjects.com https://i.pravatar.cc https://*.google-analytics.com https://*.googletagmanager.com https://www.googleadservices.com https://*.google.com https://*.google.com.eg https://*.googlesyndication.com https://*.doubleclick.net;
font-src 'self' data: https://fonts.gstatic.com;
connect-src 'self' https://bwmvrztnbjayktocsdvc.supabase.co https://*.supabase.co https://res.cloudinary.com https://images.unsplash.com https://images.pexels.com https://source.unsplash.com https://www.mawtinalriyf.com https://*.googleapis.com https://*.firebaseio.com https://api.cloudinary.com https://www.paypal.com https://www.sandbox.paypal.com https://api.apify.com https://*.vercel-analytics.com https://*.vercel-storage.com https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com https://www.googleadservices.com https://googleads.g.doubleclick.net https://*.google.com https://*.google.com.eg https://*.googlesyndication.com https://*.doubleclick.net;
frame-src 'self' https://www.paypal.com https://www.sandbox.paypal.com https://js.stripe.com https://*.google.com https://*.google.com.eg https://accounts.google.com https://*.doubleclick.net https://googleads.g.doubleclick.net;
object-src 'none';
base-uri 'self';
form-action 'self' https://www.paypal.com https://www.sandbox.paypal.com;
frame-ancestors 'self' https://search.google.com https://www.google.com;
`;

const nextConfig: NextConfig = {
  poweredByHeader: false,

  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "via.placeholder.com" },
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "*.picsum.photos" }, // ✅ يغطي fastly.picsum.photos وأي subdomain تاني
      { protocol: "https", hostname: "source.unsplash.com" },
      { protocol: "https", hostname: "i.pravatar.cc" },
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "bwmvrztnbjayktocsdvc.supabase.co" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },

  async headers() {
    return [
      {
        source: "/sitemap.xml",
        headers: [
          {
            key: "Content-Type",
            value: "application/xml; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "public, max-age=3600, s-maxage=3600",
          },
        ],
      },
      {
        source: "/((?!sitemap\\.xml$).*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: cspHeader
              .replace(/\n/g, "")
              .replace(/\s{2,}/g, " ")
              .trim(),
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default withAnalyzer(nextConfig);
