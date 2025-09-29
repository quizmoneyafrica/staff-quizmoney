import { toast } from 'sonner';
import AppLoader from '../../loader/loader';
import { formatDateTime, formatNaira, toastPosition } from '@/app/utils/utils';
import { setWithdrawalRequests } from '@/app/store/withdrawalSlice';
import { useState } from 'react';
import WithdrawalApi from '@/app/api/withdrawalApi';
import copy from 'copy-to-clipboard';
import { Copy } from 'lucide-react';
import { Avatar } from '@radix-ui/themes';
import { useAppDispatch } from '@/app/hooks/useAuth';
import { VerifiedIcon } from '@/app/icons/icons';

export interface StoreWithdrawalRequest {
  id: string;
  purpose: string;
  comment: string;
  amount: number;
  status: 'pending' | 'resolved' | 'failed';
  processAt: string;
  createdAt:
    | {
        __type: 'Date';
        iso: string;
      }
    | string;
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

/* eslint-disable @typescript-eslint/no-explicit-any */

interface IWithdrawDetailsModalProps {
  data: StoreWithdrawalRequest;
  onClose: () => void;
  setFetching: (fetching: boolean) => void;
}

const WithdrawDetailsModal: React.FunctionComponent<
  IWithdrawDetailsModalProps
> = ({ data, onClose, setFetching }) => {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();

  const fetchWithdrawalRequest = async () => {
    setFetching(true);
    try {
      const res = await WithdrawalApi.fetchWithdrawalRequest();
      dispatch(setWithdrawalRequests(res.data.result.withdrawalRequests));
    } catch {
      toast.error('Error fetching Withdrawal Request. Please refresh', {
        position: toastPosition,
      });
    } finally {
      setFetching(false);
    }
  };

  const handleReject = () => {};

  const handleApproved = async () => {
    if (!data || !data.transactionId) {
      toast.error('Invalid transaction data');
      return;
    }

    const fee = 0;
    try {
      setIsLoading(true);
      await WithdrawalApi.approveWithdrawal(data.transactionId, fee);

      toast.success('Withdrawal approved successfully!');
      onClose();
      await fetchWithdrawalRequest();
    } catch (error: any) {
      console.error('Error approving withdrawal:', error.message);
      toast.error(`Failed to approve withdrawal: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <AppLoader />;
  }

  const handleCopy = (text: string) => {
    copy(text);
    toast.success('Copied Successfully', { position: toastPosition });
  };

  const getFormattedDate = (
    dateValue: string | { __type: string; iso: string } | undefined,
  ): string => {
    if (!dateValue) return 'N/A';

    const dateString =
      typeof dateValue === 'string' ? dateValue : dateValue.iso || '';

    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? 'N/A' : date.toLocaleString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'N/A';
    }
  };

  const formattedDate = getFormattedDate(data?.createdAt);
  const [fullDate, time] = formattedDate.split(',').map((s) => s.trim());
  return (
    <div className="space-y-7 py-5">
      <div className="flex items-center justify-between">
        <p className="font-heading font-bold">Withdrawal details</p>
      </div>

      <div className="flex items-center justify-between border-b border-t py-4">
        <div className="inline-flex items-center gap-2">
          <div
            className="bg-primary-50 h-[40px] w-[40px] cursor-pointer rounded-full p-1 transition-opacity hover:opacity-80"
            onClick={(e) => {
              e.stopPropagation();
              if (data.customerId) {
                window.open(
                  `/players/player-profile/${data.customerId}`,
                  '_blank',
                );
              }
            }}
          >
            <Avatar
              src={data.avatarUrl || ''}
              fallback={data.firstName?.charAt(0).toUpperCase()}
              radius="full"
              className="bg-primary-50"
            />
          </div>

          <div>
            <div className="flex items-center gap-1">
              <p className="font-heading font-medium capitalize">
                {data.firstName} {data.lastName}
              </p>
              {data.kycVerified && (
                <VerifiedIcon className="h-4 w-4 text-blue-500" />
              )}
            </div>
            <p>{data.email}</p>
          </div>
        </div>
        <div className="space-y-1">
          <p className="font-heading font-medium">Wallet Balance</p>
          <p>{formatNaira(Number(data.balance), true)}</p>
        </div>
      </div>

      <div className="space-y-8 border-b border-dashed pb-5">
        <LinedData title="Request ID" data={data.transactionId} />
        <LinedData
          title="Request Amount"
          data={`${formatNaira(Number(data.amount), true)}`}
          onClick={() =>
            handleCopy(`${formatNaira(Number(data.amount), true)}`)
          }
        />
        <LinedData
          title="Bank Name"
          data={data.bankAccount?.bankName || 'N/A'}
        />
        <LinedData
          title="Account No"
          data={data.bankAccount?.accountNumber || 'N/A'}
        />
        <LinedData
          title="Account Holder"
          data={data.bankAccount?.accountName || 'N/A'}
        />
        <LinedData title="Request Date" data={fullDate} />
        <LinedData title="Request Time" data={time} />
        <LinedData title="Request Status" data={data.status} />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-end space-x-4">
          <button
            onClick={handleReject}
            disabled
            className="bg-error-400 inline-flex h-10 w-[120px] cursor-not-allowed items-center justify-center rounded-3xl px-[18px] py-2 text-white opacity-10"
          >
            Reject
          </button>
          <button
            onClick={handleApproved}
            disabled={data.status === 'resolved'}
            className="bg-positive-800 inline-flex h-10 w-[120px] cursor-pointer items-center justify-center rounded-3xl px-[18px] py-2 text-white disabled:cursor-not-allowed disabled:opacity-10"
          >
            Approve
          </button>
        </div>
      </div>
    </div>
  );
};

export default WithdrawDetailsModal;

interface LinedDataProps {
  title: string;
  data: string | any;
  onClick?: () => void;
}

const LinedData: React.FunctionComponent<LinedDataProps> = ({
  title,
  data,
  onClick,
}) => {
  return (
    <div className="flex items-center justify-between">
      <p className="font-heading">{title}</p>

      <p
        className={`font-heading capitalize ${
          data === 'resolved'
            ? 'bg-positive-50 text-positive-900 rounded-full px-4 py-1'
            : data === 'failed'
            ? 'bg-error-50 text-error-900 rounded-full px-4 py-1'
            : data === 'pending'
            ? 'bg-warning-100 text-warning-900 rounded-full px-4 py-1'
            : null
        }`}
      >
        {data}
      </p>
      <button onClick={onClick}>
        <Copy />
      </button>
    </div>
  );
};
