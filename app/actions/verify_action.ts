"use server";

import prisma from "@/lib/db";

export const verifyToken = async (token: string) => {
  try {
    const verifyRecord = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verifyRecord) {
      return { success: false, message: "token not found" };
    }

    if (new Date(verifyRecord.expires) < new Date()) {
      // Clean up expired token
      await prisma.verificationToken.delete({ where: { id: verifyRecord.id } });
      return { success: false, message: "token is expierd" };
    }

    const user = await prisma.user.findUnique({
      where: { email: verifyRecord.email },
    });

    if (!user) {
      return { success: false, message: "user not found" };
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      }),
      prisma.verificationToken.delete({ where: { id: verifyRecord.id } }),
    ]);

    return { success: true, message: "تم التحقق بنجاح." };
  } catch {
    return { success: false, message: "حدث خطأ غير متوقع." };
  }
};
