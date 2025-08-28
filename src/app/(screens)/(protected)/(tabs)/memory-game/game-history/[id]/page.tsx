'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactElement } from 'react';
import MemoryGameHistory, {
  type MemoryGameHistoryProps,
} from './MemoryGameHistory';

// interface PageProps {
//   params: {
//     id: string;
//   };
// }

export default function Page({
  params,
}: {
  params: { id: string };
}: PageProps): ReactElement {
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

  const gameId = searchParams?.get('gameId') ?? '';
  const status = searchParams?.get('status') ?? '';

  const searchParamsObj: MemoryGameHistoryProps['searchParams'] = {
    gameId,
    status,
  };

  return <MemoryGameHistory params={params} searchParams={searchParamsObj} />;
}

export const dynamic = 'force-dynamic';
