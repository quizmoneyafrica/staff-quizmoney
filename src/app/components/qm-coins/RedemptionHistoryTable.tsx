'use client';

import React, { useState } from 'react';
import { Avatar, Table } from '@radix-ui/themes';
import { Search } from 'lucide-react';
import { QmCoinIcon, VerifiedIcon } from '@/app/icons/icons';
import { useRouter } from 'next/navigation';
import Pagination from '../leaderboard/Pagination';
import TimeRangeDropdown from '@/app/components/common/TimeRangeDropdown';
import { calculateDateRange } from '@/app/utils/date-range';
import { useQuery } from '@tanstack/react-query';
import QmCoinsApi from '@/app/api/QmCoinsApi';
import type { QmCoinRedemptionResponse } from '@/app/api/QmCoinsApi';
import { convertToLocaleString } from '@/app/utils';

const RedemptionHistoryTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  const [search, setSearch] = useState('');
  const [exportLoading, setExportLoading] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const [selected, setSelected] = useState('All Time');

  const [customDateRange, setCustomDateRange] = useState<{
    startDate: Date;
    endDate: Date;
  } | null>(null);

  const dateRange = calculateDateRange(selected, customDateRange);
  const { data, isLoading, refetch } = useQuery<
    QmCoinRedemptionResponse['result']
  >({
    queryKey: [
      'qm-redemption-history',
      currentPage,
      itemsPerPage,
      search,
      dateRange,
    ],
    queryFn: () =>
      QmCoinsApi.getRedemptionHistoryAdmin({
        page: currentPage,
        limit: itemsPerPage,
        search: search.trim() || undefined,
        dateRange: dateRange && dateRange.start ? dateRange : undefined,
      }).then((res) => res.data.result),
  });
  const router = useRouter();
  const handleViewProfile = (userId: string) => {
    if (userId) {
      router.push(`/players/player-profile/${userId}`);
    }
  };
  const totalCount = data?.pagination?.totalItems || 0;
  const totalPages = data?.pagination?.totalPages || 1;
  const currentData = data?.data || [];
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-4 flex flex-col items-start justify-between gap-4 rounded-md bg-white px-5 py-5 md:flex-row md:items-center">
        <div className="flex w-full items-center gap-4 md:w-auto">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
            <input
              type="text"
              placeholder="Search by Users,Name,Transaction..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') refetch();
              }}
              className="w-full rounded-md border border-[#D9D9D9] py-2 pl-10 pr-4 outline-none"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <TimeRangeDropdown
            options={['All Time', 'This week', 'Last 30 days', 'Custom']}
            selected={selected}
            onSelect={(option) => {
              setSelected(option);
              if (option !== 'Custom') setCustomDateRange(null);
            }}
            customDateRange={customDateRange}
            onCustomDateChange={(range) => {
              setCustomDateRange(range);
            }}
          />
          <button
            className="bg-primary-900 hover:bg-primary-800 rounded-full px-6 py-2 text-white disabled:opacity-60"
            disabled={exportLoading}
            onClick={async () => {
              setExportLoading(true);
              setExportMessage(null);
              try {
                const res = await QmCoinsApi.exportRedemptionHistoryAdmin({
                  dateRange:
                    dateRange && dateRange.start ? dateRange : undefined,
                });
                setExportMessage(
                  res.data.result.message +
                    (res.data.result.sentTo
                      ? ` (Sent to: ${res.data.result.sentTo})`
                      : ''),
                );
              } catch {
                setExportMessage('Export failed. Please try again.');
              } finally {
                setExportLoading(false);
              }
            }}
          >
            {exportLoading ? 'Exporting...' : 'Export'}
          </button>
        </div>
      </div>
      {exportMessage && (
        <div className="mb-2 text-sm text-green-700">{exportMessage}</div>
      )}
      <div className="overflow-x-auto bg-white">
        <Table.Root variant="ghost" className="min-w-full text-sm">
          <Table.Header className="bg-primary-50">
            <Table.Row>
              <Table.Cell className="px-8 py-2 text-left">
                Transaction ID
              </Table.Cell>
              <Table.Cell className="px-8 py-2 text-left">Users</Table.Cell>
              <Table.Cell className="px-8 py-2 text-left">
                Coin Redeemed
              </Table.Cell>
              <Table.Cell className="px-8 py-2 text-left">
                Redeemed For
              </Table.Cell>
              <Table.Cell className="px-8 py-2 text-left">
                Last Transaction
              </Table.Cell>
              <Table.Cell className="px-8 py-2 text-left">Action</Table.Cell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {isLoading ? (
              <Table.Row>
                <Table.Cell colSpan={6} className="py-8 text-center">
                  Loading...
                </Table.Cell>
              </Table.Row>
            ) : (
              currentData.map((row) => (
                <Table.Row
                  key={row.objectId}
                  className="h-20 border-b border-[#F2F2F2]"
                >
                  <Table.Cell className="px-8 py-5 text-base font-bold leading-6 text-[#3B3B3B]">
                    {row.objectId}
                  </Table.Cell>
                  <Table.Cell className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Avatar
                          src={row.user.avatar || undefined}
                          fallback={row.user.firstName?.charAt(0) || 'U'}
                          radius="full"
                        />
                        {row.user.kycVerified && (
                          <div className="absolute -right-1 -top-1">
                            {<VerifiedIcon className="h-5 w-5" />}
                          </div>
                        )}
                      </div>
                      <span className="text-base font-medium leading-6 text-[#2364AA]">
                        {row.user.firstName} {row.user.lastName}
                      </span>
                    </div>
                  </Table.Cell>
                  <Table.Cell className="px-8 py-5">
                    <div className="text-positive-800 flex items-center gap-1">
                      <QmCoinIcon className="h-4 w-4" /> {row.points}coin
                    </div>
                  </Table.Cell>
                  <Table.Cell className="px-8 py-5">
                    {row.reward?.erasers || 0} Eraser,{' '}
                    {row.reward?.freeGames || 0} Free Game
                  </Table.Cell>
                  <Table.Cell className="px-8 py-5 text-sm font-medium leading-tight text-[#1B1B1B]">
                    {row.createdAt?.iso
                      ? new Date(row.createdAt.iso)
                          .toLocaleString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true,
                          })
                          .replace(',', '')
                          .replace(/(\d{2}:\d{2})/, (match) =>
                            match.replace(':', ':'),
                          )
                      : '-'}
                  </Table.Cell>
                  <Table.Cell className="px-8 py-5">
                    <button
                      className="hover:bg-primary-800 bg-primary-900 cursor-pointer rounded px-3 py-2 text-sm font-medium text-white transition-colors"
                      onClick={() => handleViewProfile(row.user.userId)}
                    >
                      View Profile
                    </button>
                  </Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table.Root>
      </div>
      <div className="mt-4 flex flex-col items-center gap-4 rounded-md bg-white p-4 md:flex-row md:justify-between">
        <div className="text-sm text-gray-500">
          {isLoading
            ? 'Loading entries...'
            : totalCount > 0
            ? `Showing ${(currentPage - 1) * itemsPerPage + 1} to ${Math.min(
                currentPage * itemsPerPage,
                totalCount,
              )} of ${convertToLocaleString(totalCount)} entries`
            : 'No entries found'}
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default RedemptionHistoryTable;
