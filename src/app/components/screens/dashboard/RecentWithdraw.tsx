'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useWithdrawals } from '@/app/lib/queries';
import type { WithdrawalRequest } from '@/app/lib/types';
import WithdrawalTable from '../withdrawal/WithdrawalTable';
import WithdrawalDetailModal from '../withdrawal/WithdrawalDetailModal';

export default function RecentWithdraw() {
  const [selected, setSelected] = useState<WithdrawalRequest | null>(null);
  const { data, isLoading } = useWithdrawals({ status: 'pending', limit: 10 });
  const withdrawals = data?.withdrawals ?? [];
  const total = data?.pagination?.total ?? 0;

  if (isLoading) {
    return (
      <motion.div
        layout
        className="h-48 w-full animate-pulse rounded-xl bg-neutral-200"
      />
    );
  }

  return (
    <>
      <div>
        <div className="border-b border-neutral-100 px-6 py-4">
          <p className="font-heading text-base font-medium text-neutral-800">
            Recent Withdrawal Request
            <span className="bg-warning-100 text-warning-800 ml-2 rounded-full px-2 py-0.5 text-xs font-semibold">
              {total}
            </span>
          </p>
        </div>
        <WithdrawalTable
          withdrawals={withdrawals}
          onViewDetails={(w) => setSelected(w)}
        />
      </div>

      <WithdrawalDetailModal
        withdrawal={selected}
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      />
    </>
  );
}
