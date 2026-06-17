import { Role, UserStatus } from "@prisma/client";

// 1. التايب الدقيق لكل مستخدم راجع في مصفوفة الـ GET
export interface AdminUserListItem {
  id: string;
  name: string | null;
  email: string | null;
  role: Role;
  status: UserStatus;
  country: string;
  image: string | null;
  createdAt: Date | string; // Date لو في الباكيند، و string لو اتبعث JSON للفرونت
  updatedAt: Date | string;

  // الـ Aggregations اللي أنت عامل لها Select
  _count: {
    order: number;
  };

  // حساب الأوردرات لجلب الإجمالي لاحقاً
  order: {
    totalAmount: number;
  }[];
}

// 2. التايب الخاص بالـ Query Parameters لتنظيم الـ Fetching
export interface GetUsersQueryParams {
  usersNumber?: number; // رقم الصفحة الحالية للـ Pagination
  search?: string | null;
  role?: Role | null;
  status?: UserStatus | null;
}

// 3. التايب الخاص بالـ PATCH request لتحديث حالة المستخدم
export interface UpdateUserStatusPayload {
  userId: string;
  status: UserStatus;
}
