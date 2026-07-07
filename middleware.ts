import { NextRequest, NextResponse, NextFetchEvent } from "next/server";
import { getToken } from "next-auth/jwt";
import { Redis } from "@upstash/redis";

// المبادرة بإنشاء اتصال Redis إذا كانت المتغيرات متوفرة
const redis = process.env.UPSTASH_REDIS_REST_URL ? Redis.fromEnv() : null;

export default async function middleware(
  req: NextRequest,
  event: NextFetchEvent,
) {
  const { nextUrl } = req;

  // 1. معالجة المسار وتوحيده (لو المسار فارغ بعد حذف السلاش يرجع "/")
  let path = nextUrl.pathname.toLowerCase().replace(/\/$/, "") || "/";

  // 2. استثناء الملفات الثابتة والـ Sitemap والـ Robots فوراً لتوفير الأداء
  if (path === "/sitemap.xml" || path === "/robots.txt" || path.includes(".")) {
    return NextResponse.next();
  }

  // --- 📊 تسجيل الإحصائيات في الخلفية (Redis) ---
  const country = req.headers.get("x-vercel-ip-country") || "unknown";

  if (country === "SA" && redis) {
    let city = req.headers.get("x-vercel-ip-city") || "Unknown City";

    try {
      city = decodeURIComponent(city).trim();
    } catch (e) {
      city = city.trim();
    }

    if (city.length > 0) {
      city = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
    } else {
      city = "Unknown City";
    }

    // تشغيل الإدخال للخلفية دون تعطيل استجابة المستخدم الرئيسي
    event.waitUntil(
      (async () => {
        try {
          await redis.zincrby("KSA:leaderBord", 1, city);
        } catch (err) {
          console.error("Redis Leaderboard Error:", err);
        }
      })(),
    );
  }

  // --- 🔑 جلب والتحقق من التوكن (Next-Auth) ---
  // ملاحظة مهمة: لازم نمرر secureCookie صريح لأن الـ auto-detection
  // بتاعة next-auth بتفشل أحياناً في edge runtime على فيرسل وتدور على
  // اسم كوكي غلط (authjs.session-token بدل __Secure-authjs.session-token)
  const isProduction = process.env.NODE_ENV === "production";

  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
    secureCookie: isProduction,
  });

  const isLoggedIn = !!token;
  const userRole = token?.role;

  // --- 🔒 نظام الحماية والتوجيه (Auth Rules) ---
  // console.log("this is token ", token, "uder role ", userRole, isLoggedIn);
  // منع المستخدم المسجل من دخول صفحات الـ Auth (مثل Login / Register)
  if (path.startsWith("/auth")) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  // تفعيل حماية مسارات المستخدمين (Order & Profile)
  const isProtectedUserRoute =
    path.startsWith("/order") || path.startsWith("/profile");

  if (isProtectedUserRoute && !isLoggedIn) {
    const loginUrl = new URL("/auth/login", req.url);
    // نمرر الـ pathname الأصلي شامل السلاش لضمان توجيه الـ callbackUrl بدقة
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // حماية الـ API الخاصة بالـ Admin
  // if (path.startsWith("/api/admin")) {
  //   if (!isLoggedIn || userRole !== "ADMIN") {
  //     return new NextResponse(
  //       JSON.stringify({ success: false, message: "Not Authorized" }),
  //       { status: 403, headers: { "Content-Type": "application/json" } },
  //     );
  //   }
  // }

  // حماية صفحات الـ Admin (عرض صفحة 404 بدلاً من التوجيه الصريح لتمويه المتسللين)
  // if (path.startsWith("/admin")) {
  //   if (!isLoggedIn || userRole !== "ADMIN") {
  //     return NextResponse.rewrite(new URL("/404", req.url));
  //   }
  // }

  return NextResponse.next();
}

// الـ Matcher لتحديد المسارات التي يطبق عليها الـ Middleware
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|product-feed.xml|api/(?!admin)).*)",
  ],
};

// production

// import { NextRequest, NextResponse, NextFetchEvent } from "next/server";
// import { getToken } from "next-auth/jwt";
// import { Redis } from "@upstash/redis";

// // المبادرة بإنشاء اتصال Redis إذا كانت المتغيرات متوفرة
// const redis = process.env.UPSTASH_REDIS_REST_URL ? Redis.fromEnv() : null;

// export default async function middleware(
//   req: NextRequest,
//   event: NextFetchEvent,
// ) {
//   const { nextUrl } = req;

//   // 1. معالجة المسار وتوحيده (لو المسار فارغ بعد حذف السلاش يرجع "/")
//   let path = nextUrl.pathname.toLowerCase().replace(/\/$/, "") || "/";

//   // 2. استثناء الملفات الثابتة والـ Sitemap والـ Robots فوراً لتوفير الأداء
//   if (path === "/sitemap.xml" || path === "/robots.txt" || path.includes(".")) {
//     return NextResponse.next();
//   }

//   // --- 📊 تسجيل الإحصائيات في الخلفية (Redis) ---
//   const country = req.headers.get("x-vercel-ip-country") || "unknown";

//   if (country === "SA" && redis) {
//     let city = req.headers.get("x-vercel-ip-city") || "Unknown City";

//     try {
//       city = decodeURIComponent(city).trim();
//     } catch (e) {
//       city = city.trim();
//     }

//     if (city.length > 0) {
//       city = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
//     } else {
//       city = "Unknown City";
//     }

//     // تشغيل الإدخال للخلفية دون تعطيل استجابة المستخدم الرئيسي
//     event.waitUntil(
//       (async () => {
//         try {
//           await redis.zincrby("KSA:leaderBord", 1, city);
//         } catch (err) {
//           console.error("Redis Leaderboard Error:", err);
//         }
//       })(),
//     );
//   }

//   // --- 🔑 جلب والتحقق من التوكن (Next-Auth) ---
//   // ملاحظة مهمة: لازم نمرر secureCookie صريح لأن الـ auto-detection
//   // بتاعة next-auth بتفشل أحياناً في edge runtime على فيرسل وتدور على
//   // اسم كوكي غلط (authjs.session-token بدل __Secure-authjs.session-token)
//   const isProduction = process.env.NODE_ENV === "production";

//   const token = await getToken({
//     req,
//     secret: process.env.AUTH_SECRET,
//     secureCookie: isProduction,
//   });

//   const isLoggedIn = !!token;
//   const userRole = token?.role;

//   // --- 🔒 نظام الحماية والتوجيه (Auth Rules) ---
//   console.log("this is token ", token, "uder role ", userRole, isLoggedIn);
//   // منع المستخدم المسجل من دخول صفحات الـ Auth (مثل Login / Register)
//   if (path.startsWith("/auth")) {
//     if (isLoggedIn) {
//       return NextResponse.redirect(new URL("/", req.url));
//     }
//     return NextResponse.next();
//   }

//   // تفعيل حماية مسارات المستخدمين (Order & Profile)
//   const isProtectedUserRoute =
//     path.startsWith("/order") || path.startsWith("/profile");

//   if (isProtectedUserRoute && !isLoggedIn) {
//     const loginUrl = new URL("/auth/login", req.url);
//     // نمرر الـ pathname الأصلي شامل السلاش لضمان توجيه الـ callbackUrl بدقة
//     loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
//     return NextResponse.redirect(loginUrl);
//   }

//   // حماية الـ API الخاصة بالـ Admin
//   if (path.startsWith("/api/admin")) {
//     if (!isLoggedIn || userRole !== "ADMIN") {
//       return new NextResponse(
//         JSON.stringify({ success: false, message: "Not Authorized" }),
//         { status: 403, headers: { "Content-Type": "application/json" } },
//       );
//     }
//   }

//   // حماية صفحات الـ Admin (عرض صفحة 404 بدلاً من التوجيه الصريح لتمويه المتسللين)
//   if (path.startsWith("/admin")) {
//     if (!isLoggedIn || userRole !== "ADMIN") {
//       return NextResponse.rewrite(new URL("/404", req.url));
//     }
//   }

//   return NextResponse.next();
// }

// // الـ Matcher لتحديد المسارات التي يطبق عليها الـ Middleware
// export const config = {
//   matcher: [
//     "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|product-feed.xml|api/(?!admin)).*)",
//   ],
// };
