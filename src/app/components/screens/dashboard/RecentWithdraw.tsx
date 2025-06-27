import * as React from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import WithdrawalApi from '@/app/api/withdrawalApi';
import { useAppDispatch, useAppSelector } from '@/app/hooks/useAuth';
import {
  setWithdrawalRequests,
  WithdrawalRequest,
} from '@/app/store/withdrawalSlice';
import RecentWithdrawTable from '../withdrawal/table';
import QmDrawer from '../../drawer/drawer';
import WithdrawDetailsModal from '../withdrawal/WithdrawDrawer';

const RecentWithdraw: React.FunctionComponent = () => {
  const dispatch = useAppDispatch();
  const { requests } = useAppSelector((state) => state.withdraw);
  const [openViewModal, setOpenViewModal] = React.useState(false);

  const [selectedData, setSelectedData] = React.useState<WithdrawalRequest>();
  const [fetching, setFetching] = React.useState(false);

  const fetchWithdrawalRequest = React.useCallback(async () => {
    if (requests?.length > 0) return;
    setFetching(true);
    try {
      const res = await WithdrawalApi.fetchWithdrawalRequest();
      dispatch(setWithdrawalRequests(res.data.result.withdrawalRequests));
    } catch {
      toast.error('Error fetching Withdrawal Request. Please refresh');
    } finally {
      setFetching(false);
    }
  }, [dispatch, requests?.length]);

  React.useEffect(() => {
    fetchWithdrawalRequest();
  }, [fetchWithdrawalRequest]);

  const handleOpenViewDetails = (data: WithdrawalRequest) => {
    setOpenViewModal(true);
    setSelectedData(data);
  };

  const closeViewDetails = () => {
    setOpenViewModal(false);
  };

  if (fetching) {
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
          Pending Withdrawal Request
        </p>
      </div>

      <QmDrawer
        // open={openViewModal}
        onOpenChange={setOpenViewModal}
        heightClass="h-auto lg:h-[80%]"
        trigger={
          <RecentWithdrawTable
            data={requests}
            viewDetails={handleOpenViewDetails}
          />
        }
      >
        {selectedData && (
          <WithdrawDetailsModal
            data={selectedData}
            onClose={closeViewDetails}
            setFetching={setFetching}
          />
        )}
      </QmDrawer>
      {/* {openViewModal && (
        <WithdrawDetailsModal
          isOpen={openViewModal}
          onClose={closeViewDetails}
          data={selectedData}
          fetchWithdrawalRequest={fetchWithdrawalRequest}
        />
      )} */}
    </div>
  );
};

export default RecentWithdraw;
