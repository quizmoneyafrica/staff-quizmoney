'use client';
import React, { useEffect, useState } from 'react';

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

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      if (result.outcome === 'accepted') {
        console.info('User accepted install');
      } else {
        console.info('User dismissed install');
      }
      setShowPrompt(false);
    }
  };

  if (!showPrompt) return null;

  return (
    <button
      onClick={handleInstall}
      className="bg-primary-500 fixed right-6 top-6 z-50 rounded-full px-4 py-2 text-white shadow-xl"
    >
      📥 Install Quiz Money
    </button>
  );
};

export default InstallAppButton;
