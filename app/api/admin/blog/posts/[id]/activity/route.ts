import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";
import { adminGuard } from "@/lib/Guards";
import { getPostActivityLogs } from "@/app/admin/blog/lib/queries/post.queries";

export const GET = adminGuard(z.object({}), async (request: NextRequest) => {
  const segments = request.nextUrl.pathname.split("/").filter(Boolean);
  const id = segments[segments.length - 2]; // .../posts/[id]/activity
  const logs = await getPostActivityLogs(id);
  return NextResponse.json({ logs });
});
