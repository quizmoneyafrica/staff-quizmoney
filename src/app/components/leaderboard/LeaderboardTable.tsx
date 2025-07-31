'use client';
import React, { useState } from 'react';
import { Avatar, Table } from '@radix-ui/themes';
import PlayerProfileModal from './PlayerProfileModal';
import CustomImage from '@/app/components/CustomImage';
import { Search } from 'lucide-react';
import Pagination from './Pagination';
import { QmCoinIcon, VerifiedIcon } from '@/app/icons/icons';
import { useRouter } from 'next/navigation';

interface LeaderboardRowData {
  id: string;
  rank: number;
  date: string;
  username: string;
  avatarUrl: string | null;
  games: number;
  price?: string;
  coins?: number;
  kycVerified: boolean;
}

interface ILeaderboardTableProps {
  data: LeaderboardRowData[];
  isLoading: boolean;
  activeTab: string;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const LeaderboardTable: React.FC<ILeaderboardTableProps> = ({
  data,
  isLoading,
  // activeTab,
  currentPage,
  totalPages,
  totalCount,
  onPageChange,
  searchTerm,
  onSearchChange,
}) => {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] =
    useState<LeaderboardRowData | null>(null);

  const handleViewDetails = (player: LeaderboardRowData) => {
    setSelectedPlayer(player);
    setIsModalOpen(true);
  };

  const handleUsernameClick = (userId: string) => {
    router.push(`/players/player-profile/${userId}`);
  };

  const SkeletonRow = () => (
    <Table.Row className="h-20 animate-pulse border-b border-[#F2F2F2]">
      <Table.Cell className="px-8 py-5">
        <div className="h-8 w-8 rounded-full bg-gray-200"></div>
      </Table.Cell>
      <Table.Cell className="px-8 py-5">
        <div className="h-4 w-20 rounded bg-gray-200"></div>
      </Table.Cell>
      <Table.Cell className="px-8 py-5">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-gray-200"></div>
          <div className="h-4 w-24 rounded bg-gray-200"></div>
        </div>
      </Table.Cell>
      <Table.Cell className="px-8 py-5">
        <div className="h-4 w-20 rounded bg-gray-200"></div>
      </Table.Cell>
      <Table.Cell className="px-8 py-5">
        <div className="h-4 w-16 rounded bg-gray-200"></div>
      </Table.Cell>
      <Table.Cell className="px-8 py-5">
        <div className="h-4 w-16 rounded bg-gray-200"></div>
      </Table.Cell>
    </Table.Row>
  );

  const startEntry = (currentPage - 1) * 10 + 1;
  const endEntry = startEntry + data.length - 1;

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between gap-2 rounded-md bg-white px-5 py-5 md:gap-5">
        <div className="relative w-full max-w-xs rounded-md">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="focus:ring-primary-900 w-full rounded-md border border-[#D9D9D9] py-2 pl-10 pr-4 outline-none focus:ring-0"
          />
        </div>
      </div>

      <div className="w-full max-w-full overflow-x-auto bg-white">
        <Table.Root variant="ghost" className="min-w-full text-sm">
          <Table.Header className="bg-primary-50">
            <Table.Row>
              <Table.Cell className="min-w-[100px] px-8 py-2 text-left">
                Rank
              </Table.Cell>
              <Table.Cell className="min-w-[120px] px-8 py-2 text-left">
                Date
              </Table.Cell>
              <Table.Cell className="min-w-[200px] px-8 py-2 text-left">
                Username
              </Table.Cell>
              <Table.Cell className="min-w-[150px] px-8 py-2 text-left">
                Games Played
              </Table.Cell>
              <Table.Cell className="min-w-[120px] px-8 py-2 text-left">
                Prize
              </Table.Cell>
              <Table.Cell className="min-w-[120px] px-8 py-2 text-left">
                Action
              </Table.Cell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {isLoading ? (
              Array.from({ length: 10 }).map((_, i) => <SkeletonRow key={i} />)
            ) : data.length > 0 ? (
              data.map((row) => (
                <Table.Row
                  key={row.id}
                  className="h-20 border-b border-[#F2F2F2]"
                >
                  <Table.Cell className="px-8 py-5">
                    <div className="size-8 flex items-center justify-center rounded-full bg-[#F9F9F9] p-1 font-medium text-[#3B3B3B]">
                      {row.rank}
                    </div>
                  </Table.Cell>
                  <Table.Cell className="px-8 py-5 text-sm font-medium leading-tight text-[#1B1B1B]">
                    {row.date}
                  </Table.Cell>
                  <Table.Cell className="px-8 py-5">
                    <div
                      className="group flex cursor-pointer items-center gap-2"
                      onClick={() => handleUsernameClick(row.id)}
                    >
                      <div className="relative">
                        <Avatar
                          src={row.avatarUrl || undefined}
                          fallback={
                            row.username?.charAt(0).toUpperCase() || 'P'
                          }
                          radius="full"
                          size="3"
                        />
                        {row.kycVerified && (
                          <div className="absolute -right-1 -top-1">
                            <VerifiedIcon className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                      <span className="text-base font-medium leading-6 text-[#2364AA]">
                        {row.username}
                      </span>
                    </div>
                  </Table.Cell>
                  <Table.Cell className="px-8 py-5 text-sm text-gray-900">
                    <div className="flex items-center gap-2">
                      <CustomImage alt="game icon" src={'/icons/game.svg'} />
                      <span>{row.games} games</span>
                    </div>
                  </Table.Cell>
                  <Table.Cell className="px-8 py-5 text-sm font-semibold">
                    <div className="flex flex-col items-start gap-1">
                      {row.price && (
                        <span className="text-gray-900">{row.price}</span>
                      )}
                      {row.coins && row.coins > 0 && (
                        <div className="flex items-center gap-1">
                          <QmCoinIcon className="h-4 w-4" />
                          <span className="text-base font-medium leading-5 text-[#00B23D]">
                            {row.coins.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </Table.Cell>
                  <Table.Cell className="px-8 py-5 text-sm font-medium">
                    <button
                      onClick={() => handleViewDetails(row)}
                      className="text-primary-800 hover:text-primary-900 cursor-pointer transition-colors"
                    >
                      View Details
                    </button>
                  </Table.Cell>
                </Table.Row>
              ))
            ) : (
              <Table.Row>
                <Table.Cell
                  colSpan={6}
                  className="py-12 text-center font-bold text-gray-500"
                >
                  No players found.
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Root>
      </div>

      <div className="mt-4 flex flex-col items-center gap-4 rounded-md bg-white p-4 md:flex-row md:justify-between">
        <div className="text-sm text-gray-500">
          {isLoading
            ? 'Loading entries...'
            : totalCount > 0
            ? `Showing ${startEntry} to ${endEntry} of ${totalCount} entries`
            : 'No players found.'}
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      </div>

      <PlayerProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        playerData={selectedPlayer}
      />
    </div>
  );
};

export default LeaderboardTable;
