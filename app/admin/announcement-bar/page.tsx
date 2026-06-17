import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { cookies } from "next/headers";
import getQueryClient from "@/lib/getQueryClient";
import { DOMAIN } from "@/lib/constants";

import {
  announcementAdminQueryOptions,
  AnnouncementsResponse,
} from "@/hook/Announcementadminqueryoptions ";
import AnnouncementClient from "./_components/AnnouncementClient";

export const dynamic = "force-dynamic"; // admin page — مفيش caching

const EMPTY: AnnouncementsResponse = {
  bars: [],
  meta: { total: 0, page: 1, limit: 10, totalPages: 0, hasNextPage: false },
};

export default async function AnnouncementBarPage() {
  const queryClient = getQueryClient();
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  await queryClient.prefetchQuery({
    ...announcementAdminQueryOptions(1, 10),
    queryFn: async (): Promise<AnnouncementsResponse> => {
      try {
        const res = await fetch(
          `${DOMAIN}/api/admin/announcement-bar?page=1&limit=10`,
          {
            cache: "no-store",
            headers: { Cookie: cookieHeader },
          },
        );
        if (!res.ok) return EMPTY;
        return res.json();
      } catch {
        return EMPTY;
      }
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AnnouncementClient />
    </HydrationBoundary>
  );
}
