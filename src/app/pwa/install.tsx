"use client";
import React, { useEffect, useState } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let deferredPrompt: any;

const InstallAppButton: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handler = (e: any) => {
      e.preventDefault();
      deferredPrompt = e;
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      if (result.outcome === "accepted") {
        console.log("User accepted install");
      } else {
        console.log("User dismissed install");
      }
      setShowPrompt(false);
    }
  };

  if (!showPrompt) return null;

  return (
    <button
      onClick={handleInstall}
      className="bg-primary-500 text-white px-4 py-2 rounded-full fixed top-6 right-6 shadow-xl z-50"
    >
      📥 Install Quiz Money
    </button>
  );
};

export default InstallAppButton;
