"use server";
import redisClient from "@/lib/redisClient"; // تأكد من مسار إعدادات الريديس عندك

// generecview

export async function incrementHomepageViews() {
  try {
    const key = "stats:generecViews:homepage";
    await redisClient.incr(key);
    return { success: true };
  } catch (error) {
    console.error("Failed to increment homepage views in Redis:", error);
    return { success: false, error };
  }
}

/**
 * 2. زيادة عداد زيارات صفحات المنتجات (بشكل عام)
 */
export async function incrementProductPageViews() {
  try {
    const key = "stats:generecViews:productpage";
    await redisClient.incr(key);
    return { success: true };
  } catch (error) {
    console.error("Failed to increment product page views in Redis:", error);
    return { success: false, error };
  }
}

/**
 * 3. زيادة عداد زيارات صفحة "من نحن" / About
 */
export async function incrementAboutPageViews() {
  try {
    const key = "stats:generecViews:aboutpage";
    await redisClient.incr(key);
    return { success: true };
  } catch (error) {
    console.error("Failed to increment about page views in Redis:", error);
    return { success: false, error };
  }
}
export async function incrementCartStats(slug: string, quantity: number) {
  try {
    const key = "stats:most_carted_products";
    await redisClient.zIncrBy(key, quantity, slug);
    return { success: true };
  } catch (error) {
    console.error("Failed to increment Redis cart stats:", error);
    return { success: false, error };
  }
}

export async function incrementViewStats(slug: string) {
  try {
    const key = "stats:most_viewed_products";
    await redisClient.zIncrBy(key, 1, slug);
    return { success: true };
  } catch (error) {
    console.error("Failed to increment Redis view stats:", error);
    return { success: false, error };
  }
}
