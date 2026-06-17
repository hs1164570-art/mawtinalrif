import prisma from "@/lib/db";
import { randomUUID } from "node:crypto";

// ممكن بدل الحذف نعجل
// \  // yo can  edit instead delete
// upsert : = (where + update if exist , create if Not exist)
// but email should be unique
// const upserToken = await prisma.verificationToken.upsert({
//   where: {email: email },
//   update: { token, expires },
//   create: { email, token, expires },
// });

export const generateVerificationToken = async (email: string) => {
  const verificationToken = await prisma.verificationToken.findFirst({
    where: { email },
  });
  if (verificationToken) {
    await prisma.verificationToken.delete({
      where: { id: verificationToken.id },
    });
  }

  const newVerificationToken = await prisma.verificationToken.create({
    data: {
      token: randomUUID(),
      expires: new Date(new Date().getTime() + 3600 * 1000 * 2),
      email,
    },
  });
  return newVerificationToken;
};

export const generateForget_PasswrdToken = async (email: string) => {
  const forgetPasswordToken = await prisma.forgetPassword.findFirst({
    where: { email },
  });

  if (forgetPasswordToken) {
    await prisma.forgetPassword.delete({
      where: { id: forgetPasswordToken.id },
    });
  }

  const newforgetPasswordToken = await prisma.forgetPassword.create({
    data: {
      token: randomUUID(),
      expires: new Date(new Date().getTime() + 3600 * 1000 * 2),
      email,
    },
  });
  return newforgetPasswordToken;
};
