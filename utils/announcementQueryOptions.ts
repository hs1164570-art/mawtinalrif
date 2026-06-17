import { queryOptions } from "@tanstack/react-query";
import { DOMAIN } from "@/lib/constants";

export type AnnouncementBarItem = {
  id: string;
  title: string;
  url: string | null;
  backgroundColor: string;
  textColor: string;
};

export const announcementQueryOptions = queryOptions({
  queryKey: ["announcement-bar"],
  queryFn: async (): Promise<AnnouncementBarItem[]> => {
    const res = await fetch(`${DOMAIN}/api/announcement-bar`);
    console.log(res);
    if (!res.ok) return [];
    const data = await res.json();
    return data.bars ?? [];
  },
  gcTime: Infinity,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
});
