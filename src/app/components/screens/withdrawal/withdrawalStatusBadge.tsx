import type { WithdrawalStatus } from '@/app/lib/types';

const STYLES: Record<WithdrawalStatus, string> = {
  pending: 'bg-warning-100 text-warning-800',
  approved: 'bg-positive-100 text-positive-800',
  processing: 'bg-positive-100 text-positive-800',
  rejected: 'bg-error-100 text-error-700',
};

const LABELS: Record<WithdrawalStatus, string> = {
  pending: 'Pending',
  approved: 'Successful',
  processing: 'Processing',
  rejected: 'Rejected',
};

export default function WithdrawalStatusBadge({
  status,
}: {
  status: WithdrawalStatus;
}) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${STYLES[status]}`}
    >
      {LABELS[status]}
    </span>
  );
}
