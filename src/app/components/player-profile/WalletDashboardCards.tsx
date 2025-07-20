import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { CoinIcon, ProductIcon, WalletHistoryIcon } from '@/app/icons/icons';
import { useParams } from 'next/navigation';
import { usePlayerProfile } from '@/app/hooks/usePlayerProfile';
import { formatNaira } from '@/app/utils/utils';
import { useUpdatePlayerErasers, useUpdatePlayerCoins } from '@/app/api/wallet';
import { toast } from 'sonner';

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
}) => (
  <div className="w-full rounded-lg border border-gray-200 bg-white shadow-sm">
    <div className="p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
          {icon}
        </div>
        <h3 className="text-sm font-medium text-gray-700">{title}</h3>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={onDecrement}
          className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 transition-colors hover:bg-gray-50"
          aria-label={`Decrease ${title.toLowerCase()}`}
        >
          <Minus className="h-4 w-4 text-gray-600" />
        </button>
        <span className="min-w-[3rem] text-center text-2xl font-semibold text-[#17478B] ">
          {count}
        </span>
        <button
          onClick={onIncrement}
          className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 transition-colors hover:bg-gray-50"
          aria-label={`Increase ${title.toLowerCase()}`}
        >
          <Plus className="h-4 w-4 text-gray-600" />
        </button>
      </div>
    </div>
  </div>
);

const WalletDashboard: React.FC = () => {
  const params = useParams();
  const userId = params.userId as string;

  const { data: playerData } = usePlayerProfile(userId);

  const { mutateAsync: updateEraser } = useUpdatePlayerErasers();
  const { mutateAsync: updateCoins } = useUpdatePlayerCoins();

  const handleEraserIncrement = async () => {
    try {
      const response = await updateEraser({
        userId,
        erasersCount: 1,
      });

      if (response?.result?.status === 'error') {
        toast.error(response?.result?.message);
      } else {
        toast.success(response?.result?.message);
      }
    } catch (error) {
      toast.error(error?.result?.message);
    }
  };

  const handleEraserDecrement = async () => {
    try {
      const response = await updateEraser({
        userId,
        erasersCount: -1,
      });

      if (response?.result?.status === 'error') {
        toast.error(response?.result?.message);
      } else {
        toast.success(response?.result?.message);
      }
    } catch (error) {
      toast.error(error?.result?.message);
    }
  };

  const handleCoinIncrement = async () => {
    try {
      const response = await updateCoins({
        userId,
        coinsCount: 10,
      });

      if (response?.result?.status === 'error') {
        toast.error(response?.result?.message);
      } else {
        toast.success(response?.result?.message);
      }
    } catch (error) {
      toast.error(error?.result?.message);
    }
  };

  const handleCoinDecrement = async () => {
    try {
      const response = await updateCoins({
        userId,
        coinsCount: -10,
      });

      if (response?.result?.status === 'error') {
        toast.error(response?.result?.message);
      } else {
        toast.success(response?.result?.message);
      }
    } catch (error) {
      toast.error(error?.result?.message);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl p-6">
      <div className="grid  grid-cols-1 gap-6 md:grid-cols-3">
        <WalletCard
          balance={formatNaira(playerData?.userDetails?.balance ?? 0)}
        />

        <CounterCard
          title="Erasers"
          count={playerData?.userDetails?.eraser ?? 0}
          icon={<ProductIcon className="h-5 w-5 text-[#17478B]" />}
          onIncrement={handleEraserIncrement}
          onDecrement={handleEraserDecrement}
        />

        <CounterCard
          title="QM Coin"
          count={playerData?.userDetails?.coinBalance ?? 0}
          icon={<CoinIcon className="h-5 w-5 text-yellow-500" />}
          onIncrement={handleCoinIncrement}
          onDecrement={handleCoinDecrement}
        />
      </div>
    </div>
  );
};

export default WalletDashboard;
