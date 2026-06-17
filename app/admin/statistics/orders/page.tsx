import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import getQueryClient from "@/lib/getQueryClient";
import { ordersQueryOptions } from "../_lib/queryOptions";
import OrdersClient from "./OrdersClient";

interface Props {
  searchParams: Promise<Record<string, string>>;
}

export const metadata = {
  title: "الطلبات والعمليات | موطن الريف",
  description: "تدفق الطلبات وحالات التشغيل وكفاءة النظام",
};

export default async function OrdersPage({ searchParams }: Props) {
  const params = await searchParams;
  const queryClient = getQueryClient();

  const key = {
    tf: params.tf ?? "7d",
    from: params.from ?? "",
    to: params.to ?? "",
    pf: params.pf ?? "",
    pt: params.pt ?? "",
  };

  await queryClient.prefetchQuery(ordersQueryOptions(key));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <OrdersClient initialKey={key} />
    </HydrationBoundary>
  );
}
