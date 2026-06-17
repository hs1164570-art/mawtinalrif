import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { adminGuard } from "@/lib/Guards";

import { userPerPage } from "@/lib/constants";
import {
  UpdateStatusData,
  updateStatusSchema,
} from "@/app/api/utils/getUserSchema";

/**
 * @method GET
 * @description GET all users
 * @route /api/admin/users/details
 * @access private (only Admin)
 * */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // سحب البيانات من الـ URL مباشرة بدل الـ Guard
    const usersNumber = Number(searchParams.get("usersNumber")) || 1;
    const search = searchParams.get("search");
    const role = searchParams.get("role");
    const status = searchParams.get("status");

    // Logic الـ Pagination
    const skip = (usersNumber - 1) * userPerPage;

    const whereCondition: any = {
      AND: [
        search ?
          {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : {},
        role ? { role } : {},
        status ? { status } : {},
      ],
    };

    const usersList = await prisma.user.findMany({
      where: whereCondition,
      skip,
      take: userPerPage,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        country: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { order: true },
        },
        order: {
          select: { totalCostPrice: true },
        },
      },
    });

    // console.log(usersList);
    return NextResponse.json(usersList, { status: 200 });
  } catch (error) {
    console.error("GET_USERS_ERROR", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

/**
 * @method PATCH
 * @description تحديث حالة المستخدم (ACTIVE أو BANNED)
 * @route /api//users/details
 * @access Private (Admin Only)
 */
export const PATCH = adminGuard(
  updateStatusSchema,
  async (request: NextRequest, adminId: string, data: UpdateStatusData) => {
    try {
      const { userId, status } = data;

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { status },
      });

      return NextResponse.json(updatedUser, { status: 200 });
    } catch (error) {
      console.error("PATCH_USER_STATUS_ERROR", error);
      return NextResponse.json(
        { message: "Failed to update user status" },
        { status: 500 },
      );
    }
  },
);
