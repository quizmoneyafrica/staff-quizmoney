'use client';
import React, { useState } from 'react';
import { Search, ListFilter, MoreVertical } from 'lucide-react';
import classNames from 'classnames';
import Pagination from '../leaderboard/Pagination';
import { motion } from 'framer-motion';
import CustomImage from '@/app/components/CustomImage';
import TransactionDetailsModal from './TransactionDetailsModal';

const TransactionTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any

  const exampleData = [
    {
      id: 'ID1234567',
      date: '21/02/2024 09:00',
      username: 'Joemicky',
      avatarUrl: 'https://github.com/shadcn.png',
      transactionType: 'Withdrawal',
      transactionAmount: '₦50,000',
      transactionStatus: 'Successful',
    },
    {
      id: 'ID1234567',
      date: '21/02/2024 09:00',
      username: 'Inioluwa',
      avatarUrl: 'https://github.com/shadcn.png',
      transactionType: 'Deposit',
      transactionAmount: '₦50,000',
      transactionStatus: 'Failed',
    },
    {
      id: 'ID1234567',
      date: '21/02/2024 09:00',
      username: 'Hanax',
      avatarUrl: 'https://github.com/shadcn.png',
      transactionType: 'Deposit',
      transactionAmount: '₦50,000',
      transactionStatus: 'Successful',
    },
    {
      id: 'ID1234567',
      date: '21/02/2024 09:00',
      username: 'Joemicky',
      avatarUrl: 'https://github.com/shadcn.png',
      transactionType: 'Withdrawal',
      transactionAmount: '₦50,000',
      transactionStatus: 'Pending',
    },
    {
      id: 'ID1234567',
      date: '21/02/2024 09:00',
      username: 'Joemicky',
      avatarUrl: 'https://github.com/shadcn.png',
      transactionType: 'Withdrawal',
      transactionAmount: '₦50,000',
      transactionStatus: 'Successful',
    },
  ];

  const totalPages = Math.ceil(exampleData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = exampleData.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
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

  return (
    <div className="">
      <div className="mb-4 flex flex-col items-start justify-between gap-4 rounded-md bg-white px-5 py-5 md:flex-row md:items-center">
        <div className="flex items-center gap-4 ">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              className="focus:ring-primary-900 w-full rounded-md border border-[#D9D9D9] py-2 pl-10 pr-4 outline-none focus:ring-0 "
            />
          </div>
          <button className="flex cursor-pointer items-center gap-1 rounded-md border border-[#D9D9D9] px-4  py-2 outline-none">
            <ListFilter className=" size-5 text-[#1B212D]" />
            <span className=" hidden md:block  ">Filter by</span>
          </button>
        </div>
      </div>

      <div className="overflow-hidden  overflow-x-auto rounded-lg bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Transaction ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Users
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Transaction Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Transaction Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Transaction Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {currentData.map((transaction, index) => (
              <motion.tr
                key={index} // Using index as key for example data, ideally use a unique id
                variants={rowVariants}
                initial="initial"
                animate="animate"
                whileHover="hover"
                transition={rowTransition}
                className="cursor-pointer"
              >
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {transaction.id}
                  </div>
                  <div className="text-sm text-gray-500">
                    {transaction.date}
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      <CustomImage
                        className="h-10 w-10 rounded-full"
                        src={transaction.avatarUrl}
                        alt={`${transaction.username}'s avatar`}
                        width={40}
                        height={40}
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-primary-900 text-sm font-medium">
                        {transaction.username}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {transaction.transactionType}
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {transaction.transactionAmount}
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span
                    className={classNames(
                      'inline-flex rounded-full px-2 text-xs font-semibold leading-5',
                      getStatusClass(transaction.transactionStatus),
                    )}
                  >
                    {transaction.transactionStatus}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                  <MoreVertical
                    className="cursor-pointer text-gray-500"
                    onClick={() => {
                      setSelectedTransaction(transaction);
                      setIsModalOpen(true);
                    }}
                  />
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-col items-center gap-4 p-4 md:flex-row md:justify-between">
        <div className="text-sm text-gray-500">
          Showing data {startIndex + 1} to{' '}
          {Math.min(endIndex, exampleData.length)} of {exampleData.length}{' '}
          entries
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
    </div>
  );
};

export default TransactionTable;
