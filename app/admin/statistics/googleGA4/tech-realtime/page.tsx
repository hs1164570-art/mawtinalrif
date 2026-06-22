// app/dashboard/analytics/tech-realtime/page.tsx
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { TechRealtimeDashboard } from "./TechRealtimeDashboard";
import getQueryClient from "@/lib/getQueryClient";
import { getRealtimeData } from "../lib/ga4-client";
import { QUERY_KEYS } from "../lib/query-client";
import { getTechReport } from "../lib/reports";
import { presetToRange } from "../lib/utils";

export const metadata = {
  title: "الأجهزة والبيانات اللحظية | تحليلات موطن الريف",
};

// Live GA4 + realtime data must be fetched per-request, not baked in at build time.
export const dynamic = "force-dynamic";

export default async function TechRealtimePage() {
  const range = presetToRange(28);
  const queryClient = getQueryClient();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: QUERY_KEYS.tech(range),
      queryFn: () => getTechReport(range),
    }),
    queryClient.prefetchQuery({
      queryKey: QUERY_KEYS.realtime(),
      queryFn: () => getRealtimeData(),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TechRealtimeDashboard initialRange={range} />
    </HydrationBoundary>
  );
}
