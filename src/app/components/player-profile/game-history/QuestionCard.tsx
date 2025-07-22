import React from 'react';
import { Check, X } from 'lucide-react';
import { Question } from './types';
import { BlueClock, GreenClock, SmallEraserIcon } from '@/app/icons/icons';

interface QuestionCardProps {
  question: Question;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question }) => {
  return (
    <div className="w-full rounded-[10px] border border-[#0000000d] bg-[#f8fcff] p-4">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          <div className="mb-3 flex items-center space-x-3">
            <div className="min-w-[91px] text-center text-lg font-bold leading-8 text-black">
              Question {question.id}
            </div>
            {question.isCorrect ? (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#00b23d]">
                <Check className="h-4 w-4 text-white" />
              </div>
            ) : (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#c30012]">
                <X className="h-4 w-4 text-white" />
              </div>
            )}
            {question.hasEraser && (
              <div className="flex items-center space-x-1 text-sm text-[#3a93db]">
                <span>Eraser used</span>
                <SmallEraserIcon />
              </div>
            )}
          </div>

          <div className="mb-2">
            <div className="mb-1 text-base font-bold leading-6 text-[#1b1b1b]">
              {question.question}
            </div>
            {question.userAnswer && !question.isCorrect && (
              <div className="text-[13px] font-normal leading-6 text-[#c30012]">
                Your answer: {question.userAnswer}
              </div>
            )}
            <div className="text-[13px] font-normal leading-6 text-[#009028]">
              Correct Answer: {question.correctAnswer}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-col items-start space-y-2 text-left lg:ml-4 lg:mt-0">
          <div className="">
            <div className="mb-1 text-xs font-normal leading-[18px] text-black">
              Answered Time
            </div>
            <div className="flex space-x-2 text-right">
              <BlueClock className="h-5 w-5 text-[#2364aa]" />

              <span className="text-sm font-bold leading-[18px] text-[#2364aa]">
                {question.answeredTime}
              </span>
            </div>
          </div>

          <div className="">
            <div className="mb-1 text-xs font-normal leading-[18px] text-black">
              Database Time
            </div>
            <div className="flex items-center space-x-2">
              <GreenClock className="h-4 w-4 text-white" />

              <span className="text-xs font-normal leading-[18px] text-[#009028]">
                {question.databaseTime}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
