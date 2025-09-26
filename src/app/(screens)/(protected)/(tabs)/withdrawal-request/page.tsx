'use client';

import WithdrawalCards, {
  WithdrawalCardsLoading,
} from '@/app/components/screens/withdrawal/Cards';
import WithdrawalModal from '@/app/components/screens/withdrawal/withdrawalmodal';
import Pagination from '@/app/components/leaderboard/Pagination';
import { Search, ListFilter, ChevronDown } from 'lucide-react';
import { formatNaira, formatDateTime } from '@/app/utils/utils';
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Avatar, Table } from '@radix-ui/themes';
import { CaretSortIcon } from '@radix-ui/react-icons';
import { useGetWithdrawalRequests, useGetWithdrawalStats } from '@/app/api/';
import {
  WalletCardIcon,
  WalletIconBig,
  WalletIconBigGreen,
  WalletCardIconGreen,
  WalletCardIconDarkYellow,
  WalletIconBigLightestYellow,
} from '@/app/icons/icons';
import TimeRangeDropdown from '@/app/components/common/TimeRangeDropdown';
import { convertToLocaleString } from '@/app/utils';

interface WithdrawalRequest {
  id: string;
  purpose: string;
  comment: string;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  processAt: string;
  createdAt: string;
  firstName: string;
  availableBalance: number;
  approvedBy?: string;
}

interface DateRange {
  start: string;
  end: string;
}

interface TimeRangeDropdownDateRange {
  startDate: Date;
  endDate: Date;
}

function Page() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isKycFilterOpen, setIsKycFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [selectedKycFilter, setSelectedKycFilter] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] =
    useState<WithdrawalRequest | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showPendingAmount, setShowPendingAmount] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  const filterDropdownRef = useRef<HTMLDivElement>(null);
  const kycFilterDropdownRef = useRef<HTMLDivElement>(null);

  const filterOptions = [
    'All',
    'PENDING',
    'APPROVED',
    'REJECTED',
    'PROCESSED',
    'FAILED',
    'PROCESSING',
  ];
  const kycFilterOptions = ['All', 'Verified', 'Unverified'];

  const options = ['All Time', 'This week', 'Last 30 days', 'Custom'];

  const [selected, setSelected] = useState('All Time');
  const [customDateRange, setCustomDateRange] = useState<{
    startDate: Date;
    endDate: Date;
  } | null>(null);

  const handleSelect = (option: string) => {
    setSelected(option);
    if (option !== 'Custom') setCustomDateRange(null);
  };

  const handleCustomDateChange = (
    dateRange: { startDate: Date; endDate: Date } | null,
  ) => {
    setCustomDateRange(dateRange);
  };

  const [selectedStats, setSelectedStats] = useState('All Time');
  const [customStatsDateRange, setCustomStatsDateRange] = useState<{
    startDate: Date;
    endDate: Date;
  } | null>(null);

  const handleStatsSelect = (option: string) => {
    setSelectedStats(option);
    if (option !== 'Custom') setCustomStatsDateRange(null);
  };

  const handleStatsCustomDateChange = (
    dateRange: { startDate: Date; endDate: Date } | null,
  ) => {
    setCustomStatsDateRange(dateRange);
  };

  const dateRange: DateRange | undefined = useMemo(() => {
    const endDate = new Date();
    const startDate = new Date();

    if (selected === 'Custom' && customDateRange) {
      return {
        start: customDateRange.startDate.toISOString().split('T')[0],
        end: customDateRange.endDate.toISOString().split('T')[0],
      };
    }

    switch (selected) {
      case 'This week': {
        const day = endDate.getDay();
        const diff = endDate.getDate() - day + (day === 0 ? -6 : 1);
        startDate.setDate(diff);
        startDate.setHours(0, 0, 0, 0);
        break;
      }
      case 'Last 30 days':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case 'All Time':
      default:
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
    }

    return {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0],
    };
  }, [selected, customDateRange]);

  const statsDateRange: DateRange | undefined = useMemo(() => {
    const endDate = new Date();
    const startDate = new Date();

    if (selectedStats === 'Custom' && customStatsDateRange) {
      return {
        start: customStatsDateRange.startDate.toISOString().split('T')[0],
        end: customStatsDateRange.endDate.toISOString().split('T')[0],
      };
    }

    switch (selectedStats) {
      case 'This week': {
        const day = endDate.getDay();
        const diff = endDate.getDate() - day + (day === 0 ? -6 : 1);
        startDate.setDate(diff);
        startDate.setHours(0, 0, 0, 0);
        break;
      }
      case 'Last 30 days':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case 'All Time':
      default:
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
    }

    return {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0],
    };
  }, [selectedStats, customStatsDateRange]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const apiPage = currentPage - 1;

  const { data, isPending: fetchingDashData } = useGetWithdrawalRequests(
    apiPage,
    itemsPerPage,
    selectedFilter === 'All' ? undefined : selectedFilter,
    debouncedSearchTerm,
    dateRange,
  );

  const { data: statsData, isPending: fetchingStats } =
    useGetWithdrawalStats(statsDateRange);

  const withdrawalData = useMemo(() => {
    if (data && data.content) {
      return data.content;
    }
    return [];
  }, [data]);

  const paginationInfo = useMemo(() => {
    if (data) {
      return {
        currentPage: data.pageNo + 1,
        totalPages: data.totalPages,
        totalCount: data.totalElements,
      };
    }

    return {
      currentPage: currentPage,
      totalPages: 1,
      totalCount: withdrawalData.length,
    };
  }, [data, currentPage, withdrawalData.length]);

  const shouldShowPagination = useMemo(() => {
    if (fetchingDashData) return false;
    return withdrawalData.length > 0 || currentPage > 1;
  }, [fetchingDashData, withdrawalData.length, currentPage]);

  const withdrawalStats = React.useMemo(() => {
    if (statsData) {
      return {
        totalRequests: statsData.totalWithdrawalRequest,
        totalChangePercent: statsData.totalWithdrawalPerChange,
        approvedRequests: statsData.totalApprovedRequest,
        approvedChangePercent: statsData.totalApprovedPerChange,
        pendingRequests: statsData.totalPendingRequest,
        pendingChangePercent: statsData.totalPendingPerChange,
      };
    }

    if (!withdrawalData || withdrawalData.length === 0) {
      return {
        totalRequests: 0,
        totalChangePercent: 0,
        approvedRequests: 0,
        approvedChangePercent: 0,
        pendingRequests: 0,
        pendingChangePercent: 0,
      };
    }

    const approved = withdrawalData.filter(
      (item) => item.status === 'APPROVED',
    );
    const pending = withdrawalData.filter((item) => item.status === 'PENDING');

    return {
      totalRequests: withdrawalData.length,
      totalChangePercent: 0,
      approvedRequests: approved.length,
      approvedChangePercent: 0,
      pendingRequests: pending.length,
      pendingChangePercent: 0,
    };
  }, [statsData, withdrawalData]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(event.target as Node)
      ) {
        setIsFilterOpen(false);
      }
      if (
        kycFilterDropdownRef.current &&
        !kycFilterDropdownRef.current.contains(event.target as Node)
      ) {
        setIsKycFilterOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleViewDetails = (withdrawalRequest: WithdrawalRequest) => {
    setSelectedWithdrawal(withdrawalRequest);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedWithdrawal(null);
  };

  const handleFilterSelect = (filter: string) => {
    setSelectedFilter(filter);
    setCurrentPage(1);
    setIsFilterOpen(false);
  };

  const handleKycFilterSelect = (filter: string) => {
    setSelectedKycFilter(filter);
    setCurrentPage(1);
    setIsKycFilterOpen(false);
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

  const getStatusStyling = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'PROCESSED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'PENDING':
      case 'PROCESSING':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  // const getPeriodText = () => {
  //   if (selectedStats === 'All Time') return 'all time';
  //   if (selectedStats === 'This week') return 'this week';
  //   if (selectedStats === 'Last 30 days') return 'last 30 days';
  //   if (selectedStats === 'Custom' && customStatsDateRange) {
  //     return `${customStatsDateRange.startDate.toLocaleDateString()} to ${customStatsDateRange.endDate.toLocaleDateString()}`;
  //   }
  //   return 'selected period';
  // };

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-2 md:hidden">
        <p>Recent Withdrawal Request</p>
        <TimeRangeDropdown
          options={options}
          selected={selectedStats}
          onSelect={handleStatsSelect}
          customDateRange={customStatsDateRange}
          onCustomDateChange={handleStatsCustomDateChange}
        />
      </div>

      <div className="hidden justify-end md:flex">
        <TimeRangeDropdown
          options={options}
          selected={selectedStats}
          onSelect={handleStatsSelect}
          customDateRange={customStatsDateRange}
          onCustomDateChange={handleStatsCustomDateChange}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {fetchingStats ? (
          <WithdrawalCardsLoading />
        ) : (
          <WithdrawalCards
            title="All Withdrawal Request"
            value={convertToLocaleString(withdrawalStats.totalRequests)}
            bgColor="blue"
            icon={<WalletCardIcon />}
            bgImage={<WalletIconBig />}
            // analytics={{
            //   percentage: withdrawalStats.totalChangePercent,
            //   period: getPeriodText(),
            // }}
          />
        )}

        {fetchingStats ? (
          <WithdrawalCardsLoading />
        ) : (
          <WithdrawalCards
            title="Total Approved Request"
            value={convertToLocaleString(withdrawalStats.approvedRequests)}
            bgColor="green"
            icon={<WalletCardIconGreen />}
            bgImage={<WalletIconBigGreen />}
            // analytics={{
            //   percentage: withdrawalStats.approvedChangePercent,
            //   period: getPeriodText(),
            // }}
          />
        )}

        {fetchingStats ? (
          <WithdrawalCardsLoading />
        ) : (
          <WithdrawalCards
            title="Total Pending Request"
            value={convertToLocaleString(withdrawalStats.pendingRequests)}
            bgColor="yellow"
            isValueVisible={showPendingAmount}
            onEyeToggle={() => setShowPendingAmount(!showPendingAmount)}
            icon={<WalletCardIconDarkYellow />}
            bgImage={<WalletIconBigLightestYellow />}
            // analytics={{
            //   percentage: withdrawalStats.pendingChangePercent,
            //   period: getPeriodText(),
            // }}
          />
        )}
      </div>

      <div className="mb-4 flex w-full flex-col items-start justify-between gap-4 rounded-md bg-white px-5 py-5 md:flex-row md:items-center">
        <div className="flex w-full flex-col">
          <p className="hidden md:block">Recent Withdrawal Request</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative w-[200px] max-w-md">
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
                <TableHeader label="Request ID" sortKey="id" />
                <TableHeader label="First Name" sortKey="firstName" />
                <TableHeader
                  label="Available Balance"
                  sortKey="availableBalance"
                />
                <TableHeader label="Amount Requested" sortKey="amount" />
                <TableHeader label="Withdrawal Status" sortKey="status" />
                <Table.Cell className="px-4 py-2 text-left">Action</Table.Cell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {fetchingDashData ? (
                <Table.Row>
                  <Table.Cell colSpan={6} className="py-12 text-center">
                    Loading withdrawal requests...
                  </Table.Cell>
                </Table.Row>
              ) : withdrawalData.length > 0 ? (
                withdrawalData.map((item: WithdrawalRequest, index: number) => {
                  const { time, fullDate } = formatDateTime(item.createdAt);
                  const actualIndex = apiPage * itemsPerPage + index + 1;

                  return (
                    <Table.Row key={item.id}>
                      <Table.Cell className="whitespace-nowrap px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex h-[48px] w-[48px] items-center justify-center rounded-full bg-neutral-50">
                            {actualIndex}
                          </div>
                          <div>
                            <p className="font-heading font-bold uppercase text-neutral-800">
                              {item.id}
                            </p>
                            <p className="text-xs text-neutral-500">
                              {fullDate} • {time}
                            </p>
                          </div>
                        </div>
                      </Table.Cell>
                      <Table.Cell className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-primary-50 relative flex h-[40px] w-[40px] items-center justify-center rounded-full p-1">
                            <Avatar
                              src=""
                              fallback={item?.firstName
                                ?.charAt(0)
                                ?.toUpperCase()}
                              radius="full"
                              className="bg-primary-50"
                            />
                          </div>
                          <div>
                            <p className="text-primary-800 capitalize">
                              {item.firstName}
                            </p>
                          </div>
                        </div>
                      </Table.Cell>

                      <Table.Cell className="px-4 py-4">
                        {formatNaira(item.availableBalance, true)}
                      </Table.Cell>
                      <Table.Cell className="px-4 py-4">
                        {formatNaira(item.amount, true)}
                      </Table.Cell>
                      <Table.Cell className="px-4 py-4">
                        <p
                          className={`font-heading w-fit rounded-full px-4 py-2 text-center capitalize ${getStatusStyling(
                            item.status,
                          )}`}
                        >
                          {item.status.toLowerCase()}
                        </p>
                      </Table.Cell>
                      <Table.Cell className="px-4 py-4">
                        <button
                          onClick={() => handleViewDetails(item)}
                          className="hover:bg-primary-50 text-primary-900 border-primary-200 cursor-pointer rounded border px-3 py-2 text-sm font-medium transition-colors"
                        >
                          View Details
                        </button>
                      </Table.Cell>
                    </Table.Row>
                  );
                })
              ) : (
                <Table.Row>
                  <Table.Cell
                    colSpan={6}
                    className="text-error-500 py-12 text-center"
                  >
                    <div className="space-y-2">
                      <p className="font-bold">
                        {selectedFilter === 'All'
                          ? 'No Withdrawal Requests Found'
                          : `No ${selectedFilter} Withdrawal Requests Found`}
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
              )}
            </Table.Body>
          </Table.Root>
        </div>

        {shouldShowPagination && (
          <div className="mt-4 flex flex-col items-center gap-4 p-4 md:flex-row md:justify-between">
            <div className="text-sm text-gray-500">
              {paginationInfo.totalCount > 0 ? (
                <>
                  Showing {(paginationInfo.currentPage - 1) * itemsPerPage + 1}{' '}
                  to{' '}
                  {Math.min(
                    paginationInfo.currentPage * itemsPerPage,
                    paginationInfo.totalCount,
                  )}{' '}
                  of {convertToLocaleString(paginationInfo.totalCount)} entries
                </>
              ) : (
                `Page ${currentPage} of ${convertToLocaleString(
                  paginationInfo.totalPages,
                )}`
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

        {fetchingDashData && (
          <div className="mt-4 flex justify-center p-4">
            <div className="text-sm text-gray-500">Loading...</div>
          </div>
        )}
      </div>

      <WithdrawalModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        withdrawalData={selectedWithdrawal}
      />
    </div>
  );
}

export default Page;
