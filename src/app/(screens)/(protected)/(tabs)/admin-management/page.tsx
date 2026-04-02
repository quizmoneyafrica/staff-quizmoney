/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Search,
  Filter,
  Plus,
  X,
  ChevronDown,
  UserCheck,
  UserX,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { api } from '@/app/lib/api-client';
import { formatDate, cn, getInitials } from '@/app/lib/utils';
import { useAuthStore } from '@/app/lib/auth-store';

// ─── Types ────────────────────────────────────────────────────────────────────
type AdminRole =
  | 'super_admin'
  | 'finance_admin'
  | 'support_admin'
  | 'game_admin'
  | 'read_only_admin';

interface Admin {
  id: string;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: AdminRole;
  is_active: boolean;
  avatar_url?: string;
  created_at: string;
  last_seen_at?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: 'Super Admin',
  finance_admin: 'Finance Admin',
  support_admin: 'Support Admin',
  game_admin: 'Game Admin',
  read_only_admin: 'Read Only Admin',
};

const ROLE_COLORS: Record<AdminRole, string> = {
  super_admin: 'bg-blue-100 text-blue-700',
  finance_admin: 'bg-green-100 text-green-700',
  support_admin: 'bg-purple-100 text-purple-700',
  game_admin: 'bg-orange-100 text-orange-700',
  read_only_admin: 'bg-gray-100 text-gray-600',
};

const ASSIGNABLE_ROLES: AdminRole[] = [
  'finance_admin',
  'support_admin',
  'game_admin',
  'read_only_admin',
];

// ─── API ──────────────────────────────────────────────────────────────────────
const adminApi = {
  list: (p: any) =>
    api.get('/api/admin/admins', { params: p }).then((r) => r.data.data),
  create: (body: any) =>
    api.post('/api/admin/admins/new', body).then((r) => r.data.data),
  update: (id: string, body: any) =>
    api.patch(`/api/admin/admins/${id}`, body).then((r) => r.data.data),
  activate: (id: string) =>
    api.post(`/api/admin/admins/${id}/activate`).then((r) => r.data),
  deactivate: (id: string) =>
    api.post(`/api/admin/admins/${id}/deactivate`).then((r) => r.data),
  remove: (id: string) =>
    api.delete(`/api/admin/admins/${id}`).then((r) => r.data),
};

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ admin, size = 'md' }: { admin: Admin; size?: 'sm' | 'md' }) {
  const sz = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';
  return (
    <div
      className={`${sz} bg-linear-to-br flex shrink-0 items-center justify-center overflow-hidden rounded-full from-blue-500 to-blue-700 font-bold text-white`}
    >
      {admin.avatar_url ? (
        <img
          src={admin.avatar_url}
          alt=""
          className="h-full w-full object-cover"
        />
      ) : (
        getInitials(
          `${admin.first_name ?? ''} ${admin.last_name ?? admin.username}`,
        )
      )}
    </div>
  );
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
function ConfirmDialog({
  title,
  message,
  confirmLabel,
  confirmClass,
  onConfirm,
  onClose,
  loading,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  confirmClass: string;
  onConfirm: () => void;
  onClose: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <h3 className="mb-2 font-semibold text-gray-900">{title}</h3>
        <p className="mb-5 text-sm text-gray-500">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${confirmClass}`}
          >
            {loading ? 'Please wait…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Add New Admin Modal ──────────────────────────────────────────────────────
function AddAdminModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<AdminRole>('read_only_admin');

  const mut = useMutation({
    mutationFn: () =>
      adminApi.create({
        first_name: firstName,
        last_name: lastName,
        email,
        role,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admins'] });
      toast.success('Admin created — credentials sent to their email');
      onClose();
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message;
      if (msg === 'EMAIL_ALREADY_EXISTS') toast.error('Email already in use');
      else toast.error('Failed to create admin');
    },
  });

  const canSubmit = firstName.trim() && lastName.trim() && email.trim() && role;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h3 className="font-semibold text-gray-900">Add New Admin</h3>
          <button onClick={onClose}>
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>
        <div className="space-y-4 p-6">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@qmtech.org"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Admin Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as AdminRole)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {ASSIGNABLE_ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-400">
              A temporary password will be emailed to this admin.
            </p>
          </div>
        </div>
        <div className="px-6 pb-6">
          <button
            onClick={() => mut.mutate()}
            disabled={!canSubmit || mut.isPending}
            className="w-full rounded-lg bg-blue-700 py-2.5 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50"
          >
            {mut.isPending ? 'Creating…' : 'Add New'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Admin Modal ─────────────────────────────────────────────────────────
function EditAdminModal({
  admin,
  onClose,
}: {
  admin: Admin;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const { user } = useAuthStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const [firstName, setFirstName] = useState(admin.first_name ?? '');
  const [lastName, setLastName] = useState(admin.last_name ?? '');
  const [role, setRole] = useState<AdminRole>(admin.role);
  const [preview, setPreview] = useState(admin.avatar_url ?? '');

  const isSelf = user?.id === admin.id;
  const canChangeRole = !isSelf && admin.role !== 'super_admin';

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(f);
  };

  const mut = useMutation({
    mutationFn: () =>
      adminApi.update(admin.id, {
        first_name: firstName,
        last_name: lastName,
        role,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admins'] });
      toast.success('Admin updated');
      onClose();
    },
    onError: () => toast.error('Update failed'),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h3 className="font-semibold text-gray-900">Admin details</h3>
          <button onClick={onClose}>
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>
        <div className="space-y-4 p-6">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-1">
            <div
              className="relative cursor-pointer"
              onClick={() => fileRef.current?.click()}
            >
              <div className="bg-linear-to-br flex h-16 w-16 items-center justify-center overflow-hidden rounded-full from-blue-500 to-blue-700 text-xl font-bold text-white">
                {preview ? (
                  <img
                    src={preview}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  getInitials(`${firstName} ${lastName}`)
                )}
              </div>
              <div className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-gray-700">
                <span className="text-xs text-white">📷</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="text-xs text-blue-600 hover:underline"
            >
              Change Profile Image
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFile}
            />
          </div>

          {/* Role */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Select Admin type
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as AdminRole)}
              disabled={!canChangeRole}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
            >
              <option value="super_admin">Super Admin</option>
              {ASSIGNABLE_ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
            {!canChangeRole && (
              <p className="mt-1 text-xs text-gray-400">
                {isSelf
                  ? "You can't change your own role."
                  : 'Super Admin role cannot be changed here.'}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              value={admin.email}
              disabled
              className="w-full cursor-not-allowed rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-400"
            />
            <p className="mt-1 text-xs text-gray-400">
              Email cannot be changed.
            </p>
          </div>
        </div>
        <div className="px-6 pb-6">
          <button
            onClick={() => mut.mutate()}
            disabled={mut.isPending}
            className="w-full rounded-lg bg-blue-700 py-2.5 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50"
          >
            {mut.isPending ? 'Saving…' : 'Edit Admin'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Row Menu ─────────────────────────────────────────────────────────────────
function RowMenu({
  admin,
  currentUserId,
  onEdit,
  onActivate,
  onDeactivate,
  onRemove,
}: {
  admin: Admin;
  currentUserId?: string;
  onEdit: () => void;
  onActivate: () => void;
  onDeactivate: () => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(false);
  const isSelf = currentUserId === admin.id;
  const isSuperAdmin = admin.role === 'super_admin';

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100"
      >
        <span className="text-lg leading-none">⋮</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-9 z-20 w-44 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
            <button
              onClick={() => {
                setOpen(false);
                onEdit();
              }}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
            >
              <Edit2 className="h-3.5 w-3.5" /> View Details
            </button>
            {!isSelf &&
              !isSuperAdmin &&
              (admin.is_active ? (
                <button
                  onClick={() => {
                    setOpen(false);
                    onDeactivate();
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-orange-600 hover:bg-orange-50"
                >
                  <UserX className="h-3.5 w-3.5" /> Deactivate
                </button>
              ) : (
                <button
                  onClick={() => {
                    setOpen(false);
                    onActivate();
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-green-600 hover:bg-green-50"
                >
                  <UserCheck className="h-3.5 w-3.5" /> Activate
                </button>
              ))}
            {!isSelf && !isSuperAdmin && (
              <button
                onClick={() => {
                  setOpen(false);
                  onRemove();
                }}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-500 hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" /> Remove Admin
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminManagementPage() {
  const qc = useQueryClient();
  const { user } = useAuthStore();

  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(1);

  const [showAdd, setShowAdd] = useState(false);
  const [editAdmin, setEditAdmin] = useState<Admin | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'activate' | 'deactivate' | 'remove';
    admin: Admin;
  } | null>(null);

  const LIMIT = 15;

  // ── Query ──────────────────────────────────────────────────
  const { data, isLoading } = useQuery({
    queryKey: ['admins', search, filterRole, filterStatus],
    queryFn: () =>
      adminApi.list({
        search: search || undefined,
        role: filterRole || undefined,
        status: filterStatus || undefined,
      }),
    staleTime: 30_000,
  });

  const allAdmins: Admin[] = data?.admins ?? [];
  const total: number = data?.total ?? 0;
  const superAdminCount = data?.super_admin_count ?? 0;

  // Client-side pagination
  const totalPages = Math.ceil(allAdmins.length / LIMIT);
  const admins = allAdmins.slice((page - 1) * LIMIT, page * LIMIT);

  // ── Mutations ──────────────────────────────────────────────
  const activateMut = useMutation({
    mutationFn: (id: string) => adminApi.activate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admins'] });
      toast.success('Admin activated');
      setConfirmAction(null);
    },
    onError: () => toast.error('Failed'),
  });

  const deactivateMut = useMutation({
    mutationFn: (id: string) => adminApi.deactivate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admins'] });
      toast.success('Admin deactivated');
      setConfirmAction(null);
    },
    onError: () => toast.error('Failed'),
  });

  const removeMut = useMutation({
    mutationFn: (id: string) => adminApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admins'] });
      toast.success('Admin role removed');
      setConfirmAction(null);
    },
    onError: () => toast.error('Failed'),
  });

  const hasFilters = filterRole || filterStatus;

  // Pagination helper
  const pages = (): (number | '...')[] => {
    if (totalPages <= 5)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 3) return [1, 2, 3, 4, '...', totalPages];
    if (page >= totalPages - 2)
      return [
        1,
        '...',
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    return [1, '...', page - 1, page, page + 1, '...', totalPages];
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold text-gray-900">Admin Management</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-4 rounded-2xl bg-blue-50 p-5">
          <div className="rounded-full bg-blue-100 p-3">
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="mb-0.5 text-xs font-medium text-blue-600">
              Total No Admin
            </p>
            <p className="text-3xl font-bold text-blue-700">
              {isLoading ? '—' : total}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl bg-blue-50 p-5">
          <div className="rounded-full bg-blue-100 p-3">
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="mb-0.5 text-xs font-medium text-blue-600">
              Total Super Admin
            </p>
            <p className="text-3xl font-bold text-blue-700">
              {isLoading ? '—' : superAdminCount}
            </p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search Admin"
            className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filter */}
        <div className="relative">
          <button
            onClick={() => setFilterOpen((o) => !o)}
            className={cn(
              'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors',
              hasFilters
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50',
            )}
          >
            <Filter className="h-4 w-4" /> Filter by
            {hasFilters && <ChevronDown className="h-3.5 w-3.5" />}
          </button>
          {filterOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setFilterOpen(false)}
              />
              <div className="absolute left-0 top-10 z-20 w-64 space-y-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-800">Filters</p>
                  {hasFilters && (
                    <button
                      onClick={() => {
                        setFilterRole('');
                        setFilterStatus('');
                      }}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    Role
                  </label>
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Roles</option>
                    {(Object.entries(ROLE_LABELS) as [AdminRole, string][]).map(
                      ([v, l]) => (
                        <option key={v} value={v}>
                          {l}
                        </option>
                      ),
                    )}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    Status
                  </label>
                  <div className="flex gap-2">
                    {['active', 'inactive'].map((s) => (
                      <button
                        key={s}
                        onClick={() =>
                          setFilterStatus(filterStatus === s ? '' : s)
                        }
                        className={cn(
                          'rounded-full border px-3 py-1 text-xs capitalize transition-colors',
                          filterStatus === s
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50',
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setFilterOpen(false)}
                  className="w-full rounded-lg bg-blue-700 py-2 text-sm font-medium text-white hover:bg-blue-800"
                >
                  Apply
                </button>
              </div>
            </>
          )}
        </div>

        {/* Add New */}
        <button
          onClick={() => setShowAdd(true)}
          className="ml-auto flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
        >
          <Plus className="h-4 w-4" /> Add New Admin
        </button>
      </div>

      {/* Table */}
      <div className="pb-30 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-500">
              <th className="px-5 py-3 font-medium">Username</th>
              <th className="px-5 py-3 font-medium">Email address</th>
              <th className="px-5 py-3 font-medium">Account Type</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Date of Registration</th>
              <th className="px-5 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-5 py-4">
                      <div className="h-4 animate-pulse rounded bg-gray-100" />
                    </td>
                  ))}
                </tr>
              ))
            ) : admins.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-14 text-center">
                  <Shield className="mx-auto mb-2 h-10 w-10 text-gray-300" />
                  <p className="text-sm text-gray-400">No admins found</p>
                </td>
              </tr>
            ) : (
              admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2.5">
                      <Avatar admin={admin} size="sm" />
                      <span className="text-sm font-medium text-blue-600">
                        {admin.username}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">
                    {admin.email}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
                        ROLE_COLORS[admin.role],
                      )}
                    >
                      {ROLE_LABELS[admin.role]}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium',
                        admin.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-600',
                      )}
                    >
                      <span
                        className={cn(
                          'h-1.5 w-1.5 rounded-full',
                          admin.is_active ? 'bg-green-500' : 'bg-red-500',
                        )}
                      />
                      {admin.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-500">
                    {formatDate(admin.created_at)}
                  </td>
                  <td className="px-5 py-4">
                    <RowMenu
                      admin={admin}
                      currentUserId={user?.id}
                      onEdit={() => setEditAdmin(admin)}
                      onActivate={() =>
                        setConfirmAction({ type: 'activate', admin })
                      }
                      onDeactivate={() =>
                        setConfirmAction({ type: 'deactivate', admin })
                      }
                      onRemove={() =>
                        setConfirmAction({ type: 'remove', admin })
                      }
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
            <p className="text-xs text-gray-500">
              Showing {(page - 1) * LIMIT + 1} to{' '}
              {Math.min(page * LIMIT, allAdmins.length)} of {allAdmins.length}{' '}
              admins
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex h-7 w-7 items-center justify-center rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              {pages().map((n, i) => (
                <button
                  key={i}
                  onClick={() => typeof n === 'number' && setPage(n)}
                  disabled={n === '...'}
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded text-xs font-medium',
                    n === page
                      ? 'bg-blue-600 text-white'
                      : n === '...'
                      ? 'cursor-default text-gray-400'
                      : 'border border-gray-200 text-gray-600 hover:bg-gray-50',
                  )}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex h-7 w-7 items-center justify-center rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showAdd && <AddAdminModal onClose={() => setShowAdd(false)} />}
      {editAdmin && (
        <EditAdminModal admin={editAdmin} onClose={() => setEditAdmin(null)} />
      )}

      {/* Confirm dialogs */}
      {confirmAction?.type === 'activate' && (
        <ConfirmDialog
          title="Activate Admin"
          message={`Activate ${confirmAction.admin.username}? They will regain access to the admin dashboard.`}
          confirmLabel="Activate"
          confirmClass="bg-green-600 hover:bg-green-700"
          loading={activateMut.isPending}
          onConfirm={() => activateMut.mutate(confirmAction.admin.id)}
          onClose={() => setConfirmAction(null)}
        />
      )}
      {confirmAction?.type === 'deactivate' && (
        <ConfirmDialog
          title="Deactivate Admin"
          message={`Deactivate ${confirmAction.admin.username}? They will lose access immediately.`}
          confirmLabel="Deactivate"
          confirmClass="bg-orange-500 hover:bg-orange-600"
          loading={deactivateMut.isPending}
          onConfirm={() => deactivateMut.mutate(confirmAction.admin.id)}
          onClose={() => setConfirmAction(null)}
        />
      )}
      {confirmAction?.type === 'remove' && (
        <ConfirmDialog
          title="Remove Admin Role"
          message={`Remove admin role from ${confirmAction.admin.username}? They will become a regular player.`}
          confirmLabel="Remove"
          confirmClass="bg-red-500 hover:bg-red-600"
          loading={removeMut.isPending}
          onConfirm={() => removeMut.mutate(confirmAction.admin.id)}
          onClose={() => setConfirmAction(null)}
        />
      )}
    </div>
  );
}
