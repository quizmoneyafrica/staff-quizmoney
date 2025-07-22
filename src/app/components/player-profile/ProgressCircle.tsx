'use client';
import React from 'react';

interface ProgressCircleProps {
  correct: number;
  total: number;
}

const ProgressCircle: React.FC<ProgressCircleProps> = ({ correct, total }) => {
  const size = 82;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const percentage = total === 0 ? 0 : correct / total;
  const strokeDashoffset = circumference * (1 - percentage);

  return (
    <div
      className="relative flex items-center justify-center"
      style={{
        width: size,
        height: size,
        borderRadius: 10,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90 transform"
      >
        {/* Base  */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E7FEED"
          strokeWidth={strokeWidth}
        />
        {/* Progress Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#00B23D"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 0.3s ease-in-out',
          }}
        />
      </svg>

      <div className="absolute flex items-center justify-center text-[16px] font-bold leading-none text-[#2364AA]">
        {correct}/{total}
      </div>
    </div>
  );
};

export default ProgressCircle;
