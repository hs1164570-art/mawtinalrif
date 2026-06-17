"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

// const queryClient = new QueryClient();

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // عشان ميعملش اعاده بناء للبروفادر وبتالي يمسح الكاش
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
