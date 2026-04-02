/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useAuthStore } from '@/app/lib/auth-store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60, // 1 minute default
            retry: (failureCount, error: any) => {
              // Don't retry on 401, 403, 404
              const status = error?.response?.status;
              if ([401, 403, 404].includes(status)) return false;
              return failureCount < 2;
            },
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: false,
          },
        },
      }),
  );

  if (!hasHydrated) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} position={'bottom'} />
      )}
    </QueryClientProvider>
  );
}
