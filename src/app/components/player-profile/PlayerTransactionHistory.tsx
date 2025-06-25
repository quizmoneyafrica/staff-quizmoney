/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';
import React, { useState } from 'react';
import { ListFilter, ChevronLeft, ChevronRight } from 'lucide-react';
import { usePlayerTransactions } from '@/app/hooks/usePlayerProfile';
import CustomImage from '../CustomImage';
import TransactionDetailsModal from '../modal/TransactionDetailsModal';

interface Transaction {
  id: number;
  transactionId: string;
  transactionType: string;
  amount: string;
  dateTime: string;
  action: string;
  type: string;
  status?: string;
  date?: string;
  description?: string;
  [key: string]: unknown;
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

interface PlayerTransactionHistoryProps {
  userId: string;
  transactionData?: {
    data: Transaction[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
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
  const [filterType, setFilterType] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('completed');

  const transactionLimit = 10;

  const {
    data: transactionResponse,
    isLoading,
    error,
    refetch,
  } = usePlayerTransactions(userId, {
    page: currentPage,
    limit: transactionLimit,
    type: filterType || undefined,
    status: filterStatus || undefined,

    // dateRange: {
    //   start: '2025-05-13',
    //   end: '2025-06-09'
    // }
  });

  // Use the response from the new hook or fallback to prop data
  const transactions = transactionData || transactionResponse?.transactions;
  const currentItems = transactions?.data || [];
  const totalPages = transactions?.pagination?.totalPages || 1;
  const currentPageFromAPI = transactions?.pagination?.currentPage || 1;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleViewDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailsPopup(true);
  };

  const handleClosePopup = () => {
    setShowDetailsPopup(false);
    setSelectedTransaction(null);
  };

  const handleSearch = (e: React.FormEvent | React.KeyboardEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    refetch();
  };

  const formatAmount = (amount?: number, type?: string) => {
    if (!amount) return '₦0';
    const formattedAmount = new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);

    return type === 'debit' || type === 'withdrawal'
      ? `- ${formattedAmount}`
      : formattedAmount;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getTransactionIcon = (type?: string, status?: string) => {
    if (status === 'failed' || status === 'cancelled') {
      return '/icons/fail.svg';
    }
    if (type === 'credit' || type === 'deposit' || status === 'completed') {
      return '/icons/suc.svg';
    }
    return '/icons/fail.svg';
  };

  const getAmountColor = (type?: string, status?: string) => {
    if (status === 'failed' || status === 'cancelled') {
      return 'text-red-600';
    }
    if (type === 'credit' || type === 'deposit') {
      return 'text-green-600';
    }
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="w-full" data-aos="fade-up" data-aos-duration="800">
        <div className="mb-4 flex items-center justify-between rounded-md bg-white px-5 py-5">
          <h2 className="font-bold">Transaction History</h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading transactions...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full" data-aos="fade-up" data-aos-duration="800">
        <div className="mb-4 flex items-center justify-between rounded-md bg-white px-5 py-5">
          <h2 className="font-bold">Transaction History</h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-red-500">
            Error loading transactions. Please try again.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full" data-aos="fade-up" data-aos-duration="800">
      <div
        className="mb-4 flex items-center justify-between rounded-md bg-white px-5 py-5"
        data-aos="fade-up"
        data-aos-delay="100"
      >
        <h2 className="font-bold">Transaction History</h2>
        <div className="flex items-center gap-2 md:gap-5">
          <div className="relative w-full rounded-md border border-[#F5F5F5] focus:border-[#F5F5F5] md:w-fit">
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
              className="focus:ring-primary-900 w-full rounded-md border-none py-2 pl-10 pr-4 outline-none focus:ring-0"
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

          {/* <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-md border border-[#F5F5F5] px-2 py-2 text-sm outline-none"
            >
              <option value="">All Types</option>
              <option value="deposit">Deposit</option>
              <option value="withdrawal">Withdrawal</option>
              <option value="bonus">Bonus</option>
              <option value="refund">Refund</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-md border border-[#F5F5F5] px-2 py-2 text-sm outline-none"
            >
              <option value="">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div> */}

          <button className="flex cursor-pointer items-center gap-1 rounded-md border border-[#F5F5F5] px-4 py-2 outline-none">
            <ListFilter className="size-5 text-[#1B212D]" />
            <span className="hidden md:block">Filter by</span>
          </button>
        </div>
      </div>

      {currentItems.length === 0 ? (
        <div className="flex items-center justify-center rounded-lg bg-white py-12">
          <div className="text-gray-500">No transactions found.</div>
        </div>
      ) : (
        <>
          <div className="w-full overflow-x-auto rounded-lg">
            <div className="min-w-[900px]">
              <table className="w-full">
                <thead className="bg-inherit">
                  <tr>
                    <th
                      className="w-[200px] px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                      data-aos="fade-up"
                      data-aos-delay="200"
                    >
                      Transaction ID
                    </th>
                    <th
                      className="w-[200px] px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
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
                      className="w-[200px] px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                      data-aos="fade-up"
                      data-aos-delay="500"
                    >
                      Date & Time
                    </th>
                    <th
                      className="w-[100px] px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                      data-aos="fade-up"
                      data-aos-delay="550"
                    >
                      Status
                    </th>
                    <th
                      className="w-[150px] px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                      data-aos="fade-up"
                      data-aos-delay="600"
                    >
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {currentItems.map((transaction, index) => (
                    <tr
                      key={transaction.transactionId || index}
                      data-aos="fade-up"
                      data-aos-delay={700 + index * 100}
                    >
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-2">
                          <CustomImage
                            src={getTransactionIcon(
                              transaction.type,
                              transaction.status,
                            )}
                            alt="transaction status"
                            className="size-5"
                          />
                          {transaction.transactionId || 'N/A'}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {transaction.description || transaction.type || 'N/A'}
                      </td>
                      <td
                        className={`whitespace-nowrap px-6 py-4 font-medium ${getAmountColor(
                          transaction.type,
                          transaction.status,
                        )}`}
                      >
                        {formatAmount(transaction.amount, transaction.type)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {formatDate(transaction.date)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            transaction.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : transaction.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : transaction.status === 'failed'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {transaction.status || 'Unknown'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <button
                          className="bg-primary-900 hover:bg-primary-500 cursor-pointer rounded-3xl px-4 py-2 text-sm text-white"
                          onClick={() => handleViewDetails(transaction)}
                        >
                          View Details
                        </button>
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

      {/* Transaction Details Popup */}
      <TransactionDetailsModal
        isOpen={showDetailsPopup}
        onClose={handleClosePopup}
        transactionData={selectedTransaction}
      />
    </div>
  );
}
