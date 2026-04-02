'use client';

import QueryProvider from '@/components/query-provider';
import { Toaster } from 'sonner';

export default function AppSetup({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      {children}
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          style: {
            fontFamily: 'var(--spacegrotesk)',
          },
        }}
      />
    </QueryProvider>
  );
}
