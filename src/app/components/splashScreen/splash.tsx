"use client";
import { useAppSelector } from "@/app/hooks/useAuth";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

export default function Splash() {
  const router = useRouter();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const rehydrated = useAppSelector((s) => s.auth.rehydrated);

  useEffect(() => {
    if (!rehydrated) return;

    const timer = setTimeout(() => {
      if (isAuthenticated) {
        router.replace("/dashboard");
      } else {
        router.replace("/login");
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [rehydrated, isAuthenticated, router]);

  return (
    <main
      id="splash"
      className="fixed inset-0 top-0 left-0 h-screen w-full bg-primary-800 flex items-center justify-center"
    >
      <Image
        src="/icons/quizmoney-logo-white.svg"
        alt="Quiz Money"
        width={180}
        height={38}
        priority
      />
    </main>
  );
}
