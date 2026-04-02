/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Lock, Eye, EyeOff, Check, ArrowRight } from 'lucide-react';
import { ROUTES } from '@/app/lib/routes';
import { api } from '@/app/lib/api-client';

function getStrength(pwd: string) {
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

export default function ResetPasswordPage() {
  const router = useRouter();
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [loading, setLoading] = useState(false);

  const strength = getStrength(newPwd);
  const matches = newPwd && confirmPwd && newPwd === confirmPwd;
  const mismatch = newPwd && confirmPwd && newPwd !== confirmPwd;
  const canSubmit = newPwd.length >= 8 && matches;

  useEffect(() => {
    const email = sessionStorage.getItem('qm_reset_email');
    const otp = sessionStorage.getItem('qm_reset_otp');
    if (!email || !otp) router.push(ROUTES.FORGOT_PASSWORD);
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const email = sessionStorage.getItem('qm_reset_email');
    const otp = sessionStorage.getItem('qm_reset_otp');
    if (!email || !otp) {
      router.push(ROUTES.FORGOT_PASSWORD);
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/auth/reset-password', {
        email,
        otp,
        new_password: newPwd,
      });
      // Clear session storage
      sessionStorage.removeItem('qm_reset_email');
      sessionStorage.removeItem('qm_reset_otp');
      toast.success('Password reset successfully');
      router.push(ROUTES.PASSWORD_CHANGED);
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      if (msg === 'INVALID_OTP') {
        toast.error('OTP expired. Please start over.');
        router.push(ROUTES.FORGOT_PASSWORD);
      } else {
        toast.error('Failed to reset password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const requirements = [
    { label: '8+ characters', met: newPwd.length >= 8 },
    { label: 'Uppercase letter', met: /[A-Z]/.test(newPwd) },
    { label: 'Number', met: /[0-9]/.test(newPwd) },
    { label: 'Special character', met: /[^A-Za-z0-9]/.test(newPwd) },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="flex flex-1 flex-col justify-center bg-white px-8 py-12 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-10">
            <Image
              src="/icons/quizmoney-logo-blue.svg"
              alt="QuizMoney"
              width={120}
              height={40}
              priority
            />
          </div>

          <div className="mb-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
              <Lock className="h-6 w-6 text-blue-600" />
            </div>
            <h1 className="mb-1 text-2xl font-bold text-gray-900">
              Set new password
            </h1>
            <p className="text-sm text-gray-500">
              Your new password must be different from your previous password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New password */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                  placeholder="Min 8 characters"
                  disabled={loading}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-11 text-sm transition-all focus:border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((s) => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNew ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Strength bar */}
              {newPwd && (
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                        style={{ width: `${(strength.score / 5) * 100}%` }}
                      />
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        strength.score <= 1
                          ? 'text-red-500'
                          : strength.score <= 3
                          ? 'text-yellow-600'
                          : strength.score === 4
                          ? 'text-blue-600'
                          : 'text-green-600'
                      }`}
                    >
                      {strength.label}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {requirements.map((r) => (
                      <div
                        key={r.label}
                        className={`flex items-center gap-1.5 text-xs ${
                          r.met ? 'text-green-600' : 'text-gray-400'
                        }`}
                      >
                        {r.met ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <div className="h-3 w-3 rounded-full border border-gray-300" />
                        )}
                        {r.label}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type={showConf ? 'text' : 'password'}
                  value={confirmPwd}
                  onChange={(e) => setConfirmPwd(e.target.value)}
                  placeholder="Re-enter new password"
                  disabled={loading}
                  className={`w-full rounded-xl border bg-gray-50 py-3 pl-10 pr-11 text-sm transition-all focus:border-transparent focus:bg-white focus:outline-none focus:ring-2 disabled:opacity-60 ${
                    mismatch
                      ? 'border-red-300 focus:ring-red-400'
                      : matches
                      ? 'border-green-300 focus:ring-green-400'
                      : 'border-gray-200 focus:ring-blue-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConf((s) => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConf ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {mismatch && (
                <p className="mt-1 text-xs text-red-500">
                  Passwords do not match
                </p>
              )}
              {matches && (
                <p className="mt-1 flex items-center gap-1 text-xs text-green-600">
                  <Check className="h-3 w-3" /> Passwords match
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!canSubmit || loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1a3a6b] py-3 text-sm font-semibold text-white transition-all hover:bg-[#152f58] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Resetting…
                </>
              ) : (
                <>
                  Reset Password
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Right panel */}
      <div className="relative hidden flex-1 flex-col items-center justify-center overflow-hidden bg-[#1a3a6b] px-14 lg:flex">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-white/5" />
          <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-white/5" />
          <svg
            className="absolute inset-0 h-full w-full opacity-[0.04]"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="grid"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="white"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        <div className="relative text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10">
            <Lock className="h-10 w-10 text-blue-200" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-white">Almost there</h2>
          <p className="max-w-xs text-sm leading-relaxed text-blue-200">
            Create a strong password you haven&apos;t used before to keep your
            admin account secure.
          </p>
          <div className="mx-auto mt-6 grid max-w-xs grid-cols-2 gap-2">
            {['8+ characters', 'Uppercase', 'Number', 'Symbol'].map((tip) => (
              <div
                key={tip}
                className="rounded-lg bg-white/10 px-3 py-2 text-xs text-blue-200"
              >
                {tip}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
