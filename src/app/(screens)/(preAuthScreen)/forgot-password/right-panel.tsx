import { Mail } from 'lucide-react';

export function RightPanel() {
  return (
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
          <Mail className="h-10 w-10 text-blue-200" />
        </div>
        <h2 className="mb-2 text-2xl font-bold text-white">Check your inbox</h2>
        <p className="max-w-xs text-sm leading-relaxed text-blue-200">
          We&apos;ll send a 6-digit code to your registered admin email address.
        </p>
      </div>
    </div>
  );
}
