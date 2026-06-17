import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import getQueryClient from "@/lib/getQueryClient";
import { financeQueryOptions } from "../_lib/queryOptions";
import FinanceClient from "./FinanceClient";

interface Props {
  searchParams: Promise<Record<string, string>>;
}

export const metadata = {
  title: "الإيرادات والأرباح | موطن الريف",
  description: "لوحة تحكم الأداء المالي — المبيعات وصافي الأرباح",
};

export default async function FinancePage({ searchParams }: Props) {
  const params = await searchParams;
  const queryClient = getQueryClient();

  const key = {
    tf: params.tf ?? "7d",
    from: params.from ?? "",
    to: params.to ?? "",
    pf: params.pf ?? "",
    pt: params.pt ?? "",
  };

  // Prefetch on server so the client hydrates immediately (no loading flash)
  await queryClient.prefetchQuery(financeQueryOptions(key));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <FinanceClient initialKey={key} />
    </HydrationBoundary>
  );
}
