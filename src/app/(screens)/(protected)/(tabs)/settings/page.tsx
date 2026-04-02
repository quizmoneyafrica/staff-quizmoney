/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  User,
  Lock,
  Bell,
  Shield,
  Camera,
  Eye,
  EyeOff,
  Check,
  X,
  LogOut,
  Smartphone,
  Monitor,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { api } from '@/app/lib/api-client';
import { useAuthStore } from '@/app/lib/auth-store';
import { ROLE_LABELS, ROLE_COLORS } from '@/app/lib/permissions';
import { cn, getInitials, formatDateTime } from '@/app/lib/utils';
import { ROUTES } from '@/app/lib/routes';

// ─── API ──────────────────────────────────────────────────────────────────────
const profileApi = {
  updateProfile: (body: any) =>
    api.patch('/api/admin/profile', body).then((r) => r.data.data),
  changePassword: (body: any) =>
    api.post('/api/admin/profile/change-password', body).then((r) => r.data),
  uploadAvatar: (file: File) => {
    const form = new FormData();
    form.append('avatar', file);
    return api
      .post('/api/admin/profile/avatar', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data.data);
  },
};

// ─── Password strength ────────────────────────────────────────────────────────
function getPasswordStrength(pwd: string): {
  score: number;
  label: string;
  color: string;
} {
  if (!pwd) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  if (score <= 1) return { score, label: 'Weak', color: 'bg-red-500' };
  if (score <= 3) return { score, label: 'Fair', color: 'bg-yellow-500' };
  if (score === 4) return { score, label: 'Good', color: 'bg-blue-500' };
  return { score, label: 'Strong', color: 'bg-green-500' };
}

// ─── Section card ─────────────────────────────────────────────────────────────
function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-gray-100 bg-white shadow-sm',
        className,
      )}
    >
      {children}
    </div>
  );
}

function CardHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="border-b border-gray-100 px-6 py-4">
      <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
      {description && (
        <p className="mt-0.5 text-xs text-gray-500">{description}</p>
      )}
    </div>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────
function Input({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  disabled,
  hint,
  suffix,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  hint?: string;
  suffix?: React.ReactNode;
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';

  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-600">
        {label}
      </label>
      <div className="relative">
        <input
          type={isPassword && show ? 'text' : type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'w-full rounded-lg border px-3 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500',
            disabled
              ? 'cursor-not-allowed border-gray-100 bg-gray-50 text-gray-400'
              : 'border-gray-200',
            isPassword || suffix ? 'pr-10' : '',
          )}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {show ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        )}
        {suffix && !isPassword && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {suffix}
          </div>
        )}
      </div>
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

// ─── Tab nav ──────────────────────────────────────────────────────────────────
const TABS = [
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'security', label: 'Security', icon: Lock },
  { key: 'sessions', label: 'Active Sessions', icon: Monitor },
] as const;
type Tab = (typeof TABS)[number]['key'];

// ─── Profile Tab ──────────────────────────────────────────────────────────────
function ProfileTab() {
  const { user, updateUser } = useAuthStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const [firstName, setFirstName] = useState(user?.first_name ?? '');
  const [lastName, setLastName] = useState(user?.last_name ?? '');
  const [username, setUsername] = useState(user?.username ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [preview, setPreview] = useState(user?.avatar_url ?? '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // Sync when user loads
  useEffect(() => {
    if (user) {
      setFirstName(user.first_name ?? '');
      setLastName(user.last_name ?? '');
      setUsername(user.username ?? '');
      setEmail(user.email ?? '');
      setPreview(user.avatar_url ?? '');
    }
  }, [user]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setAvatarFile(f);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(f);
  };

  const mut = useMutation({
    mutationFn: async () => {
      // Upload avatar first if changed
      if (avatarFile) {
        await profileApi.uploadAvatar(avatarFile);
      }
      return profileApi.updateProfile({
        first_name: firstName,
        last_name: lastName,
      });
    },
    onSuccess: (data) => {
      updateUser({
        first_name: firstName,
        last_name: lastName,
        ...(data?.avatar_url && { avatar_url: data.avatar_url }),
      });
      setAvatarFile(null);
      toast.success('Profile updated');
    },
    onError: () => toast.error('Failed to update profile'),
  });

  const role = user?.role as keyof typeof ROLE_LABELS | undefined;

  return (
    <div className="space-y-5">
      {/* Avatar + role card */}
      <Card>
        <div className="flex items-center gap-5 p-6">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-2xl font-bold text-white shadow-lg">
              {preview ? (
                <img
                  src={preview}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                getInitials(`${firstName} ${lastName}` || user?.username || '')
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 shadow-md transition-colors hover:bg-blue-700"
            >
              <Camera className="h-3.5 w-3.5 text-white" />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFile}
            />
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold text-gray-900">
              {firstName || lastName
                ? `${firstName} ${lastName}`.trim()
                : user?.username}
            </h3>
            <p className="mt-0.5 truncate text-sm text-gray-500">
              {user?.email}
            </p>
            <div className="mt-2 flex items-center gap-2">
              {role && (
                <span
                  className={cn(
                    'rounded-full px-2.5 py-1 text-xs font-medium',
                    ROLE_COLORS[role],
                  )}
                >
                  {ROLE_LABELS[role]}
                </span>
              )}
              <span
                className={cn(
                  'flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium',
                  user?.is_active
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-600',
                )}
              >
                <span
                  className={cn(
                    'h-1.5 w-1.5 rounded-full',
                    user?.is_active ? 'bg-green-500' : 'bg-red-500',
                  )}
                />
                {user?.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          {avatarFile && (
            <div className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs text-blue-600">
              <Camera className="h-3.5 w-3.5" />
              New photo ready to save
            </div>
          )}
        </div>
      </Card>

      {/* Personal info */}
      <Card>
        <CardHeader
          title="Personal Information"
          description="Update your name and display information"
        />
        <div className="space-y-4 p-6">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={firstName}
              onChange={setFirstName}
              placeholder="John"
            />
            <Input
              label="Last Name"
              value={lastName}
              onChange={setLastName}
              placeholder="Doe"
            />
          </div>
          <Input
            label="Username"
            value={username}
            disabled
            hint="Username cannot be changed"
          />
          <Input
            label="Email Address"
            value={email}
            disabled
            hint="Contact a super admin to change your email"
          />
        </div>
        <div className="px-6 pb-6">
          <button
            onClick={() => mut.mutate()}
            disabled={mut.isPending}
            className="flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-800 disabled:opacity-50"
          >
            {mut.isPending ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />{' '}
                Saving…
              </>
            ) : (
              <>
                <Check className="h-4 w-4" /> Save Changes
              </>
            )}
          </button>
        </div>
      </Card>

      {/* Account info (read-only) */}
      <Card>
        <CardHeader
          title="Account Details"
          description="Your account information"
        />
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                label: 'Admin ID',
                value: user?.id?.slice(0, 8).toUpperCase() ?? '—',
              },
              { label: 'Role', value: role ? ROLE_LABELS[role] : '—' },
              {
                label: 'Member Since',
                value: user?.created_at ? formatDateTime(user.created_at) : '—',
              },
              {
                label: 'Last Seen',
                value: user?.last_seen_at
                  ? formatDateTime(user.last_seen_at)
                  : 'Just now',
              },
            ].map((item) => (
              <div key={item.label} className="rounded-xl bg-gray-50 p-3">
                <p className="mb-0.5 text-xs text-gray-500">{item.label}</p>
                <p className="text-sm font-medium text-gray-800">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

// ─── Security Tab ─────────────────────────────────────────────────────────────
function SecurityTab() {
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');

  const user = useAuthStore((u) => u.user);

  const strength = getPasswordStrength(newPwd);
  const matches = newPwd && confirmPwd && newPwd === confirmPwd;
  const mismatch = newPwd && confirmPwd && newPwd !== confirmPwd;
  const canSubmit = currentPwd && newPwd.length >= 8 && matches;

  const mut = useMutation({
    mutationFn: () =>
      profileApi.changePassword({
        playerId: user.id,
        current_password: currentPwd,
        new_password: newPwd,
      }),
    onSuccess: () => {
      toast.success('Password changed successfully');
      setCurrentPwd('');
      setNewPwd('');
      setConfirmPwd('');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message;
      toast.error(msg);
      // if (msg === 'INVALID_CURRENT_PASSWORD')
      // else toast.error('Failed to change password');
    },
  });

  return (
    <div className="space-y-5">
      {/* Change password */}
      <Card>
        <CardHeader
          title="Change Password"
          description="Use a strong password you don't use elsewhere"
        />
        <div className="space-y-4 p-6">
          <Input
            label="Current Password"
            type="password"
            value={currentPwd}
            onChange={setCurrentPwd}
            placeholder="Enter current password"
          />

          <div>
            <Input
              label="New Password"
              type="password"
              value={newPwd}
              onChange={setNewPwd}
              placeholder="Min 8 characters"
            />
            {newPwd && (
              <div className="mt-2 space-y-1.5">
                {/* Strength bar */}
                <div className="flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-300',
                        strength.color,
                      )}
                      style={{ width: `${(strength.score / 5) * 100}%` }}
                    />
                  </div>
                  <span
                    className={cn(
                      'text-xs font-medium',
                      strength.score <= 1
                        ? 'text-red-500'
                        : strength.score <= 3
                        ? 'text-yellow-600'
                        : strength.score === 4
                        ? 'text-blue-600'
                        : 'text-green-600',
                    )}
                  >
                    {strength.label}
                  </span>
                </div>
                {/* Requirements */}
                <div className="grid grid-cols-2 gap-1">
                  {[
                    { label: '8+ characters', met: newPwd.length >= 8 },
                    { label: 'Uppercase letter', met: /[A-Z]/.test(newPwd) },
                    { label: 'Number', met: /[0-9]/.test(newPwd) },
                    {
                      label: 'Special character',
                      met: /[^A-Za-z0-9]/.test(newPwd),
                    },
                  ].map((req) => (
                    <div
                      key={req.label}
                      className={cn(
                        'flex items-center gap-1.5 text-xs',
                        req.met ? 'text-green-600' : 'text-gray-400',
                      )}
                    >
                      {req.met ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <div className="h-3 w-3 rounded-full border border-gray-300" />
                      )}
                      {req.label}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <Input
              label="Confirm New Password"
              type="password"
              value={confirmPwd}
              onChange={setConfirmPwd}
              placeholder="Re-enter new password"
              suffix={
                confirmPwd ? (
                  matches ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-red-500" />
                  )
                ) : null
              }
            />
            {mismatch && (
              <p className="mt-1 text-xs text-red-500">
                Passwords do not match
              </p>
            )}
          </div>
        </div>
        <div className="px-6 pb-6">
          <button
            onClick={() => mut.mutate()}
            disabled={!canSubmit || mut.isPending}
            className="flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-800 disabled:opacity-50"
          >
            {mut.isPending ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />{' '}
                Changing…
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" /> Change Password
              </>
            )}
          </button>
        </div>
      </Card>

      {/* Security tips */}
      <Card>
        <CardHeader title="Security Tips" />
        <div className="p-6">
          <div className="space-y-3">
            {[
              {
                icon: Shield,
                text: 'Never share your admin credentials with anyone, including other admins.',
              },
              {
                icon: Lock,
                text: 'Use a password manager to generate and store strong unique passwords.',
              },
              {
                icon: Smartphone,
                text: 'Log out from admin sessions when using shared or public devices.',
              },
              {
                icon: Bell,
                text: 'Contact your system administrator immediately if you suspect unauthorized access.',
              },
            ].map((tip, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-xl bg-blue-50 p-3"
              >
                <tip.icon className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                <p className="text-xs text-blue-800">{tip.text}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

// ─── Sessions Tab ─────────────────────────────────────────────────────────────
function SessionsTab() {
  const { clearAuth } = useAuthStore();
  const router = useRouter();

  // Static current session info — in production you'd fetch from backend
  const currentSession = {
    device:
      typeof navigator !== 'undefined'
        ? /mobile/i.test(navigator.userAgent)
          ? 'Mobile Browser'
          : 'Desktop Browser'
        : 'Desktop Browser',
    browser:
      typeof navigator !== 'undefined'
        ? navigator.userAgent.includes('Chrome')
          ? 'Chrome'
          : navigator.userAgent.includes('Firefox')
          ? 'Firefox'
          : navigator.userAgent.includes('Safari')
          ? 'Safari'
          : 'Browser'
        : 'Browser',
    location: 'Current session',
    started: new Date().toISOString(),
    isCurrent: true,
  };

  const handleLogout = () => {
    clearAuth();
    router.push(ROUTES.LOGIN);
    toast.success('Logged out successfully');
  };

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader
          title="Active Sessions"
          description="Devices and browsers currently logged into your account"
        />
        <div className="space-y-3 p-6">
          {/* Current session */}
          <div className="flex items-center justify-between rounded-xl border border-green-100 bg-green-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-100">
                <Monitor className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-800">
                    {currentSession.browser} — {currentSession.device}
                  </p>
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                    Current
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-gray-500">
                  This device • Active now
                </p>
              </div>
            </div>
          </div>

          {/* Info note */}
          <div className="flex items-start gap-2 rounded-xl bg-blue-50 p-3">
            <Shield className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
            <p className="text-xs text-blue-700">
              Session management across multiple devices is coming soon. For
              now, logging out here will end your current session.
            </p>
          </div>
        </div>
      </Card>

      {/* Danger zone */}
      <Card>
        <CardHeader
          title="Sign Out"
          description="End your current admin session"
        />
        <div className="p-6">
          <div className="flex items-center justify-between rounded-xl border border-red-100 bg-red-50 p-4">
            <div>
              <p className="text-sm font-semibold text-red-800">
                Sign out of this device
              </p>
              <p className="mt-0.5 text-xs text-red-600">
                You will be redirected to the login page
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProfileSettingsPage() {
  const [tab, setTab] = useState<Tab>('profile');
  const { user } = useAuthStore();

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile & Settings</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Manage your account and security preferences
        </p>
      </div>

      {/* Tab nav */}
      <div className="flex w-fit gap-1 rounded-xl bg-gray-100 p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all',
              tab === t.key
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700',
            )}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'profile' && <ProfileTab />}
      {tab === 'security' && <SecurityTab />}
      {tab === 'sessions' && <SessionsTab />}
    </div>
  );
}
