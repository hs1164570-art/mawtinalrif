import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { userGuard } from "@/lib/Guards";
import {
  addCommentSchema,
  deleteCommentSchema,
  updateCommentSchema,
} from "../../utils/commentSchema";
import redisClient from "@/lib/redisClient";
import { revalidateTag } from "next/cache";
/**
 * @method GET
 * @description Get comments for a specific product
 * @route /api/products/comments?productId=123
 * @access public
 */
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

    const comments = await prisma.comment.findMany({
      where: { productId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        content: true,
        rating: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(comments);
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

/**
 * @method POST
 * @description Add a new comment to a product
 * @route /api/products/comments
 * @access private (only user)
 */
export const POST = userGuard(
  addCommentSchema,
  async (request, userId, data) => {
    const newComment = await prisma.comment.create({
      data: {
        content: data.content,
        rating: data.rating,
        userId: userId,
        productId: data.productId,
      },
    });
    if (data.rating == 5) {
      try {
        redisClient
          .hIncrBy("stats:total:allStats", "totalComments", 1)
          .catch((err) => console.error("Redis Incr Error:", err));
      } catch (e) {
        console.error("Redis incre totalComments err Error:", e);
      }
    }
    revalidateTag(`summary`);

    revalidateTag(`productComment-${data.productId}`);
    revalidateTag(`productStats-${data.productId}`);
    return NextResponse.json(
      { message: "Comment added successfully", comment: newComment },
      { status: 201 },
    );
  },
);

/**
 * @method PUT
 * @description Update an existing comment
 * @route /api/products/comments
 * @access private (only user who created it)
 */
export const PUT = userGuard(
  updateCommentSchema,
  async (request, userId, data) => {
    const updatedComment = await prisma.comment.updateMany({
      where: {
        id: data.commentId,
        userId: userId,
      },
      data: {
        content: data.content,
        rating: data.rating,
      },
    });

    if (updatedComment.count === 0) {
      return NextResponse.json(
        { message: "Comment not found or unauthorized" },
        { status: 404 },
      );
    }

    return NextResponse.json({ message: "Comment updated successfully" });
  },
);

/**
 * @method DELETE
 * @description Delete a comment
 * @route /api/products/comments
 * @access private (only user who created it)
 */
export const DELETE = userGuard(
  deleteCommentSchema,
  async (request, userId, data) => {
    // حذف التعليق بشرط التطابق
    const deletedComment = await prisma.comment.deleteMany({
      where: {
        id: data.commentId,
        userId: userId,
      },
    });

    if (deletedComment.count === 0) {
      return NextResponse.json(
        { message: "Comment not found or unauthorized" },
        { status: 404 },
      );
    }
    revalidateTag(`summary`);

    return NextResponse.json({ message: "Comment deleted successfully" });
  },
);
