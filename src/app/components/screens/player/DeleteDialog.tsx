import { X } from 'lucide-react';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { playersApi } from '@/app/lib/api';

// ─── Delete Dialog ─────────────────────────────────────────────────────────────
export function DeleteDialog({
  playerId,
  onClose,
  onDeleted,
}: {
  playerId: string;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const qc = useQueryClient();
  const mut = useMutation({
    mutationFn: () => playersApi.updatePlayer(playerId, { is_active: false }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['players'] });
      toast.success('User deleted');
      onDeleted();
    },
    onError: () => toast.error('Delete failed'),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold text-red-600">Delete User Account?</h3>
          <button onClick={onClose}>
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>
        <p className="mb-6 text-center text-sm text-gray-600">
          This action is irreversible. All user data, wallet balance, and
          activity history will be permanently deleted. Are you sure you want to
          proceed?
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            No, cancel
          </button>
          <button
            onClick={() => mut.mutate()}
            disabled={mut.isPending}
            className="hover:bg-primary-700 bg-primary-800 rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {mut.isPending ? 'Deleting…' : 'Yes, Delete this user'}
          </button>
        </div>
      </div>
    </div>
  );
}
