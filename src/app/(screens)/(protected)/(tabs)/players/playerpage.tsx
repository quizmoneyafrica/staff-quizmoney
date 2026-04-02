/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  BadgeCheck,
} from 'lucide-react';
import { usePlayers } from '@/app/lib/queries';
import { formatDate } from '@/app/lib/utils';
import { ROUTES } from '@/app/lib/routes';
import { Button } from '@/app/components/ui/button';

export default function PlayersPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search inline
  const handleSearch = (val: string) => {
    setSearch(val);
    clearTimeout((handleSearch as any)._t);
    (handleSearch as any)._t = setTimeout(() => {
      setDebouncedSearch(val);
      setPage(1);
    }, 400);
  };

  const { data, isLoading } = usePlayers({
    page,
    search: debouncedSearch || undefined,
    is_admin: false,
  });

  const players = data?.players ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination
    ? Math.ceil(pagination.total / pagination.limit)
    : 1;

  const totalUsers = pagination?.total ?? 0;
  const activeUsers = (data as any)?.activeCount ?? 0;
  const inactiveUsers = (data as any)?.inactiveCount ?? 0;

  // CSV export
  const handleExport = () => {
    if (!players.length) return;
    const headers = [
      'User ID',
      'Username',
      'Email',
      'Account Type',
      'Date of Registration',
    ];
    const rows = players.map((p: any) => [
      p.id,
      p.username,
      p.email,
      p.is_admin ? 'Admin' : 'User',
      formatDate(p.created_at),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'players.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Pagination numbers with ellipsis
  const pageNumbers = (): (number | '...')[] => {
    if (totalPages <= 6)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    return [1, 2, 3, 4, '...', totalPages];
  };

  return (
    <div className="space-y-6 p-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total No of Players', value: totalUsers },
          { label: 'Total active Players', value: activeUsers },
          { label: 'Total No of verified Players', value: inactiveUsers },
        ].map((card, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-2xl bg-blue-50 p-5"
          >
            <div className="rounded-full bg-blue-100 p-3">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="mb-0.5 text-xs font-medium text-blue-600">
                {card.label}
              </p>
              <p className="text-2xl font-bold leading-tight text-blue-700">
                {isLoading ? '—' : card.value.toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {/* Toolbar */}
        <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search"
              className="focus:ring-primary-800 w-full rounded-lg border border-gray-200 py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2"
            />
          </div>

          <button className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
            <Filter className="h-4 w-4" /> Filter by
          </button>

          <Button
            variant="outline"
            onClick={handleExport}
            className="ml-auto text-sm"
          >
            Export &nbsp;<span className="font-semibold">CSV</span>
          </Button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="px-6 py-3">User ID</th>
                <th className="px-6 py-3">Username</th>
                <th className="px-6 py-3">Email address</th>
                <th className="px-6 py-3">Verification Type</th>
                <th className="px-6 py-3">Date of Registration</th>
                <th className="px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                Array.from({ length: 7 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 animate-pulse rounded bg-gray-100" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : players.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <Users className="mx-auto mb-2 h-10 w-10 text-gray-300" />
                    <p className="text-sm text-gray-400">No players found</p>
                  </td>
                </tr>
              ) : (
                players.map((player: any) => (
                  <tr
                    key={player.id}
                    className="transition-colors hover:bg-gray-50"
                  >
                    {/* User ID */}
                    <td className="px-6 py-4">
                      <div className="text-xs font-semibold text-gray-700">
                        {'ID' +
                          player.id
                            ?.replace(/-/g, '')
                            .slice(0, 7)
                            .toUpperCase()}
                      </div>
                      <div className="mt-0.5 text-xs text-gray-400">
                        {formatDate(player.created_at)} 09:00
                      </div>
                    </td>

                    {/* Username */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="bg-primary-50 flex h-10 w-10 items-center justify-center rounded-full">
                          <div className="bg-linear-to-br flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full from-blue-400 to-blue-600 text-xs font-bold text-white">
                            {player.avatar_url ? (
                              <img
                                src={player.avatar_url}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              (player.username?.[0] ?? '?').toUpperCase()
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-medium capitalize text-gray-800">
                            {player.username}
                          </span>
                          {player.verifications?.phone_verified &&
                            player.verifications?.bvn_verified && (
                              <BadgeCheck className="text-primary-800 h-4 w-4 shrink-0" />
                            )}
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-6 py-4 text-gray-600">{player.email}</td>

                    {/* Verification Type */}
                    <td className="px-6 py-4 text-gray-700">
                      {player.verifications.phone_verified &&
                      player.verifications.bvn_verified
                        ? 'Phone & BVN'
                        : player.verifications.phone_verified
                        ? 'Phone'
                        : '-'}
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-gray-600">
                      {formatDate(player.created_at)}
                    </td>

                    {/* Action */}
                    <td className="px-6 py-4">
                      <button
                        onClick={() =>
                          router.push(ROUTES.PLAYER_PROFILE(player.id))
                        }
                        className="text-sm font-medium text-blue-600 hover:underline"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
          <p className="text-sm text-gray-500">
            {pagination
              ? `Showing data ${
                  (page - 1) * pagination.limit + 1
                } to ${Math.min(
                  page * pagination.limit,
                  pagination.total,
                )} of  ${pagination.total.toLocaleString()} entries`
              : ''}
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex h-8 w-8 items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {pageNumbers().map((p, i) => (
              <button
                key={i}
                onClick={() => typeof p === 'number' && setPage(p)}
                disabled={p === '...'}
                className={`flex h-8 w-8 items-center justify-center rounded text-sm font-medium transition-colors ${
                  p === page
                    ? 'bg-blue-600 text-white'
                    : p === '...'
                    ? 'cursor-default text-gray-400'
                    : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
              className="flex h-8 w-8 items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
