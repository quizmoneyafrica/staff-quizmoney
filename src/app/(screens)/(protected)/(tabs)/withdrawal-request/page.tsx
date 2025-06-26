/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import WithdrawalCards, {
  WithdrawalCardsLoading,
} from '@/app/components/screens/withdrawal/Cards';
import WithdrawalModal from '@/app/components/screens/withdrawal/withdrawalmodal';
import Pagination from '@/app/components/leaderboard/Pagination';
import { Search, ListFilter, ChevronDown } from 'lucide-react';
import { useAppDispatch } from '@/app/hooks/useAuth';
import { setDashboardDetails } from '@/app/store/dashboardSlice';
import { WithdrawalRequest } from '@/app/store/withdrawalSlice';
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

function Page() {
  const dispatch = useAppDispatch();

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<
    UnknownObject | WithdrawalRequest | null
  >(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showPendingAmount, setShowPendingAmount] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  const filterDropdownRef = useRef<HTMLDivElement>(null);

  const filterOptions = ['All', 'Approved', 'Pending', 'Rejected'];

  const [selected, setSelected] = useState('This week');
  const [customDateRange, setCustomDateRange] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const formatDateRange = (dateRange) => {
    if (!dateRange || !dateRange.startDate || !dateRange.endDate) return null;

    const formatDate = (date) => {
      if (typeof date === 'string') return date;
      return date.toISOString().split('T')[0];
    };

    return {
      start: formatDate(dateRange.startDate),
      end: formatDate(dateRange.endDate),
    };
  };

  const calculateDateRange = (selectedOption, customDateRange) => {
    if (selectedOption === 'Custom' && customDateRange) {
      return formatDateRange(customDateRange);
    }

    const today = new Date();
    const formatDate = (date) => {
      return date.toISOString().split('T')[0];
    };

    switch (selectedOption) {
      case 'This week': {
        const startOfWeek = new Date(today);
        const dayOfWeek = today.getDay();
        const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        startOfWeek.setDate(today.getDate() - daysFromMonday);
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(today);
        endOfWeek.setHours(23, 59, 59, 999);

        return {
          start: formatDate(startOfWeek),
          end: formatDate(endOfWeek),
        };
      }

      case 'Last 30 days': {
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        thirtyDaysAgo.setHours(0, 0, 0, 0);

        const endDate = new Date(today);
        endDate.setHours(23, 59, 59, 999);

        return {
          start: formatDate(thirtyDaysAgo),
          end: formatDate(endDate),
        };
      }

      default:
        return null;
    }
  };

  const {
    data,
    isPending: fetchingDashData,
    error,
  } = useGetWithdrawalRequests(
    currentPage,
    itemsPerPage,
    selectedFilter?.toLowerCase(),
    debouncedSearchTerm,
    calculateDateRange(selected, customDateRange),
  );

  const { data: statsData, isPending: fetchingStats } = useGetWithdrawalStats();

  const withdrawalData = useMemo(() => {
    if (data) {
      return data?.withdrawalRequests ?? data?.results ?? data ?? [];
    }
    return [];
  }, [data]);

  const paginationInfo = useMemo(() => {
    if (data?.pagination) {
      return {
        currentPage: data.pagination.currentPage,
        totalPages: data.pagination.totalPages,
        totalCount: data.pagination.totalCount,
        hasNext: data.pagination.hasNext,
        hasPrevious: data.pagination.hasPrevious,
      };
    }

    return {
      currentPage: currentPage,
      totalPages: 1,
      totalCount: withdrawalData.length,
      hasNext: false,
      hasPrevious: false,
    };
  }, [data, currentPage, withdrawalData.length]);

  const shouldShowPagination = useMemo(() => {
    if (fetchingDashData) return false;

    return (
      paginationInfo.totalPages > 1 ||
      currentPage > 1 ||
      withdrawalData.length === itemsPerPage
    );
  }, [
    fetchingDashData,
    paginationInfo.totalPages,
    currentPage,
    withdrawalData.length,
    itemsPerPage,
  ]);

  const withdrawalStats = React.useMemo(() => {
    if (statsData?.result) {
      return {
        totalRequests: statsData.result.totalThisWeek,
        totalChangePercent: statsData.result.totalChangePercent,
        approvedRequests: statsData.result.approvedThisWeek,
        approvedChangePercent: statsData.result.approvedChangePercent,
        pendingRequests: statsData.result.pendingThisWeek,
        pendingChangePercent: statsData.result.pendingChangePercent,
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

    const approved = withdrawalData.filter((item) => {
      const status = (item.status || 'pending').toLowerCase();
      return (
        status === 'resolved' || status === 'approved' || status === 'completed'
      );
    });

    const pending = withdrawalData.filter((item) => {
      const status = (item.status || 'pending').toLowerCase();
      return status === 'pending' || status === 'processing';
    });

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
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleViewDetails = (withdrawalRequest: UnknownObject) => {
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

  const options = ['This week', 'Last 30 days', 'Custom'];

  const handleSelect = (option) => {
    setSelected(option);
    setCurrentPage(1);

    if (option !== 'Custom') {
      setCustomDateRange(null);
    }
  };

  const handleCustomDateChange = (dateRange) => {
    setCustomDateRange(dateRange);
    setCurrentPage(1);
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

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {fetchingStats || fetchingDashData ? (
          <WithdrawalCardsLoading />
        ) : (
          <WithdrawalCards
            title="All Withdrawal Request"
            value={withdrawalStats.totalRequests.toString()}
            bgColor="blue"
            icon={<WalletCardIcon />}
            bgImage={<WalletIconBig />}
            analytics={{
              percentage: withdrawalStats.totalChangePercent,
              period: 'this week',
            }}
          />
        )}

        {fetchingStats || fetchingDashData ? (
          <WithdrawalCardsLoading />
        ) : (
          <WithdrawalCards
            title="Total Approved Request"
            value={withdrawalStats.approvedRequests.toString()}
            bgColor="green"
            icon={<WalletCardIconGreen />}
            bgImage={<WalletIconBigGreen />}
            analytics={{
              percentage: withdrawalStats.approvedChangePercent,
              period: 'this week',
            }}
          />
        )}

        {fetchingStats || fetchingDashData ? (
          <WithdrawalCardsLoading />
        ) : (
          <WithdrawalCards
            title="Total Pending Request"
            value={withdrawalStats.pendingRequests.toString()}
            bgColor="yellow"
            // showEye={true}
            isValueVisible={showPendingAmount}
            onEyeToggle={() => setShowPendingAmount(!showPendingAmount)}
            icon={<WalletCardIconDarkYellow />}
            bgImage={<WalletIconBigLightestYellow />}
            analytics={{
              percentage: withdrawalStats.pendingChangePercent,
              period: 'this week',
            }}
          />
        )}
      </div>

      <div className="mb-4 flex w-full flex-col items-start justify-between gap-4 rounded-md bg-white px-5 py-5 md:flex-row md:items-center">
        <p>Recent Withdrawal Request</p>

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
                <TableHeader label="Request ID" sortKey="id" />
                <TableHeader label="First Name" sortKey="firstName" />
                <TableHeader label="Wallet Balance" sortKey="balance" />
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
                withdrawalData.map((item: UnknownObject, index: number) => {
                  const { time, fullDate } = formatDateTime(
                    item.createdAt?.iso || new Date().toISOString(),
                  );

                  const actualIndex =
                    (currentPage - 1) * itemsPerPage + index + 1;

                  return (
                    <Table.Row key={item.id || index}>
                      <Table.Cell className="whitespace-nowrap px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex h-[48px] w-[48px] items-center justify-center rounded-full bg-neutral-50">
                            {actualIndex}
                          </div>
                          <div>
                            <p className="font-heading font-bold uppercase text-neutral-800">
                              {item.id || `REQ-${actualIndex}`}
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
                              src=""
                              fallback={
                                item.firstName?.charAt(0).toUpperCase() || 'U'
                              }
                              radius="full"
                              className="bg-primary-50"
                            />
                          </div>
                          <p className="text-primary-800 capitalize">
                            {item.firstName || 'Unknown'}
                          </p>
                        </div>
                      </Table.Cell>
                      <Table.Cell className="px-4 py-4">
                        {formatNaira(Number(item.balance || 0), true)}
                      </Table.Cell>
                      <Table.Cell className="px-4 py-4">
                        {formatNaira(Number(item.amount || 0), true)}
                      </Table.Cell>
                      <Table.Cell className="px-4 py-4">
                        <p
                          className={`font-heading w-fit rounded-full px-4 py-2 text-center capitalize ${(() => {
                            const status = (item.status || 'pending') as string;
                            const statusLower = status.toLowerCase();

                            if (
                              statusLower === 'resolved' ||
                              statusLower === 'approved' ||
                              statusLower === 'completed'
                            ) {
                              return 'bg-green-100 text-green-800';
                            }
                            if (
                              statusLower === 'failed' ||
                              statusLower === 'rejected' ||
                              statusLower === 'declined'
                            ) {
                              return 'bg-red-100 text-red-800';
                            }
                            return 'bg-yellow-100 text-yellow-800';
                          })()}`}
                        >
                          {item.status || 'pending'}
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
