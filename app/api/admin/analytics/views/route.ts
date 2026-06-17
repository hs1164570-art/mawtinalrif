import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const viewStatsRaw = await prisma.analytics.findFirst();

    const data = {
      total:
        (viewStatsRaw?.homapageVisits || 0) +
        (viewStatsRaw?.productPageVisits || 0) +
        (viewStatsRaw?.aboutPageVisits || 0),
      distribution: [
        { name: "Home Page", value: viewStatsRaw?.homapageVisits || 0 },
        { name: "Product Page", value: viewStatsRaw?.productPageVisits || 0 },
        { name: "About Page", value: viewStatsRaw?.aboutPageVisits || 0 },
      ],
    };

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error fetching views" },
      { status: 500 },
    );
  }
}
