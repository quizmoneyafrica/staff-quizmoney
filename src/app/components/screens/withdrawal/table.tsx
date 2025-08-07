import { formatNaira } from '@/app/utils/utils';
import { CaretSortIcon } from '@radix-ui/react-icons';
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

interface IRecentWithdrawTableProps {
  data: WithdrawalRequest[];
  viewDetails?: (data: WithdrawalRequest) => void;
  pagination?: PaginationInfo;
  onPageChange?: (page: number) => void;
  currentPage?: number;
}

const RecentWithdrawTable: React.FC<IRecentWithdrawTableProps> = ({
  data,
  viewDetails,
  pagination,
  onPageChange,
  currentPage = 1,
}) => {
  type SortableWithdrawalKeys =
    | 'id'
    | 'firstName'
    | 'amount'
    | 'availableBalance'
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
              <Th label="Request ID" onClick={() => handleSort('id')} />
              <Th
                label="Name & Purpose"
                onClick={() => handleSort('firstName')}
              />
              <Th
                label="Available Balance"
                onClick={() => handleSort('availableBalance')}
              />
              <Th
                label="Amount Requested"
                onClick={() => handleSort('amount')}
              />
              <Th label="Status" onClick={() => handleSort('status')} />
              <Table.Cell className="px-4 py-2 text-left">Action</Table.Cell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {sortedData?.length > 0 ? (
              sortedData.map((item) => {
                const createdDate = new Date(item.createdAt);
                const processDate = item.processAt
                  ? new Date(item.processAt)
                  : null;
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
                    hour12: true,
                  });

                return (
                  <Table.Row key={item.id}>
                    <Table.Cell className="whitespace-nowrap px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-[48px] w-[48px] items-center justify-center rounded-full bg-neutral-50">
                          <CreditCard className="h-5 w-5 text-neutral-600" />
                        </div>
                        <div>
                          <p className="font-heading font-bold uppercase text-neutral-800">
                            {item.id}
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
                            {item.firstName}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {item.purpose}
                          </p>
                        </div>
                      </div>
                    </Table.Cell>
                    <Table.Cell className="px-4 py-4">
                      <span className="font-medium">
                        {formatNaira(Number(item.availableBalance), true)}
                      </span>
                    </Table.Cell>
                    <Table.Cell className="px-4 py-4">
                      <span className="font-medium text-orange-600">
                        {formatNaira(Number(item.amount), true)}
                      </span>
                    </Table.Cell>
                    <Table.Cell className="px-4 py-4">
                      <div>
                        <p
                          className={`font-heading w-fit rounded-full px-4 py-2 text-center capitalize ${
                            item.status === 'APPROVED'
                              ? 'bg-green-100 text-green-800'
                              : item.status === 'REJECTED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {item.status.toLowerCase()}
                        </p>
                        {processDate && (
                          <p className="mt-1 text-xs text-neutral-500">
                            Processed: {processDate.toLocaleDateString()}
                          </p>
                        )}
                      </div>
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
