import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { adminGuard } from "@/lib/Guards"; // تأكد من صحة مسار الجارد عندك

/**
 * @method GET
 * @description Get Status Details
 * @route /api/products/order/stats
 * @access private (only Admin)
 * */

const emptySchema = z.unknown();

export const GET = adminGuard(
  emptySchema,
  async (request: NextRequest, userId: string) => {
    try {
      // 2. جلب الإحصائيات وعمل تجميع بناءً على حالة الأوردر
      const statusDetails = await prisma.order.groupBy({
        by: ["status"],
        _count: {
          status: true,
        },
      });

      return NextResponse.json(statusDetails, { status: 200 });
    } catch (error: any) {
      console.error("Fetch Status Details Error:", error);

      return NextResponse.json(
        { message: "Error fetching order statistics" },
        { status: 500 },
      );
    }
  },
);
