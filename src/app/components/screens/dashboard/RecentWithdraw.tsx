import * as React from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  useGetWithdrawalRequests,
  type WithdrawalRequest,
} from '@/app/api/withdrawal';
import RecentWithdrawTable from '../withdrawal/table';
import QmDrawer from '../../drawer/drawer';
import WithdrawDetailsModal from '../withdrawal/WithdrawDrawer';
import { convertToLocaleString } from '@/app/utils';
import { WithdrawalStatus } from '@/app/store/withdrawalSlice';

type TableWithdrawalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

type TableWithdrawalRequest = Omit<
  WithdrawalRequest,
  'status' | 'createdAt'
> & {
  status: TableWithdrawalStatus;
  createdAt: string;
};

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
  customerId: string;
  avatarUrl?: string;
  kycVerified?: boolean;
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
    if (!data?.content) return [];

    return data.content
      .filter((req): req is TableWithdrawalRequest =>
        ['PENDING', 'APPROVED', 'REJECTED'].includes(req.status),
      )
      .map((req) => ({
        ...req,

        status: req.status as TableWithdrawalStatus,
      }));
  }, [data]);

  React.useEffect(() => {
    if (isError) {
      toast.error('Error fetching Withdrawal Requests. Please refresh');
    }
  }, [isError]);

  const transformForModal = (
    apiData: TableWithdrawalRequest,
  ): StoreWithdrawalRequest => {
    let status: 'pending' | 'resolved' | 'failed' = 'pending';
    if (apiData.status === 'APPROVED') {
      status = 'resolved';
    } else if (apiData.status === 'REJECTED') {
      status = 'failed';
    }

    return {
      id: apiData.id,
      purpose: apiData.purpose,
      comment: apiData.comment,
      amount: apiData.amount,
      status,
      processAt: apiData.processAt,
      createdAt: { __type: 'Date' as const, iso: apiData.createdAt },
      firstName: apiData.firstName,
      lastName: '',
      email: '',
      balance: apiData.availableBalance,
      availableBalance: apiData.availableBalance,
      customerId: apiData.customerId,
      avatarUrl: apiData.avatarUrl,
      kycVerified: apiData.kycVerified,
      approvedBy: apiData.approvedBy,
      bankAccount: {
        bankName: '',
        accountNumber: '',
        accountName: '',
      },
      transactionId: apiData.id,
    };
  };

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
