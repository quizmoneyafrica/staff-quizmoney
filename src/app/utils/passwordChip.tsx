import { CheckIcon } from '@radix-ui/react-icons';
import { cn } from './utils';

type Props = {
  text: string;
  valid: boolean;
};

export const PasswordChip = ({ text, valid }: Props) => {
  return (
    <div
      className={cn(
        'text-nowrap flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium transition',
        valid
          ? 'bg-positive-100 text-positive-900'
          : 'bg-[#F4F4F4] text-[#6E759F]',
      )}
    >
      {valid && <CheckIcon className="h-4 w-4 text-green-700" />}
      <span>{text}</span>
    </div>
  );
};
