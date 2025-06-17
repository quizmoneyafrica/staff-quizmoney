'use client';
import React, { useState } from 'react';
import { ListFilter } from 'lucide-react';
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
              {exampleData.map((row, index) => (
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

      {/* Transaction Details Popup */}
      <TransactionDetailsModal
        isOpen={showDetailsPopup}
        onClose={handleClosePopup}
        transactionData={selectedTransaction}
      />
    </div>
  );
}
