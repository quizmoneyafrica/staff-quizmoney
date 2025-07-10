'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ListFilter, ChevronDown, AlertCircle } from 'lucide-react';
import classNames from 'classnames';
import CustomImage from '@/app/components/CustomImage';

import Pagination from '../leaderboard/Pagination';
import { useSelector } from 'react-redux';
import { selectSales, StoreTransaction } from '@/app/store/salesSlice';
import { Avatar, Table } from '@radix-ui/themes';
import { CaretSortIcon } from '@radix-ui/react-icons';
import TimeRangeDropdown from '@/app/components/common/TimeRangeDropdown';
import { formatDateTime } from '@/app/utils/utils';

import TotalTransactionModal from './TotalTransactionsModal';

const TotalTransactionsTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(7);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<StoreTransaction | null>(null);

  const { salesData, isLoading: isSalesLoading } = useSelector(selectSales);
  const totalTransactions: StoreTransaction[] =
    salesData?.storeTransactions ?? [];

  const filterDropdownRef = useRef<HTMLDivElement>(null);
  const filterOptions = ['All', 'Completed', 'Pending', 'Failed'];

  // Time range dropdown options
  const options = ['All Time', 'This week', 'Last 30 days', 'Custom'];
  const [selected, setSelected] = useState('All Time');
  const [customDateRange, setCustomDateRange] = useState(null);

  const handleSelect = (option) => {
    setSelected(option);
    if (option !== 'Custom') {
      setCustomDateRange(null);
    }
  };

  const handleCustomDateChange = (dateRange) => {
    setCustomDateRange(dateRange);
  };

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Filter dropdown click outside effect
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

  // Filter transactions based on search and filter
  const filteredTransactions = useMemo(() => {
    let filtered = totalTransactions;

    // Apply search filter
    if (debouncedSearchTerm) {
      filtered = filtered.filter(
        (transaction) =>
          transaction.objectId
            .toLowerCase()
            .includes(debouncedSearchTerm.toLowerCase()) ||
          transaction.firstName
            .toLowerCase()
            .includes(debouncedSearchTerm.toLowerCase()) ||
          transaction.product.productName
            .toLowerCase()
            .includes(debouncedSearchTerm.toLowerCase()),
      );
    }

    // Apply status filter
    if (selectedFilter !== 'All') {
      filtered = filtered.filter(
        (transaction) =>
          transaction.status.toLowerCase() === selectedFilter.toLowerCase(),
      );
    }

    return filtered;
  }, [totalTransactions, debouncedSearchTerm, selectedFilter]);

  // Pagination calculations
  const paginationInfo = useMemo(() => {
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentData = filteredTransactions.slice(startIndex, endIndex);

    return {
      currentPage,
      totalPages,
      totalCount: filteredTransactions.length,
      startIndex,
      endIndex,
      currentData,
    };
  }, [filteredTransactions, currentPage, itemsPerPage]);

  const shouldShowPagination = useMemo(() => {
    if (isSalesLoading) return false;
    return filteredTransactions.length > 0 || currentPage > 1;
  }, [isSalesLoading, filteredTransactions.length, currentPage]);

  const getStatusClass = (status: string) => {
    const statusLower = status.toLowerCase();

    if (statusLower === 'completed') {
      return 'bg-green-100 text-green-800';
    }
    if (statusLower === 'failed') {
      return 'bg-red-100 text-red-800';
    }
    if (statusLower === 'pending') {
      return 'bg-yellow-100 text-yellow-800';
    }
    // Default fallback for any other status
    return 'bg-gray-100 text-gray-800';
  };

  const handleFilterSelect = (filter: string) => {
    setSelectedFilter(filter);
    setCurrentPage(1);
    setIsFilterOpen(false);
  };

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleViewDetails = (transaction: StoreTransaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTransaction(null);
  };

  const TableHeader = ({
    label,
    sortKey,
  }: {
    label: string;
    sortKey: string;
  }) => (
    <Table.Cell
      className="cursor-pointer px-4 py-2 text-left"
      onClick={() => handleSort(sortKey)}
    >
      <div className="flex items-center gap-1">
        <span>{label}</span>
        <CaretSortIcon />
      </div>
    </Table.Cell>
  );

  const EmptyState = () => (
    <Table.Row>
      <Table.Cell colSpan={6} className="text-error-500 py-12 text-center">
        <div className="space-y-2">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-gray-50 p-4">
              <AlertCircle className="h-8 w-8 text-gray-400" />
            </div>
          </div>
          <p className="font-bold">
            {selectedFilter === 'All'
              ? 'No Transactions Found'
              : `No ${selectedFilter} Transactions Found`}
          </p>
          <p className="mx-auto max-w-sm text-center text-sm text-gray-500">
            There are no transactions to display at the moment. Check back later
            for updates.
          </p>
          {currentPage > 1 && (
            <p className="text-sm text-gray-500">
              You&apos;re on page {currentPage}. Try{' '}
              <button
                onClick={() => handlePageChange(1)}
                className="text-primary-600 hover:text-primary-800 underline"
              >
                going to page 1
              </button>{' '}
              or adjusting your filters.
            </p>
          )}
        </div>
      </Table.Cell>
    </Table.Row>
  );

  return (
    <div className="space-y-10">
      <div className="mb-4 flex w-full flex-col items-start justify-between gap-4 rounded-md bg-white px-5 py-5 md:flex-row md:items-center">
        <h2 className="text-xl font-bold text-[#3B3B3B] sm:text-2xl">
          Total Transactions
        </h2>

        <div className="flex items-center gap-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={handleSearchChange}
              className="focus:ring-primary-900 w-full rounded-md border border-[#D9D9D9] py-2 pl-10 pr-4 outline-none focus:ring-0"
            />
          </div>

          <TimeRangeDropdown
            options={options}
            selected={selected}
            onSelect={handleSelect}
            customDateRange={customDateRange}
            onCustomDateChange={handleCustomDateChange}
          />

          <div className="relative" ref={filterDropdownRef}>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-1 whitespace-nowrap rounded-md border border-[#D9D9D9] px-4 py-2 outline-none transition-colors hover:bg-gray-50"
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
                <div className="py-2">
                  {filterOptions.map((option, index) => (
                    <React.Fragment key={option}>
                      <button
                        onClick={() => handleFilterSelect(option)}
                        className={`w-full px-4 py-2 text-left transition-colors hover:bg-gray-50 ${
                          selectedFilter === option
                            ? 'bg-blue-50 font-medium text-blue-600'
                            : 'text-gray-700'
                        }`}
                      >
                        {option}
                      </button>
                      {index < filterOptions.length - 1 && (
                        <div className="mx-2 border-b border-gray-200"></div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="w-full rounded-lg bg-white">
        <div className="overflow-x-auto">
          <Table.Root
            variant="ghost"
            className="min-w-full border-collapse text-sm"
          >
            <Table.Header className="bg-primary-50">
              <Table.Row>
                <TableHeader label="Transaction ID" sortKey="objectId" />
                <TableHeader label="Username" sortKey="firstName" />
                <TableHeader label="Transaction Type" sortKey="product" />
                <TableHeader label="Amount" sortKey="amount" />
                <TableHeader label="Transaction Status" sortKey="status" />
                <Table.Cell className="px-4 py-2 text-left">Action</Table.Cell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {isSalesLoading ? (
                <Table.Row>
                  <Table.Cell colSpan={6} className="py-12 text-center">
                    Loading transactions...
                  </Table.Cell>
                </Table.Row>
              ) : paginationInfo.currentData.length > 0 ? (
                paginationInfo.currentData.map((transaction, index) => {
                  const { time, fullDate } = formatDateTime(
                    transaction.createdAt?.iso || new Date().toISOString(),
                  );

                  return (
                    <Table.Row key={transaction.objectId || index}>
                      <Table.Cell className="whitespace-nowrap px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex h-[48px] w-[48px] items-center justify-center rounded-full bg-neutral-50">
                            <CustomImage alt="" src={'/icons/down.svg'} />
                          </div>
                          <div>
                            <p className="font-heading font-bold uppercase text-neutral-800">
                              {transaction.objectId}
                            </p>
                            <p className="text-xs text-neutral-500">
                              {fullDate} • {time}
                            </p>
                          </div>
                        </div>
                      </Table.Cell>
                      <Table.Cell className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="bg-primary-50 flex h-[40px] w-[40px] items-center justify-center rounded-full p-1">
                            <Avatar
                              src={transaction.avatar}
                              fallback={
                                transaction.firstName
                                  ?.charAt(0)
                                  .toUpperCase() || 'U'
                              }
                              radius="full"
                              className="bg-primary-50"
                            />
                          </div>
                          <p className="text-primary-800 capitalize">
                            {transaction.firstName || 'Unknown'}
                          </p>
                        </div>
                      </Table.Cell>
                      <Table.Cell className="px-4 py-4">
                        <div className="text-sm text-gray-900">
                          {transaction.product.productName}
                        </div>
                      </Table.Cell>
                      <Table.Cell className="px-4 py-4">
                        <div className="text-sm text-gray-900">
                          ₦{transaction.amount.toFixed(2)}
                        </div>
                      </Table.Cell>
                      <Table.Cell className="px-4 py-4">
                        <p
                          className={classNames(
                            'font-heading w-fit rounded-full px-4 py-2 text-center capitalize',
                            getStatusClass(transaction.status),
                          )}
                        >
                          {transaction.status}
                        </p>
                      </Table.Cell>
                      <Table.Cell className="px-4 py-4">
                        <button
                          onClick={() => handleViewDetails(transaction)}
                          className="hover:bg-primary-50 text-primary-900 border-primary-200 cursor-pointer rounded border px-3 py-2 text-sm font-medium transition-colors"
                        >
                          View Details
                        </button>
                      </Table.Cell>
                    </Table.Row>
                  );
                })
              ) : (
                <EmptyState />
              )}
            </Table.Body>
          </Table.Root>
        </div>

        {shouldShowPagination && (
          <div className="mt-4 flex flex-col items-center gap-4 p-4 md:flex-row md:justify-between">
            <div className="text-sm text-gray-500">
              {paginationInfo.totalCount > 0 ? (
                <>
                  Showing {paginationInfo.startIndex + 1} to{' '}
                  {Math.min(paginationInfo.endIndex, paginationInfo.totalCount)}{' '}
                  of {paginationInfo.totalCount} entries
                </>
              ) : (
                `Page ${currentPage} of ${paginationInfo.totalPages}`
              )}
              {selectedFilter !== 'All' && ` (filtered by ${selectedFilter})`}
              {debouncedSearchTerm && ` (search: "${debouncedSearchTerm}")`}
            </div>
            <Pagination
              currentPage={paginationInfo.currentPage}
              totalPages={paginationInfo.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}

        {isSalesLoading && (
          <div className="mt-4 flex justify-center p-4">
            <div className="text-sm text-gray-500">Loading...</div>
          </div>
        )}
      </div>

      <TotalTransactionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        transactionData={selectedTransaction}
      />
    </div>
  );
};

export default TotalTransactionsTable;
