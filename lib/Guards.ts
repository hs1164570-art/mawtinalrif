import { auth } from "@/auth";
import { headers } from "next/headers";
import { NextResponse, NextRequest } from "next/server";
// import { ratelimit } from "./ratelimit";
import { z } from "zod";

// بنستخدم <T> عشان الداتا تاخد شكل الـ Schema المبعوتة
type AuthenticatedHandler<T> = (
  req: NextRequest,
  userId: string,
  data: T,
  role: string,
) => Promise<NextResponse | Response>;

export function userGuard<T>(
  schema: z.ZodSchema<T>,
  originalFunction: AuthenticatedHandler<T>,
) {
  return async (request: NextRequest) => {
    // 1. التحقق من الهوية
    const session = await auth();
    const userId = session?.user?.id;
    const role = session?.user?.role;

    if (!session || !userId || !role) {
      return NextResponse.json(
        { message: "Access denied. Please login." },
        { status: 403 },
      );
    }

    // 2. حماية من كثرة الطلبات (Rate Limiting)
    // try {
    //   const ip = (await headers()).get("x-forwarded-for") ?? "127.0.0.1";
    //   const { success } = await ratelimit.limit(ip);

    //   if (!success) {
    //     return NextResponse.json(
    //       { message: "Too Many Requests" },
    //       { status: 429 },
    //     );
    //   }
    // } catch (error) {
    //   // console.error("Rate limit error:", error);
    // }

    // 3. تخصيص مصدر البيانات (GET vs Body)
    let dataToValidate;
    if (request.method === "GET" || request.method === "DELETE") {
      const { searchParams } = new URL(request.url);
      dataToValidate = Object.fromEntries(searchParams.entries());
    } else {
      dataToValidate = await request.json().catch(() => ({}));
    }

    // 4. الفحص بـ Zod وتمرير البيانات
    try {
      const validatedData = schema.parse(dataToValidate);
      return originalFunction(request, userId, validatedData, role);
    } catch (error) {
      console.error("Validation Error:", error);

      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            message: "Invalid data provided",
            errors: error.errors.map((e) => ({
              path: e.path.join("."),
              message: e.message,
            })),
          },
          { status: 400 },
        );
      }

      return NextResponse.json(
        { message: "Internal Server Error" },
        { status: 500 },
      );
    }
  };
}

export function adminGuard<T>(
  schema: z.ZodSchema<T>,
  originalFunction: (
    request: NextRequest,
    userId: string,
    validatedData: T,
  ) => Promise<NextResponse>,
) {
  return async (request: NextRequest) => {
    // 1. التحقق من الهوية والصلاحيات (Authentication & Authorization)
    const session = await auth();
    const userId = session?.user?.id;
    const role = session?.user?.role;
    // console.log("this is session ", session);
    if (!session || !userId || role !== "ADMIN") {
      return NextResponse.json(
        { message: "Access denied. Admins only." },
        { status: 403 },
      );
    }

    // 2. التحقق من الـ Rate Limit (لحماية السيرفر)
    // try {
    //   const ip = (await headers()).get("x-forwarded-for") ?? "127.0.0.1";
    //   const { success } = await ratelimit.limit(ip);

    //   if (!success) {
    //     return NextResponse.json(
    //       { message: "Too Many Requests. Please slow down." },
    //       { status: 429 },
    //     );
    //   }
    // } catch (error) {
    //   // بنسجل الخطأ بس بنخلي السيرفر يكمل عشان الـ API ميعطلش لو Redis وقع
    //   // console.error("Rate limit error:", error);
    // }

    // 3. تحديد مصدر البيانات بناءً على نوع الريكويست (The Logic we discussed)
    let dataToValidate;
    if (request.method === "GET" || request.method === "DELETE") {
      // استخراج البيانات من الـ URL (Search Params)
      const { searchParams } = new URL(request.url);
      dataToValidate = Object.fromEntries(searchParams.entries());
    } else {
      // استخراج البيانات من الـ Body
      dataToValidate = await request.json().catch(() => ({}));
    }

    // 4. الفحص بـ Zod وتمرير البيانات للـ Handler
    try {
      const validatedData = schema.parse(dataToValidate);

      // هنا بننادي الفانكشن الأصلية وبنباصي ليها البيانات "النضيفة"
      return originalFunction(request, userId, validatedData);
    } catch (error) {
      console.error("Validation Error:", error);

      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            message: "Invalid data provided",
            errors: error.errors.map((err) => ({
              path: err.path.join("."),
              message: err.message,
            })),
          },
          { status: 400 },
        );
      }

      return NextResponse.json(
        { message: "Internal Server Error" },
        { status: 500 },
      );
    }
  };
}
