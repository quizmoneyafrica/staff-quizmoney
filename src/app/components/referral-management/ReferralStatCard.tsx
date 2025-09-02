import * as React from 'react';
import { QmCoinIcon } from '@/app/icons/icons';

type BgColor = 'lightBlue' | 'lightCyan' | 'redError' | 'lightGreen';

interface IReferralStatCardProps {
  title: string;
  value: number;
  bgColor: BgColor;
  icon: React.ReactNode;
  bgImage?: React.ReactNode;
  isVisible?: boolean;
  onToggleVisibility?: () => void;
  format: (value: number) => string | React.ReactNode;
  isLoading: boolean;
  showQmCoin?: boolean;
  subtitle?: string;
}

const ReferralStatCard: React.FC<IReferralStatCardProps> = (props) => {
  const {
    title,
    value,
    bgColor,
    icon,
    bgImage,
    isVisible,
    onToggleVisibility,
    format,
    isLoading,
    showQmCoin,
    subtitle,
  } = props;

  const getColorClass = (color: BgColor) => {
    switch (color) {
      case 'lightBlue':
        return 'text-[#0A5A6D]';
      case 'lightCyan':
        return 'text-[#0A4B8C]';
      case 'lightGreen':
        return 'text-[#0A7C3D]';
      case 'redError':
        return 'text-[#C01F3E]';
      default:
        return '';
    }
  };

  const getBackgroundClass = (color: BgColor) => {
    switch (color) {
      case 'lightBlue':
        return 'bg-[#E8F7FB]';
      case 'lightCyan':
        return 'bg-[#EBF5FC]';
      case 'lightGreen':
        return 'bg-[#EAFBF1]';
      case 'redError':
        return 'bg-[#FCEEF0]';
      default:
        return '';
    }
  };

  const getIconBackgroundClass = (color: BgColor) => {
    switch (color) {
      case 'lightBlue':
        return 'bg-[#C5EDF7]';
      case 'lightCyan':
        return 'bg-[#D0E6F9]';
      case 'lightGreen':
        return 'bg-[#D0F7E1]';
      case 'redError':
        return 'bg-[#FBDCE1]';
      default:
        return '';
    }
  };

  const colorClass = getColorClass(bgColor);
  const backgroundClass = getBackgroundClass(bgColor);
  const iconBackgroundClass = getIconBackgroundClass(bgColor);

  const applyColorToIcon = (element: React.ReactNode) => {
    return (
      <div className={`${colorClass} [&>*]:text-current [&>svg]:text-current`}>
        {element}
      </div>
    );
  };

  if (isLoading) {
    return <ReferralStatCardLoading />;
  }

  return (
    <div
      className={`relative flex h-[120px] w-full flex-col rounded-lg p-4 lg:h-[169px] ${backgroundClass}`}
    >
      {bgImage && (
        <div className="absolute bottom-0 right-2 z-[1]">
          {applyColorToIcon(bgImage)}
        </div>
      )}
      <div className="flex flex-col gap-4">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-lg ${iconBackgroundClass}`}
        >
          {applyColorToIcon(icon)}
        </div>
        <div className="flex flex-col">
          <p className={`font-heading text-base font-semibold ${colorClass}`}>
            {title}
          </p>
          <div className="mt-1">
            <div
              className={`font-body flex items-baseline gap-2 text-3xl font-bold ${colorClass}`}
            >
              {showQmCoin && <QmCoinIcon className="mr-1 h-5 w-5" />}
              {onToggleVisibility && isVisible === false ? (
                <span>********</span>
              ) : (
                <>{format(value)}</>
              )}
              {showQmCoin && (
                <span className="text-base font-medium">QM coins</span>
              )}
              {onToggleVisibility && (
                <button
                  className="ml-2 text-current opacity-70 transition-opacity hover:opacity-100"
                  onClick={onToggleVisibility}
                  aria-label={isVisible ? 'Hide value' : 'Show value'}
                >
                  {isVisible ? (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m15 18-.722-3.25" />
                      <path d="m2 2 20 20" />
                      <path d="m9 9-.722-3.25" />
                      <path d="M3 13a13.5 13.5 0 0 0 3-4" />
                      <path d="M21 13a13.5 13.5 0 0 1-3-4" />
                      <path d="M12 5c4 0 8 2.5 11 8-1.5 2.8-3.5 5.5-7 7l-1-.5" />
                    </svg>
                  ) : (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              )}
            </div>
            {subtitle && (
              <p
                className={`text-xs font-normal ${colorClass} mt-1 opacity-70`}
              >
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralStatCard;

export const ReferralStatCardLoading = () => {
  return (
    <div className="h-[120px] w-full animate-pulse rounded-lg bg-neutral-300 p-4 lg:h-[169px]"></div>
  );
};
