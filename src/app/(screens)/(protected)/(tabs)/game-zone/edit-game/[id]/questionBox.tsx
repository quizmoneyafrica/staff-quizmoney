import { QuestionState } from '@/app/store/gameSlice';
import CustomTextField from '@/app/utils/CustomTextField';
import { LucideArrowDown, LucideArrowUp } from 'lucide-react';
import React, { useState } from 'react';

interface IQuestionBoxProps {
  questionNumber: number;
  question: QuestionState;
  onQuestionUpdate: (
    questionIndex: number,
    updatedQuestion: QuestionState,
  ) => void;
}

const QuestionBox: React.FC<IQuestionBoxProps> = ({
  questionNumber,
  question,
  onQuestionUpdate,
}) => {
  const [opened, setOpened] = useState(true);

  const toggleOpened = () => {
    setOpened(!opened);
  };

  const handleQuestionTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedQuestion = {
      ...question,
      question: e.target.value,
    };
    onQuestionUpdate(questionNumber, updatedQuestion);
  };

  const handleOptionChange = (optionIndex: number, value: string) => {
    const updatedOptions = [...question.options];
    updatedOptions[optionIndex] = value;

    const updatedQuestion = {
      ...question,
      options: updatedOptions,
    };
    onQuestionUpdate(questionNumber, updatedQuestion);
  };

  const handleCorrectAnswerChange = (selectedOption: string) => {
    const updatedQuestion = {
      ...question,
      correctAnswer: selectedOption,
    };
    onQuestionUpdate(questionNumber, updatedQuestion);
  };

  return (
    <>
      <div className="rounded-lg bg-white p-4">
        <div
          className="flex cursor-pointer items-start justify-between lg:items-center"
          onClick={toggleOpened}
        >
          <div className="flex w-[80%] flex-col gap-2 lg:w-full lg:flex-row lg:items-start lg:gap-0">
            <p className="font-heading font-medium">
              Question {questionNumber + 1}
            </p>
            {!opened && (
              <div className="font-heading flex items-center gap-1">
                <span className="hidden lg:block">:</span>{' '}
                <span className="truncate">{question.question}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button type="button" className="text-2xl text-neutral-600">
              {!opened ? <LucideArrowDown /> : <LucideArrowUp />}
            </button>
          </div>
        </div>

        {opened && (
          <div className="pt-10 lg:pt-5">
            <div className="font-heading space-y-5">
              <CustomTextField
                label="Question Text"
                placeholder="Enter game Question"
                type="text"
                name="question"
                value={question.question || ''}
                onChange={handleQuestionTextChange}
              />

              <div className="space-y-3">
                <h4 className="font-medium text-gray-700">Answer Options</h4>
                {question.options.map((option, index) => (
                  <div className="flex items-center gap-3" key={index}>
                    <div className="flex items-center">
                      <input
                        id={`option-${questionNumber}-${index}`}
                        type="radio"
                        name={`options-${questionNumber}`}
                        value={option}
                        checked={option === question.correctAnswer}
                        onChange={() => handleCorrectAnswerChange(option)}
                        className="text-primary-800 h-4 w-4 cursor-pointer border-gray-300 focus:ring-blue-500"
                      />
                      <label
                        htmlFor={`option-${questionNumber}-${index}`}
                        className="ml-2 text-sm font-medium text-gray-700"
                      >
                        {String.fromCharCode(65 + index)}:
                      </label>
                    </div>
                    <div className="flex-1">
                      <CustomTextField
                        placeholder={`Enter option ${String.fromCharCode(
                          65 + index,
                        )}`}
                        value={option || ''}
                        onChange={(e) =>
                          handleOptionChange(index, e.target.value)
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>

              {question.correctAnswer && (
                <div className="mt-4 rounded-lg bg-green-50 p-3">
                  <p className="text-sm text-green-700">
                    <span className="font-medium">Correct Answer:</span>{' '}
                    {question.correctAnswer}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default QuestionBox;
