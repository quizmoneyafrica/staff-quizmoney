'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  Shield,
  Zap,
  Trophy,
} from 'lucide-react';
import { ROUTES } from '@/app/lib/routes';
import { useLogin } from '@/app/lib/queries';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const { mutate: login, isPending } = useLogin();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Email and password are required.');
      return;
    }

    login(
      { email: email.toLowerCase().trim(), password },
      {
        onSuccess: (data) => {
          if (!data.player.is_admin && data.player.role === 'player') {
            toast.error('Access denied. Admin accounts only.');
            return;
          }
          toast.success(`Welcome back, ${data.player.username}!`);
          router.push(ROUTES.DASHBOARD);
        },
      },
    );
  };

  const isValid = email.includes('@') && password.length > 0;

  return (
    <div className="flex min-h-screen">
      {/* ── Left panel — form ──────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col justify-center bg-white px-8 py-12 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          {/* Logo */}
          <div className="mb-10">
            <Image
              src="/icons/quizmoney-logo-blue.svg"
              alt="QuizMoney"
              width={120}
              height={40}
              priority
            />
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="mb-1 text-2xl font-bold text-gray-900">
              Welcome back
            </h1>
            <p className="text-sm text-gray-500">
              Sign in to your admin account to continue
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
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
                  disabled={isPending}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm text-gray-900 transition-all placeholder:text-gray-400 focus:border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={isPending}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-11 text-sm text-gray-900 transition-all placeholder:text-gray-400 focus:border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div className="flex justify-end">
              <Link
                href={ROUTES.FORGOT_PASSWORD}
                className="text-xs font-medium text-blue-600 transition-colors hover:text-blue-800"
              >
                Forgot your password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!isValid || isPending}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1a3a6b] py-3 text-sm font-semibold text-white transition-all hover:bg-[#152f58] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-8 text-center text-xs text-gray-400">
            QM Technologies — Staff access only
          </p>
        </div>
      </div>

      {/* ── Right panel — branding ─────────────────────────────────────── */}
      <div className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-[#1a3a6b] px-14 py-14 lg:flex">
        {/* Background decoration */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-white/5" />
          <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-white/5" />
          <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.02]" />
          {/* Grid pattern */}
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

        {/* Logo white */}
        <div className="relative">
          <Image
            src="/icons/quizmoney-logo-white.svg"
            alt="QuizMoney"
            width={130}
            height={44}
            priority
            // Fallback if white logo doesn't exist
            onError={(e) => {
              (e.target as HTMLImageElement).style.opacity = '0';
            }}
          />
        </div>

        {/* Main content */}
        <div className="relative space-y-8">
          <div>
            <h2 className="mb-3 text-4xl font-bold leading-tight text-white">
              Run QuizMoney
              <br />
              <span className="text-blue-300">like a pro</span>
            </h2>
            <p className="max-w-xs text-sm leading-relaxed text-blue-200">
              Manage games, players, withdrawals, and revenue — all from one
              powerful dashboard.
            </p>
          </div>

          {/* Feature pills */}
          <div className="space-y-3">
            {[
              { icon: Zap, label: 'Real-time game management' },
              { icon: Shield, label: 'Secure admin access controls' },
              { icon: Trophy, label: 'Live prize distribution engine' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <item.icon className="h-4 w-4 text-blue-200" />
                </div>
                <span className="text-sm text-blue-100">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom tagline */}
        <div className="relative">
          <div className="mb-4 h-0.5 w-10 bg-blue-400/50" />
          <p className="text-xs text-blue-300">
            © {new Date().getFullYear()} QM Technologies Limited
          </p>
        </div>
      </div>
    </div>
  );
}
