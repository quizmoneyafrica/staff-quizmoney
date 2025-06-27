'use client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@radix-ui/react-dropdown-menu';
import { CaretSortIcon, DotsVerticalIcon } from '@radix-ui/react-icons';
import { Avatar, Table } from '@radix-ui/themes';
import React, { useState, useEffect, useMemo } from 'react';
import { Search, ListFilter, Loader2 } from 'lucide-react';
import { calculateDateRange } from '@/app/utils/date-range';
import Pagination from '../leaderboard/Pagination';
import TransactionDetailsModal from './TransactionDetailsModal';
import { useGetAllTransactionsWithStats } from '@/app/hooks/useTransaction';
import TimeRangeDropdown from '@/app/components/common/TimeRangeDropdown';
import { formatDateTime } from '@/app/utils/utils';
import { useDebounce } from '@/app/hooks/useDebounce';

interface TransactionStats {
  totalWalletBalance: number;
  totalSuccessfulTransactions: number;
  totalFailedTransactions: number;
  totalPendingTransactions: number;
}

interface RawTransaction {
  id: string;
  createdAt: { iso: string } | string;
  user?: {
    name?: string;
    avatar?: string;
  };
  type?: string;
  amount: number | string;
  status: string;
}

interface StaticTransactionData {
  id: string;
  createdAt: string;
  date: string;
  time: string;
  username: string;
  avatarUrl: string;
  transactionType: string;
  transactionAmount: string;
  transactionStatus: 'Pending' | 'Successful' | 'Failed';
}

interface PaginationData {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
}

interface ApiResponse {
  transactions: RawTransaction[];
  stats: TransactionStats;
  pagination: PaginationData;
}

interface TransactionTableProps {
  data?: StaticTransactionData[];
  onStatsUpdate?: (stats: TransactionStats) => void;
}

const formatStatus = (status: string): 'Pending' | 'Successful' | 'Failed' => {
  switch (status?.toLowerCase()) {
    case 'completed':
    case 'successful':
      return 'Successful';
    case 'pending':
      return 'Pending';
    case 'failed':
    default:
      return 'Failed';
  }
};

const transformTransaction = (tx: RawTransaction): StaticTransactionData => {
  const createdAtString =
    typeof tx.createdAt === 'string' ? tx.createdAt : tx.createdAt.iso;
  const { time, fullDate } = formatDateTime(createdAtString);

  return {
    id: tx.id,
    createdAt: createdAtString,
    date: fullDate,
    time: time,
    username: tx.user?.name || 'Unknown',
    avatarUrl: tx.user?.avatar || '',
    transactionType: tx.type || 'N/A',
    transactionAmount: `₦${Number(tx.amount).toLocaleString()}`,
    transactionStatus: formatStatus(tx.status),
  };
};

const TransactionTable: React.FC<TransactionTableProps> = ({
  data,
  onStatsUpdate,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<StaticTransactionData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'All' | 'Successful' | 'Pending' | 'Failed'
  >('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortableTransactionKeys | ''>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const [selected, setSelected] = useState('This week');
  const [customDateRange, setCustomDateRange] = useState(null);

  const debouncedSearchTerm = useDebounce(searchTerm);
  const itemsPerPage = 10;

  type SortableTransactionKeys =
    | 'id'
    | 'username'
    | 'transactionAmount'
    | 'transactionType'
    | 'transactionStatus'
    | 'date';

  const {
    data: apiResponse,
    isLoading,
    error,
    refetch,
  } = useGetAllTransactionsWithStats(
    currentPage,
    itemsPerPage,
    undefined,
    debouncedSearchTerm || undefined,
    statusFilter !== 'All' ? statusFilter : undefined,
    calculateDateRange(selected, customDateRange),
    undefined,
  ) as {
    data: ApiResponse | undefined;
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
  };

  const transactions =
    apiResponse?.transactions?.map(transformTransaction) || [];
  const stats = apiResponse?.stats || null;

  const pagination = apiResponse?.pagination;
  const totalCount = pagination?.totalItems || 0;
  const totalPages = pagination?.totalPages || 1;

  useEffect(() => {
    if (stats && onStatsUpdate) {
      onStatsUpdate(stats);
    }
  }, [stats, onStatsUpdate]);

  const tableData = data || transactions;

  const handleFilterSelect = (
    status: 'All' | 'Successful' | 'Pending' | 'Failed',
  ) => {
    setStatusFilter(status);
    setIsFilterOpen(false);
    setCurrentPage(1);
  };

  const handleSort = (key: SortableTransactionKeys) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
  };

  const handleRowClick = (transaction: StaticTransactionData) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const options = ['This week', 'Last 30 days', 'Custom'];

  const handleSelect = (option) => {
    setSelected(option);
    setCurrentPage(1);

    if (option !== 'Custom') {
      setCustomDateRange(null);
    }
  };

  const handleCustomDateChange = (dateRange) => {
    setCustomDateRange(dateRange);
    setCurrentPage(1);
  };

  const sortedData = React.useMemo(() => {
    if (!sortBy || !tableData) return tableData;

    return [...tableData].sort((a, b) => {
      const order = sortOrder === 'asc' ? 1 : -1;
      const aValue = a[sortBy] as string;
      const bValue = b[sortBy] as string;

      if (aValue < bValue) return -1 * order;
      if (aValue > bValue) return 1 * order;
      return 0;
    });
  }, [tableData, sortBy, sortOrder]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isFilterOpen && !target.closest('.relative')) {
        setIsFilterOpen(false);
      }
    };

    if (isFilterOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFilterOpen]);

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Successful':
        return 'bg-[#D4F9E4] text-[#006E2D]';
      case 'Failed':
        return 'bg-[#FFEDED] text-[#E11C25]';
      case 'Pending':
        return 'bg-[#FFF8DB] text-[#A16207]';
      default:
        return '';
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
              placeholder="Search"
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
                <div className="absolute right-0 z-10 mt-2 w-48 rounded-md border border-gray-200 bg-white shadow-lg">
                  <div className="py-1">
                    {['All', 'Successful', 'Pending', 'Failed'].map(
                      (status) => (
                        <button
                          key={status}
                          onClick={() =>
                            handleFilterSelect(status as typeof statusFilter)
                          }
                          className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${
                            statusFilter === status ? 'bg-gray-50' : ''
                          }`}
                        >
                          {status} Status
                        </button>
                      ),
                    )}
                  </div>
                </div>
              )}
            </div>

            <TimeRangeDropdown
              options={options}
              selected={selected}
              onSelect={handleSelect}
              customDateRange={customDateRange}
              onCustomDateChange={handleCustomDateChange}
            />
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading transactions...</span>
          </div>
        )}
        {!isLoading && (
          <Table.Root
            variant="ghost"
            className="min-w-full border-collapse text-sm"
          >
            <Table.Header className="bg-primary-50">
              <Table.Row>
                <Th label="Transaction ID" onClick={() => handleSort('id')} />
                <Th label="Users" onClick={() => handleSort('username')} />
                <Th
                  label="Transaction Type"
                  onClick={() => handleSort('transactionType')}
                />
                <Th
                  label="Transaction Amount"
                  onClick={() => handleSort('transactionAmount')}
                />
                <Th
                  label="Transaction Status"
                  onClick={() => handleSort('transactionStatus')}
                />
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {sortedData && sortedData?.length > 0 ? (
                sortedData.map((item, index) => (
                  <Table.Row
                    key={item.id}
                    className="cursor-pointer border-b border-gray-100 hover:bg-gray-50"
                    onClick={() => handleRowClick(item)}
                  >
                    <Table.Cell className="whitespace-nowrap px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-[48px] w-[48px] items-center justify-center rounded-full bg-neutral-50">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </div>
                        <div>
                          <p className="font-heading font-bold uppercase text-neutral-800">
                            {item.id}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {item.date} • {item.time}
                          </p>
                        </div>
                      </div>
                    </Table.Cell>
                    <Table.Cell className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="bg-primary-50 flex h-[40px] w-[40px] items-center justify-center rounded-full p-1">
                          <Avatar
                            src={item.avatarUrl}
                            fallback={item.username?.charAt(0).toUpperCase()}
                            radius="full"
                            className="bg-primary-50"
                          />
                        </div>
                        <p className="text-primary-800 capitalize">
                          {item.username}
                        </p>
                      </div>
                    </Table.Cell>
                    <Table.Cell className="px-4 py-4 capitalize">
                      {item.transactionType}
                    </Table.Cell>
                    <Table.Cell className="px-4 py-4 font-semibold">
                      {item.transactionAmount}
                    </Table.Cell>
                    <Table.Cell className="px-4 py-4">
                      <p
                        className={`font-heading w-fit rounded-full px-4 py-2 text-center capitalize ${getStatusClass(
                          item.transactionStatus,
                        )}`}
                      >
                        {item.transactionStatus}
                      </p>
                    </Table.Cell>
                  </Table.Row>
                ))
              ) : (
                <Table.Row>
                  <Table.Cell
                    colSpan={6}
                    className="text-error-500 py-12 text-center font-bold"
                  >
                    No Transactions Found
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table.Root>
        )}
      </div>

      <div className="mt-4 flex flex-col items-center gap-4 p-4 md:flex-row md:justify-between">
        <div className="text-sm text-gray-500">
          Showing data {(currentPage - 1) * itemsPerPage + 1} to{' '}
          {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount}{' '}
          entries
          {selected !== 'This week' && ` (${selected})`}
          {statusFilter !== 'All' && ` • Filtered by ${statusFilter}`}
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      <TransactionDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        transactionData={selectedTransaction}
      />
    </>
  );
};

export default TransactionTable;

interface ThProps {
  label: string;
  onClick: () => void;
}

const Th: React.FC<ThProps> = ({ label, onClick }) => (
  <Table.Cell className="cursor-pointer px-4 py-2 text-left" onClick={onClick}>
    <div className="flex items-center gap-1">
      <span>{label}</span>
      <CaretSortIcon />
    </div>
  </Table.Cell>
);
