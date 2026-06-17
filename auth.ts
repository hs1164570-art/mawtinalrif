// auth.ts
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import authConfig from "./auth.config";
import prisma from "./lib/db";
import { Role } from "@prisma/client";
import { getCountryByIp } from "./lib/getCountryBy_IP";
import redisClient from "./lib/redisClient";
import Credentials from "next-auth/providers/credentials";
import bycrypt from "bcryptjs";
import z from "zod";
const loginSchema = z.object({
  email: z.string().min(1).email(),
  password: z.string().min(6),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  ...authConfig,
  providers: [
    ...authConfig.providers, // بيجيب جوجل وجيت هاب تلقائي
    Credentials({
      async authorize(data) {
        const validation = loginSchema.safeParse(data);
        if (validation.success) {
          const { password, email } = validation.data;
          const user = await prisma.user.findFirst({
            where: { email: email },
          });
          if (!user || !user.password) return null;

          const comparePassword = await bycrypt.compare(
            password,
            user.password,
          );
          if (comparePassword) return user;
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // الـ user هنا بيكون متاح فقط "أثناء تسجيل الدخول الناجح لأول مرة"
      if (user) {
        token.id = user.id;

        // بنعمل كويري لمرة واحدة فقط وقت الدخول نجيب كل البيانات اللي تهمنا ونحطها في الـ JWT Token المشفر
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          include: { favorite: { select: { productId: true } } },
        });

        if (dbUser) {
          token.role = dbUser.role;
          token.country = dbUser.country;
          token.favorites = dbUser.favorite.map((el: any) => el.productId);
        }
      }
      return token; // التوكن ده بيتحفظ في الكوكيز وبيمشي معانا في كل ريكويست خفيف وسريع
    },

    async session({ session, token }) {
      // هنا بقى طيران! مفيش أي كويري لقاعدة البيانات.. بنقرا من التوكن اللي في الميموري علطول $O(1)$
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.country = token.country as string;
        session.user.favorites = token.favorites as string[];
      }
      return session;
    },

    async signIn({ user, account }) {
      const country = await getCountryByIp();

      // تحديث الـ Redis والـ DB بشكل آمن
      try {
        redisClient
          .hIncrBy("stats:total:allStats", "totalUsers", 1)
          .catch((err) => console.error("Redis Incr Error:", err));
      } catch (e) {
        console.error("Redis incre totalUsers err Error:", e);
      }

      if (user.id) {
        await prisma.user
          .update({
            where: { id: user.id },
            data: { country: country },
          })
          .catch(() => {});
      }

      if (account?.provider !== "credentials") {
        return true;
      }

      const userFromDb = await prisma.user.findUnique({
        where: { id: user.id },
      });

      if (!userFromDb?.emailVerified) {
        return false; // هيرمي AccessDenied والـ Action هيلقطه ويبعت الإيميل
      }

      return true;
    },
  },
  events: {
    async linkAccount({ user }) {
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      });
    },
  },
});
