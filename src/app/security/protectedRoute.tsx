'use client';

import { useAppSelector } from '@/app/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { ROUTES } from '@/app/utils';

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [checking, setChecking] = useState(true);

  const { isAuthenticated, rehydrated } = useAppSelector((s) => s.auth);
  const user = useAppSelector((s) => s.auth.userEncryptedData);

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

  if (
    [
      ROUTES.SALES,
      ROUTES.PRODUCTS,
      ROUTES.GAME_ZONE,
      ROUTES.WALLET,
      ROUTES.QM_COINS,
      ROUTES.ADMIN_MANAGEMENT,
      ROUTES.SUPPORT,
    ].includes(pathname) &&
    !['SUPER_ADMIN', 'MANAGER'].includes(user?.role)
  ) {
    return null;
  }

  return <>{children}</>;
}
