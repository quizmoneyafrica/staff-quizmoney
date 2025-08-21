import React from 'react';
import { KeyRound, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

const ChangePasswordButton = () => {
  const router = useRouter();

  const handleNavigateToChangePassword = () => {
    router.push('/settings/change-password');
  };

  return (
    <div className="mt-6 w-full rounded-lg border border-gray-200 bg-white shadow-sm">
      <button
        onClick={handleNavigateToChangePassword}
        className="group flex w-full items-center justify-between rounded-lg p-6 transition-colors duration-200 hover:bg-gray-50"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 transition-colors duration-200 group-hover:bg-blue-100">
            <KeyRound className="h-6 w-6 text-blue-600" />
          </div>
          <div className="text-left">
            <h3 className="mb-1 text-lg font-semibold text-gray-900">
              Change Password
            </h3>
            <p className="text-sm text-gray-500">
              Update your account password for better security
            </p>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-gray-400 transition-colors duration-200 group-hover:text-gray-600" />
      </button>
    </div>
  );
};

export default ChangePasswordButton;
