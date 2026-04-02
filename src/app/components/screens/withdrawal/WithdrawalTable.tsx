'use client';

import { Avatar } from '@radix-ui/themes';
import { DropdownMenu } from 'radix-ui';
import { MoreVertical, Eye } from 'lucide-react';
import { formatNaira, formatDateTime, getInitials } from '@/app/lib/utils';
import type { WithdrawalRequest } from '@/app/lib/types';
import WithdrawalStatusBadge from './withdrawalStatusBadge';

interface Props {
  withdrawals: WithdrawalRequest[];
  onViewDetails: (w: WithdrawalRequest) => void;
  // Optional — for full page pagination
  pagination?: {
    page: number;
    totalPages: number;
    total: number;
    onPageChange: (page: number) => void;
  };
}

export default function WithdrawalTable({
  withdrawals,
  onViewDetails,
  pagination,
}: Props) {
  if (withdrawals.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-neutral-400">
        No withdrawal requests found
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100 text-left text-xs font-medium text-neutral-500">
              <th className="px-6 py-3">Request ID</th>
              <th className="px-6 py-3">Username</th>
              <th className="px-6 py-3">Amount Requested</th>
              <th className="px-6 py-3">Bank</th>
              <th className="px-6 py-3">Withdrawal Status</th>
              <th className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50">
            {withdrawals.map((w) => (
              <tr
                key={w.id}
                className="cursor-pointer transition-colors hover:bg-neutral-50"
                onClick={() => onViewDetails(w)}
              >
                {/* Request ID */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-neutral-100 p-2">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-neutral-500"
                      >
                        <rect x="2" y="5" width="20" height="14" rx="2" />
                        <line x1="2" y1="10" x2="22" y2="10" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-neutral-800">
                        ID{w.id.slice(0, 3).toUpperCase()}...
                        {w.id.slice(0, 7).toUpperCase()}
                      </p>
                      <p className="text-xs text-neutral-400">
                        {formatDateTime(w.created_at)}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Username */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Avatar
                      fallback={getInitials(w.players?.username ?? 'U')}
                      radius="full"
                      className="bg-primary-50 p-2 text-xs text-[#00000090]"
                    />

                    <span className="text-primary-700 font-medium capitalize">
                      {w.players?.username ?? '—'}
                    </span>
                  </div>
                </td>

                {/* Amount */}
                <td className="px-6 py-4 font-medium text-neutral-800">
                  {w.amount_formatted ?? formatNaira(w.amount)}
                </td>

                {/* Bank */}
                <td className="px-6 py-4">
                  <p className="text-neutral-700">
                    {w.player_bank_accounts?.bank_name ?? '—'}
                  </p>
                  <p className="text-xs text-neutral-400">
                    {w.player_bank_accounts?.account_number}
                  </p>
                </td>

                {/* Status */}
                <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                  <WithdrawalStatusBadge status={w.status} />
                </td>

                {/* Action */}
                <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                      <button className="cursor-pointer rounded-full p-1 transition-colors hover:bg-neutral-100">
                        <MoreVertical size={16} className="text-neutral-500" />
                      </button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Portal>
                      <DropdownMenu.Content
                        className="DropdownMenuContent"
                        sideOffset={4}
                      >
                        <DropdownMenu.Item
                          className="DropdownMenuItem"
                          onSelect={() => onViewDetails(w)}
                        >
                          View Details
                          <span className="RightSlot">
                            <Eye size={14} />
                          </span>
                        </DropdownMenu.Item>
                      </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Root>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination — only shown on full page */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-neutral-100 px-6 py-4">
          <p className="text-xs text-neutral-500">
            Showing {withdrawals.length} of {pagination.total} requests
          </p>
          <div className="flex items-center gap-1">
            <PageBtn
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              ‹
            </PageBtn>
            {Array.from(
              { length: Math.min(5, pagination.totalPages) },
              (_, i) => {
                const page = i + 1;
                return (
                  <PageBtn
                    key={page}
                    onClick={() => pagination.onPageChange(page)}
                    active={pagination.page === page}
                  >
                    {page}
                  </PageBtn>
                );
              },
            )}
            {pagination.totalPages > 5 && (
              <span className="px-1 text-neutral-400">…</span>
            )}
            <PageBtn
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              ›
            </PageBtn>
          </div>
        </div>
      )}
    </div>
  );
}

function PageBtn({
  children,
  onClick,
  disabled,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`min-w-7 h-7 rounded px-2 text-xs font-medium transition ${
        active
          ? 'bg-primary-800 text-white'
          : 'text-neutral-600 hover:bg-neutral-100 disabled:opacity-40'
      }`}
    >
      {children}
    </button>
  );
}
