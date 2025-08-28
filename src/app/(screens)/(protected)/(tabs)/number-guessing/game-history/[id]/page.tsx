'use client';

import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import NumberGuessingGameHistory from './NumberGuessingGameHistory';

interface PageProps {
  params: {
    id: string;
  };
}

export default function Page({ params }: PageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  const gameId = searchParams?.get('gameId') || '';
  const status = searchParams?.get('status') || '';

  return (
    <NumberGuessingGameHistory
      params={params}
      searchParams={{ gameId, status }}
    />
  );
}

export const dynamic = 'force-dynamic';
