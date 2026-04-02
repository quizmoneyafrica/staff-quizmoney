'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import * as Dialog from '@radix-ui/react-dialog';
import { Avatar } from '@radix-ui/themes';
import { X, BadgeCheck } from 'lucide-react';
import { useApproveWithdrawal, useRejectWithdrawal } from '@/app/lib/queries';
import {
  formatNaira,
  formatDate,
  getInitials,
  formatTimeAgo,
} from '@/app/lib/utils';
import { ROUTES } from '@/app/lib/routes';
import type { WithdrawalRequest } from '@/app/lib/types';
import WithdrawalStatusBadge from './withdrawalStatusBadge';
import { Button } from '../../ui/button';

interface Props {
  withdrawal: WithdrawalRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function WithdrawalDetailModal({
  withdrawal,
  open,
  onOpenChange,
}: Props) {
  const router = useRouter();
  const [comment, setComment] = useState('');

  const { mutate: approve, isPending: approving } = useApproveWithdrawal();
  const { mutate: reject, isPending: rejecting } = useRejectWithdrawal();

  if (!withdrawal) return null;

  const handleApprove = () => {
    approve(
      { withdrawalId: withdrawal.id, note: comment || undefined },
      {
        onSuccess: () => {
          onOpenChange(false);
          setComment('');
        },
      },
    );
  };

  const handleReject = () => {
    if (!comment.trim()) return;
    reject(
      { withdrawalId: withdrawal.id, note: comment },
      {
        onSuccess: () => {
          onOpenChange(false);
          setComment('');
        },
      },
    );
  };

  const isPending = withdrawal.status === 'pending';
  const date = formatDate(withdrawal.created_at);
  const time = formatTimeAgo(withdrawal.created_at);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl focus:outline-none">
          {/* Header */}
          <div className="mb-5 flex items-center justify-between">
            <Dialog.Title className="font-heading text-lg font-semibold text-neutral-900">
              Withdrawal details
            </Dialog.Title>
            <Dialog.Close className="rounded-full p-1 transition-colors hover:bg-neutral-100">
              <X size={18} className="text-neutral-500" />
            </Dialog.Close>
          </div>

          <div className="border-t border-neutral-100 pt-4">
            {/* Player info row */}
            <div className="mb-5 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar
                  fallback={getInitials(withdrawal.players?.username ?? 'U')}
                  radius="full"
                  className="bg-primary-50 p-4 text-xs text-[#00000090]"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="font-semibold capitalize text-neutral-900">
                      {withdrawal.players?.username ?? '—'}
                    </p>
                    {/* <BadgeCheck size={14} className="text-primary-600" /> */}
                  </div>
                  <p className="text-sm text-neutral-500">
                    {withdrawal.players?.email}
                  </p>
                  {/* <button
                    onClick={() => {
                      router.push(ROUTES.PLAYER_PROFILE(withdrawal.player_id));
                      onOpenChange(false);
                    }}
                    className="bg-primary-800 hover:bg-primary-700 mt-1.5 rounded-full px-3 py-1 text-xs font-medium text-white transition-colors"
                  >
                    View user Profile
                  </button> */}
                </div>
              </div>
              <div className="text-right">
                <Button
                  onClick={() => {
                    router.push(ROUTES.PLAYER_PROFILE(withdrawal.player_id));
                    onOpenChange(false);
                  }}
                  className="bg-primary-800 hover:bg-primary-700 mt-1.5 rounded-full px-3 py-1 text-xs font-medium text-white transition-colors"
                >
                  View user Profile
                </Button>
                {/* <p className="text-xs text-neutral-500">Wallet Balance</p>
                <p className="font-semibold text-neutral-800">
                  {formatNaira(withdrawal.amount)}
                </p> */}
              </div>
            </div>

            {/* Detail rows */}
            <div className="space-y-3 border-t border-neutral-100 pt-4">
              <DetailRow
                label="Request ID"
                value={`ID${withdrawal.id.slice(0, 7).toUpperCase()}`}
              />
              <DetailRow
                label="Request Amount"
                value={
                  withdrawal.amount_formatted ?? formatNaira(withdrawal.amount)
                }
                valueClass="font-semibold text-neutral-900"
              />
              <DetailRow
                label="Withdrawal Account"
                value={
                  <div className="text-right">
                    <p>
                      {withdrawal.player_bank_accounts?.account_name ?? '—'}
                    </p>
                    <p className="text-neutral-500">
                      {withdrawal.player_bank_accounts?.account_number}
                    </p>
                    <p className="text-neutral-500">
                      {withdrawal.player_bank_accounts?.bank_name}
                    </p>
                  </div>
                }
              />
              <DetailRow
                label="Request Date"
                // value={date.toLocaleDateString('en-NG', {
                //   day: '2-digit',
                //   month: '2-digit',
                //   year: 'numeric',
                // })}
                value={date}
              />
              <DetailRow label="Request Time" value={time} />
              <DetailRow
                label="Request Status"
                value={<WithdrawalStatusBadge status={withdrawal.status} />}
              />
            </div>

            {/* Admin note — only if reviewed */}
            {withdrawal.admin_note && (
              <div className="mt-3 rounded-lg bg-neutral-50 px-3 py-2 text-sm text-neutral-600">
                <span className="font-medium">Note: </span>
                {withdrawal.admin_note}
              </div>
            )}

            {/* Comment box + actions — only for pending */}
            {isPending && (
              <>
                <div className="mt-4 border-t border-dashed border-neutral-200 pt-4">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add Comments"
                    rows={3}
                    className="focus:border-primary-400 w-full resize-none rounded-xl border border-neutral-200 px-4 py-3 text-sm text-neutral-700 outline-none placeholder:text-neutral-400"
                  />
                </div>

                <div className="mt-4 flex gap-3">
                  <button
                    onClick={handleReject}
                    disabled={!comment.trim() || rejecting}
                    className="bg-error-500 hover:bg-error-600 flex-1 rounded-full py-2.5 text-sm font-semibold text-white transition disabled:opacity-50"
                  >
                    {rejecting ? 'Rejecting…' : 'Reject'}
                  </button>
                  <button
                    onClick={handleApprove}
                    disabled={approving}
                    className="bg-positive-500 hover:bg-positive-600 flex-1 rounded-full py-2.5 text-sm font-semibold text-white transition disabled:opacity-50"
                  >
                    {approving ? 'Approving…' : 'Approve'}
                  </button>
                </div>
              </>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ─── Detail Row ───────────────────────────────────────────────

function DetailRow({
  label,
  value,
  valueClass = 'text-neutral-700',
}: {
  label: string;
  value: React.ReactNode;
  valueClass?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <p className="shrink-0 text-sm text-neutral-500">{label}</p>
      <div className={`text-right text-sm ${valueClass}`}>{value}</div>
    </div>
  );
}
