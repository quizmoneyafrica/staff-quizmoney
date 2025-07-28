'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import LeaderboardAPI from '@/app/api/leaderboardApi';
import { formatNaira } from '@/app/utils/utils';
import { format } from 'date-fns';

import LeaderboardCard from '@/app/components/leaderboard/LeaderboardCard';
import LeaderboardTable from '@/app/components/leaderboard/LeaderboardTable';
import classNames from 'classnames';

import { WalletStatCardsLoading } from '@/app/components/wallet/WalletStatCard';

interface LastGamePlayer {
  position: number;
  prize: number;
  coins: number;
  user: {
    userId: string;
    firstName?: string;
    lastName?: string;
    noOfGamesPlayed: number;
    avatar: string;
  };
}

const normalizeLeaderboardData = (
  player: LastGamePlayer,
  gameDate?: string,
) => {
  return {
    id: player.user.userId,
    rank: player.position,
    username: `${player.user.firstName || ''} ${
      player.user.lastName || ''
    }`.trim(),
    games: player.user.noOfGamesPlayed,
    price: player.prize > 0 ? formatNaira(player.prize) : undefined,
    coins: player.coins > 0 ? player.coins : undefined,
    avatarUrl: player.user.avatar,
    date: gameDate ? format(new Date(gameDate), 'dd/MM/yyyy') : 'N/A',
  };
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

const allTimeData = Array.from({ length: 30 }, (_, i) => ({
  id: `at-${i + 1}`,
  rank: i + 1,
  date: 'N/A',
  username: `AllTimePlayer${i + 1}`,
  games: 100 - i * 2,
  price: `₦${50000 - i * 1000}`,
  avatarUrl: 'https://github.com/shadcn.png',
}));

function Page() {
  const [activeTab, setActiveTab] = useState('Last Game leaderboard');
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: lastGameResult,
    isLoading: isLastGameLoading,
    isError,
  } = useQuery({
    queryKey: ['lastGameLeaderboard'],
    queryFn: () => LeaderboardAPI.getLastGameLeaderboard(),
    select: (res) => {
      const gameDate = res.data.result.createdAt?.iso;
      return res.data.result.rankings.map((p: LastGamePlayer) =>
        normalizeLeaderboardData(p, gameDate),
      );
    },
    enabled: activeTab === 'Last Game leaderboard',
  });

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const { topThree, tableData, totalPages, totalCount } = useMemo(() => {
    const data =
      activeTab === 'Last Game leaderboard'
        ? lastGameResult || []
        : allTimeData;
    const itemsPerPage = 10;
    const itemsOnFirstPage = 7;

    const topThree = data.slice(0, 3);
    const tablePlayers = data.slice(3);

    let paginatedTableData = [];
    if (currentPage === 1) {
      paginatedTableData = tablePlayers.slice(0, itemsOnFirstPage);
    } else {
      const startIndex = itemsOnFirstPage + (currentPage - 2) * itemsPerPage;
      paginatedTableData = tablePlayers.slice(
        startIndex,
        startIndex + itemsPerPage,
      );
    }

    let calculatedTotalPages = 1;
    if (tablePlayers.length > itemsOnFirstPage) {
      calculatedTotalPages =
        1 + Math.ceil((tablePlayers.length - itemsOnFirstPage) / itemsPerPage);
    }

    return {
      topThree,
      tableData: paginatedTableData,
      totalPages: calculatedTotalPages,
      totalCount: data.length,
    };
  }, [activeTab, currentPage, lastGameResult]);

  return (
    <div className="w-full max-w-full overflow-x-hidden py-6">
      <LeaderboardTabs activeTab={activeTab} setActiveTab={handleTabChange} />

      {isLastGameLoading && currentPage === 1 && (
        <div className="mb-8 grid w-full grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
          <WalletStatCardsLoading />
          <WalletStatCardsLoading />
          <WalletStatCardsLoading />
        </div>
      )}

      {!isLastGameLoading && currentPage === 1 && topThree.length > 0 && (
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
          Failed to load leaderboard data.
        </div>
      )}

      <div className="mt-8">
        <LeaderboardTable
          data={tableData}
          isLoading={isLastGameLoading && activeTab === 'Last Game leaderboard'}
          activeTab={activeTab}
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}

export default Page;
