"use server";

import prisma from "@/lib/db";
import { generateForget_PasswrdToken } from "../auth/utils/generateToken";
import { sendForget_passwordToken } from "../auth/utils/emailFogerPass";
import { emailschema } from "../auth/utils/forget_reset_Password";

export const forgetPassword = async (email: string, lang: string | null) => {
  try {
    const validation = emailschema.safeParse({ email });
    if (!validation.success) {
      return { success: false, message: validation.error.issues[0].message };
    }

    // Check user exists BEFORE generating token (fixed order)
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Generic message — don't reveal if email is registered
      return {
        success: true,
        message: "إذا كان البريد مسجلاً، ستصلك رسالة قريباً.",
      };
    }

    const token = await generateForget_PasswrdToken(email);
    await sendForget_passwordToken(token.email, token.token, lang);

    return { success: true, message: "تم إرسال رابط الاسترداد إلى بريدك." };
  } catch {
    return { success: false, message: "حدث خطأ غير متوقع. حاول مرة أخرى." };
  }
};
