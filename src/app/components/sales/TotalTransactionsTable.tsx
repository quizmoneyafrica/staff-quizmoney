'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Search, ListFilter, ChevronDown, AlertCircle } from 'lucide-react';
import classNames from 'classnames';
import { Avatar, Table } from '@radix-ui/themes';
import { subDays } from 'date-fns';
import { useDebounce } from '@/app/hooks/useDebounce';

import CustomImage from '@/app/components/CustomImage';
import Pagination from '../leaderboard/Pagination';
import TimeRangeDropdown from '@/app/components/common/TimeRangeDropdown';
import { formatDateTime, formatNaira } from '@/app/utils/utils';
import SalesApi, {
  CustomerOrderResponse,
  PageResponse,
  SalesOrdersApiResponse,
} from '@/app/api/salesApi';
import { VerifiedIcon } from '@/app/icons/icons';

type CustomDateRange = { startDate: Date; endDate: Date } | null;

const getDateRangeForFilter = (
  selectedOption: string,
  customRange: CustomDateRange,
) => {
  const formatDateForApi = (date: Date) => date.toISOString().split('T')[0];

  const now = new Date();
  switch (selectedOption) {
    case 'This week':
      return {
        start: formatDateForApi(subDays(now, 7)),
        end: formatDateForApi(now),
      };
    case 'Last 30 days':
      return {
        start: formatDateForApi(subDays(now, 30)),
        end: formatDateForApi(now),
      };
    case 'Custom':
      if (customRange?.startDate && customRange?.endDate) {
        return {
          start: formatDateForApi(customRange.startDate),
          end: formatDateForApi(customRange.endDate),
        };
      }
      return undefined;
    case 'All Time':
    default:
      return undefined;
  }
};

const TotalTransactionsTable = () => {
  const router = useRouter();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(7);
  const [selectedFilter, setSelectedFilter] = useState<
    'All' | 'COMPLETED' | 'PENDING' | 'FAILED'
  >('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Use the debounce hook
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterDropdownRef = useRef<HTMLDivElement>(null);
  const filterOptions = ['All', 'COMPLETED', 'PENDING', 'FAILED'];

  const [selectedTimeRange, setSelectedTimeRange] = useState('All Time');
  const [customDateRange, setCustomDateRange] = useState<CustomDateRange>(null);

  const { data, isLoading, isError, error } = useQuery<
    PageResponse<CustomerOrderResponse>,
    Error
  >({
    queryKey: [
      'salesOrders',
      currentPage,
      itemsPerPage,
      debouncedSearchTerm,
      selectedFilter,
      selectedTimeRange,
      customDateRange,
    ],
    queryFn: async () => {
      const dateRange = getDateRangeForFilter(
        selectedTimeRange,
        customDateRange,
      );
      const statusForApi =
        selectedFilter === 'All' ? undefined : selectedFilter;

      const params = {
        page: currentPage,
        limit: itemsPerPage,
        ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
        ...(statusForApi && { status: statusForApi }),
        ...(dateRange && {
          startDate: dateRange.start,
          endDate: dateRange.end,
        }),
      };

      const response = await SalesApi.getSalesOrders(params);

      return response.data.data;
    },
    placeholderData: (previousData) => previousData,
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, selectedFilter, selectedTimeRange, customDateRange]);

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
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFilterSelect = (
    filter: 'All' | 'COMPLETED' | 'PENDING' | 'FAILED',
  ) => {
    setSelectedFilter(filter);
    setIsFilterOpen(false);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleViewProfile = (customerId: string) => {
    if (customerId) {
      router.push(`/players/player-profile/${customerId}`);
    }
  };

  const getStatusClass = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'completed') return 'bg-green-100 text-green-800';
    if (statusLower === 'failed') return 'bg-red-100 text-red-800';
    if (statusLower === 'pending') return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const transactions = data?.data || [];
  const pagination = data?.pagination;

  const EmptyState = () => (
    <Table.Row>
      <Table.Cell colSpan={6} className="text-error-500 py-12 text-center">
        <div className="space-y-2">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-gray-50 p-4">
              <AlertCircle className="h-8 w-8 text-gray-400" />
            </div>
          </div>
          <p className="font-bold">No Transactions Found</p>
          {debouncedSearchTerm && (
            <p className="text-sm text-gray-500">
              No results for {debouncedSearchTerm}
            </p>
          )}
        </div>
      </Table.Cell>
    </Table.Row>
  );

  const LoadingState = () => (
    <Table.Row>
      <Table.Cell colSpan={6} className="py-12 text-center">
        <div className="flex items-center justify-center space-x-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
          <span>Loading transactions...</span>
        </div>
      </Table.Cell>
    </Table.Row>
  );

  const ErrorState = () => (
    <Table.Row>
      <Table.Cell colSpan={6} className="py-12 text-center text-red-500">
        <div className="space-y-2">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-red-50 p-4">
              <AlertCircle className="h-8 w-8 text-red-400" />
            </div>
          </div>
          <p className="font-bold">Error Loading Transactions</p>
          <p className="text-sm">
            {error?.message || 'An unexpected error occurred'}
          </p>
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
        <div className="flex w-full flex-wrap items-center justify-start gap-4 md:w-auto md:flex-nowrap md:justify-end">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
            <input
              type="text"
              placeholder="Search by ID, Name, Product..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="focus:ring-primary-900 w-full rounded-md border border-[#D9D9D9] py-2 pl-10 pr-4 outline-none focus:ring-0"
            />
          </div>

          <TimeRangeDropdown
            options={['All Time', 'This week', 'Last 30 days', 'Custom']}
            selected={selectedTimeRange}
            onSelect={(option) => {
              setSelectedTimeRange(option);
            }}
            customDateRange={customDateRange}
            onCustomDateChange={(range) => {
              setCustomDateRange(range);
              setSelectedTimeRange('Custom');
            }}
          />

          <div className="relative" ref={filterDropdownRef}>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-1 whitespace-nowrap rounded-md border border-[#D9D9D9] px-4 py-2 outline-none transition-colors hover:bg-gray-50"
            >
              <ListFilter className="size-5 text-[#1B212D]" />
              <span className="hidden md:block">{selectedFilter}</span>
              <ChevronDown
                className={`size-4 text-[#1B212D] transition-transform ${
                  isFilterOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
            {isFilterOpen && (
              <div className="absolute right-0 z-10 mt-2 w-48 rounded-md border border-[#D9D9D9] bg-white shadow-lg">
                <div className="py-2">
                  {filterOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() =>
                        handleFilterSelect(
                          option as 'All' | 'COMPLETED' | 'PENDING' | 'FAILED',
                        )
                      }
                      className={`w-full px-4 py-2 text-left transition-colors hover:bg-gray-50 ${
                        selectedFilter === option
                          ? 'bg-blue-50 font-medium text-blue-600'
                          : 'text-gray-700'
                      }`}
                    >
                      {option}
                    </button>
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
                <Table.Cell className="px-4 py-2 text-left">
                  Order ID
                </Table.Cell>
                <Table.Cell className="px-4 py-2 text-left">
                  Customer Name
                </Table.Cell>
                <Table.Cell className="px-4 py-2 text-left">
                  Description
                </Table.Cell>
                <Table.Cell className="px-4 py-2 text-left">Amount</Table.Cell>
                <Table.Cell className="px-4 py-2 text-left">Status</Table.Cell>
                <Table.Cell className="px-4 py-2 text-left">Action</Table.Cell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {isLoading ? (
                <LoadingState />
              ) : isError ? (
                <ErrorState />
              ) : transactions.length > 0 ? (
                transactions.map((transaction) => (
                  <Table.Row key={transaction.orderId}>
                    <Table.Cell className="whitespace-nowrap px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-[48px] w-[48px] items-center justify-center rounded-full bg-neutral-50">
                          <CustomImage alt="" src={'/icons/down.svg'} />
                        </div>
                        <div>
                          <p className="font-heading font-bold uppercase text-neutral-800">
                            {transaction.orderId}
                          </p>
                        </div>
                      </div>
                    </Table.Cell>
                    <Table.Cell className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <Avatar
                            fallback={
                              transaction.name?.charAt(0).toUpperCase() || 'U'
                            }
                            radius="full"
                            size="3"
                          />
                        </div>
                        <p className="text-primary-800 capitalize">
                          {transaction.name || 'Unknown'}
                        </p>
                      </div>
                    </Table.Cell>
                    <Table.Cell className="px-4 py-4 text-sm text-gray-900">
                      {transaction.description}
                    </Table.Cell>
                    <Table.Cell className="px-4 py-4 text-sm text-gray-900">
                      {formatNaira(transaction.amount)}
                    </Table.Cell>
                    <Table.Cell className="px-4 py-4">
                      <p
                        className={classNames(
                          'font-heading w-fit rounded-full px-4 py-2 text-center capitalize',
                          getStatusClass(transaction.status),
                        )}
                      >
                        {transaction.status.toLowerCase()}
                      </p>
                    </Table.Cell>
                    <Table.Cell className="px-4 py-4">
                      <button
                        onClick={() =>
                          handleViewProfile(transaction.customerId)
                        }
                        className="hover:bg-primary-800 bg-primary-900 cursor-pointer rounded px-3 py-2 text-sm font-medium text-white transition-colors"
                      >
                        View Profile
                      </button>
                    </Table.Cell>
                  </Table.Row>
                ))
              ) : (
                <EmptyState />
              )}
            </Table.Body>
          </Table.Root>
        </div>

        {pagination && pagination.totalItems > 0 && (
          <div className="mt-4 flex flex-col items-center gap-4 p-4 md:flex-row md:justify-between">
            <div className="text-sm text-gray-500">
              Showing {(pagination.currentPage - 1) * pagination.limit + 1} to{' '}
              {Math.min(
                pagination.currentPage * pagination.limit,
                pagination.totalItems,
              )}{' '}
              of {pagination.totalItems} entries
              {debouncedSearchTerm && (
                <span className="ml-1 font-medium">
                  for &quot;{debouncedSearchTerm}&quot;
                </span>
              )}
            </div>
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TotalTransactionsTable;
