// app/api/analytics/pages/route.ts
import { getPagesReport } from "@/app/admin/statistics/googleGA4/lib/reports";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("startDate") || "28daysAgo";
  const endDate = searchParams.get("endDate") || "today";

  // TODO: swap getPagesReport's internal generator for a real GA4 runReport
  // call using Page Path/Title/Referrer/Landing Page/Exit Page/Content Group/
  // Event Name dimensions once GA4 credentials are configured.
  const data = await getPagesReport({ startDate, endDate });
  return NextResponse.json(data);
}
