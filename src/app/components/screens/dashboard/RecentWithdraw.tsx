import * as React from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useGetWithdrawalRequests } from '@/app/api';
import { WithdrawalRequest } from '@/app/store/withdrawalSlice';
import RecentWithdrawTable from '../withdrawal/table';
import QmDrawer from '../../drawer/drawer';
import WithdrawDetailsModal from '../withdrawal/WithdrawDrawer';

const RecentWithdraw: React.FunctionComponent = () => {
  const [openViewModal, setOpenViewModal] = React.useState(false);
  const [selectedData, setSelectedData] = React.useState<WithdrawalRequest>();
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage] = React.useState(10);
  const [isRefetching, setIsRefetching] = React.useState(false);

  const {
    data,
    isPending: fetching,
    isError,
    error,
  } = useGetWithdrawalRequests(currentPage, itemsPerPage, 'pending', '', null);

  const withdrawalRequests = React.useMemo(() => {
    if (data?.results) {
      return data.results;
    }
    return [];
  }, [data]);

  React.useEffect(() => {
    if (isError) {
      toast.error('Error fetching Withdrawal Requests. Please refresh');
    }
  }, [isError]);

  const handleOpenViewDetails = (data: WithdrawalRequest) => {
    setOpenViewModal(true);
    setSelectedData(data);
  };

  const closeViewDetails = () => {
    setOpenViewModal(false);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
          Pending Withdrawal Request ({data?.pagination?.totalItems || 0})
        </p>
      </div>

      <QmDrawer
        onOpenChange={setOpenViewModal}
        heightClass="h-auto lg:h-[80%]"
        trigger={
          <RecentWithdrawTable
            data={withdrawalRequests}
            viewDetails={handleOpenViewDetails}
            pagination={data?.pagination}
            onPageChange={handlePageChange}
            currentPage={currentPage}
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
