import * as React from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useGetWithdrawalRequests } from '@/app/api/withdrawal';
import RecentWithdrawTable from '../withdrawal/table';
import QmDrawer from '../../drawer/drawer';
import WithdrawDetailsModal from '../withdrawal/WithdrawDrawer';
import { convertToLocaleString } from '@/app/utils';

interface TableWithdrawalRequest {
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

interface StoreWithdrawalRequest {
  id: string;
  purpose: string;
  comment: string;
  amount: number;
  status: 'pending' | 'resolved' | 'failed';
  processAt: string;
  createdAt: {
    __type: 'Date';
    iso: string;
  };
  firstName: string;
  lastName: string;
  email: string;
  balance: number;
  availableBalance: number;
  approvedBy?: string;
  bankAccount: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  transactionId: string;
}

const RecentWithdraw: React.FunctionComponent = () => {
  const [selectedData, setSelectedData] =
    React.useState<StoreWithdrawalRequest>();
  const [currentPage, setCurrentPage] = React.useState(0);
  const [pageSize] = React.useState(10);
  const [isRefetching, setIsRefetching] = React.useState(false);

  const {
    data,
    isLoading: fetching,
    isError,
  } = useGetWithdrawalRequests(currentPage, pageSize, 'PENDING');

  const withdrawalRequests = React.useMemo(() => {
    return data?.content || [];
  }, [data]);

  React.useEffect(() => {
    if (isError) {
      toast.error('Error fetching Withdrawal Requests. Please refresh');
    }
  }, [isError]);

  const transformForModal = (
    apiData: TableWithdrawalRequest,
  ): StoreWithdrawalRequest => ({
    ...apiData,
    status:
      apiData.status === 'PENDING'
        ? 'pending'
        : apiData.status === 'APPROVED'
        ? 'resolved'
        : apiData.status === 'REJECTED'
        ? 'failed'
        : 'pending',
    createdAt: { __type: 'Date' as const, iso: apiData.createdAt },

    lastName: '',
    email: '',
    balance: apiData.availableBalance || 0,
    bankAccount: {
      bankName: '',
      accountNumber: '',
      accountName: '',
    },
    transactionId: apiData.id,
  });

  const handleOpenViewDetails = (data: TableWithdrawalRequest) => {
    const transformedData = transformForModal(data);
    setSelectedData(transformedData);
  };

  const closeViewDetails = () => {
    setSelectedData(undefined);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page - 1);
  };

  if (fetching || isRefetching) {
    return (
      <motion.div
        layout
        className="col-span-2 h-[223px] w-full animate-pulse rounded-lg bg-neutral-300 p-4"
      ></motion.div>
    );
  }

  return (
    <div>
      <div className="p-4">
        <p className="font-heading text-base text-neutral-800">
          Pending Withdrawal Request (
          {convertToLocaleString(data?.totalElements)})
        </p>
      </div>

      <QmDrawer
        onOpenChange={(isOpen: boolean) => {
          if (!isOpen) {
            setSelectedData(undefined);
          }
        }}
        heightClass="h-auto lg:h-[80%]"
        trigger={
          <RecentWithdrawTable
            data={withdrawalRequests}
            viewDetails={handleOpenViewDetails}
            pagination={{
              currentPage: (data?.pageNo || 0) + 1,
              totalPages: data?.totalPages || 1,
              totalItems: data?.totalElements || 0,
              limit: data?.pageSize || pageSize,
            }}
            onPageChange={handlePageChange}
            currentPage={currentPage + 1}
          />
        }
      >
        {selectedData && (
          <WithdrawDetailsModal
            data={selectedData}
            onClose={closeViewDetails}
            setFetching={setIsRefetching}
          />
        )}
      </QmDrawer>
    </div>
  );
};

export default RecentWithdraw;
