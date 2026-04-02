'use client';
import { useAuthStore } from '@/app/lib/auth-store';
// import { useAppSelector } from '@/app/hooks/useAuth';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

export default function Splash() {
  const router = useRouter();
  // const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  // const rehydrated = useAppSelector((s) => s.auth.rehydrated);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    // if (!rehydrated) return;

    const timer = setTimeout(() => {
      if (isAuthenticated) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [isAuthenticated, router]);

  return (
    <main
      id="splash"
      className="bg-primary-800 fixed inset-0 left-0 top-0 flex h-screen w-full items-center justify-center"
    >
      <Image
        src="/icons/quizmoney-logo-white.svg"
        alt="Quiz Money"
        width={180}
        height={38}
        priority
      />
    </main>
  );
}
