// app/api/analytics/realtime/route.ts
import { getRealtimeData } from "@/app/admin/statistics/googleGA4/lib/ga4-client";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Backed by lib/ga4-client.ts → getRealtimeData(), which is currently a typed
 * placeholder. TODO: connect to GA4 runRealtimeReport when ready — this route
 * will not need to change shape when that happens.
 */
export async function GET() {
  const data = await getRealtimeData();
  return NextResponse.json(data);
}
