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
import { useGetWithdrawalRequests } from '@/app/api';
import {
  WalletCardIcon,
  WalletIconBig,
  WalletIconBigGreen,
  WalletCardIconGreen,
  WalletCardIconDarkYellow,
  WalletIconBigLightestYellow,
} from '@/app/icons/icons';

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

  const filterDropdownRef = useRef<HTMLDivElement>(null);

  const filterOptions = ['All', 'Approved', 'Pending', 'Rejected'];

  const { data, isPending: fetchingDashData } = useGetWithdrawalRequests(
    currentPage,
    itemsPerPage,
    selectedFilter?.toLowerCase(),
  );

  const withdrawalData = useMemo(() => {
    if (data?.result) {
      dispatch(setDashboardDetails(data?.result));

      return data?.result?.withdrawalRequests ?? [];
    }

    return [];
  }, [data]);

  const withdrawalStats = React.useMemo(() => {
    if (!withdrawalData || withdrawalData.length === 0) {
      return {
        totalRequests: 0,
        totalAmount: 0,
        approvedRequests: 0,
        approvedAmount: 0,
        pendingRequests: 0,
        pendingAmount: 0,
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
      totalAmount: withdrawalData.reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0,
      ),
      approvedRequests: approved.length,
      approvedAmount: approved.reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0,
      ),
      pendingRequests: pending.length,
      pendingAmount: pending.reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0,
      ),
    };
  }, [withdrawalData]);

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

  const filteredData = React.useMemo(() => {
    if (!withdrawalData || withdrawalData.length === 0) return [];

    let filtered = withdrawalData;

    if (selectedFilter !== 'All') {
      filtered = withdrawalData?.filter((item: UnknownObject) => {
        const status = (item.status || 'pending') as string;
        const statusLower = status.toLowerCase();
        const filterStatus = selectedFilter.toLowerCase();

        if (filterStatus === 'approved') {
          return (
            statusLower === 'resolved' ||
            statusLower === 'approved' ||
            statusLower === 'completed'
          );
        }
        if (filterStatus === 'pending') {
          return statusLower === 'pending' || statusLower === 'processing';
        }
        if (filterStatus === 'rejected') {
          return (
            statusLower === 'rejected' ||
            statusLower === 'failed' ||
            statusLower === 'declined'
          );
        }

        return statusLower === filterStatus;
      });
    }

    if (sortBy) {
      filtered = [...filtered].sort((a: UnknownObject, b: UnknownObject) => {
        let aValue: string | number | Date;
        let bValue: string | number | Date;

        switch (sortBy) {
          case 'id':
            aValue = (a.id || '').toString().toLowerCase();
            bValue = (b.id || '').toString().toLowerCase();
            break;
          case 'firstName':
            aValue = (a.firstName || '').toString().toLowerCase();
            bValue = (b.firstName || '').toString().toLowerCase();
            break;
          case 'balance':
            aValue = Number(a.balance || 0);
            bValue = Number(b.balance || 0);
            break;
          case 'amount':
            aValue = Number(a.amount || 0);
            bValue = Number(b.amount || 0);
            break;
          case 'status':
            aValue = (a.status || 'pending').toString().toLowerCase();
            bValue = (b.status || 'pending').toString().toLowerCase();
            break;
          case 'createdAt':
            aValue = new Date(a.createdAt?.iso || a.createdAt || 0);
            bValue = new Date(b.createdAt?.iso || b.createdAt || 0);
            break;
          default:
            return 0;
        }

        if (sortOrder === 'asc') {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
      });
    }

    return filtered;
  }, [withdrawalData, selectedFilter, sortBy, sortOrder]);

  const [showPendingAmount, setShowPendingAmount] = useState(false);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
        {fetchingDashData ? (
          <WithdrawalCardsLoading />
        ) : (
          <WithdrawalCards
            title="All Withdrawal Request"
            value={withdrawalStats.totalRequests.toString()}
            bgColor="blue"
            icon={<WalletCardIcon />}
            bgImage={<WalletIconBig />}
            analytics={{
              percentage: 15.5,
              period: 'this week',
            }}
          />
        )}
        {fetchingDashData ? (
          <WithdrawalCardsLoading />
        ) : (
          <WithdrawalCards
            title="Total Approved Request"
            value={withdrawalStats.approvedRequests.toString()}
            bgColor="green"
            icon={<WalletCardIconGreen />}
            bgImage={<WalletIconBigGreen />}
            analytics={{
              percentage: -5.2,
              period: 'this week',
            }}
          />
        )}
        {fetchingDashData ? (
          <WithdrawalCardsLoading />
        ) : (
          <WithdrawalCards
            title="Total Pending Request"
            value={withdrawalStats.pendingRequests.toString()}
            bgColor="yellow"
            showEye={true}
            isValueVisible={showPendingAmount}
            onEyeToggle={() => setShowPendingAmount(!showPendingAmount)}
            icon={<WalletCardIconDarkYellow />}
            bgImage={<WalletIconBigLightestYellow />}
            analytics={{
              percentage: 8.3,
              period: 'this month',
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
              className="focus:ring-primary-900 w-full rounded-md border border-[#D9D9D9] py-2 pl-10 pr-4 outline-none focus:ring-0"
            />
          </div>

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
              ) : filteredData.length > 0 ? (
                filteredData.map((item: UnknownObject, index: number) => {
                  const { time, fullDate } = formatDateTime(
                    item.createdAt?.iso || new Date().toISOString(),
                  );

                  return (
                    <Table.Row key={item.id || index}>
                      <Table.Cell className="whitespace-nowrap px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex h-[48px] w-[48px] items-center justify-center rounded-full bg-neutral-50">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-heading font-bold uppercase text-neutral-800">
                              {item.id || `REQ-${index + 1}`}
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
                    className="text-error-500 py-12 text-center font-bold"
                  >
                    {selectedFilter === 'All'
                      ? 'No Withdrawal Requests Found'
                      : `No ${selectedFilter} Withdrawal Requests Found`}
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table.Root>
        </div>

        {!fetchingDashData && filteredData.length > 0 && (
          <div className="mt-4 flex flex-col items-center gap-4 p-4 md:flex-row md:justify-between">
            <div className="text-sm text-gray-500">
              Showing data {currentPage} to {itemsPerPage} of{' '}
              {data?.result?.totalCount} entries{' '}
              {selectedFilter !== 'All' && `(filtered by ${selectedFilter})`}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={data?.result?.totalPages || 1}
              onPageChange={handlePageChange}
            />
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
