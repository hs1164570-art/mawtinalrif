"use client";

// ────────────────────────────────────────────────────────────────────────────
// Place this file at:  app/providers.tsx  (or app/admin/_components/Providers.tsx)
//
// Then wrap your root layout (or admin layout) with <Providers>:
//
//   import { Providers } from "./providers";
//   export default function RootLayout({ children }) {
//     return (
//       <html>
//         <body>
//           <Providers>{children}</Providers>
//         </body>
//       </html>
//     );
//   }
// ────────────────────────────────────────────────────────────────────────────

import { NuqsAdapter } from "nuqs/adapters/next/app";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "sonner";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      })
  );

  return (
    <NuqsAdapter>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster
          position="top-left"
          richColors
          toastOptions={{
            style: {
              fontFamily: "var(--font-cairo), 'Cairo', sans-serif",
              direction: "rtl",
            },
          }}
        />
        {process.env.NODE_ENV === "development" && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    </NuqsAdapter>
  );
}
