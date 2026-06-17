import { z } from "zod";
import { AnalyticsType, ProductAnalyticsByDay } from "@prisma/client";

export const productAnalyticsSchema = z.object({});

export type ProductAnalyticsSchema = z.infer<typeof productAnalyticsSchema>;

export interface RedisLeaderboardItem {
  slug: string;
  totalScore: number;
}

export interface DailyTrendItem {
  date: string;
  cart: number;
  purchase: number;
}
