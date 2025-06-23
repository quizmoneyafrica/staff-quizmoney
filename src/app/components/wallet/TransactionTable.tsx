'use client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@radix-ui/react-dropdown-menu';
import { CaretSortIcon, DotsVerticalIcon } from '@radix-ui/react-icons';
import { Avatar, Table } from '@radix-ui/themes';
import React, { useState } from 'react';
import { Search, ListFilter, MoreVertical } from 'lucide-react';

import Pagination from '../leaderboard/Pagination';
import TransactionDetailsModal from './TransactionDetailsModal';

interface StaticTransactionData {
  id: string;
  date: string;
  username: string;
  avatarUrl: string;
  transactionType: string;
  transactionAmount: string;
  transactionStatus: 'Pending' | 'Successful' | 'Failed';
}

interface TransactionTableProps {
  data?: StaticTransactionData[];
  viewDetails: (data: StaticTransactionData) => void;
}

const TransactionTable: React.FC<TransactionTableProps> = ({
  data,
  viewDetails,
}) => {
  // Static data
  const exampleData: StaticTransactionData[] = [
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
      id: 'ID1234568',
      date: '21/02/2024 09:00',
      username: 'Inioluwa',
      avatarUrl: 'https://github.com/shadcn.png',
      transactionType: 'Deposit',
      transactionAmount: '₦50,000',
      transactionStatus: 'Failed',
    },
    {
      id: 'ID1234569',
      date: '21/02/2024 09:00',
      username: 'Hanax',
      avatarUrl: 'https://github.com/shadcn.png',
      transactionType: 'Deposit',
      transactionAmount: '₦50,000',
      transactionStatus: 'Successful',
    },
    {
      id: 'ID1234570',
      date: '21/02/2024 09:00',
      username: 'Joemicky',
      avatarUrl: 'https://github.com/shadcn.png',
      transactionType: 'Withdrawal',
      transactionAmount: '₦50,000',
      transactionStatus: 'Pending',
    },
    {
      id: 'ID1234571',
      date: '21/02/2024 09:00',
      username: 'Joemicky',
      avatarUrl: 'https://github.com/shadcn.png',
      transactionType: 'Withdrawal',
      transactionAmount: '₦50,000',
      transactionStatus: 'Successful',
    },
  ];

  const tableData = data || exampleData;

  type SortableTransactionKeys =
    | 'id'
    | 'username'
    | 'transactionAmount'
    | 'transactionType'
    | 'transactionStatus'
    | 'date';

  const [sortBy, setSortBy] = React.useState<SortableTransactionKeys | ''>('');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('asc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<StaticTransactionData | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'All' | 'Successful' | 'Pending' | 'Failed'
  >('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const itemsPerPage = 10;

  const handleFilterSelect = (
    status: 'All' | 'Successful' | 'Pending' | 'Failed',
  ) => {
    setStatusFilter(status);
    setIsFilterOpen(false);
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

  const sortedData = React.useMemo(() => {
    let filtered = tableData;

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.transactionType
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          item.transactionAmount
            .toLowerCase()
            .includes(searchTerm.toLowerCase()),
      );
    }

    if (statusFilter !== 'All') {
      filtered = filtered.filter(
        (item) => item.transactionStatus === statusFilter,
      );
    }

    if (sortBy) {
      return filtered.slice().sort((a, b) => {
        const order = sortOrder === 'asc' ? 1 : -1;
        const aValue = a[sortBy] as string;
        const bValue = b[sortBy] as string;

        if (aValue < bValue) return -1 * order;
        if (aValue > bValue) return 1 * order;
        return 0;
      });
    }
    return filtered;
  }, [tableData, sortBy, sortOrder, searchTerm, statusFilter]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  React.useEffect(() => {
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

  return (
    <>
      <div className="overflow-x-auto">
        <div className="mb-4 flex flex-col items-start justify-between gap-4 rounded-md bg-white px-5 py-5 md:flex-row md:items-center">
          <div className="flex items-center gap-4 ">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="focus:ring-primary-900 w-full rounded-md border border-[#D9D9D9] py-2 pl-10 pr-4 outline-none focus:ring-0 "
              />
            </div>
            <div className="relative">
              <button
                className="flex cursor-pointer items-center gap-1 rounded-md border border-[#D9D9D9] px-4  py-2 outline-none"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <ListFilter className=" size-5 text-[#1B212D]" />
                <span className=" hidden md:block  ">Filter by</span>
              </button>
              {isFilterOpen && (
                <div className="absolute right-0 z-10 mt-2 w-48 rounded-md border border-gray-200 bg-white shadow-lg">
                  <div className="py-1">
                    <button
                      onClick={() => handleFilterSelect('All')}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${
                        statusFilter === 'All' ? 'bg-gray-50' : ''
                      }`}
                    >
                      All Status
                    </button>
                    <button
                      onClick={() => handleFilterSelect('Successful')}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${
                        statusFilter === 'Successful' ? 'bg-gray-50' : ''
                      }`}
                    >
                      Successful
                    </button>
                    <button
                      onClick={() => handleFilterSelect('Pending')}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${
                        statusFilter === 'Pending' ? 'bg-gray-50' : ''
                      }`}
                    >
                      Pending
                    </button>
                    <button
                      onClick={() => handleFilterSelect('Failed')}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${
                        statusFilter === 'Failed' ? 'bg-gray-50' : ''
                      }`}
                    >
                      Failed
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
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
              {/* <Table.Cell className="px-4 py-2 text-left">Action</Table.Cell> */}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {paginatedData.length > 0 ? (
              paginatedData.map((item, index) => {
                return (
                  <Table.Row
                    key={item.id}
                    className="cursor-pointer border-b border-gray-100 hover:bg-gray-50"
                    onClick={() => handleRowClick(item)}
                  >
                    <Table.Cell className="whitespace-nowrap px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-[48px] w-[48px] items-center justify-center rounded-full bg-neutral-50">
                          {startIndex + index + 1}
                        </div>
                        <div>
                          <p className="font-heading font-bold uppercase text-neutral-800">
                            {item.id}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {item.date}
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
                    <Table.Cell className="px-4 py-4">
                      <span className="capitalize">{item.transactionType}</span>
                    </Table.Cell>
                    <Table.Cell className="px-4 py-4">
                      <span className="font-semibold">
                        {item.transactionAmount}
                      </span>
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
                );
              })
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
      </div>

      <div className="mt-4 flex flex-col items-center gap-4 p-4 md:flex-row md:justify-between">
        <div className="text-sm text-gray-500">
          Showing data {startIndex + 1} to{' '}
          {Math.min(endIndex, sortedData.length)} of {sortedData.length} entries
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
