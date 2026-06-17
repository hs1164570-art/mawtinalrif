import { NextRequest, NextResponse, NextFetchEvent } from "next/server";
import { getToken } from "next-auth/jwt"; // 👈 استورد دي بديل لـ auth() في الميدل وير
import { Redis } from "@upstash/redis/cloudflare";

const redis = Redis.fromEnv();
export default async function middleware(
  req: NextRequest,
  event: NextFetchEvent,
) {
  const { nextUrl } = req;
  const path = nextUrl.pathname.toLowerCase().replace(/\/$/, "");

  if (path === "/sitemap.xml" || path === "/robots.txt" || path.includes(".")) {
    return NextResponse.next();
  }

  // تسجيل الإحصائيات في الخلفية

  const country = req.headers.get("x-vercel-ip-country") || "unknown";

  if (country === "SA") {
    let city = req.headers.get("x-vercel-ip-city") || "Unknown City";

    // 1. فك تشفير أي رموز غريبة (لو المدينة فيها مساحات مشفرة مثل %20)
    // 2. إزالة المسافات الزائدة من البداية والنهاية (.trim)
    try {
      city = decodeURIComponent(city).trim();
    } catch (e) {
      city = city.trim(); // Fallback لو التشفير فيه مشكلة
    }

    // 3. تأمين حالة الأحرف (حاول تثبتها إما Capitalize أو تسييها زي ما هي بس متأمنة)
    // يفضل تخلي أول حرف كابتل والباقي سمول أو ترفعها كلها عشان الـ Matching في الـ Redis
    if (city.length > 0) {
      city = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
    } else {
      city = "Unknown City";
    }

    event.waitUntil(
      (async () => {
        try {
          // استخدام الاسم النظيف المعقم جوه الريديس
          await redis.zincrby("KSA:leaderBord", 1, city);
        } catch (err) {
          console.error("Redis Leaderboard Error:", err);
        }
      })(),
    );
  }

  // 👈 الحل هنا: بنقرا التوكن المشفر مباشرة من الكوكيز
  // ده شغال 100% في الـ Edge Runtime وهيطبع لك الـ Role زي الـ Layout بالملي
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
  });

  const isLoggedIn = !!token;
  const userRole = token?.role; // هنا الـ role هيقرأ "ADMIN" بنجاح

  // --- 🔒 نظام الحماية والتوجيه ---

  if (path.startsWith("/auth")) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  const isProtectedUserRoute =
    path.startsWith("/order") || path.startsWith("/profile");
  if (isProtectedUserRoute && !isLoggedIn) {
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (path.startsWith("/api/admin")) {
    if (!isLoggedIn || userRole !== "ADMIN") {
      return new NextResponse(
        JSON.stringify({ success: false, message: "Not Authorized" }),
        { status: 403, headers: { "Content-Type": "application/json" } },
      );
    }
  }

  if (path.startsWith("/admin")) {
    if (!isLoggedIn || userRole !== "ADMIN") {
      return NextResponse.rewrite(new URL("/404", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|api/(?!admin)).*)",
  ],
};
