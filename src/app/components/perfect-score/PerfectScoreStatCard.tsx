import * as React from 'react';

type BgColor = 'lightBlue' | 'lightCyan' | 'redError' | 'lightGreen';

interface IPerfectScoreStatCardProps {
  title: string;
  value: number;
  bgColor: BgColor;
  icon: React.ReactNode;
  bgImage?: React.ReactNode;
  isVisible?: boolean;
  onToggleVisibility?: () => void;
  format: (value: number) => string;
  isLoading: boolean;
}

const PerfectScoreStatCard: React.FunctionComponent<
  IPerfectScoreStatCardProps
> = (props) => {
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
  } = props;

  const getColorClass = (color: BgColor) => {
    switch (color) {
      case 'lightBlue':
        return 'text-blue-800';
      case 'lightCyan':
        return 'text-blue-700';
      case 'lightGreen':
        return 'text-green-800';
      case 'redError':
        return 'text-error-800';
      default:
        return '';
    }
  };

  const getBackgroundClass = (color: BgColor) => {
    switch (color) {
      case 'lightBlue':
        return 'bg-[#DFF9FF]';
      case 'lightCyan':
        return 'bg-[#E4F1FA]';
      case 'lightGreen':
        return 'bg-[#E7FEED]';
      case 'redError':
        return 'bg-error-50';
      default:
        return '';
    }
  };

  const getIconBackgroundClass = (color: BgColor) => {
    switch (color) {
      case 'lightBlue':
        return 'bg-blue-100';
      case 'lightCyan':
        return 'bg-blue-50';
      case 'lightGreen':
        return 'bg-green-100';
      case 'redError':
        return 'bg-error-100';
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
    return <PerfectScoreStatCardLoading />;
  }

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
            {onToggleVisibility && isVisible === false
              ? '********'
              : format(value)}
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
        </div>
      </div>
    </div>
  );
};

export default PerfectScoreStatCard;

export const PerfectScoreStatCardLoading: React.FunctionComponent = () => {
  return (
    <div className="h-[120px] w-full animate-pulse rounded-lg bg-neutral-300 p-4 lg:h-[169px]"></div>
  );
};
