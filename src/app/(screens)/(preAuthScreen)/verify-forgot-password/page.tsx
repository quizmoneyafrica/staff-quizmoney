'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ShieldCheck, ArrowLeft, RefreshCw } from 'lucide-react';
import { ROUTES } from '@/app/lib/routes';
import { api } from '@/app/lib/api-client';

const OTP_LENGTH = 6;

export default function VerifyOtpPage() {
  const router = useRouter();
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [email, setEmail] = useState('');
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const stored = sessionStorage.getItem('qm_reset_email');
    if (!stored) {
      router.push(ROUTES.FORGOT_PASSWORD);
      return;
    }
    setEmail(stored);
    inputs.current[0]?.focus();
  }, [router]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    // Allow only digits
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    // Auto-advance
    if (digit && index < OTP_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, OTP_LENGTH);
    const next = [...otp];
    pasted.split('').forEach((d, i) => {
      next[i] = d;
    });
    setOtp(next);
    const lastFilled = Math.min(pasted.length, OTP_LENGTH - 1);
    inputs.current[lastFilled]?.focus();
  };

  const otpValue = otp.join('');
  const isComplete = otpValue.length === OTP_LENGTH;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isComplete) return;

    setLoading(true);
    try {
      await api.post('/api/auth/verify-reset-otp', { email, otp: otpValue });
      sessionStorage.setItem('qm_reset_otp', otpValue);
      toast.success('OTP verified');
      router.push(ROUTES.RESET_PASSWORD);
    } catch {
      toast.error('Invalid or expired OTP. Please try again.');
      setOtp(Array(OTP_LENGTH).fill(''));
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await api.post('/api/auth/forgot-password', { email });
      setCountdown(60);
      setOtp(Array(OTP_LENGTH).fill(''));
      inputs.current[0]?.focus();
      toast.success('New OTP sent');
    } catch {
      toast.error('Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  const maskedEmail = email.replace(
    /(.{2})(.*)(@.*)/,
    (_, a, b, c) => a + b.replace(/./g, '*') + c,
  );

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

          <Link
            href={ROUTES.FORGOT_PASSWORD}
            className="mb-8 inline-flex items-center gap-1.5 text-xs text-gray-500 transition-colors hover:text-gray-700"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </Link>

          <div className="mb-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
              <ShieldCheck className="h-6 w-6 text-blue-600" />
            </div>
            <h1 className="mb-1 text-2xl font-bold text-gray-900">
              Enter your code
            </h1>
            <p className="text-sm text-gray-500">
              We sent a 6-digit code to{' '}
              <span className="font-medium text-gray-700">{maskedEmail}</span>
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-6">
            {/* OTP inputs */}
            <div className="flex justify-between gap-2" onPaste={handlePaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    inputs.current[i] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  disabled={loading}
                  className={`h-14 w-12 rounded-xl border-2 text-center text-xl font-bold outline-none transition-all
                    ${
                      digit
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-gray-50 text-gray-900'
                    }
                    focus:border-blue-500 focus:bg-blue-50
                    disabled:opacity-60
                  `}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={!isComplete || loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1a3a6b] py-3 text-sm font-semibold text-white transition-all hover:bg-[#152f58] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Verifying…
                </>
              ) : (
                'Verify Code'
              )}
            </button>
          </form>

          {/* Resend */}
          <div className="mt-6 text-center">
            {countdown > 0 ? (
              <p className="text-xs text-gray-400">
                Resend code in{' '}
                <span className="font-semibold text-gray-600">
                  {countdown}s
                </span>
              </p>
            ) : (
              <button
                onClick={handleResend}
                disabled={resending}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 transition-colors hover:text-blue-800 disabled:opacity-60"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${resending ? 'animate-spin' : ''}`}
                />
                {resending ? 'Sending…' : 'Resend code'}
              </button>
            )}
          </div>
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
          {/* Animated OTP visual */}
          <div className="mb-6 flex justify-center gap-2">
            {Array(6)
              .fill(null)
              .map((_, i) => (
                <div
                  key={i}
                  className="flex h-12 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="h-2 w-2 rounded-full bg-blue-300 opacity-60" />
                </div>
              ))}
          </div>
          <h2 className="mb-2 text-2xl font-bold text-white">
            Check your email
          </h2>
          <p className="max-w-xs text-sm leading-relaxed text-blue-200">
            The 6-digit code expires in 10 minutes. Don&apos;t share it with
            anyone.
          </p>
        </div>
      </div>
    </div>
  );
}
