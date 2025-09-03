import React from 'react';
import { useRouter } from 'next/navigation';
import { EraserIcon } from '@/app/icons/icons';
import { ChevronRight } from 'lucide-react';

interface ErasersCardProps {
  totalErasers: number;
  totalQuantity: number;
}

const ErasersCard: React.FC<ErasersCardProps> = ({
  totalErasers,
  totalQuantity,
}) => {
  const router = useRouter();

  return (
    <div className="relative h-[269px] select-none rounded-[10px] bg-[#F9F9F9]">
      <div className="absolute left-4 right-4 top-4">
        <div
          className="flex items-end justify-center text-center text-[#17478B]"
          style={{
            width: 200,
            height: 30,
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: 20,
            lineHeight: '30px',
            letterSpacing: 0,
          }}
        >
          Erasers
        </div>
      </div>

      <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center space-y-4">
        <div
          className="flex items-center justify-center"
          style={{ width: 80, height: 80 }}
        >
          <EraserIcon width={80} height={80} className="text-[#17478B]" />
        </div>
        <div className="text-sm text-gray-600">
          {totalErasers} {totalErasers === 1 ? 'type' : 'types'} available
        </div>
      </div>

      <button
        onClick={() => router.push('/products/erasers')}
        className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center justify-center space-x-2 rounded-full  bg-[#17478B] px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-[#0f3a75]"
      >
        <span>View Eraser List</span>
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

export default ErasersCard;
