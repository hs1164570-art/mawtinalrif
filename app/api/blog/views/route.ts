// ─── app/api/blog/views/route.ts ─────────────────────────────────────────────
// Public endpoint — called from the frontend /blog/[slug] page on mount.
// Not protected by adminGuard (public route), but:
//   • Only increments if post is PUBLISHED + publishedAt ≤ now() (double-check)
//   • No sensitive data returned — just { ok: true }
//   • Rate-limiting should be handled at the CDN/edge layer in production.
//
// Usage from frontend Server Component:
//   After rendering the page, fire this from a Client Component:
//   useEffect(() => { fetch(`/api/blog/views?slug=${slug}`, { method: "POST" }) }, [slug])

import { NextRequest, NextResponse } from "next/server";
import { incrementViewCount } from "@/lib/blog/queries";

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    if (!slug || typeof slug !== "string" || slug.length > 200) {
      return NextResponse.json({ message: "slug مطلوب" }, { status: 400 });
    }

    await incrementViewCount(slug);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[POST /api/blog/views]", err);
    // نرجع 200 حتى لو فشل — عداد المشاهدات مش حرج للمستخدم
    return NextResponse.json({ ok: false });
  }
}
