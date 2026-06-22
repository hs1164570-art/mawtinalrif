// app/api/analytics/users/route.ts
import { getUsersReport } from "@/app/admin/statistics/googleGA4/lib/reports";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("startDate") || "28daysAgo";
  const endDate = searchParams.get("endDate") || "today";

  const data = await getUsersReport({ startDate, endDate });
  return NextResponse.json(data);
}
