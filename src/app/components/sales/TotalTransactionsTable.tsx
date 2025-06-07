'use client';

import React, { useState } from 'react';
import { Search, ListFilter, AlertCircle } from 'lucide-react';
import classNames from 'classnames';
import CustomImage from '@/app/components/CustomImage';
import { motion } from 'framer-motion';
import Pagination from '../leaderboard/Pagination';
import { useSelector } from 'react-redux';
import { selectSales, StoreTransaction } from '@/app/store/salesSlice';

const TotalTransactionsTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const { salesData, isLoading: isSalesLoading } = useSelector(selectSales);
  const totalTransactions: StoreTransaction[] =
    salesData?.storeTransactions ?? [];

  const itemsPerPage = 7;

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Successful':
        return 'bg-[#D4F9E4] text-[#006E2D]';
      case 'Pending':
        return 'bg-[#FFF8DB] text-[#A16207]';
      default:
        return '';
    }
  };

  const rowVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    hover: { scale: 1.01, y: -2 },
  };

  const rowTransition = {
    duration: 0.5,
    hover: {
      duration: 0.2,
    },
  };

  const totalPages = Math.ceil(totalTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = totalTransactions.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center px-4 py-12">
      <div className="mb-4 rounded-full bg-gray-50 p-4">
        <AlertCircle className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="mb-1 text-lg font-medium text-gray-900">
        No Transactions Found
      </h3>
      <p className="max-w-sm text-center text-sm text-gray-500">
        There are no transactions to display at the moment. Check back later for
        updates.
      </p>
    </div>
  );

  return (
    <div className="w-full rounded-2xl bg-white ">
      <div className="mb-6 flex flex-col justify-between border-b border-b-[#D9D9D9] p-4 pb-4 sm:flex-row sm:items-center sm:p-8">
        <h2 className="text-xl font-bold text-[#3B3B3B] sm:text-2xl">
          Total Transactions
        </h2>
        <div className="mt-4 flex items-center gap-4 sm:mt-0">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              className="focus:ring-primary-900 w-full rounded-md border border-[#D9D9D9] py-2 pl-10 pr-4 outline-none focus:ring-0 "
            />
          </div>
          <button className="flex cursor-pointer items-center gap-1 rounded-md border border-[#D9D9D9] px-4 py-2 outline-none">
            <ListFilter className="size-5 text-[#1B212D]" />
            <span className="hidden md:block">Filter by</span>
          </button>
        </div>
      </div>

      <div className="overflow-hidden overflow-x-auto rounded-lg bg-white">
        {isSalesLoading ? (
          <table className="min-w-full">
            <thead className="bg-gray-50 p-4 sm:p-8">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Transaction ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Username
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Transaction Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Transaction Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white p-4 sm:p-8">
              {Array.from({ length: itemsPerPage }).map((_, index) => (
                <tr key={index} className="animate-pulse">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-1">
                      <div className="size-10 rounded-full bg-gray-200"></div>
                      <div className="flex flex-col gap-2">
                        <div className="h-4 w-24 rounded bg-gray-200"></div>
                        <div className="h-3 w-32 rounded bg-gray-200"></div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">
                      <div className="size-10 rounded-full bg-gray-200"></div>
                      <div className="ml-4 h-4 w-20 rounded bg-gray-200"></div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="h-4 w-32 rounded bg-gray-200"></div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="h-4 w-20 rounded bg-gray-200"></div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="h-6 w-24 rounded-full bg-gray-200"></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : totalTransactions.length === 0 ? (
          <EmptyState />
        ) : (
          <table className="min-w-full">
            <thead className="bg-gray-50 p-4 sm:p-8">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Transaction ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Username
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Transaction Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Transaction Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white p-4 sm:p-8">
              {currentData.map((transaction, index) => (
                <motion.tr
                  key={transaction.objectId || index}
                  variants={rowVariants}
                  initial="initial"
                  animate="animate"
                  whileHover="hover"
                  transition={rowTransition}
                  className="cursor-pointer"
                >
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className=" flex items-center gap-1">
                      <div className=" size-10 rounded-full bg-[#F9F9F9] p-3">
                        <CustomImage alt="" src={'/icons/down.svg'} />
                      </div>
                      <div className=" flex flex-col">
                        <div className="text-sm font-medium text-gray-900">
                          {transaction.objectId}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(transaction.createdAt.iso).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <CustomImage
                          className="h-10 w-10 rounded-full"
                          src={transaction.avatar}
                          alt={`${transaction.firstName}'s avatar`}
                          width={40}
                          height={40}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-primary-900 text-sm font-medium">
                          {transaction.firstName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {transaction.product.productName}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm text-gray-900">
                      ₦{transaction.amount.toFixed(2)}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={classNames(
                        'inline-flex rounded-full px-2 text-xs font-semibold leading-5',
                        getStatusClass(transaction.status),
                      )}
                    >
                      {transaction.status}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!isSalesLoading && totalTransactions.length > 0 && (
        <div className="mt-4 flex flex-col items-center gap-4 p-4 p-4 sm:p-8 md:flex-row md:justify-between">
          <div className="text-sm text-gray-500">
            Showing data {startIndex + 1} to{' '}
            {Math.min(endIndex, totalTransactions.length)} of{' '}
            {totalTransactions.length} entries
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default TotalTransactionsTable;
