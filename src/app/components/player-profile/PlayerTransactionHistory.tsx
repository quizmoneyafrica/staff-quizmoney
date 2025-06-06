'use client'
import React, { useState } from 'react'
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
      transactionId: "ID1234567",
      transactionType: "Wallet Top up",
      amount: "₦12,000",
      dateTime: "Feb 12 09:00am",
      action: "View Details",
      type: "credit"
    },
    {
      id: 2,
      transactionId: "ID1234567",
      transactionType: "Withdraw request",
      amount: "- ₦12,000",
      dateTime: "Feb 12 09:00am",
      action: "View Details",
      type: "debit"
    },
  ];

  const [showDetailsPopup, setShowDetailsPopup] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

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
      <div className="flex md:gap-5 gap-2 bg-white py-5 px-5 rounded-md items-center mb-4" data-aos="fade-up" data-aos-delay="100">
        <div className="relative w-full md:w-fit border rounded-md border-[#F5F5F5] focus:border-[#F5F5F5]">
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-10 pr-4 py-2 border-none rounded-md outline-none focus:ring-primary-900 focus:ring-0"
          />
          <svg
            className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2"
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
        <button className="flex cursor-pointer gap-1 items-center px-4 py-2 border rounded-md outline-none border-[#F5F5F5]">
          <ListFilter className='size-5 text-[#1B212D]' />
          <span className='md:block hidden'>Filter by</span>
        </button>
      </div>
      <div className="w-full overflow-x-auto rounded-lg">
        <div className="min-w-[900px]">
          <table className="w-full">
            <thead className="bg-inherit">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[200px]" data-aos="fade-up" data-aos-delay="200">Transaction ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[200px]" data-aos="fade-up" data-aos-delay="300">Transaction Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[150px]" data-aos="fade-up" data-aos-delay="400">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[200px]" data-aos="fade-up" data-aos-delay="500">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[150px]" data-aos="fade-up" data-aos-delay="600">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {exampleData.map((row, index) => (
                <tr key={row.id} data-aos="fade-up" data-aos-delay={700 + (index * 100)}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className='flex items-center gap-2'>
                      {row.type === 'credit' ? (
                        <CustomImage src={'/icons/suc.svg'} alt='success' className='size-5' />
                      ) : (
                        <CustomImage src={'/icons/fail.svg'} alt='success' className='size-5' />
                      )}
                      {row.transactionId}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{row.transactionType}</td>
                  <td className={`px-6 py-4 whitespace-nowrap ${row.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>{row.amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{row.dateTime}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="bg-primary-900 text-white rounded-3xl p-2 cursor-pointer hover:bg-primary-500" onClick={() => handleViewDetails(row)}>{row.action}</button>
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
  )
}