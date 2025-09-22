import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { CoinIcon, ProductIcon, WalletHistoryIcon } from '@/app/icons/icons';
import { useParams } from 'next/navigation';
import { usePlayerBalances } from '@/app/hooks/usePlayerBalances';
import { formatNaira } from '@/app/utils/utils';
import { useUpdatePlayerErasers, useUpdatePlayerCoins } from '@/app/api/wallet';
import { toast } from 'sonner';
import { useAppSelector } from '@/app/hooks/useAuth';

interface WalletCardProps {
  balance: string;
}

interface CounterCardProps {
  title: string;
  count: number;
  icon: React.ReactNode;
  onIncrement?: () => void;
  onDecrement?: () => void;
}

const WalletCard: React.FC<WalletCardProps> = ({ balance }) => (
  <div className="w-full rounded-lg border border-gray-200 bg-white shadow-sm">
    <div className="p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
          <WalletHistoryIcon className="h-5 w-5 text-[#17478B]" />
        </div>
        <h3 className="text-sm font-medium text-gray-700">Wallet Balance</h3>
      </div>
      <p className="text-2xl font-semibold text-[#17478B]">{balance}</p>
    </div>
  </div>
);

const CounterCard: React.FC<CounterCardProps> = ({
  title,
  count,
  icon,
  onIncrement,
  onDecrement,
}) => {
  const user = useAppSelector((s) => s.auth.userEncryptedData);

  return (
    <div className="w-full rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
            {icon}
          </div>
          <h3 className="text-sm font-medium text-gray-700">{title}</h3>
        </div>
        <div className="flex items-center gap-4">
          {/* {['SUPER_ADMIN', 'MANAGER'].includes(user?.role) && (
            <button
              onClick={onDecrement}
              className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 transition-colors hover:bg-gray-50"
              aria-label={`Decrease ${title.toLowerCase()}`}
            >
              <Minus className="h-4 w-4 text-gray-600" />
            </button>
          )} */}
          <span className="min-w-[3rem] text-center text-2xl font-semibold text-[#17478B] ">
            {count}
          </span>
          {/* {['SUPER_ADMIN', 'MANAGER'].includes(user?.role) && (
            <button
              onClick={onIncrement}
              className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 transition-colors hover:bg-gray-50"
              aria-label={`Increase ${title.toLowerCase()}`}
            >
              <Plus className="h-4 w-4 text-gray-600" />
            </button>
          )} */}
        </div>
      </div>
    </div>
  );
};

const WalletDashboard: React.FC = () => {
  const params = useParams();
  const userId = params.userId as string;
  const { data: balances } = usePlayerBalances(userId);
  const { mutateAsync: updateEraser } = useUpdatePlayerErasers();
  const { mutateAsync: updateCoins } = useUpdatePlayerCoins();
  const user = useAppSelector((s) => s.auth.userEncryptedData);

  const handleUpdateErasers = async (newCount: number) => {
    try {
      const response = await updateEraser({
        userId,
        erasersCount: Math.abs(newCount - (balances?.eraserBalance || 0)),
        action:
          newCount > (balances?.eraserBalance || 0) ? 'increment' : 'decrement',
      });

      if (response?.result?.status === 'error') {
        toast.error(response?.result?.message);
      } else {
        toast.success('Erasers updated successfully');
      }
    } catch (error) {
      toast.error('Failed to update erasers');
    }
  };

  const handleUpdateCoins = async (newCount: number) => {
    try {
      const response = await updateCoins({
        userId,
        coin: Math.abs(newCount - (balances?.coinBalance || 0)),
        action:
          newCount > (balances?.coinBalance || 0) ? 'increment' : 'decrement',
      });

      if (response?.result?.status === 'error') {
        toast.error(response?.result?.message);
      } else {
        toast.success('Coins updated successfully');
      }
    } catch (error) {
      toast.error('Failed to update coins');
    }
  };

  return (
    <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3">
      <WalletCard balance={formatNaira(balances?.walletBalance || 0)} />
      <CounterCard
        title="Erasers"
        count={balances?.eraserBalance || 0}
        icon={<ProductIcon className="h-5 w-5 text-[#17478B]" />}
        onIncrement={() =>
          handleUpdateErasers((balances?.eraserBalance || 0) + 1)
        }
        onDecrement={() =>
          handleUpdateErasers(Math.max(0, (balances?.eraserBalance || 0) - 1))
        }
      />
      <CounterCard
        title="Coins"
        count={balances?.coinBalance || 0}
        icon={<CoinIcon className="h-5 w-5 text-[#17478B]" />}
        onIncrement={() => handleUpdateCoins((balances?.coinBalance || 0) + 1)}
        onDecrement={() =>
          handleUpdateCoins(Math.max(0, (balances?.coinBalance || 0) - 1))
        }
      />
    </div>
  );
};

export default WalletDashboard;
