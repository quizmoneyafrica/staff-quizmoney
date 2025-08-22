'use client';

import React, { useState } from 'react';

import {
  useQuery,
  keepPreviousData,
  useQueryClient,
} from '@tanstack/react-query';
import { Avatar, Table } from '@radix-ui/themes';
import { Search, ListFilter, Loader2, ReceiptText } from 'lucide-react';

import { calculateDateRange } from '@/app/utils/date-range';
import Pagination from '../leaderboard/Pagination';
import TransactionDetailsModal from './TransactionDetailsModal';

import WalletApi, {
  WalletTransactionResponse,
  PageResponse,
} from '@/app/api/wallet';
import TimeRangeDropdown from '@/app/components/common/TimeRangeDropdown';
import { formatDateTime, formatNaira } from '@/app/utils/utils';
import { useDebounce } from '@/app/hooks/useDebounce';
import { VerifiedIcon } from '@/app/icons/icons';

const TransactionTable: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<
    string | null
  >(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'All' | 'SUCCESSFUL' | 'PENDING' | 'FAILED'
  >('All');
  const [typeFilter, setTypeFilter] = useState<
    'All' | 'WITHDRAWAL' | 'FUNDING'
  >('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const queryClient = useQueryClient();

  const [selected, setSelected] = useState('All Time');

  // Query to fetch transaction details
  const { data: transactionDetails } = useQuery({
    queryKey: ['transactionDetails', selectedTransactionId],
    queryFn: () => {
      if (!selectedTransactionId) return null;
      return WalletApi.getTransactionById(selectedTransactionId).then(
        (res) => res.data.data,
      );
    },
    enabled: !!selectedTransactionId,
  });

  const handleRowClick = (transactionId: string) => {
    setSelectedTransactionId(transactionId);
  };
  const [customDateRange, setCustomDateRange] = useState(null);

  const debouncedSearchTerm = useDebounce(searchTerm);
  const itemsPerPage = 10;

  const { data, isLoading, error, refetch } = useQuery<
    {
      success: boolean;
      code: string;
      message: string;
      data: {
        content: WalletTransactionResponse[];
        pageNo: number;
        pageSize: number;
        totalElements: number;
        totalPages: number;
        last: boolean;
      };
    },
    Error
  >({
    queryKey: [
      'walletTransactions',
      currentPage,
      debouncedSearchTerm,
      statusFilter,
      typeFilter,
      selected,
      customDateRange,
      itemsPerPage,
    ],
    queryFn: () => {
      const apiStatus = statusFilter === 'All' ? undefined : statusFilter;
      const apiType = typeFilter === 'All' ? undefined : typeFilter;

      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearchTerm || undefined,
        status: apiStatus,
        type: apiType,
      };

      return WalletApi.getWalletTransactions(params).then((res) => res.data);
    },

    placeholderData: keepPreviousData,
  });

  const transactions = data?.data?.content || [];
  const pagination = data?.data;
  const totalCount = pagination?.totalElements || 0;

  const totalPages = pagination?.totalPages || 1;

  const handleFilterSelect = (
    status: 'All' | 'SUCCESSFUL' | 'PENDING' | 'FAILED',
  ) => {
    setStatusFilter(status);
    setIsFilterOpen(false);
    setCurrentPage(1);
  };

  const handleTypeFilterSelect = (type: 'All' | 'WITHDRAWAL' | 'FUNDING') => {
    setTypeFilter(type);
    setCurrentPage(1);
  };

  const handleViewDetailsClick = (transaction: WalletTransactionResponse) => {
    setSelectedTransactionId(transaction.id);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleTimeRangeSelect = (option: string) => {
    setSelected(option);
    if (option !== 'Custom') setCustomDateRange(null);
  };

  const getStatusClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'successful':
        return 'bg-[#D4F9E4] text-[#006E2D]';
      case 'failed':
        return 'bg-[#FFEDED] text-[#E11C25]';
      case 'pending':
        return 'bg-[#FFF8DB] text-[#A16207]';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="mb-4 text-red-600">Failed to load transactions</p>
        <button
          onClick={() => refetch()}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <div className="mb-4 flex flex-col items-start justify-between gap-4 rounded-md bg-white px-5 py-5 md:flex-row md:items-center">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, etc."
              value={searchTerm}
              onChange={handleSearchChange}
              className="focus:ring-primary-900 w-full rounded-md border border-[#D9D9D9] py-2 pl-10 pr-4 outline-none focus:ring-0"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                className="flex cursor-pointer items-center gap-1 rounded-md border border-[#D9D9D9] px-4 py-2 outline-none"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <ListFilter className="size-5 text-[#1B212D]" />
                <span className="hidden md:block">Filter by</span>
              </button>
              {isFilterOpen && (
                <div className="absolute right-0 z-10 mt-2 w-48 rounded-md border bg-white shadow-lg">
                  <div className="py-1">
                    <div className="px-4 py-2 text-xs font-semibold uppercase text-gray-500">
                      Status
                    </div>
                    {['All', 'SUCCESSFUL', 'PENDING', 'FAILED'].map(
                      (status) => (
                        <button
                          key={status}
                          onClick={() =>
                            handleFilterSelect(
                              status as
                                | 'All'
                                | 'SUCCESSFUL'
                                | 'PENDING'
                                | 'FAILED',
                            )
                          }
                          className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${
                            statusFilter === status ? 'bg-gray-50' : ''
                          }`}
                        >
                          {status}
                        </button>
                      ),
                    )}
                    <div className="my-2 border-t border-gray-200"></div>
                    <div className="px-4 py-2 text-xs font-semibold uppercase text-gray-500">
                      Type
                    </div>
                    {['All', 'WITHDRAWAL', 'FUNDING'].map((type) => (
                      <button
                        key={type}
                        onClick={() =>
                          handleTypeFilterSelect(
                            type as 'All' | 'WITHDRAWAL' | 'FUNDING',
                          )
                        }
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${
                          typeFilter === type ? 'bg-gray-50' : ''
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <TimeRangeDropdown
              options={['All Time', 'This week', 'Last 30 days', 'Custom']}
              selected={selected}
              onSelect={handleTimeRangeSelect}
              customDateRange={customDateRange}
              onCustomDateChange={setCustomDateRange}
            />
          </div>
        </div>

        {isLoading && !data ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <Table.Root
            variant="ghost"
            className="min-h-[600px] min-w-full text-sm"
          >
            <Table.Header className="bg-primary-50">
              <Table.Row>
                <Table.Cell className="px-4 py-2 text-left">
                  Transaction ID
                </Table.Cell>
                <Table.Cell className="px-4 py-2 text-left">User</Table.Cell>
                <Table.Cell className="px-4 py-2 text-left">
                  Transaction Type
                </Table.Cell>
                <Table.Cell className="px-4 py-2 text-left">
                  Transaction Amount
                </Table.Cell>
                <Table.Cell className="px-4 py-2 text-left">
                  Transaction Status
                </Table.Cell>
                <Table.Cell className="px-4 py-2 text-left">Actions</Table.Cell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {transactions.length > 0 ? (
                transactions.map((tx) => {
                  const { time, fullDate } = formatDateTime(tx.transactionDate);
                  const fullName = `${tx.firstName} ${tx.lastName}`;
                  return (
                    <Table.Row
                      key={tx.id}
                      className="cursor-pointer transition-colors hover:bg-gray-50"
                      onClick={() => handleViewDetailsClick(tx)}
                    >
                      <Table.Cell className="whitespace-nowrap px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-50">
                            <ReceiptText className="h-6 w-6 text-gray-500" />
                          </div>
                          <div>
                            <p className="font-bold uppercase text-neutral-800">
                              {tx.id}
                            </p>
                            <p className="text-xs text-neutral-500">
                              {fullDate} • {time}
                            </p>
                          </div>
                        </div>
                      </Table.Cell>

                      <Table.Cell className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <Avatar
                              fallback={fullName.charAt(0).toUpperCase()}
                              radius="full"
                              size="3"
                            />
                          </div>
                          <p className="capitalize">{fullName}</p>
                        </div>
                      </Table.Cell>
                      <Table.Cell className="px-4 py-4 capitalize">
                        {tx.transactionType}
                      </Table.Cell>
                      <Table.Cell className="px-4 py-4 font-semibold">
                        {formatNaira(tx.amount)}
                      </Table.Cell>
                      <Table.Cell className="px-4 py-4">
                        <p
                          className={`font-heading w-fit rounded-full px-4 py-2 text-center capitalize ${getStatusClass(
                            tx.transactionStatus,
                          )}`}
                        >
                          {tx.transactionStatus}
                        </p>
                      </Table.Cell>
                      <Table.Cell className="px-4 py-4">
                        <button
                          onClick={() => handleViewDetailsClick(tx)}
                          className="hover:bg-primary-50 text-primary-900 border-primary-200 cursor-pointer rounded border px-3 py-2 text-sm font-medium transition-colors"
                        >
                          View Details
                        </button>
                      </Table.Cell>
                    </Table.Row>
                  );
                })
              ) : (
                <Table.Row>
                  <Table.Cell
                    colSpan={6}
                    className="py-12 text-center font-bold"
                  >
                    No Transactions Found
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table.Root>
        )}
      </div>

      {pagination && totalCount > 0 && (
        <div className="mt-4 flex flex-col items-center gap-4 p-4 md:flex-row md:justify-between">
          <div className="text-sm text-gray-500">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount}{' '}
            entries
          </div>
          <Pagination
            currentPage={pagination.pageNo || currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {transactionDetails && (
        <TransactionDetailsModal
          isOpen={!!selectedTransactionId}
          onClose={() => setSelectedTransactionId(null)}
          transactionData={{
            ...transactionDetails,
            transactionStatus: transactionDetails.transactionStatus as
              | 'SUCCESSFUL'
              | 'PENDING'
              | 'FAILED',
            transactionType: transactionDetails.transactionType as
              | 'WITHDRAWAL'
              | 'FUNDING',
          }}
        />
      )}
    </>
  );
};

export default TransactionTable;
