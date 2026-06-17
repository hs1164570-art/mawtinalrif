import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { adminGuard } from "@/lib/Guards";

/**
 * @method GET
 * @description Get Total Count of orders (Filtered by status if provided)
 * @route /api/products/order/count
 * @access Private (Admin only)
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const status = searchParams.get("status");

    const whereClause = status ? { status: status as any } : {};

    const totalCount = await prisma.order.count({
      where: whereClause,
    });

    return NextResponse.json(totalCount, { status: 200 });
  } catch (error) {
    console.error("Error fetching orders count:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
