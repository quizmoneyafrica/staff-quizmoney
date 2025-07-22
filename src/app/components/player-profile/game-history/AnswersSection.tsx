import React from 'react';
import { Check, X } from 'lucide-react';
import AnswerBubble from './AnswerBubble';

interface AnswersSectionProps {
  correctAnswers: number[];
  missedAnswers: number[];
}

const AnswersSection: React.FC<AnswersSectionProps> = ({
  correctAnswers,
  missedAnswers,
}) => {
  return (
    <div className="flex-1">
      <div className="mb-6">
        <div className="mb-4 flex items-center space-x-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#00b23d]">
            <Check className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-lg font-semibold leading-6 text-black">
            Correct Answers
          </h2>
        </div>
        <div className="flex flex-wrap gap-10">
          {correctAnswers.map((num) => (
            <AnswerBubble
              key={`correct-${num}`}
              number={num}
              isCorrect={true}
            />
          ))}
        </div>
      </div>

      <div className="mb-6">
        <div className="mb-4 flex items-center space-x-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#c30012]">
            <X className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-lg font-semibold leading-6 text-black">
            Missed Questions
          </h2>
        </div>
        <div className="flex flex-wrap gap-10">
          {missedAnswers.map((num) => (
            <AnswerBubble
              key={`missed-${num}`}
              number={num}
              isCorrect={false}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnswersSection;
