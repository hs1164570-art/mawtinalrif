import { NextResponse } from "next/server";
/**
 * @method Get
 * @description GET  products count
 * @route /api/products/count
 * @access public
 * */

export async function GET() {
  try {
    const productsCount = await prisma?.product.count();
    return NextResponse.json(productsCount, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Internal Server Error",
        error: (error as Error).message,
      },
      { status: 500 },
    );
  }
}
