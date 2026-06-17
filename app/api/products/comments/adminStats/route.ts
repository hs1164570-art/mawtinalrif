// /api/admin/products/comments/adminStats/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const stats = await prisma.comment.groupBy({
      by: ["rating"],
      _count: { rating: true },
    });

    const totalComments = stats.reduce(
      (acc, curr) => acc + curr._count.rating,
      0,
    );

    // 3. ترتيب الداتا من 5 لـ 1 عشان الفطيرة تطلع منظمة
    const ratingsMap = [5, 4, 3, 2, 1].map((star) => {
      const found = stats.find((s) => s.rating === star);
      const count = found ? found._count.rating : 0;

      return {
        label: `${star} Stars`,
        value: count, // ده الرقم اللي الفطيرة بتحتاجه
        percentage:
          totalComments > 0 ?
            parseFloat(((count / totalComments) * 100).toFixed(1))
          : 0,
      };
    });

    return NextResponse.json(
      {
        totalComments,
        stats: ratingsMap,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      },
    );
  } catch (error) {
    console.error("Pie Chart Stats Error:", error);
    return NextResponse.json(
      { message: "Error loading stats" },
      { status: 500 },
    );
  }
}
