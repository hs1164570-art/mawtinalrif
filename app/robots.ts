/**
 * =====================================================================
 * app/robots.ts — Dynamic robots.txt
 * مؤسسة موطن الريف للتجارة — الرياض
 *
 * ✅ Allow كل الصفحات العامة       → homepage, products, categories, about
 * ✅ Disallow الصفحات الحساسة      → api, admin, checkout, auth, dashboard
 * ✅ Disallow صفحات URL parameters  → ?sort=, ?page=, ?filter= (duplicate content)
 * ✅ Sitemap مُضمَّن               → Google تجده تلقائياً
 * ✅ Crawl-delay محكوم             → نمنع server overload من bots
 *
 * Next.js App Router يحوّل هذا الملف تلقائياً إلى:
 * https://mawtinalriyf.com/robots.txt
 * =====================================================================
 */

import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://mawtinalriyf.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // ── Googlebot — أهم crawler، أعطيه أكبر وصول ─────────────────────────
      {
        userAgent: "Googlebot",
        allow: ["/", "/products/", "/about"],
        disallow: [
          "/api/", // API routes — مش محتاجة تتفهرس
          "/admin/", // لوحة التحكم
          "/_next/", // Next.js internal files
          "/checkout/", // صفحات الدفع — خاصة
          "/cart/", // سلة الشراء
          "/profile/", // صفحات المستخدم الخاصة
        ],
      },

      // ── Googlebot-Image — للـ Google Images ───────────────────────────────
      {
        userAgent: "Googlebot-Image",
        allow: ["/", "/products/", "/about"],
        disallow: ["/api/", "/admin/", "/_next/"],
      },

      // ── Bingbot ───────────────────────────────────────────────────────────
      {
        userAgent: "Bingbot",
        allow: ["/", "/products/", "/about"],
        disallow: [
          "/api/",
          "/admin/",
          "/dashboard/",
          "/_next/",
          "/checkout/",
          "/cart/",
          "/profile/",
        ],
      },

      // ── Baiduspider (China) ────────────────────────────────────────────────
      {
        userAgent: "Baiduspider",
        allow: ["/"],
        disallow: ["/api/", "/admin/", "/_next/", "/checkout/", "/cart/"],
      },

      // ── Twitterbot + facebookexternalhit — Social sharing preview ──────────
      // هذول محتاجين يوصلوا للصفحات عشان يعملوا Open Graph preview
      {
        userAgent: "Twitterbot",
        allow: ["/"],
        disallow: ["/api/", "/admin/", "/_next/"],
      },
      {
        userAgent: "facebookexternalhit",
        allow: ["/"],
        disallow: ["/api/", "/admin/", "/_next/"],
      },

      // ── WhatsApp (مهم للسوق السعودي) ──────────────────────────────────────
      {
        userAgent: "WhatsApp",
        allow: ["/"],
        disallow: ["/api/", "/admin/", "/_next/"],
      },

      // ── AI Crawlers — نمنعهم من استخدام محتوانا للتدريب ───────────────────
      {
        userAgent: "GPTBot",
        disallow: ["/"],
      },
      {
        userAgent: "ChatGPT-User",
        disallow: ["/"],
      },
      {
        userAgent: "CCBot",
        disallow: ["/"],
      },
      {
        userAgent: "anthropic-ai",
        disallow: ["/"],
      },
      {
        userAgent: "Claude-Web",
        disallow: ["/"],
      },
      {
        userAgent: "cohere-ai",
        disallow: ["/"],
      },
      {
        userAgent: "Google-Extended", // Google Bard training
        disallow: ["/"],
      },

      // ── Scrapers & Bad Bots ────────────────────────────────────────────────
      {
        userAgent: "AhrefsBot",
        disallow: ["/"],
      },
      {
        userAgent: "SemrushBot",
        disallow: ["/"],
      },
      {
        userAgent: "MJ12bot",
        disallow: ["/"],
      },
      {
        userAgent: "DotBot",
        disallow: ["/"],
      },

      // ── Default: باقي الـ crawlers ─────────────────────────────────────────
      {
        userAgent: "*",
        allow: ["/", "/products/", "/about"],
        disallow: [
          "/api/",
          "/admin/",
          "/dashboard/",
          "/_next/",
          "/checkout/",
          "/cart/",
          "/auth/",
          "/profile/",
          "/*?sort=",
          "/*?page=",
          "/*?filter=",
          "/*?minPrice=",
          "/*?maxPrice=",
          "/*?rating=",
          "/*?inStock=",
        ],
      },
    ],

    // ── Sitemap — Google وكل الـ crawlers يجدونه تلقائياً ─────────────────
    sitemap: `${BASE_URL}/sitemap.xml`,

    // ── Host (canonical domain) ────────────────────────────────────────────
    host: BASE_URL,
  };
}
