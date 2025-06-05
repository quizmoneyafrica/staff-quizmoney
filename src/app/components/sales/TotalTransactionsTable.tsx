'use client';

import React, { useState } from 'react';
import { Search, ListFilter } from 'lucide-react';
import classNames from 'classnames';
import CustomImage from '@/app/components/CustomImage';
import { motion } from 'framer-motion';
import Pagination from '../leaderboard/Pagination';

const TotalTransactionsTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const exampleData = [
    {
      id: 'ID1234567',
      date: '21/02/2024 09:00',
      username: 'Joemicky',
      avatarUrl: 'https://github.com/shadcn.png',
      transactionType: 'Purchase eraser',
      transactionAmount: '₦500.0',
      transactionStatus: 'Successful',
    },
    {
      id: 'ID1234567',
      date: '21/02/2024 09:00',
      username: 'Inioluwa',
      avatarUrl: 'https://github.com/shadcn.png',
      transactionType: 'Purchase eraser',
      transactionAmount: '₦500.0',
      transactionStatus: 'Pending',
    },
    {
      id: 'ID1234567',
      date: '21/02/2024 09:00',
      username: 'Joemicky',
      avatarUrl: 'https://github.com/shadcn.png',
      transactionType: 'Purchase eraser',
      transactionAmount: '₦100.0',
      transactionStatus: 'Successful',
    },
     {
      id: 'ID1234567',
      date: '21/02/2024 09:00',
      username: 'Joemicky',
      avatarUrl: 'https://github.com/shadcn.png',
      transactionType: 'Purchase eraser',
      transactionAmount: '₦500.0',
      transactionStatus: 'Pending',
    },
    {
      id: 'ID1234567',
      date: '21/02/2024 09:00',
      username: 'Hanax',
      avatarUrl: 'https://github.com/shadcn.png',
      transactionType: 'Purchase eraser',
      transactionAmount: '₦200.0',
      transactionStatus: 'Pending',
    },
     {
      id: 'ID1234567',
      date: '21/02/2024 09:00',
      username: 'Joemicky',
      avatarUrl: 'https://github.com/shadcn.png',
      transactionType: 'Purchase eraser',
      transactionAmount: '₦500.0',
      transactionStatus: 'Successful',
    },
     {
      id: 'ID1234567',
      date: '21/02/2024 09:00',
      username: 'Hanax',
      avatarUrl: 'https://github.com/shadcn.png',
      transactionType: 'Purchase eraser',
      transactionAmount: '₦500.0',
      transactionStatus: 'Pending',
    },
  ];

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
    hover: { scale: 1.01, y: -2 }
  };

  const rowTransition = {
    duration: 0.5,
    hover: {
      duration: 0.2
    }
  };

  const totalPages = Math.ceil(exampleData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = exampleData.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="bg-white rounded-2xl w-full ">
      <div className="flex flex-col sm:flex-row sm:items-center p-4 sm:p-8 justify-between mb-6 border-b border-b-[#D9D9D9] pb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-[#3B3B3B]">Total Transactions</h2>
        <div className="flex gap-4 items-center mt-4 sm:mt-0">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-10 pr-4 py-2 border rounded-md border-[#D9D9D9] outline-none focus:ring-primary-900 focus:ring-0 "
            />
          </div>
          <button className="flex cursor-pointer gap-1 items-center px-4 py-2 border rounded-md outline-none border-[#D9D9D9]">
            <ListFilter className='size-5 text-[#1B212D]' />
            <span className='md:block hidden'>Filter by</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg overflow-hidden  overflow-x-auto">
        <table className="min-w-full ">
          <thead className="bg-gray-50 p-4 sm:p-8">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 p-4 sm:p-8">
            {currentData.map((transaction, index) => (
              <motion.tr
                key={index}
                variants={rowVariants}
                initial="initial"
                animate="animate"
                whileHover="hover"
                transition={rowTransition}
                className='cursor-pointer'
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className=' flex items-center gap-1'>
                    <div className=' bg-[#F9F9F9] rounded-full size-10 p-3'>
                      <CustomImage alt='' src={'/icons/down.svg'}/>
                    </div>
                    <div className=' flex flex-col'>
                      <div className="text-sm font-medium text-gray-900">{transaction.id}</div>
                      <div className="text-sm text-gray-500">{transaction.date}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <CustomImage className="h-10 w-10 rounded-full" src={transaction.avatarUrl} alt={`${transaction.username}'s avatar`} width={40} height={40} />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-primary-900">{transaction.username}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{transaction.transactionType}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{transaction.transactionAmount}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={classNames("px-2 inline-flex text-xs leading-5 font-semibold rounded-full", getStatusClass(transaction.transactionStatus))}>
                    {transaction.transactionStatus}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex md:flex-row flex-col md:justify-between items-center mt-4 p-4 sm:p-8 gap-4 p-4">
        <div className="text-sm text-gray-500">
          Showing data {startIndex + 1} to {Math.min(endIndex, exampleData.length)} of {exampleData.length} entries
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

export default TotalTransactionsTable; 