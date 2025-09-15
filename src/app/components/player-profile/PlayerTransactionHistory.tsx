/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';
import React, { useState, useMemo } from 'react';
import {
  ListFilter,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { useWalletTransactions } from '@/app/hooks/usePlayerProfile';
import CustomImage from '../CustomImage';
import TransactionDetailsModal from '../modal/TransactionDetailsModal';
import { useRef, useEffect, useCallback } from 'react';
import TimeRangeDropdown from '../common/TimeRangeDropdown';
import { calculateDateRange } from '@/app/utils/date-range';
import { serializeDateRange, isValidDateRange } from '@/app/utils/dateUtils';
import { Transaction, TransactionResponse } from '@/app/types/transaction';
import WalletDashboard from './WalletDashboardCards';

import { DepositGreenIcon, DebitRedIcon } from '@/app/icons/icons';

const getTransactionId = (transaction: Transaction) => {
  return transaction.transactionId || transaction.id || 'N/A';
};

const getTransactionType = (transaction: Transaction) => {
  return transaction.transactionType || transaction.type || 'N/A';
};

const formatDate = (transaction: Transaction) => {
  let date: Date | null = null;

  if (transaction.transactionDate) {
    date = new Date(transaction.transactionDate);
  } else if (transaction.createdAt?.iso) {
    date = new Date(transaction.createdAt.iso);
  } else if (transaction.dateTime) {
    date = new Date(transaction.dateTime);
  } else if (transaction.date) {
    date = new Date(transaction.date);
  }

  if (date) {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  return 'N/A';
};

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

interface PlayerTransactionHistoryProps {
  userId: string;
  transactionData?: TransactionResponse;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const generatePageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(
          1,
          '...',
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages,
        );
      } else {
        pages.push(
          1,
          '...',
          currentPage - 1,
          currentPage,
          currentPage + 1,
          '...',
          totalPages,
        );
      }
    }

    return pages;
  };

  return (
    <div className="mt-6 flex items-center justify-center gap-2 md:justify-end">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`rounded-lg p-2 ${
          currentPage === 1
            ? 'cursor-not-allowed bg-gray-100 text-gray-400'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <div className="flex gap-2">
        {generatePageNumbers().map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className="px-3 py-2 text-gray-500">...</span>
            ) : (
              <button
                onClick={() => onPageChange(page as number)}
                className={`rounded-lg px-4 py-2 font-medium ${
                  currentPage === page
                    ? 'bg-primary-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`rounded-lg p-2 ${
          currentPage === totalPages
            ? 'cursor-not-allowed bg-gray-100 text-gray-400'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
};

export default function PlayerTransactionHistory({
  userId,
  transactionData,
}: PlayerTransactionHistoryProps) {
  const [showDetailsPopup, setShowDetailsPopup] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [selectedTimeRange, setSelectedTimeRange] =
    useState<string>('All Time');
  const [customDateRange, setCustomDateRange] = useState<{
    start: string;
    end: string;
  } | null>(null);

  const filterDropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const transactionLimit = 10;

  const getApiFilterStatus = (filter: string) => {
    return filter === 'All' ? undefined : filter.toLowerCase();
  };

  const dateRange = useMemo(() => {
    if (selectedTimeRange === 'Custom' && customDateRange) {
      return customDateRange;
    }

    if (selectedTimeRange !== 'All Time') {
      return calculateDateRange(selectedTimeRange, null);
    }

    return null;
  }, [selectedTimeRange, customDateRange]);

  const {
    data: walletTransactionsResponse,
    isLoading,
    error,
    refetch,
  } = useWalletTransactions(
    userId,
    {
      page: currentPage - 1,
      size: transactionLimit,
      status: getApiFilterStatus(selectedFilter) as any,
      search: searchTerm.trim() || undefined,
      'start-date': dateRange?.start,
      'end-date': dateRange?.end,
    },
    {
      enabled: !!userId,
    },
  );

  const transactions = useMemo<TransactionResponse | null>(() => {
    if (!walletTransactionsResponse || !walletTransactionsResponse.content) {
      return {
        data: [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalCount: 0,
          hasNext: false,
          hasPrev: false,
        },
      };
    }

    return {
      data: (walletTransactionsResponse.content || []).map((tx) => ({
        ...tx,
        id: tx.id,
        transactionId: tx.id,
        transactionDate: tx.transactionDate,
        transactionType: tx.transactionType,
        transactionStatus: tx.transactionStatus,
        type: tx.transactionType || 'UNKNOWN',
        status: tx.transactionStatus || 'PENDING',
        description: tx.narration || '',
        amount: tx.amount * (tx.direction === 'DEBIT' ? -1 : 1),
      })),
      pagination: {
        currentPage: (walletTransactionsResponse.pageNo || 0) + 1,
        totalPages: walletTransactionsResponse.totalPages || 1,
        totalCount: walletTransactionsResponse.totalElements || 0,
        hasNext: !walletTransactionsResponse.last,
        hasPrev: (walletTransactionsResponse.pageNo || 0) > 0,
      },
    };
  }, [walletTransactionsResponse]);

  const currentItems = transactions?.data || [];
  const totalPages = transactions?.pagination?.totalPages || 1;
  const currentPageFromAPI = transactions?.pagination?.currentPage || 1;

  const filteredItems = currentItems.filter((txn: Transaction) => {
    if (!searchTerm.trim()) return true;

    const search = searchTerm.trim().toLowerCase();
    const txnId = (txn.id || '').toLowerCase();
    const txnType = (txn.transactionType || txn.type || '').toLowerCase();
    const txnStatus = (txn.transactionStatus || txn.status || '').toLowerCase();
    const txnDescription = (
      txn.narration ||
      txn.description ||
      ''
    ).toLowerCase();
    const txnDate = formatDate(txn).toLowerCase();

    return (
      txnId.includes(search) ||
      txnType.includes(search) ||
      txnStatus.includes(search) ||
      txnDescription.includes(search) ||
      txnDate.includes(search)
    );
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(event.target as Node)
      ) {
        setIsFilterOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedFilter, searchTerm, selectedTimeRange, dateRange]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleViewDetails = (transaction: Transaction) => {
    const formattedTransaction: Transaction = {
      ...transaction,
      type: transaction.transactionType || transaction.type || '',
      status: transaction.transactionStatus || transaction.status || '',
      description: transaction.narration || transaction.description || '',
    };
    setSelectedTransaction(formattedTransaction);
    setShowDetailsPopup(true);
  };

  const handleClosePopup = () => {
    setShowDetailsPopup(false);
    setSelectedTransaction(null);
  };

  const debouncedSearch = useCallback(
    debounce((searchValue: string) => {
      setCurrentPage(1);
    }, 300),
    [],
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number,
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  useEffect(() => {
    if (
      searchTerm &&
      searchInputRef.current &&
      document.activeElement !== searchInputRef.current
    ) {
      const shouldRefocus =
        searchInputRef.current.dataset.wasFocused === 'true';
      if (shouldRefocus) {
        searchInputRef.current.focus();

        const length = searchInputRef.current.value.length;
        searchInputRef.current.setSelectionRange(length, length);
      }
    }
  }, [filteredItems, searchTerm]);

  const handleSearchFocus = () => {
    if (searchInputRef.current) {
      searchInputRef.current.dataset.wasFocused = 'true';
    }
  };

  const handleSearchBlur = () => {
    if (searchInputRef.current) {
      searchInputRef.current.dataset.wasFocused = 'false';
    }
  };

  const handleFilterSelect = (status: string) => {
    setSelectedFilter(status);
    setIsFilterOpen(false);
    setCurrentPage(1);
  };

  const handleTimeRangeSelect = (option: string) => {
    setSelectedTimeRange(option);
    setCurrentPage(1);

    if (option !== 'Custom') {
      setCustomDateRange(null);
    }
  };

  const handleCustomDateChange = (
    dateRange: { startDate: Date; endDate: Date } | null,
  ) => {
    if (!dateRange) {
      setCustomDateRange(null);
      return;
    }

    const standardFormat = {
      start: dateRange.startDate.toISOString(),
      end: dateRange.endDate.toISOString(),
    };

    if (isValidDateRange(standardFormat)) {
      const serializedRange = serializeDateRange(standardFormat);
      setCustomDateRange(serializedRange);
    } else {
      console.error('Invalid date range received:', dateRange);
      setCustomDateRange(null);
    }

    setCurrentPage(1);
  };

  const formatAmount = (amount?: number, direction?: string) => {
    if (amount === undefined) return '₦0';
    const formattedAmount = new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(Math.abs(amount));

    return direction === 'DEBIT' ? `- ${formattedAmount}` : formattedAmount;
  };

  const getTransactionIcon = (direction?: string, status?: string) => {
    if (status === 'FAILED' || status === 'CANCELLED') {
      return (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
          <svg
            className="h-7 w-7 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
      );
    }

    if (direction === 'CREDIT' || status === 'COMPLETED') {
      return (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E7FEED]">
          <DepositGreenIcon className="h-7 w-7" />
        </div>
      );
    }

    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
        <DebitRedIcon className="h-7 w-7" />
      </div>
    );
  };

  const getAmountColor = (direction?: string, status?: string) => {
    if (status === 'FAILED' || status === 'CANCELLED') {
      return 'text-red-600';
    }
    return direction === 'CREDIT' ? 'text-green-600' : 'text-red-600';
  };

  const timeRangeOptions = ['All Time', 'This week', 'Last 30 days', 'Custom'];

  const customDateRangeForDropdown = customDateRange
    ? {
        startDate: new Date(customDateRange.start),
        endDate: new Date(customDateRange.end),
      }
    : null;

  return (
    <div className="w-full" data-aos="fade-up" data-aos-duration="800">
      {/* Wallet Dashboard */}
      <div className=" bg-white">
        <WalletDashboard />
      </div>

      <div
        className="mb-4 flex items-center justify-between rounded-md bg-white px-5 py-5"
        data-aos="fade-up"
        data-aos-delay="100"
      >
        <h2 className="font-bold">Transaction History</h2>
        <div className="flex items-center gap-2 md:gap-3">
          {/* Search Input */}
          <div className="relative w-full rounded-md border border-[#F5F5F5] focus:border-[#F5F5F5] md:w-fit">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              className="focus:ring-primary-900 w-full rounded-md border-none py-2 pl-10 pr-4 outline-none focus:ring-0"
              disabled={isLoading}
            />
            <svg
              className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          <div className="relative" ref={filterDropdownRef}>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center gap-1 whitespace-nowrap rounded-md border border-[#D9D9D9] px-4 py-2 outline-none transition-colors hover:bg-gray-50 ${
                isLoading ? 'cursor-not-allowed opacity-50' : ''
              }`}
              disabled={isLoading}
            >
              <ListFilter className="size-5 text-[#1B212D]" />
              <span className="hidden md:block">
                {selectedFilter === 'All' ? 'Filter by' : selectedFilter}
              </span>
              <ChevronDown
                className={`size-4 text-[#1B212D] transition-transform ${
                  isFilterOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isFilterOpen && (
              <div className="absolute right-0 z-10 mt-2 w-48 rounded-md border border-[#D9D9D9] bg-white shadow-lg">
                <ul className="py-1">
                  {['All', 'completed', 'pending', 'failed'].map((status) => (
                    <li key={status}>
                      <button
                        className={`w-full px-4 py-2 text-left text-sm capitalize hover:bg-gray-100 ${
                          selectedFilter === status
                            ? 'bg-gray-100 font-semibold'
                            : ''
                        } ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}
                        onClick={() => handleFilterSelect(status)}
                        disabled={isLoading}
                      >
                        {status}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <TimeRangeDropdown
            options={timeRangeOptions}
            selected={selectedTimeRange}
            onSelect={handleTimeRangeSelect}
            customDateRange={customDateRangeForDropdown}
            onCustomDateChange={handleCustomDateChange}
          />
        </div>
      </div>

      {error && (
        <div className="flex items-center justify-center rounded-lg bg-white py-12">
          <div className="text-red-500">
            Error loading transactions. Please try again.
          </div>
        </div>
      )}

      {!error && (
        <>
          {isLoading ? (
            <div className="flex items-center justify-center rounded-lg bg-white py-12">
              <div className="flex items-center gap-2 text-gray-500">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                Loading transactions...
              </div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex items-center justify-center rounded-lg bg-white py-12">
              <div className="text-gray-500">No transactions found.</div>
            </div>
          ) : (
            <>
              <div className="w-full overflow-x-auto rounded-lg border border-gray-200">
                <div className="w-full">
                  <table className="w-full table-auto text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          className="w-[200px] px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                          data-aos="fade-up"
                          data-aos-delay="200"
                        >
                          Transaction ID
                        </th>
                        <th
                          className="w-[150px] px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                          data-aos="fade-up"
                          data-aos-delay="300"
                        >
                          Transaction Type
                        </th>
                        <th
                          className="w-[150px] px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                          data-aos="fade-up"
                          data-aos-delay="400"
                        >
                          Amount
                        </th>
                        <th
                          className="w-[180px] px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                          data-aos="fade-up"
                          data-aos-delay="500"
                        >
                          Date & Time
                        </th>
                        {/* <th
                          className="w-[100px] px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                          data-aos="fade-up"
                          data-aos-delay="550"
                        >
                          Status
                        </th> */}
                        <th
                          className="w-[120px] px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                          data-aos="fade-up"
                          data-aos-delay="600"
                        >
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="w-full divide-y divide-gray-200 bg-white text-sm">
                      {filteredItems.map((transaction, index) => (
                        <tr
                          key={transaction.id || index}
                          data-aos="fade-up"
                          data-aos-delay={700 + index * 100}
                          className="w-full border-b border-gray-200"
                        >
                          <td className="whitespace-nowrap px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-2">
                                {getTransactionIcon(
                                  transaction.direction,
                                  transaction.status,
                                )}
                                <span className="text-gray-900">
                                  {getTransactionId(transaction)}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            {getTransactionType(transaction)}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <div className="flex items-center">
                              <div
                                className={`flex items-center gap-1 font-medium ${getAmountColor(
                                  transaction.direction,
                                  transaction.status,
                                )}`}
                              >
                                {formatAmount(
                                  transaction.amount,
                                  transaction.direction,
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            {formatDate(transaction)}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <div className="flex justify-end md:block">
                              <button
                                className="bg-primary-900 hover:bg-primary-500 mt-2 w-full cursor-pointer rounded-3xl px-4 py-2 text-sm text-white md:mt-0 md:w-auto"
                                onClick={() => handleViewDetails(transaction)}
                              >
                                View Details
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <Pagination
                currentPage={currentPageFromAPI}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </>
      )}

      {/* Transaction Details Popup */}
      <TransactionDetailsModal
        isOpen={showDetailsPopup}
        onClose={handleClosePopup}
        transactionData={selectedTransaction}
      />
    </div>
  );
}
