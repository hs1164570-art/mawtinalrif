import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

/**
 * @method GET
 * @route  /api/notification/announcement-bar
 * @access Public
 */
export async function GET(req: NextRequest) {
  try {
    const bars = await prisma.announcement.findMany({
      where: { isActive: true },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        title: true,
        url: true,
        backgroundColor: true,
        textColor: true,
        showCount: true,
      },
    });

    const expandedBars = bars.flatMap(({ showCount, ...bar }) =>
      Array.from({ length: showCount }, () => bar),
    );

    return NextResponse.json({ bars: expandedBars });
  } catch (error) {
    console.error("GET /public/announcement-bar Error:", error);
    return NextResponse.json(
      { error: "فشل في جلب الإعلانات" },
      { status: 500 },
    );
  }
}
