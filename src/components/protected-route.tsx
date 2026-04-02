'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/app/lib/auth-store';
import { hasPermission } from '@/app/lib/permissions';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
}

export default function ProtectedRoute({
  children,
  requiredPermission,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, user, hasHydrated } = useAuthStore();

  useEffect(() => {
    if (!hasHydrated) return null;

    if (!isAuthenticated || !user) {
      router.replace('/login');
      return;
    }

    // Block players from admin dashboard
    if (user.role === 'player') {
      router.replace('/login');
      return;
    }

    // Check specific permission if required
    if (requiredPermission && !hasPermission(user.role, requiredPermission)) {
      router.replace('/dashboard');
      return;
    }
  }, [isAuthenticated, user, router, requiredPermission, hasHydrated]);

  if (!isAuthenticated || !user || user.role === 'player') {
    return null;
  }

  if (requiredPermission && !hasPermission(user.role, requiredPermission)) {
    return null;
  }

  return <>{children}</>;
}
