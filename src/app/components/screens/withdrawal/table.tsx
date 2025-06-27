import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@radix-ui/react-dropdown-menu';
import { WithdrawalRequest } from '@/app/store/withdrawalSlice';
import { formatDateTime, formatNaira } from '@/app/utils/utils';
import { CaretSortIcon, DotsVerticalIcon } from '@radix-ui/react-icons';
import { Avatar, Table } from '@radix-ui/themes';
import Pagination from '../../leaderboard/Pagination';
import WithdrawalModal from './withdrawalmodal';
import { useGetWithdrawalRequests } from '@/app/api';
import React, { useEffect, useState, useRef, useMemo } from 'react';

interface IRecentWithdrawTableProps {
  data: WithdrawalRequest[];
  viewDetails?: (data: WithdrawalRequest) => void;
  showDirectAction?: boolean;
}

const RecentWithdrawTable: React.FC<IRecentWithdrawTableProps> = ({
  data,
  viewDetails,
  showDirectAction = false,
}) => {
  type SortableWithdrawalKeys =
    | 'id'
    | 'firstName'
    | 'amount'
    | 'balance'
    | 'status'
    | 'createdAt';

  const [sortBy, setSortBy] = React.useState<SortableWithdrawalKeys | ''>('');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('asc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] =
    useState<WithdrawalRequest | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedFilter] = useState<string>('pending');

  //   const { data, isPending: fetchingDashData } = useGetWithdrawalRequests(
  //     currentPage,
  //     itemsPerPage,
  //     selectedFilter?.toLowerCase(),
  //   );
  //
  //   const withdrawalData = useMemo(() => {
  //     if (data?.result) {
  //       return data?.result?.withdrawalRequests ?? [];
  //     }
  //
  //     return [];
  //   }, [data]);

  const handleSort = (key: SortableWithdrawalKeys) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
  };

  const sortedData = React.useMemo(() => {
    if (sortBy) {
      return data.slice().sort((a, b) => {
        const order = sortOrder === 'asc' ? 1 : -1;
        const aValue = a[sortBy] as string | number | Date;
        const bValue = b[sortBy] as string | number | Date;

        if (aValue < bValue) return -1 * order;
        if (aValue > bValue) return 1 * order;
        return 0;
      });
    }
    return data;
  }, [data, sortBy, sortOrder]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const paginatedData = sortedData?.slice(startIndex, endIndex);

  const totalPages = Math.ceil(sortedData?.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleViewDetails = (item: WithdrawalRequest) => {
    setSelectedWithdrawal(item);
    setIsModalOpen(true);

    if (viewDetails) {
      viewDetails(item);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedWithdrawal(null);
  };

  return (
    <>
      <div className="overflow-x-auto">
        <Table.Root
          variant="ghost"
          className="min-w-full border-collapse text-sm"
        >
          <Table.Header className="bg-primary-50">
            <Table.Row>
              <Th label="Request ID" onClick={() => handleSort('id')} />
              <Th label="First Name" onClick={() => handleSort('firstName')} />
              <Th
                label="Wallet Balance"
                onClick={() => handleSort('balance')}
              />
              <Th
                label="Amount Requested"
                onClick={() => handleSort('amount')}
              />
              <Th
                label="Withdrawal Status"
                onClick={() => handleSort('status')}
              />
              <Table.Cell className="px-4 py-2 text-left">Action</Table.Cell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {/* {paginatedData.length > 0 ? ( */}
            {paginatedData?.length > 0 ? (
              paginatedData.map((item, index) => {
                const { time, fullDate } = formatDateTime(item.createdAt.iso);

                return (
                  <Table.Row key={item.id}>
                    <Table.Cell className="whitespace-nowrap px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-[48px] w-[48px] items-center justify-center rounded-full bg-neutral-50">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-heading font-bold uppercase text-neutral-800">
                            {fullDate}
                          </p>
                          <p className="text-xs text-neutral-500">{time}</p>
                        </div>
                      </div>
                    </Table.Cell>
                    <Table.Cell className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="bg-primary-50 flex h-[40px] w-[40px] items-center justify-center rounded-full p-1">
                          <Avatar
                            src=""
                            fallback={item.firstName?.charAt(0).toUpperCase()}
                            radius="full"
                            className="bg-primary-50"
                          />
                        </div>
                        <p className="text-primary-800 capitalize">
                          {item.firstName}
                        </p>
                      </div>
                    </Table.Cell>
                    <Table.Cell className="px-4 py-4">
                      {formatNaira(Number(item.balance), true)}
                    </Table.Cell>
                    <Table.Cell className="px-4 py-4">
                      {formatNaira(Number(item.amount), true)}
                    </Table.Cell>
                    <Table.Cell className="px-4 py-4">
                      <p
                        className={`font-heading w-fit rounded-full px-4 py-2 text-center capitalize ${
                          item.status === 'resolved'
                            ? 'bg-green-100 text-green-800'
                            : item.status === 'failed'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {item.status}
                      </p>
                    </Table.Cell>
                    <Table.Cell className="px-4 py-4">
                      {showDirectAction ? (
                        <button
                          onClick={() => handleViewDetails(item)}
                          className="hover:bg-primary-50 text-primary-900 border-primary-200 cursor-pointer rounded border px-3 py-2 text-sm font-medium transition-colors"
                        >
                          View Details
                        </button>
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button>
                              <DotsVerticalIcon />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            side="bottom"
                            align="start"
                            className="z-50 w-40 rounded-md border bg-white p-1 shadow-md"
                          >
                            <DropdownMenuItem
                              className="hover:bg-primary-50 text-primary-900 cursor-pointer rounded px-2 py-1 text-sm font-medium"
                              onClick={() => handleViewDetails(item)}
                            >
                              View Details
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
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
                  No Pending Request
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Root>
      </div>

      <div className="mt-4 flex flex-col items-center gap-4 p-4 md:flex-row md:justify-between">
        <div className="text-sm text-gray-500">
          Showing data {startIndex + 1} to{' '}
          {Math.min(endIndex, sortedData?.length)} of {sortedData?.length}{' '}
          entries
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      <WithdrawalModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        withdrawalData={selectedWithdrawal}
      />
    </>
  );
};

export default RecentWithdrawTable;

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
