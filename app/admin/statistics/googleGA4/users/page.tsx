// app/dashboard/analytics/users/page.tsx
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { UsersDashboard } from "./UsersDashboard";
import getQueryClient from "@/lib/getQueryClient";
import { QUERY_KEYS } from "../lib/query-client";
import { getUsersReport } from "../lib/reports";
import { presetToRange } from "../lib/utils";

export const metadata = { title: "المستخدمون | تحليلات موطن الريف" };

// Live GA4 data must be fetched per-request, not baked in at build time.
export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const range = presetToRange(28);
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: QUERY_KEYS.users(range),
    queryFn: () => getUsersReport(range),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UsersDashboard range={range} />
    </HydrationBoundary>
  );
}
