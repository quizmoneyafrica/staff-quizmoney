'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';

interface WithdrawalCardsProps {
  title: string;
  value: string;
  color: 'blue' | 'green' | 'cyan' | 'yellow' | 'default';
  showEye?: boolean;
  smallIcon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  bigIcon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const cardColors = {
  default: {
    bg: 'bg-neutral-50',
    iconBg: 'bg-neutral-100',
    text: 'text-neutral-900',
    value: 'text-neutral-900',
  },
  blue: {
    bg: 'bg-primary-50',
    iconBg: 'bg-primary-100',
    text: 'text-primary-900',
    value: 'text-primary-900',
  },
  green: {
    bg: 'bg-positive-50',
    iconBg: 'bg-positive-100',
    text: 'text-positive-900',
    value: 'text-positive-900',
  },
  cyan: {
    bg: 'bg-secondary-50',
    iconBg: 'bg-secondary-200',
    text: 'text-secondary-900',
    value: 'text-secondary-900',
  },
  yellow: {
    bg: 'bg-yellow-50',
    iconBg: 'bg-yellow-100',
    text: 'text-yellow-900',
    value: 'text-yellow-900',
  },
};

const WithdrawalCards: React.FC<WithdrawalCardsProps> = ({
  title,
  value,
  color,
  showEye = false,
  smallIcon: SmallIcon,
  bigIcon: BigIcon,
}) => {
  const colors = cardColors[color] || cardColors.default;
  const [hidden, setHidden] = React.useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative flex h-[120px] w-full items-center rounded-lg p-4 lg:h-[169px] ${colors.bg}`}
    >
      {BigIcon && (
        <div className="absolute bottom-0 right-2 z-[1]">
          <BigIcon className="opacity-60" style={{ width: 80, height: 80 }} />
        </div>
      )}

      <div className="relative z-[2] flex gap-2">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-lg ${colors.iconBg}`}
        >
          {SmallIcon && <SmallIcon style={{ width: 24, height: 24 }} />}
        </div>

        <div>
          <p className={`font-heading text-base font-normal ${colors.text}`}>
            {title}
          </p>
          <div
            className={`font-body flex items-center gap-4 text-2xl font-bold ${colors.value}`}
          >
            {hidden && showEye ? '••••••' : value}
            {showEye && (
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="cursor-pointer"
                role="button"
                aria-label={hidden ? 'Show value' : 'Hide value'}
                tabIndex={0}
                onClick={() => setHidden(!hidden)}
                onKeyDown={(e) => e.key === 'Enter' && setHidden(!hidden)}
              >
                {hidden ? (
                  <Eye size={20} className={colors.text} />
                ) : (
                  <EyeOff size={20} className={colors.text} />
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default WithdrawalCards;

export const WithdrawalCardsLoading: React.FC = () => {
  return (
    <div className="h-[120px] w-full animate-pulse rounded-lg bg-neutral-300 p-4 lg:h-[169px]"></div>
  );
};
