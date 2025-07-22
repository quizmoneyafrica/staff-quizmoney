import React from 'react';

interface AnswerBubbleProps {
  number: number;
  isCorrect: boolean;
  size?: 'sm' | 'md';
}

const AnswerBubble: React.FC<AnswerBubbleProps> = ({
  number,
  isCorrect,
  size = 'md',
}) => {
  const sizeClasses =
    size === 'sm' ? 'w-12 h-12 text-sm' : 'w-[60px] h-[60px] text-base';
  const bgColor = isCorrect ? '#e7feed' : '#ffeaee';
  const borderColor = isCorrect ? '#00b23d4d' : '#f69798';
  const textColor = isCorrect ? '#00b23d' : '#c30012';

  return (
    <div
      className={`${sizeClasses} flex items-center justify-center rounded-full border font-semibold`}
      style={{
        backgroundColor: bgColor,
        borderColor: borderColor,
        color: textColor,
      }}
    >
      {number}
    </div>
  );
};

export default AnswerBubble;
