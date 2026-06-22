// app/dashboard/analytics/sessions/page.tsx
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { SessionsDashboard } from "./SessionsDashboard";
import getQueryClient from "@/lib/getQueryClient";
import { QUERY_KEYS } from "../lib/query-client";
import { getSessionsReport } from "../lib/reports";
import { presetToRange } from "../lib/utils";

export const metadata = { title: "الجلسات والحملات | تحليلات موطن الريف" };

// Live GA4 data must be fetched per-request, not baked in at build time.
export const dynamic = "force-dynamic";

export default async function SessionsPage() {
  const range = presetToRange(28);
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: QUERY_KEYS.sessions(range),
    queryFn: () => getSessionsReport(range),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SessionsDashboard range={range} />
    </HydrationBoundary>
  );
}
