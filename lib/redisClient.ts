import { createClient, RedisClientType } from "redis";

const globalForRedis = global as unknown as { redis: RedisClientType };

let baseClient: RedisClientType;

if (!globalForRedis.redis) {
  baseClient = createClient({
    url: process.env.REDIS_URL,
    socket: {
      reconnectStrategy: (retries) => Math.min(retries * 50, 3000),
      connectTimeout: 5000, // حماية إضافية ضد الـ Hanging
    },
  });

  if (process.env.NEXT_PHASE !== "phase-production-build") {
    baseClient.connect().catch((err) => {
      console.error("⚠️ Initial Redis connection failed:", err.message);
    });
  }

  if (process.env.NODE_ENV !== "production") {
    globalForRedis.redis = baseClient;
  }
} else {
  baseClient = globalForRedis.redis;
}

// 🚀 الـ Proxy السحري المطور: ديناميكي 100% وبدون كسر للـ Sockets
const redisClient = new Proxy({} as RedisClientType, {
  get(_, prop: string) {
    // 1. لو في مرحلة الـ Build، ارجع دالة وهمية فوراً لأي عملية
    if (process.env.NEXT_PHASE === "phase-production-build") {
      if (prop === "isOpen") return false;
      return () => Promise.resolve(null);
    }

    // 2. في الـ Dev أو الـ Prod: اسحب الدالة من الـ baseClient الأصلي
    const value = (baseClient as any)[prop];

    if (typeof value === "function") {
      // 💡 الحل السحري: نـ bind للدالة مع الـ baseClient الأصلي مباشرة
      // عشان الـ JavaScript يحافظ على الـ Private Context والماسورة (Socket) من بره الـ Proxy
      return value.bind(baseClient);
    }

    return value;
  },
});

export default redisClient;

// import { createClient, RedisClientType } from "redis";

// const globalForRedis = global as unknown as { redis: RedisClientType };

// let baseClient: RedisClientType;

// if (!globalForRedis.redis) {
//   baseClient = createClient({
//     url: process.env.REDIS_URL,
//     socket: { reconnectStrategy: (retries) => Math.min(retries * 50, 3000) },
//   });

//   if (process.env.NEXT_PHASE !== "phase-production-build") {
//     baseClient.connect().catch(console.error);
//   }

//   if (process.env.NODE_ENV !== "production") {
//     globalForRedis.redis = baseClient;
//   }
// } else {
//   baseClient = globalForRedis.redis;
// }

// // 🚀 الحماية المطلقة: أي طلب بييجي وقت الـ Build، نرجعه "فاضي" فوراً من غير ما يوصل للسيرفر
// const redisClient = new Proxy(baseClient, {
//   get(target, prop) {
//     if (process.env.NEXT_PHASE === "phase-production-build") {
//       // لو حد بيسأل الـ client مفتوح ولا لأ، قوله لأ
//       if (prop === "isOpen") return false;
//       // أي دالة (get, incr, hIncrBy) نرجع دالة وهمية بترجع null عشان الـ Build ما يقفش
//       return () => Promise.resolve(null);
//     }
//     const value = Reflect.get(target, prop);
//     return typeof value === "function" ? value.bind(target) : value;
//   },
// }) as RedisClientType;

// export default redisClient;
