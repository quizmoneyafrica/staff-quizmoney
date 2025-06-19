'use client';
import React, { useState } from 'react';
import { ListFilter, ChevronLeft, ChevronRight } from 'lucide-react';
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
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const generatePageNumbers = () => {
    const pages = [];
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

export default function PlayerTransactionHistory() {
  const exampleData: Transaction[] = [
    {
      id: 1,
      transactionId: 'ID1234567',
      transactionType: 'Wallet Top up',
      amount: '₦12,000',
      dateTime: 'Feb 12 09:00am',
      action: 'View Details',
      type: 'credit',
    },
    {
      id: 2,
      transactionId: 'ID1234567',
      transactionType: 'Withdraw request',
      amount: '- ₦12,000',
      dateTime: 'Feb 12 09:00am',
      action: 'View Details',
      type: 'debit',
    },
  ];

  const [showDetailsPopup, setShowDetailsPopup] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(exampleData.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = exampleData.slice(startIndex, endIndex);

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
              placeholder="Search"
              className=" focus:ring-primary-900 w-full rounded-md border-none py-2 pl-10 pr-4 outline-none focus:ring-0"
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
          <button className="flex cursor-pointer items-center gap-1 rounded-md border border-[#F5F5F5] px-4 py-2 outline-none">
            <ListFilter className="size-5 text-[#1B212D]" />
            <span className="hidden md:block">Filter by</span>
          </button>
        </div>
      </div>
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
                  className="w-[150px] px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  data-aos="fade-up"
                  data-aos-delay="600"
                >
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {currentItems.map((row, index) => (
                <tr
                  key={row.id}
                  data-aos="fade-up"
                  data-aos-delay={700 + index * 100}
                >
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-2">
                      {row.type === 'credit' ? (
                        <CustomImage
                          src={'/icons/suc.svg'}
                          alt="success"
                          className="size-5"
                        />
                      ) : (
                        <CustomImage
                          src={'/icons/fail.svg'}
                          alt="success"
                          className="size-5"
                        />
                      )}
                      {row.transactionId}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {row.transactionType}
                  </td>
                  <td
                    className={`whitespace-nowrap px-6 py-4 ${
                      row.type === 'credit' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {row.amount}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {row.dateTime}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <button
                      className="bg-primary-900 hover:bg-primary-500 cursor-pointer rounded-3xl p-2 text-white"
                      onClick={() => handleViewDetails(row)}
                    >
                      {row.action}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      {/* Transaction Details Popup */}
      <TransactionDetailsModal
        isOpen={showDetailsPopup}
        onClose={handleClosePopup}
        transactionData={selectedTransaction}
      />
    </div>
  );
}
