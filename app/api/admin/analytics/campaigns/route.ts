// app/api/analytics/campaigns/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSessionsReport } from "@/app/admin/statistics/googleGA4/lib/reports";

export const dynamic = "force-dynamic";

/**
 * Dedicated endpoint for the campaigns slice specifically (Session Campaign
 * Name dimension), reusing the same real GA4-backed report as
 * /api/analytics/sessions so the numbers never drift between the two routes
 * (DRY).
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("startDate") || "28daysAgo";
  const endDate = searchParams.get("endDate") || "today";

  const data = await getSessionsReport({ startDate, endDate });

  return NextResponse.json({
    campaigns: data.campaigns,
    campaignTrend: data.campaignTrend,
  });
}
