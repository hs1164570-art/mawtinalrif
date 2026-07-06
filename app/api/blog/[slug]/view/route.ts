// ─── app/api/blog/[slug]/view/route.ts ───────────────────────────────────────
// POST /api/blog/:slug/view — increments view count for a published post.
//
// Called client-side on post page mount (useEffect / server action).
// Security:
//   • Only published posts are updated (double-check in incrementViewCount)
//   • Slug is validated: alphanumeric + hyphens only
//   • 1-request-per-session deduplication is delegated to the client
//     (set a sessionStorage flag after the first call)
//   ⚠ For production at scale → replace with Redis INCR + TTL per IP/session

import { NextRequest, NextResponse } from "next/server";
import { incrementViewCount } from "@/utils/blog/queries";

// Only alphanumeric, hyphens, Arabic chars allowed in slugs
const SLUG_RE = /^[\w\u0600-\u06FF-]{1,200}$/;

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  // Validate slug format
  if (!SLUG_RE.test(slug)) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

  try {
    await incrementViewCount(slug);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("[view-count] error:", err);
    // Silently fail — view count errors must never break the user experience
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

// Disable caching on this route
// export const dynamic = "force-dynamic";
