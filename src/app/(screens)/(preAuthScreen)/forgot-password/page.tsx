/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import { ROUTES } from '@/app/lib/routes';
import { api } from '@/app/lib/api-client';
import { RightPanel } from './right-panel';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) return;

    setLoading(true);
    try {
      await api.post('/api/auth/forgot-password', {
        email: email.toLowerCase().trim(),
      });
      // Store email for OTP screen
      sessionStorage.setItem('qm_reset_email', email.toLowerCase().trim());
      toast.success('OTP sent to your email');
      router.push(ROUTES.VERIFY_OTP);
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      // Don't reveal if email exists — always show success-like message
      if (msg === 'PLAYER_NOT_FOUND' || msg === 'NOT_AN_ADMIN') {
        toast.error('No admin account found with that email.');
      } else {
        toast.error('Failed to send OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

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

          {/* Back link */}
          <Link
            href={ROUTES.LOGIN}
            className="mb-8 inline-flex items-center gap-1.5 text-xs text-gray-500 transition-colors hover:text-gray-700"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to login
          </Link>

          <div className="mb-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <h1 className="mb-1 text-2xl font-bold text-gray-900">
              Forgot password?
            </h1>
            <p className="text-sm text-gray-500">
              Enter your admin email and we&apos;ll send you a one-time code to
              reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@qmtech.org"
                  autoComplete="email"
                  disabled={loading}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm text-gray-900 transition-all placeholder:text-gray-400 focus:border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!email.includes('@') || loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1a3a6b] py-3 text-sm font-semibold text-white transition-all hover:bg-[#152f58] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Sending OTP…
                </>
              ) : (
                <>
                  Send Reset Code
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-gray-400">
            Remember your password?{' '}
            <Link
              href={ROUTES.LOGIN}
              className="font-medium text-blue-600 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Right panel */}
      <RightPanel />
    </div>
  );
}
