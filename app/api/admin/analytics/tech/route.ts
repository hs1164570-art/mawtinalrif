// app/api/analytics/tech/route.ts
import { getTechReport } from "@/app/admin/statistics/googleGA4/lib/reports";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("startDate") || "28daysAgo";
  const endDate = searchParams.get("endDate") || "today";

  // TODO: swap getTechReport's internal generator for a real GA4 runReport
  // call using Browser/OS/Device Category/Device Model plus Date/Day of Week/
  // Hour dimensions once GA4 credentials are configured.
  const data = await getTechReport({ startDate, endDate });
  return NextResponse.json(data);
}
