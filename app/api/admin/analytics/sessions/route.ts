// app/api/analytics/sessions/route.ts
import { getSessionsReport } from "@/app/admin/statistics/googleGA4/lib/reports";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("startDate") || "28daysAgo";
  const endDate = searchParams.get("endDate") || "today";

  // TODO: swap getSessionsReport's internal generator for a real GA4 runReport
  // call using Session Source/Medium/Campaign Name/Manual Ad Content/Google Ads
  // Keyword/Ad Network Type dimensions once GA4 credentials are configured.
  const data = await getSessionsReport({ startDate, endDate });
  return NextResponse.json(data);
}
