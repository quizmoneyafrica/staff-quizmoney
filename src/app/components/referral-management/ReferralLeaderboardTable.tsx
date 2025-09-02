'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, Table } from '@radix-ui/themes';
import { Search, Loader2 } from 'lucide-react';
import Pagination from '../leaderboard/Pagination';

import { useDebounce } from '@/app/hooks/useDebounce';
import { VerifiedIcon, QmCoinIcon } from '@/app/icons/icons';

type ReferralStatus = 'ACTIVE' | 'BANNED' | 'PENDING';

interface ReferralUser {
  id: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  totalReferrals: number;
  thisMonthReferrals: number;
  qmCoinsEarned: number;
  status: ReferralStatus;
  createdAt?: string;
}

const mockReferralUsers: ReferralUser[] = [
  {
    id: '1',
    firstName: 'Joemicky',
    lastName: '',
    username: 'JONOW',
    email: 'joemicky@example.com',
    totalReferrals: 20,
    thisMonthReferrals: 3,
    qmCoinsEarned: 150,
    status: 'BANNED',
    createdAt: '2024-08-15T10:30:00Z',
  },
  {
    id: '2',
    firstName: 'Joemicky',
    lastName: '',
    username: 'FHGUI',
    email: 'joemicky2@example.com',
    totalReferrals: 12,
    thisMonthReferrals: 6,
    qmCoinsEarned: 300,
    status: 'ACTIVE',
    createdAt: '2024-08-10T14:20:00Z',
  },
  {
    id: '3',
    firstName: 'Joemicky',
    lastName: '',
    username: 'JKOLU',
    email: 'joemicky3@example.com',
    totalReferrals: 10,
    thisMonthReferrals: 2,
    qmCoinsEarned: 100,
    status: 'BANNED',
    createdAt: '2024-08-12T09:15:00Z',
  },
  {
    id: '4',
    firstName: 'Joemicky',
    lastName: '',
    username: 'RTEWQ',
    email: 'joemicky4@example.com',
    totalReferrals: 7,
    thisMonthReferrals: 5,
    qmCoinsEarned: 250,
    status: 'ACTIVE',
    createdAt: '2024-08-08T16:45:00Z',
  },
  {
    id: '5',
    firstName: 'Joemicky',
    lastName: '',
    username: 'KYUOI',
    email: 'joemicky5@example.com',
    totalReferrals: 2,
    thisMonthReferrals: 2,
    qmCoinsEarned: 100,
    status: 'ACTIVE',
    createdAt: '2024-08-20T11:30:00Z',
  },
];

export const ReferralLeaderboardTable: React.FC = () => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter] = useState<'All' | ReferralStatus>('All');
  const [isLoading] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm);
  const itemsPerPage = 10;

  const filteredReferrers = mockReferralUsers.filter((referrer) => {
    const matchesSearch =
      !debouncedSearchTerm ||
      referrer.firstName
        ?.toLowerCase()
        .includes(debouncedSearchTerm.toLowerCase()) ||
      referrer.lastName
        ?.toLowerCase()
        .includes(debouncedSearchTerm.toLowerCase()) ||
      referrer.username
        ?.toLowerCase()
        .includes(debouncedSearchTerm.toLowerCase()) ||
      referrer.email?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'All' || referrer.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalCount = filteredReferrers.length;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReferrers = filteredReferrers.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const handleViewDetailsClick = (referrer: ReferralUser) => {
    // router.push(
    //   `/referral/user-details/${referrer.id}?userId=${referrer.id}&status=${referrer.status}`,
    // );
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const getStatusClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-[#D4F9E4] text-[#006E2D]';
      case 'banned':
        return 'bg-[#FFEDED] text-[#E11C25]';
      case 'pending':
        return 'bg-[#FFF6C5] text-[#ED7B2B]';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatusDisplay = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Active';
      case 'BANNED':
        return 'Banned';
      case 'PENDING':
        return 'Pending';
      default:
        return status;
    }
  };

  return (
    <div className="overflow-x-auto">
      <div className="mb-4 flex flex-col items-start justify-between gap-4 rounded-md bg-white px-5 py-5 md:flex-row md:items-center">
        <h3 className="text-lg font-semibold text-gray-900">
          Referral leaderboard
        </h3>
        <div className="flex items-center gap-4">
          <div className="flex w-full items-center gap-4 md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={handleSearchChange}
                className="focus:ring-primary-900 w-full rounded-md border border-[#D9D9D9] py-2 pl-10 pr-4 outline-none focus:ring-0"
              />
            </div>
          </div>
          <button className="rounded-md  border px-4 py-2 text-sm font-medium text-black  hover:bg-gray-100">
            Export CSV
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <Table.Root variant="ghost" className=" min-w-full text-sm">
          <Table.Header>
            <Table.Row>
              <Table.Cell className="px-4 py-2 text-left font-medium text-gray-600">
                Rank
              </Table.Cell>
              <Table.Cell className="px-4 py-2 text-left font-medium text-gray-600">
                Referrer
              </Table.Cell>
              <Table.Cell className="px-4 py-2 text-left font-medium text-gray-600">
                This Month
              </Table.Cell>
              <Table.Cell className="px-4 py-2 text-left font-medium text-gray-600">
                Total
              </Table.Cell>
              <Table.Cell className="px-4 py-2 text-left font-medium text-gray-600">
                QM Coin Earned
              </Table.Cell>
              <Table.Cell className="px-4 py-2 text-left font-medium text-gray-600">
                Status
              </Table.Cell>
              <Table.Cell className="px-4 py-2 text-left font-medium text-gray-600">
                Action
              </Table.Cell>
            </Table.Row>
          </Table.Header>
          <Table.Body className="bg-white">
            {paginatedReferrers.length > 0 ? (
              paginatedReferrers.map((referrer: ReferralUser, index) => {
                const fullName = `${referrer.firstName || ''} ${
                  referrer.lastName || ''
                }`.trim();
                const displayName = fullName || referrer.username || 'Unknown';
                const rank = (currentPage - 1) * itemsPerPage + index + 1;

                return (
                  <Table.Row
                    key={referrer.id}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <Table.Cell className="whitespace-nowrap px-4 py-4">
                      <div className="flex items-center justify-center">
                        <span className="text-lg font-bold text-gray-900">
                          {rank}
                        </span>
                      </div>
                    </Table.Cell>
                    <Table.Cell className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <Avatar
                            fallback={
                              displayName.charAt(0).toUpperCase() || 'U'
                            }
                            radius="full"
                            size="3"
                          />
                        </div>
                        <div>
                          <div className="flex items-center">
                            <p className="font-medium">{displayName}</p>
                            <VerifiedIcon size={14} className="ml-0.5" />
                          </div>
                          <p className="text-xs text-gray-500">
                            {referrer.username ||
                              referrer.email ||
                              'No username'}
                          </p>
                        </div>
                      </div>
                    </Table.Cell>
                    <Table.Cell className="px-4 py-4 font-medium">
                      {referrer.thisMonthReferrals || 0}
                    </Table.Cell>
                    <Table.Cell className="px-4 py-4 font-medium">
                      {referrer.totalReferrals || 0}
                    </Table.Cell>
                    <Table.Cell className="px-4 py-4 font-medium">
                      <div className="flex items-center gap-1.5">
                        <QmCoinIcon className="h-6 w-6" />
                        <span>{referrer.qmCoinsEarned || 0}</span>
                        <span className="text-sm font-medium">QM</span>
                      </div>
                    </Table.Cell>
                    <Table.Cell className="px-4 py-4">
                      <span
                        className={`font-heading w-fit rounded-full px-4 py-2 text-center text-sm font-medium ${getStatusClass(
                          referrer.status,
                        )}`}
                      >
                        {formatStatusDisplay(referrer.status)}
                      </span>
                    </Table.Cell>
                    <Table.Cell className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => handleViewDetailsClick(referrer)}
                        className="text-lg font-bold text-gray-400 transition-colors hover:text-gray-600"
                      >
                        ⋮
                      </button>
                    </Table.Cell>
                  </Table.Row>
                );
              })
            ) : (
              <Table.Row>
                <Table.Cell
                  colSpan={7}
                  className="py-12 text-center font-bold text-gray-500"
                >
                  No Referrers Found
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Root>
      )}

      <div className="mt-4 flex flex-col items-center gap-4 p-4 md:flex-row md:justify-between">
        <div className="text-sm text-gray-500">
          {totalCount > 0 ? (
            <>
              Showing data {startIndex + 1} to{' '}
              {Math.min(startIndex + itemsPerPage, totalCount)} of {totalCount}{' '}
              entries
            </>
          ) : (
            'No entries found'
          )}
        </div>

        {totalPages > 0 && (
          <div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ReferralLeaderboardTable;
