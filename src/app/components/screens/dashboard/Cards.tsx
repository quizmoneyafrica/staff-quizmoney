import * as React from 'react';

interface IDashboardCardsProps {
  title: string;
  children: React.ReactNode;
  bgColor: string;
  icon: React.ReactNode;
  bgImage: React.ReactNode;
}

const DashboardCards: React.FunctionComponent<IDashboardCardsProps> = (
  props,
) => {
  const { title, children, bgColor, icon, bgImage } = props;
  return (
    <div
      className={`relative flex h-[120px] w-full items-center rounded-lg p-4 lg:h-[169px] ${
        bgColor === 'blue'
          ? 'bg-primary-50'
          : bgColor === 'green'
          ? 'bg-positive-50'
          : bgColor === 'cyan'
          ? 'bg-secondary-50'
          : null
      }`}
    >
      <div className="absolute bottom-0 right-2 z-[1]">
        {bgImage}
        {/* <Image src={bgImage} alt="Admin" width={100} height={80} priority /> */}
      </div>
      <div className="relative z-[2] flex gap-2">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-lg ${
            bgColor === 'blue'
              ? 'bg-primary-100 text-primary-900'
              : bgColor === 'green'
              ? 'bg-positive-100 text-positive-900'
              : bgColor === 'cyan'
              ? 'bg-secondary-200 text-secondary-900'
              : null
          }`}
        >
          {icon}
        </div>
        <div>
          <p
            className={`font-heading text-base font-normal ${
              bgColor === 'blue'
                ? 'text-primary-900'
                : bgColor === 'green'
                ? 'text-positive-900'
                : bgColor === 'cyan'
                ? 'text-secondary-900'
                : null
            }`}
          >
            {title}
          </p>
          <div
            className={`font-body flex items-center gap-4 text-2xl font-bold ${
              bgColor === 'blue'
                ? 'text-primary-900'
                : bgColor === 'green'
                ? 'text-positive-900'
                : bgColor === 'cyan'
                ? 'text-secondary-900'
                : null
            }`}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCards;

export const DashboardCardsLoading: React.FunctionComponent = () => {
  return (
    <div
      className={`h-[120px] w-full animate-pulse rounded-lg bg-neutral-300 p-4 lg:h-[169px]`}
    ></div>
  );
};
