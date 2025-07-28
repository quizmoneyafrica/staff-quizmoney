import * as React from 'react';
import { QmCoinIcon } from '@/app/icons/icons';
import classNames from 'classnames';

interface IQmCoinStatCardProps {
  title: string;
  value?: string | number;
  bgColor: string;
  icon: React.ReactNode;
  children?: React.ReactNode;
}

const QmCoinStatCard: React.FunctionComponent<IQmCoinStatCardProps> = (
  props,
) => {
  const { title, value, bgColor, icon, children } = props;

  const getColorClass = (bgColor: string) =>
    ({
      lightBlue: 'text-blue-800',
      lightCyan: 'text-cyan-700',
      redError: 'text-error-800',
    }[bgColor] || '');

  const getBackgroundClass = (bgColor: string) =>
    ({
      lightBlue: 'bg-[#E4F1FA]',
      lightCyan: 'bg-[#DFF9FF]',
      redError: 'bg-error-50',
    }[bgColor] || '');

  const getIconBackgroundClass = (bgColor: string) =>
    ({
      lightBlue: 'bg-primary-100',
      lightCyan: 'bg-secondary-100',
      redError: 'bg-error-100',
    }[bgColor] || '');

  const colorClass = getColorClass(bgColor);
  const backgroundClass = getBackgroundClass(bgColor);
  const iconBackgroundClass = getIconBackgroundClass(bgColor);

  return (
    <div
      className={classNames(
        'relative flex h-[169px] w-full flex-col rounded-lg p-4',
        backgroundClass,
        {
          'gap-6': bgColor === 'redError',
          'gap-4': bgColor === 'lightBlue' || bgColor === 'lightCyan',
        },
      )}
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-[10px] ${iconBackgroundClass}`}
      >
        {icon}
      </div>

      <div className="flex flex-col gap-1">
        <p className={`font-heading text-base font-medium ${colorClass}`}>
          {title}
        </p>

        {children || (
          <div
            className={`font-body flex items-center gap-1.5 text-2xl font-bold ${colorClass}`}
          >
            <QmCoinIcon className="h-6 w-6" />
            <span>{value}</span>
            <span className="text-xl font-semibold">QM</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default QmCoinStatCard;
