import * as React from 'react';

interface IDashboardCardsProps {
  title: string;
  children?: React.ReactNode;
  value?: string;
  bgColor: string;
  icon: React.ReactNode;
  bgImage?: React.ReactNode;
  showEye?: boolean;

  analytics?: {
    percentage: number;
    period?: string;
  };

  isValueVisible?: boolean;
  onEyeToggle?: () => void;
}

const WalletStatCard: React.FunctionComponent<IDashboardCardsProps> = (
  props,
) => {
  const {
    title,
    children,
    value,
    bgColor,
    icon,
    bgImage,
    showEye,
    analytics,
    isValueVisible,
    onEyeToggle,
  } = props;

  const getColorClass = (bgColor: string) => {
    switch (bgColor) {
      case 'lightBlue':
        return 'text-blue-800';
      case 'lightCyan':
        return 'text-blue-700';
      case 'lightGreen':
        return 'text-green-800';
      case 'blue':
        return 'text-primary-900';
      case 'green':
        return 'text-positive-900';
      case 'cyan':
        return 'text-secondary-900';
      case 'yellow':
        return 'text-yellow-500';
      default:
        return '';
    }
  };

  const getBackgroundClass = (bgColor: string) => {
    switch (bgColor) {
      case 'lightBlue':
        return 'bg-[#DFF9FF]';
      case 'lightCyan':
        return 'bg-[#E4F1FA]';
      case 'lightGreen':
        return 'bg-[#E7FEED]';
      case 'blue':
        return 'bg-primary-50';
      case 'green':
        return 'bg-positive-50';
      case 'cyan':
        return 'bg-secondary-50';
      case 'yellow':
        return 'bg-yellow-50';
      default:
        return '';
    }
  };

  const getIconBackgroundClass = (bgColor: string) => {
    switch (bgColor) {
      case 'lightBlue':
        return 'bg-blue-100';
      case 'lightCyan':
        return 'bg-blue-50';
      case 'lightGreen':
        return 'bg-green-100';
      case 'blue':
        return 'bg-primary-100';
      case 'green':
        return 'bg-positive-100';
      case 'cyan':
        return 'bg-secondary-200';
      case 'yellow':
        return 'bg-yellow-100';
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

  const formatAnalytics = () => {
    if (!analytics) return null;

    const { percentage, period = 'this week' } = analytics;
    const isPositive = percentage >= 0;
    const arrow = isPositive ? '↑' : '↓';
    const sign = isPositive ? '+' : '';
    const colorClass = isPositive ? 'text-green-600' : 'text-red-600';

    return (
      <div className={`flex items-center gap-1 text-sm ${colorClass}`}>
        <span className="font-medium">
          {arrow} {sign}
          {Math.abs(percentage)}%
        </span>
        <span className="text-gray-500">{period}</span>
      </div>
    );
  };

  return (
    <div
      className={`relative flex h-[120px] w-full items-center rounded-lg p-4 lg:h-[169px] ${backgroundClass}`}
    >
      {bgImage && (
        <div className="absolute bottom-0 right-2 z-[1]">
          {applyColorToIcon(bgImage)}
        </div>
      )}
      <div className="relative z-[2] flex gap-2">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-lg ${iconBackgroundClass}`}
        >
          {applyColorToIcon(icon)}
        </div>
        <div className="flex flex-col">
          <p className={`font-heading text-base font-medium ${colorClass}`}>
            {title}
          </p>
          <div
            className={`font-body flex items-center gap-4 text-2xl font-bold ${colorClass}`}
          >
            {showEye && !isValueVisible ? '********' : value || children}
            {showEye && (
              <button
                className="ml-2 text-current opacity-70 transition-opacity hover:opacity-100"
                onClick={onEyeToggle}
                aria-label={isValueVisible ? 'Hide value' : 'Show value'}
              >
                {isValueVisible ? (
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

          {analytics && <div className="mt-1">{formatAnalytics()}</div>}
        </div>
      </div>
    </div>
  );
};

export default WalletStatCard;

export const WalletStatCardsLoading: React.FunctionComponent = () => {
  return (
    <div className="h-[120px] w-full animate-pulse rounded-lg bg-neutral-300 p-4 lg:h-[169px]"></div>
  );
};
