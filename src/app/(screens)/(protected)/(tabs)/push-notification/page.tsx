/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useRef } from 'react';
import {
  Bell,
  Search,
  Plus,
  X,
  Send,
  Calendar,
  Clock,
  Users,
  AlertCircle,
  MoreVertical,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { pushApi, playersApi } from '@/app/lib/api';
import { formatDateTime } from '@/app/lib/utils';
import { useAuthStore } from '@/app/lib/auth-store';
import { hasPermission } from '@/app/lib/permissions';
import { Button } from '@/app/components/ui/button';

// ─── Types ────────────────────────────────────────────────────────────────────
interface PushNotif {
  id: string;
  title: string;
  body: string;
  image_url?: string;
  created_at: string;
  sent_at?: string;
  status?: string;
}

interface ScheduleRow {
  date: string;
  time: string;
}

// ─── Notification preview card (used in Send modal) ──────────────────────────
function NotifPreviewCard({ notif }: { notif: PushNotif }) {
  return (
    <div className="mb-5 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-blue-200">
        {notif.image_url ? (
          <img
            src={notif.image_url}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <Bell className="h-5 w-5 text-blue-600" />
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-gray-800">
          {notif.title}
        </p>
        <p className="line-clamp-2 text-xs text-gray-500">{notif.body}</p>
      </div>
    </div>
  );
}

// ─── Create / Edit Modal ──────────────────────────────────────────────────────
function CreateEditModal({
  notif,
  onClose,
}: {
  notif?: PushNotif;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const isEdit = !!notif;
  const { user } = useAuthStore();

  const [title, setTitle] = useState(notif?.title ?? '');
  const [body, setBody] = useState(notif?.body ?? '');
  const [imageUrl, setImageUrl] = useState(notif?.image_url ?? '');
  const [preview, setPreview] = useState(notif?.image_url ?? '');

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      setPreview(src);
      setImageUrl(src); // in prod you'd upload and get a URL back
    };
    reader.readAsDataURL(f);
  };

  const mut = useMutation({
    mutationFn: () =>
      isEdit
        ? pushApi.update(notif!.id, { title, body, image_url: imageUrl })
        : pushApi.create({
            title,
            body,
            image_url: imageUrl,
            created_by: user.id,
          }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['push-notifications'] });
      toast.success(isEdit ? 'Notification updated' : 'Notification created');
      onClose();
    },
    onError: () => toast.error('Failed to save notification'),
  });

  const canSubmit = title.trim() && body.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h3 className="font-semibold text-gray-900">
            {isEdit ? 'Edit Notification' : 'Create New Notification'}
          </h3>
          <button onClick={onClose}>
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <div className="space-y-4 p-6">
          {/* Image upload */}
          <div className="flex flex-col items-center gap-1">
            <div
              className="relative cursor-pointer"
              onClick={() => fileRef.current?.click()}
            >
              <div className="bg-primary-50 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full p-1">
                {preview ? (
                  <img
                    src={preview}
                    alt=""
                    className="h-full w-full rounded-full object-cover shadow"
                  />
                ) : (
                  <span className="text-3xl text-blue-400">?</span>
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
              Change Image
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFile}
            />
          </div>

          {/* Subject */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Subject
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Update !!"
              className="focus:ring-primary-800 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2"
            />
          </div>

          {/* Body */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Body
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Quiz Money app has been updated  download version  2.0.1"
              rows={4}
              className="focus:ring-primary-800 w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2"
            />
          </div>
        </div>

        <div className="px-6 pb-6">
          <button
            onClick={() => mut.mutate()}
            disabled={!canSubmit || mut.isPending}
            className="hover:bg-primary-700 bg-primary-800 w-full rounded-lg py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {mut.isPending ? 'Saving…' : isEdit ? 'Save Changes' : 'Add New'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Select Users sub-view ────────────────────────────────────────────────────
function SelectUsersView({
  notif,
  onBack,
  onSent,
}: {
  notif: PushNotif;
  onBack: () => void;
  onSent: () => void;
}) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const { data, isLoading } = useQuery({
    queryKey: ['players-for-push', page, search],
    queryFn: () =>
      playersApi.list({ page, limit: 5, search: search || undefined }),
  });

  const players = data?.players ?? [];
  const pagination = data?.pagination;
  const total = pagination?.total ?? 0;
  const totalPages = pagination ? Math.ceil(total / pagination.limit) : 1;

  const toggleAll = () => {
    if (selected.size === players.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(players.map((p: any) => p.id)));
    }
  };

  const toggle = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const qc = useQueryClient();
  const mut = useMutation({
    mutationFn: () =>
      pushApi.send(notif.id, { player_ids: Array.from(selected) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['push-notifications'] });
      toast.success('Notification sent');
      onSent();
    },
    onError: () => toast.error('Failed to send'),
  });

  // page numbers
  const pageNums = (): (number | '...')[] => {
    if (totalPages <= 5)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    return [1, 2, 3, 4, '...', totalPages];
  };

  return (
    <div className="space-y-4">
      {/* Preview */}
      <NotifPreviewCard notif={notif} />

      {/* Search */}
      <div>
        <p className="mb-2 text-sm font-semibold text-gray-800">Search Users</p>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Enter username"
            className="focus:ring-primary-800 w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2"
          />
        </div>
      </div>

      {/* User list */}
      <div className="space-y-1">
        {/* Select all */}
        <label className="flex cursor-pointer items-center gap-3 px-1 py-2">
          <input
            type="checkbox"
            checked={players.length > 0 && selected.size === players.length}
            onChange={toggleAll}
            className="focus:ring-primary-800 h-4 w-4 rounded border-gray-300 text-blue-600"
          />
          <span className="text-sm font-medium text-gray-700">
            Select all Users
          </span>
        </label>

        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-1 py-2">
                <div className="h-4 w-4 animate-pulse rounded bg-gray-100" />
                <div className="h-8 w-8 animate-pulse rounded-full bg-gray-100" />
                <div className="flex-1 space-y-1">
                  <div className="h-3 w-24 animate-pulse rounded bg-gray-100" />
                  <div className="h-3 w-40 animate-pulse rounded bg-gray-100" />
                </div>
              </div>
            ))
          : players.map((p: any) => (
              <label
                key={p.id}
                className="flex cursor-pointer items-center gap-3 rounded-lg px-1 py-2 hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={selected.has(p.id)}
                  onChange={() => toggle(p.id)}
                  className="focus:ring-primary-800 h-4 w-4 rounded border-gray-300 text-blue-600"
                />
                <div className="bg-linear-to-br flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full from-blue-400 to-blue-600 text-xs font-bold text-white">
                  {p.avatar_url ? (
                    <img
                      src={p.avatar_url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    (p.username?.[0] ?? '?').toUpperCase()
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-blue-600">
                    {p.username}
                  </p>
                  <p className="truncate text-xs text-gray-500">{p.email}</p>
                </div>
              </label>
            ))}
      </div>

      {/* Pagination + Send */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex h-7 w-7 items-center justify-center rounded border border-gray-200 disabled:opacity-40"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          {pageNums().map((n, i) => (
            <button
              key={i}
              onClick={() => typeof n === 'number' && setPage(n)}
              disabled={n === '...'}
              className={`flex h-7 w-7 items-center justify-center rounded text-xs font-medium transition-colors ${
                n === page
                  ? 'bg-blue-600 text-white'
                  : n === '...'
                  ? 'cursor-default text-gray-400'
                  : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {n}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex h-7 w-7 items-center justify-center rounded border border-gray-200 disabled:opacity-40"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <button
          onClick={() => mut.mutate()}
          disabled={selected.size === 0 || mut.isPending}
          className="hover:bg-primary-700 bg-primary-800 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          {mut.isPending ? 'Sending…' : 'Send Message'}
        </button>
      </div>

      {/* Warning */}
      <p className="flex items-center gap-1.5 text-xs text-red-500">
        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
        Once notifications sent it can&apos;t be undone
      </p>
    </div>
  );
}

// ─── Send Modal ───────────────────────────────────────────────────────────────
function SendModal({
  notif,
  onClose,
}: {
  notif: PushNotif;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  type SendMode = 'now' | 'schedule';
  type SubView = 'main' | 'select-users';

  const [mode, setMode] = useState<SendMode>('now');
  const [subView, setSubView] = useState<SubView>('main');
  const [schedules, setSchedules] = useState<ScheduleRow[]>([
    { date: '', time: '' },
  ]);

  const addSchedule = () => setSchedules((s) => [...s, { date: '', time: '' }]);
  const updateSched = (i: number, key: keyof ScheduleRow, val: string) =>
    setSchedules((s) =>
      s.map((r, idx) => (idx === i ? { ...r, [key]: val } : r)),
    );

  const sendAllMut = useMutation({
    mutationFn: () =>
      pushApi.send(notif.id, {
        send_now: mode === 'now',
        schedules: mode === 'schedule' ? schedules : undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['push-notifications'] });
      toast.success('Notification sent to all users');
      onClose();
    },
    onError: () => toast.error('Failed to send'),
  });

  if (subView === 'select-users') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <h3 className="font-semibold text-gray-900">
              Send Push Notification
            </h3>
            <button onClick={onClose}>
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>
          <div className="p-6">
            <SelectUsersView
              notif={notif}
              onBack={() => setSubView('main')}
              onSent={onClose}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h3 className="font-semibold text-gray-900">
            Send Push Notification
          </h3>
          <button onClick={onClose}>
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <div className="space-y-4 p-6">
          {/* Preview */}
          <NotifPreviewCard notif={notif} />

          {/* When to send */}
          <p className="text-sm font-semibold text-gray-800">
            Who should this notification be sent ?
          </p>

          {/* Send Now */}
          <label
            className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
              mode === 'now'
                ? 'border-primary-800 bg-blue-50'
                : 'border-gray-200'
            }`}
          >
            <input
              type="radio"
              name="send-mode"
              checked={mode === 'now'}
              onChange={() => setMode('now')}
              className="focus:ring-primary-800 h-4 w-4 text-blue-600"
            />
            <span className="text-sm font-medium text-gray-700">Send Now</span>
          </label>

          {/* Schedule for later */}
          <label
            className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
              mode === 'schedule'
                ? 'border-primary-800 bg-blue-50'
                : 'border-gray-200'
            }`}
          >
            <input
              type="radio"
              name="send-mode"
              checked={mode === 'schedule'}
              onChange={() => setMode('schedule')}
              className="focus:ring-primary-800 h-4 w-4 text-blue-600"
            />
            <span className="text-sm font-medium text-gray-700">
              Schedule for later
            </span>
          </label>

          {/* Schedule rows */}
          {mode === 'schedule' && (
            <div className="space-y-2">
              {schedules.map((s, i) => (
                <div key={i} className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      value={s.date}
                      onChange={(e) => updateSched(i, 'date', e.target.value)}
                      className="focus:ring-primary-800 w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2"
                    />
                  </div>
                  <div className="relative">
                    <Clock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="time"
                      value={s.time}
                      onChange={(e) => updateSched(i, 'time', e.target.value)}
                      className="focus:ring-primary-800 w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2"
                    />
                  </div>
                </div>
              ))}
              <button
                onClick={addSchedule}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
              >
                Add new Schedule
                <span className="border-primary-800 flex h-5 w-5 items-center justify-center rounded-full border text-xs">
                  +
                </span>
              </button>
            </div>
          )}

          {/* Who receives */}
          <p className="text-sm font-semibold text-gray-800">
            Who should receive this notification?
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setSubView('select-users')}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Users className="h-4 w-4" />
              Select User(s)
              <span className="text-base">+</span>
            </button>
            <button
              onClick={() => sendAllMut.mutate()}
              disabled={sendAllMut.isPending}
              className="hover:bg-primary-700 bg-primary-800 flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              {sendAllMut.isPending
                ? 'Sending…'
                : 'Send Notification to all users'}
            </button>
          </div>

          {/* Warning */}
          <p className="flex items-center gap-1.5 text-xs text-red-500">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            Once notifications sent it can&apos;t be undone
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Delete confirm ───────────────────────────────────────────────────────────
function DeleteConfirm({
  notifId,
  onClose,
}: {
  notifId: string;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const mut = useMutation({
    mutationFn: () => pushApi.delete(notifId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['push-notifications'] });
      toast.success('Notification deleted');
      onClose();
    },
    onError: () => toast.error('Delete failed'),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <h3 className="mb-2 font-semibold text-gray-900">
          Delete Notification?
        </h3>
        <p className="mb-5 text-sm text-gray-500">
          This will permanently delete this notification.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => mut.mutate()}
            disabled={mut.isPending}
            className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50"
          >
            {mut.isPending ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Row action menu ──────────────────────────────────────────────────────────
function RowMenu({
  notif,
  onSend,
  onEdit,
  onDelete,
}: {
  notif: PushNotif;
  onSend: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-50 w-36 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
            <button
              onClick={() => {
                setOpen(false);
                onSend();
              }}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
            >
              <Send className="h-3.5 w-3.5" /> Send
            </button>
            <button
              onClick={() => {
                setOpen(false);
                onEdit();
              }}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
            >
              <Edit2 className="h-3.5 w-3.5" /> Edit
            </button>
            <button
              onClick={() => {
                setOpen(false);
                onDelete();
              }}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-500 hover:bg-red-50"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PushNotificationPage() {
  const { user } = useAuthStore();
  const canWrite = hasPermission(
    user?.role ?? 'read_only_admin',
    'notifications.write',
  );

  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editNotif, setEditNotif] = useState<PushNotif | null>(null);
  const [sendNotif, setSendNotif] = useState<PushNotif | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['push-notifications', search],
    queryFn: () => pushApi.list({ search: search || undefined }),
    staleTime: 30_000,
  });

  const notifications: PushNotif[] =
    (data as any)?.notifications ?? (data as any)?.data ?? [];
  const total = (data as any)?.total ?? notifications.length;

  const filtered = search
    ? notifications.filter(
        (n) =>
          n.title.toLowerCase().includes(search.toLowerCase()) ||
          n.body.toLowerCase().includes(search.toLowerCase()),
      )
    : notifications;

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold text-gray-900">Push Notification</h1>

      {/* Stat card */}
      <div className="flex max-w-xs items-center gap-4 rounded-2xl bg-blue-50 p-5">
        <div className="rounded-full bg-blue-100 p-3">
          <Users className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <p className="mb-0.5 text-xs font-medium text-blue-600">
            Total No Notification
          </p>
          <p className="text-2xl font-bold text-blue-700">
            {isLoading ? '—' : total}
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notification"
            className="focus:ring-primary-800 w-full rounded-lg border border-gray-200 py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2"
          />
        </div>
        {canWrite && (
          <Button
            onClick={() => setShowCreate(true)}
            className="ml-auto flex text-sm font-medium text-white"
          >
            <Plus className="h-4 w-4" />
            Create New Notification
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="pbe-38 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-500">
              <th className="px-6 py-3 font-medium">Image</th>
              <th className="px-6 py-3 font-medium">Subject</th>
              <th className="px-6 py-3 font-medium">Notification body</th>
              <th className="px-6 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 pb-60">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 4 }).map((_, j) => (
                    <td key={j} className="px-6 py-4">
                      <div className="h-4 animate-pulse rounded bg-gray-100" />
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-14 text-center">
                  <Bell className="mx-auto mb-2 h-10 w-10 text-gray-300" />
                  <p className="text-sm text-gray-400">
                    No notifications found
                  </p>
                </td>
              </tr>
            ) : (
              filtered.map((notif) => (
                <tr key={notif.id} className="hover:bg-gray-50">
                  {/* Image / ID */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-100">
                        {notif.image_url ? (
                          <img
                            src={notif.image_url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Bell className="text-primary-800 h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-700">
                          {'ID' +
                            notif.id
                              .replace(/-/g, '')
                              .slice(0, 7)
                              .toUpperCase()}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatDateTime(notif.created_at)}
                        </p>
                      </div>
                    </div>
                  </td>
                  {/* Subject */}
                  <td className="px-6 py-4 text-sm font-medium text-gray-700">
                    {notif.title}
                  </td>
                  {/* Body */}
                  <td className="max-w-xs px-6 py-4 text-sm text-gray-500">
                    <p className="line-clamp-2">{notif.body}</p>
                  </td>
                  {/* Action */}
                  <td className="px-6 py-4">
                    {canWrite && (
                      <RowMenu
                        notif={notif}
                        onSend={() => setSendNotif(notif)}
                        onEdit={() => setEditNotif(notif)}
                        onDelete={() => setDeleteId(notif.id)}
                      />
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {showCreate && <CreateEditModal onClose={() => setShowCreate(false)} />}
      {editNotif && (
        <CreateEditModal notif={editNotif} onClose={() => setEditNotif(null)} />
      )}
      {sendNotif && (
        <SendModal notif={sendNotif} onClose={() => setSendNotif(null)} />
      )}
      {deleteId && (
        <DeleteConfirm notifId={deleteId} onClose={() => setDeleteId(null)} />
      )}
    </div>
  );
}
