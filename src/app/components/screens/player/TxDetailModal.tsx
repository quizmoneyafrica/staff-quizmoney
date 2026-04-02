/* eslint-disable @typescript-eslint/no-explicit-any */
import { formatDateTime, formatNaira } from '@/app/lib/utils';
import { X } from 'lucide-react';

// ─── Transaction Detail Modal ──────────────────────────────────────────────────
export function TxDetailModal({
  tx,
  onClose,
}: {
  tx: any;
  onClose: () => void;
}) {
  const isCredit =
    tx.direction === 'credit' ||
    tx.type === 'deposit' ||
    tx.type === 'wallet_topup';
  const isSuccess = tx.status === 'success' || tx.status === 'completed';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h3 className="font-semibold">Transaction Details</h3>
          <button onClick={onClose}>
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3 p-5">
          {/* row 1 */}
          <div className="rounded-xl bg-gray-50 p-3">
            <p className="text-primary-800 mb-1 text-xs font-medium">
              Transaction ID
            </p>
            <p className="text-sm font-semibold text-gray-800">
              {tx.id?.slice(0, 10)}
            </p>
          </div>
          <div className="rounded-xl bg-gray-50 p-3">
            <p className="text-primary-800 mb-1 text-xs font-medium">
              Transaction title
            </p>
            <span className="inline-flex rounded bg-blue-100 px-2 py-0.5 text-xs font-semibold capitalize text-blue-700">
              {(tx.description ?? tx.type ?? 'wallet top up').replace(
                /_/g,
                ' ',
              )}
            </span>
          </div>
          <div className="rounded-xl bg-gray-50 p-3">
            <p className="text-primary-800 mb-1 text-xs font-medium">
              Transaction type
            </p>
            <span
              className={`inline-flex rounded px-2 py-0.5 text-xs font-semibold ${
                isCredit
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-600'
              }`}
            >
              {isCredit ? 'Deposit' : 'Withdrawal'}
            </span>
          </div>
          {/* row 2 */}
          <div className="rounded-xl bg-gray-50 p-3">
            <p className="text-primary-800 mb-1 text-xs font-medium">
              Transaction Status
            </p>
            <span
              className={`inline-flex rounded px-2 py-0.5 text-xs font-semibold ${
                isSuccess
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}
            >
              {isSuccess ? 'Successful' : tx.status ?? 'Pending'}
            </span>
          </div>
          <div className="rounded-xl bg-gray-50 p-3">
            <p className="text-primary-800 mb-1 text-xs font-medium">
              Transaction Amount
            </p>
            <p className="text-sm font-semibold text-gray-800">
              {formatNaira(tx.amount ?? tx.amount_kobo ?? 0)}
            </p>
          </div>
          <div className="rounded-xl bg-gray-50 p-3">
            <p className="text-primary-800 mb-1 text-xs font-medium">
              Date & Time
            </p>
            <p className="text-sm font-semibold text-gray-800">
              {formatDateTime(tx.created_at)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
