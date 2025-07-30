'use client';

import React from 'react';
import ordinalize from 'ordinalize';
import { cn } from '@/app/utils';

interface RankBadgeProps {
  rank: number;
  className?: string;
}

export const RankBadge: React.FC<RankBadgeProps> = ({ rank, className }) => {
  return (
    <div className={cn('relative', className)}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 30 38"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M20.9802 29.1316L21.2858 35.0702L15.0174 30.8958L8.71397 35.0742L9.01978 29.1316H6.37245L5.91618 38H8.94798L15.014 33.9791L21.0519 38H24.0838L23.6275 29.1316H20.9802ZM28.1717 10.9921L27.9904 7.18711L24.6427 5.13416L22.5 1.92579L18.5293 1.75159L15 0L11.4707 1.75198L7.5 1.92618L5.35728 5.13416L2.0096 7.18711L1.82832 10.9921L0 14.3743L1.82832 17.7566L2.0101 21.5615L5.35728 23.6145L7.49967 26.8229L11.4704 26.9967L15 28.7487L18.5293 26.9967L22.5 26.8229L24.6424 23.6145L27.9903 21.5618L28.1717 17.7569L30 14.3746L28.1717 10.9921ZM25.5568 17.0851L25.4112 20.1347L22.7278 21.7801L21.0108 24.3516L17.8284 24.4909L15 25.8951L12.1713 24.4909L8.98888 24.3516L7.27186 21.7801L4.58884 20.1347L4.4435 17.0851L2.97759 14.3743L4.44317 11.6641L4.58884 8.61397L7.27186 6.96857L8.98888 4.39721L12.1713 4.25785L15 2.85364L17.8287 4.25777L21.0111 4.39714L22.7281 6.96849L25.4112 8.61397L25.5565 11.6637L27.0224 14.3743L25.5568 17.0851Z" />

        <text
          x="50%"
          y="40%"
          dominantBaseline="middle"
          textAnchor="middle"
          fill="currentColor"
          //   stroke="white"
          strokeWidth="1.5"
          paintOrder="stroke"
          fontSize="11"
          fontWeight="bold"
        >
          {ordinalize(rank)}
        </text>
      </svg>
    </div>
  );
};
