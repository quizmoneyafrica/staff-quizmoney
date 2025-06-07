'use client';

import { useAppSelector } from '@/app/hooks/useAuth';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, rehydrated } = useAppSelector((s) => s.auth);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!rehydrated) return;

    if (!isAuthenticated) {
      router.replace('/login');
    } else {
      setChecking(false);
    }
  }, [rehydrated, isAuthenticated, router]);

  if (!rehydrated || checking) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="border-primary-500 h-12 w-12 animate-spin rounded-full border-b-2 border-t-2" />
      </div>
    );
  }

  return <>{children}</>;
}
