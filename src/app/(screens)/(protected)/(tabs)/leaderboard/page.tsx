'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
  // ...
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
          {' '}
          {tab}{' '}
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

  const { data: topThreeData, isLoading: isTopThreeLoading } = useQuery<
    UnknownObject[],
    Error
  >({
    queryKey: ['leaderboardTopThree'],
    queryFn: async () => {
      const res = await LeaderboardAPI.getLeaderboard(1, 3, '');
      return (res.data.data.content || []).map((p) => ({
        id: p.id,
        rank: p.rank,
        firstName: p.firstName,
        gamesPlayed: p.gamesPlayed,
        price: p.prizeWon ? formatNaira(p.prizeWon) : undefined,
        coins: undefined,
        avatarUrl: p.avatarUrl,
        date: p.lastGameDate,
        kycVerified: false,
      }));
    },
  });

  const {
    data: tableApiData,
    isLoading: isTableLoading,
    isError,
  } = useQuery<QueryResultData, Error>({
    queryKey: [
      'leaderboardTable',
      currentPage,
      debouncedSearchTerm,
      itemsPerPage,
    ],
    queryFn: async () => {
      const res = await LeaderboardAPI.getLeaderboard(
        currentPage,
        itemsPerPage,
        debouncedSearchTerm,
      );
      const list = res.data.data;
      const normalizedData = (list.content || []).map((p) => ({
        id: p.id,
        rank: p.rank,
        username: p.firstName,
        games: p.gamesPlayed,
        price: p.prizeWon ? formatNaira(p.prizeWon) : undefined,
        coins: undefined,
        avatarUrl: p.avatarUrl,
        date: p.lastGameDate,
        kycVerified: false,
      }));
      return {
        data: normalizedData,
        pagination: {
          currentPage: (list.pageNo || 0) + 1,
          limit: list.pageSize || itemsPerPage,
          totalPages: list.totalPages || 1,
          totalItems: list.totalElements || 0,
        },
      };
    },
  });

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const topThree = topThreeData || [];
  const tableData = tableApiData?.data || [];
  const pagination = tableApiData?.pagination;
  // const isLoading = isTopThreeLoading || isTableLoading;

  return (
    <div className="w-full max-w-full overflow-x-hidden py-6">
      <LeaderboardTabs activeTab={activeTab} setActiveTab={handleTabChange} />

      {isTopThreeLoading ? (
        <div className="mb-8 grid w-full grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
          <WalletStatCardsLoading />
          <WalletStatCardsLoading />
          <WalletStatCardsLoading />
        </div>
      ) : (
        topThree.length > 0 && (
          <div className="mb-8 grid w-full grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
            {topThree.map((data) => (
              <LeaderboardCard
                key={data.id}
                playerId={data.id}
                rank={data.rank}
                playerName={data?.firstName}
                gamesPlayed={data.gamesPlayed}
                prize={data.price}
                avatarUrl={data.avatarUrl}
              />
            ))}
          </div>
        )
      )}

      {isError && (
        <div className="text-center text-red-500">
          Failed to load leaderboard data.
        </div>
      )}

      <div className="mt-8">
        <LeaderboardTable
          data={tableData}
          isLoading={isTableLoading}
          activeTab={activeTab}
          currentPage={pagination?.currentPage || 1}
          totalPages={pagination?.totalPages || 1}
          totalCount={pagination?.totalItems || 0}
          onPageChange={setCurrentPage}
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
        />
      </div>
    </div>
  );
}

export default Page;
