"use server";

import prisma from "@/lib/db";
import bcrypt from "bcryptjs";
import { passwordSchema } from "../auth/utils/forget_reset_Password";

export const resetPassword = async (token: string | null, password: string) => {
  try {
    if (!token) {
      return { success: false, message: "token not found" };
    }

    const validation = passwordSchema.safeParse({ password });
    if (!validation.success) {
      return { success: false, message: validation.error.issues[0].message };
    }

    const resetToken = await prisma.forgetPassword.findFirst({
      where: { token },
    });
    if (!resetToken) {
      return { success: false, message: "token not found" };
    }

    if (new Date(resetToken.expires) < new Date()) {
      return { success: false, message: "token is expierd" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { email: resetToken.email },
        data: { password: hashedPassword },
      }),
      prisma.forgetPassword.delete({
        where: { id: resetToken.id },
      }),
    ]);

    return { success: true, message: "تم تغيير كلمة المرور بنجاح." };
  } catch {
    return { success: false, message: "حدث خطأ غير متوقع. حاول مرة أخرى." };
  }
};
