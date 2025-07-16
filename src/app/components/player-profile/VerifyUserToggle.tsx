import React from 'react';
import { User } from 'lucide-react';

interface VerifyUserToggleProps {
  isEnabled: boolean;
  onToggle: (newState: boolean) => void;
  isUpdating?: boolean;
}

const VerifyUserToggle: React.FC<VerifyUserToggleProps> = ({
  isEnabled,
  onToggle,
  isUpdating = false,
}) => {
  const handleToggle = () => {
    if (!isUpdating) {
      onToggle(!isEnabled);
    }
  };

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <User className="h-5 w-5 text-gray-700" />
          <span className="mr-2 text-sm font-medium text-gray-900">
            KYC Verify User
          </span>
        </div>
        <button
          onClick={handleToggle}
          disabled={isUpdating}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
            isEnabled ? 'bg-green-500' : 'bg-gray-300'
          }`}
          role="switch"
          aria-checked={isEnabled}
          aria-label="Toggle user KYC verification"
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isEnabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </div>
  );
};

export default VerifyUserToggle;
