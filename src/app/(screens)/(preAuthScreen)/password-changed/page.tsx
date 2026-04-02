'use client';

import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { ROUTES } from '@/app/lib/routes';

export default function PasswordChangedPage() {
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

          {/* Success state */}
          <div className="py-8 text-center">
            {/* Animated checkmark */}
            <div className="relative mx-auto mb-6 h-20 w-20">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
                <CheckCircle className="h-10 w-10 text-green-500" />
              </div>
              {/* Pulse ring */}
              <div className="absolute inset-0 animate-ping rounded-full bg-green-100 opacity-30" />
            </div>

            <h1 className="mb-2 text-2xl font-bold text-gray-900">
              Password updated!
            </h1>
            <p className="mb-8 text-sm leading-relaxed text-gray-500">
              Your password has been reset successfully.
              <br />
              You can now sign in with your new password.
            </p>

            <Link
              href={ROUTES.LOGIN}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1a3a6b] py-3 text-sm font-semibold text-white transition-all hover:bg-[#152f58] active:scale-[0.98]"
            >
              Back to Sign In
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <p className="mt-4 text-center text-xs text-gray-400">
            If you didn&apos;t request this change, contact your system
            administrator immediately.
          </p>
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
            <CheckCircle className="h-10 w-10 text-green-300" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-white">All done!</h2>
          <p className="max-w-xs text-sm leading-relaxed text-blue-200">
            Your admin account is secured with your new password. You&apos;re
            ready to get back to work.
          </p>
        </div>
      </div>
    </div>
  );
}
