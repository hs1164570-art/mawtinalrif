import {
  QueryClient,
  defaultShouldDehydrateQuery,
} from "@tanstack/react-query";
import { cache } from "react";

const getQueryClient = cache(
  () =>
    new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000,
        },
        dehydrate: {
          shouldDehydrateQuery: (query) =>
            defaultShouldDehydrateQuery(query) ||
            query.state.status === "pending",
        },
      },
    }),
);

export default getQueryClient;
