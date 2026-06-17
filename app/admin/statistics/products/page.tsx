import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import getQueryClient from "@/lib/getQueryClient";
import { productsQueryOptions } from "../_lib/queryOptions";
import ProductsClient from "./ProductsClient";

interface Props {
  searchParams: Promise<Record<string, string>>;
}

export const metadata = {
  title: "المنتجات والمبيعات | موطن الريف",
  description: "أداء المنتجات — المبيعات والمشاهدات والتحويل",
};

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams;
  const queryClient = getQueryClient();

  const key = {
    tf: params.tf ?? "7d",
    from: params.from ?? "",
    to: params.to ?? "",
    pf: params.pf ?? "",
    pt: params.pt ?? "",
  };

  await queryClient.prefetchQuery(productsQueryOptions(key));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductsClient initialKey={key} />
    </HydrationBoundary>
  );
}
