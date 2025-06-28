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
import { CreditCard } from 'lucide-react';
import Pagination from '../../leaderboard/Pagination';
import WithdrawalModal from './withdrawalmodal';
import React, { useState } from 'react';

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
}

interface IRecentWithdrawTableProps {
  data: WithdrawalRequest[];
  viewDetails?: (data: WithdrawalRequest) => void;
  showDirectAction?: boolean;
  pagination?: PaginationInfo;
  onPageChange?: (page: number) => void;
  currentPage?: number;
}

const RecentWithdrawTable: React.FC<IRecentWithdrawTableProps> = ({
  data,
  viewDetails,
  showDirectAction = false,
  pagination,
  onPageChange,
  currentPage = 1,
}) => {
  type SortableWithdrawalKeys =
    | 'transactionId'
    | 'firstName'
    | 'amount'
    | 'balance'
    | 'status';

  const [sortBy, setSortBy] = React.useState<SortableWithdrawalKeys | ''>('');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('asc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] =
    useState<WithdrawalRequest | null>(null);

  const handleSort = (key: SortableWithdrawalKeys) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
  };

  const sortedData = React.useMemo(() => {
    if (sortBy && data) {
      return [...data].sort((a, b) => {
        const order = sortOrder === 'asc' ? 1 : -1;
        const aValue: string | number = a[sortBy] as string | number;
        const bValue: string | number = b[sortBy] as string | number;

        if (aValue < bValue) return -1 * order;
        if (aValue > bValue) return 1 * order;
        return 0;
      });
    }
    return data || [];
  }, [data, sortBy, sortOrder]);

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

  const handlePageChange = (page: number) => {
    if (onPageChange) {
      onPageChange(page);
    }
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
              <Th
                label="Transaction ID"
                onClick={() => handleSort('transactionId')}
              />
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
            {sortedData?.length > 0 ? (
              sortedData.map((item, index) => {
                const createdDate = new Date(item.createdAt.iso);
                const formattedDateTime =
                  createdDate.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  }) +
                  ' • ' +
                  createdDate.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true,
                  });

                return (
                  <Table.Row key={item.transactionId}>
                    <Table.Cell className="whitespace-nowrap px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-[48px] w-[48px] items-center justify-center rounded-full bg-neutral-50">
                          <CreditCard className="h-5 w-5 text-neutral-600" />
                        </div>
                        <div>
                          <p className="font-heading font-bold uppercase text-neutral-800">
                            {item.transactionId}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {formattedDateTime}
                          </p>
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
                        <div>
                          <p className="text-primary-800 font-medium capitalize">
                            {item.firstName} {item.lastName}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {item.email}
                          </p>
                        </div>
                      </div>
                    </Table.Cell>
                    <Table.Cell className="px-4 py-4">
                      <span className="font-medium">
                        {formatNaira(Number(item.balance), true)}
                      </span>
                    </Table.Cell>
                    <Table.Cell className="px-4 py-4">
                      <span className="font-medium text-orange-600">
                        {formatNaira(Number(item.amount), true)}
                      </span>
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
                            <button className="rounded p-1 hover:bg-gray-100">
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
                  No Pending Withdrawal Requests
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Root>
      </div>

      {data && data.length > 0 && pagination && (
        <div className="mt-4 flex flex-col items-center gap-4 p-4 md:flex-row md:justify-between">
          <div className="text-sm text-gray-500">
            Showing page {pagination.currentPage} of {pagination.totalPages}(
            {pagination.totalItems} total entries)
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

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
