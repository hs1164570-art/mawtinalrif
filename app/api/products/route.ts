import { NextRequest, NextResponse } from "next/server";
import { getProductsData } from "@/utils/getProductsBySlug";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;

    const slug = sp.get("slug");
    if (!slug) {
      return NextResponse.json({ error: "slug مطلوب" }, { status: 400 });
    }

    const page = Math.max(1, Number(sp.get("page")) || 1);
    const sort = sp.get("sort") || "newest";
    const minPrice = Math.max(0, Number(sp.get("minPrice")) || 0);
    const maxPrice = Number(sp.get("maxPrice")) || 9_999_999;
    const inStock = sp.get("inStock") === "true" ? true : undefined;
    const rating = Number(sp.get("rating")) || 0;

    const data = await getProductsData({
      slug,
      page,
      sort,
      minPrice,
      maxPrice,
      inStock,
      rating: rating > 0 ? rating : undefined,
    });

    if (!data) {
      return NextResponse.json({ error: "القسم غير موجود" }, { status: 404 });
    }

    return NextResponse.json(data, {
      headers: {
        // ✅ CDN cache 60s — browser revalidate في الخلفية
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (err) {
    console.error("[/api/products]", err);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
