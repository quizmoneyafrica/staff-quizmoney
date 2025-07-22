import React from 'react';

interface InfoCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  iconBg?: string;
}

const InfoCard: React.FC<InfoCardProps> = ({
  icon,
  value,
  label,
  iconBg = '#BCDDF4',
}) => (
  <div className="flex min-w-[107px] flex-col items-center space-y-2">
    <div
      className="flex h-10 w-10 items-center justify-center rounded-full text-white"
      style={{ backgroundColor: iconBg }}
    >
      {icon}
    </div>
    <div className="text-center">
      <div className="text-lg font-bold leading-6 text-[#2364aa]">{value}</div>
      <div className="text-sm font-medium leading-[18px] text-[#6d6d6d]">
        {label}
      </div>
    </div>
  </div>
);

export default InfoCard;
