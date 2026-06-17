import { AnalyticType } from "@prisma/client";
import z from "zod";

export const analyticsQuerySchema = z
  .object({
    type: z.nativeEnum(AnalyticType),
    timeframe: z
      .enum(["7days", "30days", "90days", "thisYear", "custom"])
      .default("30days"),
    from: z.string().optional(),
    to: z.string().optional(),
  })
  .refine(
    (data) => (data.timeframe === "custom" ? !!data.from && !!data.to : true),
    {
      message: "Both 'from' and 'to' are required for 'custom'",
      path: ["timeframe"],
    },
  );
