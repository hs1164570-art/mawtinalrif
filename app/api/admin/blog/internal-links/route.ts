import { NextResponse } from "next/server";
import { adminGuard } from "@/lib/Guards";
import { z } from "zod";
import { getInternalLinkCandidates } from "@/app/admin/blog/lib/queries/internalLinks.queries";

export const GET = adminGuard(z.object({}), async () => {
  try {
    const candidates = await getInternalLinkCandidates();
    return NextResponse.json({ candidates });
  } catch (err) {
    console.error("[internal-links GET]", err);
    return NextResponse.json({ candidates: [] }, { status: 200 });
  }
});
