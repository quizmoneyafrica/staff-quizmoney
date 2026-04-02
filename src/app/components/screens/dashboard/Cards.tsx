import * as React from 'react';

interface IDashboardCardsProps {
  title: string;
  icon: React.ReactNode;
  bgColor: string;
  loading: boolean;
  children: React.ReactNode;
  action?: React.ReactNode;
  bgImage: React.ReactNode;
}

const StatCard: React.FunctionComponent<IDashboardCardsProps> = (props) => {
  const { title, loading, children, action, bgColor, icon, bgImage } = props;
  if (loading) {
    return (
      <div className="h-28 w-full animate-pulse rounded-xl bg-neutral-200" />
    );
  }
  return (
    <>
      <div
        className={`h-30 relative flex w-full items-center rounded-lg p-4 lg:h-[169px] ${
          bgColor === 'blue'
            ? 'bg-primary-50'
            : bgColor === 'green'
            ? 'bg-positive-50'
            : bgColor === 'cyan'
            ? 'bg-secondary-50'
            : null
        }`}
      >
        <div className="z-1 absolute bottom-0 right-2">{bgImage}</div>
        <div className="z-2 relative flex gap-2">
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
              {action}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StatCard;
