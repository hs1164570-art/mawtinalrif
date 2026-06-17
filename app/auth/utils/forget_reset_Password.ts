import z from "zod";

export const emailschema = z.object({
  email: z.string().email(),
});
export const passwordSchema = z.object({
  password: z.string().min(6, "password shuld be at least 6").max(24),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(6),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
