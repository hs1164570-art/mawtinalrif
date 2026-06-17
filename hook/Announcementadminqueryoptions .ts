import { queryOptions } from "@tanstack/react-query";
import { DOMAIN } from "@/lib/constants";

export type Announcement = {
  id: string;
  title: string;
  url: string | null;
  backgroundColor: string;
  textColor: string;
  isActive: boolean;
  showCount: number;
  priority: number;
  createdAt: string;
  updatedAt: string;
};

export type AnnouncementsResponse = {
  bars: Announcement[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
  };
};

const EMPTY_RESPONSE: AnnouncementsResponse = {
  bars: [],
  meta: { total: 0, page: 1, limit: 10, totalPages: 0, hasNextPage: false },
};

export const announcementAdminQueryOptions = (page = 1, limit = 10) =>
  queryOptions({
    queryKey: ["admin", "announcement-bar", page, limit] as const,
    queryFn: async (): Promise<AnnouncementsResponse> => {
      const res = await fetch(
        `${DOMAIN}/api/admin/announcement-bar?page=${page}&limit=${limit}`,
      );
      if (!res.ok) return EMPTY_RESPONSE;
      return res.json();
    },
    staleTime: 0, // admin data — دايماً fresh
  });
