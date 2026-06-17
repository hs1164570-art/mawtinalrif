import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { adminGuard } from "@/lib/Guards";
import {
  paginationSchema,
  createAnnouncementSchema,
  updateAnnouncementSchema,
  deleteAnnouncementSchema,
} from "../../utils/AnnouncemntSchema";

/**
 * @method GET
 * @route  /api/admin/notification/announcement-bar
 * @access Private (Admin only)
 */
export const GET = adminGuard(
  paginationSchema,
  async (_req, _userId, { page = 1, limit = 10 }) => {
    const skip = (page - 1) * limit;

    const [bars, total] = await Promise.all([
      prisma.announcement.findMany({
        orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),
      prisma.announcement.count(),
    ]);

    return NextResponse.json({
      bars,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
      },
    });
  },
);
/**
 * @method POST
 * @route  /api/admin/notification/announcement-bar
 * @access Private (Admin only)
 */
export const POST = adminGuard(
  createAnnouncementSchema,
  async (_req, _userId, validatedData) => {
    const newBar = await prisma.announcement.create({
      data: validatedData,
    });

    return NextResponse.json(newBar, { status: 201 });
  },
);

/**
 * @method PATCH
 * @route  /api/admin/notification/announcement-bar
 * @access Private (Admin only)
 */
export const PATCH = adminGuard(
  updateAnnouncementSchema,
  async (_req, _userId, { id, ...updateData }) => {
    const updatedBar = await prisma.announcement
      .update({
        where: { id },
        data: updateData,
      })
      .catch((error) => {
        if (error?.code === "P2025") return null;
        throw error;
      });

    if (!updatedBar) {
      return NextResponse.json({ error: "الإعلان غير موجود" }, { status: 404 });
    }

    return NextResponse.json(updatedBar);
  },
);

/**
 * @method DELETE
 * @route  /api/admin/notification/announcement-bar?id=xxx
 * @access Private (Admin only)
 * ✅ الـ Guard بيقرأ الـ id من searchParams أوتوماتيك
 */
export const DELETE = adminGuard(
  deleteAnnouncementSchema,
  async (_req, _userId, { id }) => {
    await prisma.announcement.delete({ where: { id } }).catch((error) => {
      if (error?.code === "P2025") return null;
      throw error;
    });

    return NextResponse.json({ message: "تم حذف الإعلان بنجاح" });
  },
);
