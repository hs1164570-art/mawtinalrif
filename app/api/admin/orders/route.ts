// @TODOابقي ابعت ايميل لما تغير حالة الطلب

import { adminGuard } from "@/lib/Guards";
import { NextResponse, NextRequest } from "next/server";
import {
  updateOrderSchema,
  getOrdersSchema,
  GetOrdersInput,
} from "../../utils/createOrderSchema";
import prisma from "@/lib/db";
import { orderPerPage } from "@/lib/constants";

/*
 * @method GET
 * @description Get All Orders with pagination, status filtering, and smart search (Fully populated based on Schema)
 * @route /api/products/order
 * @access Private (Admin only)
 */
export const GET = adminGuard(
  getOrdersSchema,
  async (
    request: NextRequest,
    userId: string,
    validatedData: GetOrdersInput,
  ) => {
    try {
      const pageNumber = validatedData.pageNumber || "1";
      const status = validatedData.status || null;
      const searchQuery = validatedData.searchQuery || null;
      const searchType = validatedData.searchType || null;

      const orders = await getOrders(
        +pageNumber,
        status,
        searchQuery,
        searchType,
      );

      return NextResponse.json(orders, { status: 200 });
    } catch (error) {
      console.error("🚨 Fetch Orders Error:", error);
      return NextResponse.json(
        { message: "Error fetching orders" },
        { status: 500 },
      );
    }
  },
);

const getOrders = async (
  pageNumber: number,
  status: string | null,
  searchQuery: string | null,
  searchType: "id" | "email" | null,
) => {
  const whereClause: any = {};

  // 1. الفلترة بحالة الأوردر (PENDING_PAYMENT, PROCESSING, SHIPPED, DELIVERED, CANCELLED, REFUNDED)
  if (status) {
    whereClause.status = status;
  }

  // 2. منطق البحث الذكي (بالـ ID أو بإيميل العميل)
  if (searchQuery && searchType) {
    if (searchType === "id") {
      whereClause.id = searchQuery;
    } else if (searchType === "email") {
      whereClause.user = {
        email: {
          contains: searchQuery,
          mode: "insensitive",
        },
      };
    }
  }

  // 3. استعلام بريزما الشامل والمملوء بالكامل (Fully Populated)
  const Orders = await prisma.order.findMany({
    where: whereClause,
    take: orderPerPage,
    skip: orderPerPage * (pageNumber - 1),
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      totalPrice: true, // السعر النهائي اللي دفعه العميل بعد الخصم
      totalCostPrice: true, // تكلفة المنتجات الإجمالية (لحساب صافي الأرباح بالفترات)
      phoneNumber: true, // رقم تليفون العميل للشحن
      status: true, // حالة الأوردر الحالية
      paymentMethod: true, // طريقة الدفع (PAYPAL)
      coupon: true, // كود الكوبون المستخدم (إن وُجد) كـ String
      country: true, // بلد الشحن
      region: true, // 👈 تم ملؤه: المحافظة/المنطقة
      street: true, // 👈 تم ملؤه: اسم الشارع/العنوان التفصيلي
      createdAt: true, // تاريخ الطلب (مهم جداً للفترات الزمنية)
      updatedAt: true,

      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          status: true, // عشان الأدمن يعرف لو العميل ده BANNED أو ACTIVE
        },
      },

      // جلب تفاصيل المنتجات جوة الأوردر بالملي
      orderItems: {
        select: {
          id: true,
          quantity: true, // الكمية المطلوبة من المنتج ده
          price: true, // السعر اللي اشترى بيه وقتها
          product: {
            select: {
              id: true,
              name: true,
              image: true, // عشان يعرض صورة المنتج في جدول تفاصيل الأوردر
              price: true, // السعر الحالي في الموقع للمقارنة
              costPrice: true, // تكلفة المنتج المفرد
              slug: true,
              inStock: true,
              countStock: true, // عشان الأدمن يتابع حالة المخزن وهو بيراجع الأوردر
            },
          },
        },
      },
    },
  });

  return Orders;
};

/** * @method PATCH
 * @description Update order status (with zero database performance overhead)
 * @route /api/products/order
 * @access private (Admin only)
 */
export const PATCH = adminGuard(
  updateOrderSchema,
  async (request: NextRequest, userId, data) => {
    try {
      // تحديث حالة الأوردر مباشرة بطلقة واحدة مفرومة أداء
      const updatedOrder = await prisma.order.update({
        where: { id: data.orderId },
        data: { status: data.status },
      });

      return NextResponse.json(
        { message: "Order status updated successfully", order: updatedOrder },
        { status: 200 },
      );
    } catch (error: any) {
      // حماية بريزما: لو الأوردر مش موجود أو الـ ID غلط
      if (error.code === "P2025") {
        return NextResponse.json(
          { message: "Order not found" },
          { status: 404 },
        );
      }
      console.error("🚨 Update Order Error:", error);
      return NextResponse.json(
        { message: "Error updating order" },
        { status: 500 },
      );
    }
  },
);
