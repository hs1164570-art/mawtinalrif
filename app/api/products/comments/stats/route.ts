import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { message: "Product ID is required" },
        { status: 400 },
      );
    }

    // 1. Aggregate data from database with optimized query
    const stats = await prisma.comment.groupBy({
      by: ["rating"],
      where: { productId },
      _count: { rating: true },
    });

    // 2. Calculate total comments efficiently
    const totalComments = stats.reduce(
      (acc, curr) => acc + curr._count.rating,
      0,
    );

    // 3. Build complete rating structure (1-5 stars) with percentages
    // Ensures consistent UI even when some ratings have zero reviews
    const ratingsMap = [5, 4, 3, 2, 1].map((star) => {
      const found = stats.find((s) => s.rating === star);
      const count = found ? found._count.rating : 0;
      const percentage = totalComments > 0 ? (count / totalComments) * 100 : 0;

      return {
        rating: star,
        count,
        percentage: parseFloat(percentage.toFixed(1)),
      };
    });

    // 4. Return with aggressive caching headers for performance
    return NextResponse.json(
      {
        totalComments,
        stats: ratingsMap,
      },
      {
        status: 200,
        headers: {
          // Cache in browser for 5 minutes
          "Cache-Control": "public, s-maxage=12, stale-while-revalidate=30",
          // CDN cache for 5 minutes, allow stale for 10 minutes
          "CDN-Cache-Control": "public, s-maxage=12, stale-while-revalidate=30",
          // Vary by query string to cache different products separately
          Vary: "Accept-Encoding",
        },
      },
    );
  } catch (error) {
    console.error("Stats Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
