import { useState } from 'react';
import { useSuspendPlayer, useUnsuspendPlayer } from '@/app/lib/queries';
import { toast } from 'sonner';
import { Flag, X } from 'lucide-react';

// ─── Suspend / Unsuspend Dialog ────────────────────────────────────────────────
export function SuspendDialog({
  playerId,
  isSuspended,
  onClose,
}: {
  playerId: string;
  isSuspended: boolean;
  onClose: () => void;
}) {
  const [reason, setReason] = useState('');
  const suspend = useSuspendPlayer();
  const unsuspend = useUnsuspendPlayer();
  const busy = suspend.isPending || unsuspend.isPending;

  const confirm = () => {
    if (isSuspended) {
      unsuspend.mutate(playerId, { onSuccess: onClose });
    } else {
      if (!reason.trim()) {
        toast.error('Enter a reason');
        return;
      }
      suspend.mutate({ playerId, reason }, { onSuccess: onClose });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flag className="h-4 w-4 text-red-500" />
            <h3 className="font-semibold">
              {isSuspended ? 'Unsuspend User' : 'Suspend User'}
            </h3>
          </div>
          <button onClick={onClose}>
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>
        <p className="mb-4 text-center text-sm text-gray-600">
          {isSuspended
            ? 'Are you sure you want to unsuspend this user? This will restore their account activities.'
            : 'Are you sure you want to suspend this user? This action will restrict their account activities and mark them for review.'}
        </p>
        {!isSuspended && (
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter reason…"
            rows={3}
            className="mb-4 w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
          />
        )}
        <div className="flex justify-center gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            No, cancel
          </button>
          <button
            onClick={confirm}
            disabled={busy}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${
              isSuspended
                ? 'hover:bg-primary-800 bg-blue-600'
                : 'bg-red-500 hover:bg-red-600'
            }`}
          >
            {busy
              ? 'Processing…'
              : isSuspended
              ? 'Yes, unsuspend this user'
              : 'Yes, suspend this user'}
          </button>
        </div>
      </div>
    </div>
  );
}
