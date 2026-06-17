"use server";

import prisma from "@/lib/db";
import bcrypt from "bcryptjs";
import { registerSchema, RegisterFormData } from "../auth/utils/register";
import { generateVerificationToken } from "../auth/utils/generateToken";
import { sendVerificationToken } from "../auth/utils/email";

export const registerAction = async (data: RegisterFormData, lang: string) => {
  try {
    const validation = registerSchema.safeParse(data);
    if (!validation.success) {
      return { success: false, message: validation.error.issues[0].message };
    }

    const { name, email, password } = validation.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { success: false, message: "البريد الإلكتروني مسجّل مسبقاً." };
    }

    const existingName = await prisma.user.findUnique({ where: { name } });
    if (existingName) {
      return {
        success: false,
        message: "هذا الاسم مستخدم بالفعل، اختر اسماً آخر.",
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    const verificationToken = await generateVerificationToken(email);
    await sendVerificationToken(
      verificationToken.email,
      verificationToken.token,
      lang,
    );

    return {
      success: true,
      message: "تم إنشاء الحساب! تحقق من بريدك لتفعيله.",
    };
  } catch {
    return { success: false, message: "حدث خطأ غير متوقع. حاول مرة أخرى." };
  }
};
