// app/dashboard/analytics/pages/page.tsx
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { PagesDashboard } from "./PagesDashboard";
import { getQueryClient, QUERY_KEYS } from "../lib/query-client";
import { presetToRange } from "../lib/utils";
import { getPagesReport } from "../lib/reports";

export const metadata = { title: "الصفحات والأحداث | تحليلات موطن الريف" };

// Live GA4 data must be fetched per-request, not baked in at build time.
export const dynamic = "force-dynamic";

export default async function PagesPage() {
  const range = presetToRange(28);
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: QUERY_KEYS.pages(range),
    queryFn: () => getPagesReport(range),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PagesDashboard range={range} />
    </HydrationBoundary>
  );
}
