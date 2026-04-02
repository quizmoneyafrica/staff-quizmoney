/* eslint-disable @typescript-eslint/no-explicit-any */
import { playersApi } from '@/app/lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  X,
  Shield,
  Facebook,
  Twitter,
  Instagram,
  ChevronDown,
} from 'lucide-react';
import { TikTokIcon } from './TikTokIcon';

export function EditProfileModal({
  player,
  onClose,
}: {
  player: any;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    first_name: player.first_name ?? '',
    last_name: player.last_name ?? '',
    email: player.email ?? '',
    date_of_birth: player.date_of_birth ?? '',
    gender: player.gender ?? '',
    country: player.country ?? 'Nigeria',
    referred_by: player.referred_by ?? '',
    social_facebook: player.social_facebook ?? '',
    social_twitter: player.social_twitter ?? '',
    social_instagram: player.social_instagram ?? '',
    social_tiktok: player.social_tiktok ?? '',
    is_kyc_verified: player.is_kyc_verified ?? false,
  });

  const mut = useMutation({
    mutationFn: () => playersApi.updatePlayer(player.id, form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['player', player.id] });
      toast.success('Profile updated');
      onClose();
    },
    onError: () => toast.error('Update failed'),
  });

  const field = (key: keyof typeof form, type = 'text') => ({
    type,
    value: form[key] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value })),
    className:
      'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-800',
  });

  const socials: {
    label: string;
    key:
      | 'social_facebook'
      | 'social_twitter'
      | 'social_instagram'
      | 'social_tiktok';
    icon: React.ReactNode;
  }[] = [
    {
      label: 'Facebook',
      key: 'social_facebook',
      icon: <Facebook className="h-4 w-4" />,
    },
    {
      label: 'Twitter',
      key: 'social_twitter',
      icon: <Twitter className="h-4 w-4" />,
    },
    {
      label: 'Instagram',
      key: 'social_instagram',
      icon: <Instagram className="h-4 w-4" />,
    },
    { label: 'TikTok', key: 'social_tiktok', icon: <TikTokIcon /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
      <div className="my-8 w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h3 className="font-semibold">User Profile</h3>
          <button onClick={onClose}>
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <div className="space-y-5 p-6">
          {/* Personal Information */}
          <h4 className="font-semibold text-gray-800">Personal Information</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs text-gray-500">
                First name
              </label>
              <input {...field('first_name')} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">
                Last name
              </label>
              <input {...field('last_name')} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">
                Email Address
              </label>
              <input {...field('email', 'email')} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">
                Date of Birth
              </label>
              <input {...field('date_of_birth', 'date')} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Gender</label>
              <div className="relative">
                <select
                  {...field('gender')}
                  className="focus:ring-primary-800 w-full appearance-none rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2"
                >
                  <option value="">Select</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">
                Country
              </label>
              <div className="relative">
                <select
                  {...field('country')}
                  className="focus:ring-primary-800 w-full appearance-none rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2"
                >
                  <option>Nigeria</option>
                  <option>Ghana</option>
                  <option>Kenya</option>
                  <option>South Africa</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            {/* Referred by + verify toggle — full width */}
            <div className="col-span-2">
              <label className="mb-1 block text-xs text-gray-500">
                Referred by
              </label>
              <div className="flex items-center gap-3">
                <input
                  value={form.referred_by}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, referred_by: e.target.value }))
                  }
                  placeholder="john/00"
                  className="focus:ring-primary-800 flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2"
                />
                {/* Verify toggle */}
                <button
                  type="button"
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      is_kyc_verified: !f.is_kyc_verified,
                    }))
                  }
                  className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
                    form.is_kyc_verified
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-gray-200 bg-white text-gray-600'
                  }`}
                >
                  {/* iOS-style toggle */}
                  <div
                    className={`relative h-5 w-9 rounded-full transition-colors ${
                      form.is_kyc_verified ? 'bg-white/30' : 'bg-gray-200'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${
                        form.is_kyc_verified ? 'left-4' : 'left-0.5'
                      }`}
                    />
                  </div>
                  Verify User Account
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-400">
                Toggle to verify this user&apos;s account
              </p>
            </div>
          </div>

          {/* Socials */}
          <h4 className="font-semibold text-gray-800">Socials</h4>
          <div className="grid grid-cols-2 gap-4">
            {socials.map(({ label, key, icon }) => (
              <div key={label}>
                <label className="mb-1 block text-xs text-gray-500">
                  {label}
                </label>
                <div className="focus-within:ring-primary-800 flex overflow-hidden rounded-lg border border-gray-200 focus-within:ring-2">
                  <div className="flex shrink-0 items-center gap-1 border-r border-gray-200 bg-gray-50 px-2.5 text-gray-500">
                    {icon}
                    <ChevronDown className="h-3 w-3" />
                  </div>
                  <input
                    value={form[key]}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, [key]: e.target.value }))
                    }
                    placeholder="https://...com/@EnterUsername"
                    className="flex-1 px-3 py-2 text-sm outline-none"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Bank — read-only */}
          <h4 className="font-semibold text-gray-800">Bank</h4>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Account Number', val: player.bank_account_number },
              { label: 'Bank Name', val: player.bank_name },
              { label: 'Account Name', val: player.bank_account_name },
            ].map(({ label, val }) => (
              <div key={label}>
                <label className="mb-1 block text-xs text-gray-500">
                  {label}
                </label>
                <div className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
                  <Shield className="h-4 w-4 shrink-0 text-blue-400" />
                  <span className="truncate text-sm text-gray-500">
                    {val ?? '—'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-5 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => mut.mutate()}
            disabled={mut.isPending}
            className="hover:bg-primary-700 bg-primary-800 rounded-lg px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {mut.isPending ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
