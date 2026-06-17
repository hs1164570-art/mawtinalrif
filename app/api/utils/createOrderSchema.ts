import { OrderStatus } from "@prisma/client";
import z from "zod";

export const orderSchema = z.object({
  status: z.nativeEnum(OrderStatus),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().min(1),
      size: z.enum(["Small", "Medium", "Large", "XLarge"]), // تأكد من مطابقة الـ Enum
    }),
  ),
  coupon: z.string().optional(),
});

export type OrderInput = z.infer<typeof orderSchema>;

export interface productDetailsType {
  price: number;
  quantity: number;
  id: string;
}

export const getOrderSchema = z.object({
  orderNumber: z.coerce.number().optional().default(1),
  status: z.nativeEnum(OrderStatus).optional(), // 💡 يفضل تعديلها هنا أيضاً لتكون Type-safe
});

// 👇 التعديل الجوهري هنا اللي هيحل لك الـ Error اللي فات نهائياً
export const updateOrderSchema = z.object({
  orderId: z.string(),
  status: z.nativeEnum(OrderStatus), // ⚡ تم استبدال الـ z.enum بـ z.nativeEnum المتوافق مع بريزما
});

export const getStatusCount = z.object({});

export const getOrdersSchema = z.object({
  pageNumber: z.string().optional(),
  status: z.nativeEnum(OrderStatus).optional(), // 💡 يفضل استخدام الـ Enum هنا برضه لتصفية دقيقة
  searchQuery: z.string().optional(),
  searchType: z.enum(["id", "email"]).optional(), // بنجبره يختار نوع بحث محدد لو هيبحث
});

export type GetOrdersInput = z.infer<typeof getOrdersSchema>;
