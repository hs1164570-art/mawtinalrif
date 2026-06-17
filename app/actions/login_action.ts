"use server";

import { signIn } from "@/auth";
import { sendVerificationToken } from "../auth/utils/email";
import { generateVerificationToken } from "../auth/utils/generateToken";
import { loginSchema, LoginFormData } from "../auth/utils/login";
export const loginAction = async (data: LoginFormData, lang: string) => {
  try {
    const validation = loginSchema.safeParse(data);
    if (!validation.success) {
      return { success: false, message: validation.error.issues[0].message };
    }

    await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    return { success: true, message: "تم تسجيل الدخول بنجاح." };
  } catch (error: any) {
    if (
      error.type === "CredentialsSignin" ||
      error.code === "CredentialsSignin"
    ) {
      return { success: false, message: "CredentialsSignin" };
    }

    if (
      error.type === "AccessDenied" ||
      error.message?.includes("AccessDenied")
    ) {
      const token = await generateVerificationToken(data.email);
      await sendVerificationToken(token.email, token.token, lang);
      return { success: false, message: "AccessDenied" };
    }

    console.error("Auth Action Error:", error);
    return { success: false, message: "SomethingWentWrong" };
  }
};
