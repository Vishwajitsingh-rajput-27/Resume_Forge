'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const accountId = useAuthStore((state) => state.user?.id ?? null);
  const previousAccountId = useRef<string | null>(accountId);
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  useEffect(() => {
    if (previousAccountId.current !== accountId) {
      client.clear();
      previousAccountId.current = accountId;
    }
  }, [accountId, client]);

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
