import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

/**
 * @method GET
 * @description Get all root categories with their sub-categories
 * @route /api/categories
 * @access public (Open for everyone)
 * */

export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.category.findMany({
      where: {
        parentId: null,
      },
      include: {
        children: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    // console.log("this is categories in GET route", categories);
    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    console.error("GET_CATEGORIES_ERROR:", error);
    return NextResponse.json(
      { message: "Failed to fetch categories. Internal server error." },
      { status: 500 },
    );
  }
}
