/* eslint-disable @typescript-eslint/no-explicit-any */
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';

// ─── Tailwind ─────────────────────────────────────────────────

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Currency ─────────────────────────────────────────────────

export function formatNaira(kobo: number): string {
  return `₦${(kobo / 100).toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatQMCoin(amount: number): string {
  return `${amount.toLocaleString()} QMC`;
}

// ─── Dates ────────────────────────────────────────────────────

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'MMM d, yyyy');
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), 'MMM d, yyyy · h:mm a');
}

export function formatTimeAgo(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatNigeriaTime(utcDate: string): string {
  const date = new Date(utcDate);
  return date.toLocaleString('en-NG', {
    timeZone: 'Africa/Lagos',
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

// ─── Game Status ──────────────────────────────────────────────

export const GAME_STATUS_COLORS = {
  scheduled: 'bg-blue-100 text-blue-700',
  lobby: 'bg-yellow-100 text-yellow-700',
  locked: 'bg-orange-100 text-orange-700',
  active: 'bg-green-100 text-green-700',
  finished: 'bg-neutral-100 text-neutral-700',
  cancelled: 'bg-red-100 text-red-700',
} as const;

export const GAME_STATUS_LABELS = {
  scheduled: 'Scheduled',
  lobby: 'Lobby Open',
  locked: 'Locked',
  active: 'Live',
  finished: 'Finished',
  cancelled: 'Cancelled',
} as const;

// ─── Misc ─────────────────────────────────────────────────────

export function truncate(str: string, length: number): string {
  return str.length > length ? `${str.slice(0, length)}...` : str;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getApiError(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as any;
    return axiosError?.response?.data?.message || 'Something went wrong';
  }
  return 'Something went wrong';
}
