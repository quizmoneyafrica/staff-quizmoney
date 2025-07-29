'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import LeaderboardAPI, {
  LastGameAdminRanking,
  AllTimeAdminRanking,
} from '@/app/api/leaderboardApi';
import { formatNaira } from '@/app/utils/utils';
import { useDebounce } from '@/app/hooks/useDebounce';

import LeaderboardCard from '@/app/components/leaderboard/LeaderboardCard';
import LeaderboardTable from '@/app/components/leaderboard/LeaderboardTable';
import classNames from 'classnames';
import { WalletStatCardsLoading } from '@/app/components/wallet/WalletStatCard';

interface NormalizedPlayer {
  id: string;
  rank: number;
  username: string;
  games: number;
  price?: string;
  coins?: number;
  avatarUrl: string | null;
  date: string;
  kycVerified: boolean;
}

interface QueryResultData {
  data: NormalizedPlayer[];
  pagination: {
    currentPage: number;
    limit: number;
    totalPages: number;
    totalItems: number;
  };
}

const normalizeLeaderboardData = (
  player: LastGameAdminRanking | AllTimeAdminRanking,
  type: 'lastGame' | 'allTime',
): NormalizedPlayer => {
  if (type === 'lastGame') {
    const p = player as LastGameAdminRanking;
    return {
      id: p.user.userId,
      rank: p.position,
      username: `${p.user.firstName || ''} ${p.user.lastName || ''}`.trim(),
      games: p.noOfGamesPlayed,
      price: p.prize > 0 ? formatNaira(p.prize) : undefined,
      coins: p.coins > 0 ? p.coins : undefined,
      avatarUrl: p.user.avatar,
      date: 'N/A',
      kycVerified: p.user.kycVerified,
    };
  } else {
    const p = player as AllTimeAdminRanking;
    return {
      id: p.user.userId,
      rank: p.overallRank,
      username: `${p.user.firstName || ''} ${p.user.lastName || ''}`.trim(),
      games: p.noOfGamesPlayed,
      price: p.amountWon > 0 ? formatNaira(p.amountWon) : undefined,
      coins: p.coins && p.coins > 0 ? p.coins : undefined,
      avatarUrl: p.user.avatar,
      date: 'N/A',
      kycVerified: p.user.kycVerified,
    };
  }
};

const LeaderboardTabs = ({
  activeTab,
  setActiveTab,
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) => {
  const tabs = ['Last Game leaderboard', 'All time Leaderboard'];
  return (
    <div className="mx-auto my-8 flex max-w-[1106px] rounded-[24px] bg-[#E4F1FA] p-1">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={classNames(
            'w-1/2 rounded-[24px] px-[59px] py-3 text-sm leading-5 transition-colors duration-300',
            {
              'bg-[#2364AA] font-bold text-white': activeTab === tab,
              'font-normal text-[#6D6D6D]': activeTab !== tab,
            },
          )}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

function Page() {
  const [activeTab, setActiveTab] = useState('Last Game leaderboard');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const itemsPerPage = 10;

  const {
    data: lastGameData,
    isLoading: isLastGameLoading,
    isError: isLastGameError,
  } = useQuery<QueryResultData, Error>({
    queryKey: [
      'lastGameLeaderboardAdmin',
      currentPage,
      debouncedSearchTerm,
      itemsPerPage,
    ],
    queryFn: async () => {
      const res = await LeaderboardAPI.getLastGameLeaderboardAdmin(
        currentPage,
        itemsPerPage,
        debouncedSearchTerm,
      );
      const normalizedData = res.data.result.data.map((p) =>
        normalizeLeaderboardData(p, 'lastGame'),
      );
      return {
        data: normalizedData,
        pagination: res.data.result.pagination,
      };
    },
    enabled: activeTab === 'Last Game leaderboard',
    placeholderData: keepPreviousData,
  });

  const {
    data: allTimeData,
    isLoading: isAllTimeLoading,
    isError: isAllTimeError,
  } = useQuery<QueryResultData, Error>({
    queryKey: [
      'allTimeLeaderboardAdmin',
      currentPage,
      debouncedSearchTerm,
      itemsPerPage,
    ],
    queryFn: async () => {
      const res = await LeaderboardAPI.getAllTimeLeaderboardAdmin(
        currentPage,
        itemsPerPage,
        debouncedSearchTerm,
      );
      const normalizedData = res.data.result.data.map((p) =>
        normalizeLeaderboardData(p, 'allTime'),
      );
      return {
        data: normalizedData,
        pagination: res.data.result.pagination,
      };
    },
    enabled: activeTab === 'All time Leaderboard',
    placeholderData: keepPreviousData,
  });

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const isLoading = isLastGameLoading || isAllTimeLoading;
  const isError = isLastGameError || isAllTimeError;
  const activeData =
    activeTab === 'Last Game leaderboard' ? lastGameData : allTimeData;

  const { topThree, tableData, totalPages, totalCount } = useMemo(() => {
    const data = activeData?.data || [];
    const pagination = activeData?.pagination;

    const playersArray = Array.isArray(data) ? data : [];

    const topThree = currentPage === 1 ? playersArray.slice(0, 3) : [];
    const tableData = currentPage === 1 ? playersArray.slice(3) : playersArray;

    return {
      topThree,
      tableData,
      totalPages: pagination?.totalPages || 1,
      totalCount: pagination?.totalItems || 0,
    };
  }, [activeData, currentPage]);

  return (
    <div className="w-full max-w-full overflow-x-hidden py-6">
      <LeaderboardTabs activeTab={activeTab} setActiveTab={handleTabChange} />

      {isLoading && currentPage === 1 && (
        <div className="mb-8 grid w-full grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
          <WalletStatCardsLoading />
          <WalletStatCardsLoading />
          <WalletStatCardsLoading />
        </div>
      )}

      {!isLoading && currentPage === 1 && topThree.length > 0 && (
        <div className="mb-8 grid w-full grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
          {topThree.map((data) => (
            <LeaderboardCard
              key={data.id}
              rank={data.rank}
              playerName={data.username}
              gamesPlayed={data.games}
              prize={data.price}
              avatarUrl={data.avatarUrl}
            />
          ))}
        </div>
      )}

      {isError && (
        <div className="text-center text-red-500">
          Failed to load leaderboard data. Please try again.
        </div>
      )}

      <div className="mt-8">
        <LeaderboardTable
          data={tableData}
          isLoading={isLoading}
          activeTab={activeTab}
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
          onPageChange={setCurrentPage}
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
        />
      </div>
    </div>
  );
}

export default Page;
