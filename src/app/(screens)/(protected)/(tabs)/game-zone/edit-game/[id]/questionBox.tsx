import { QuestionState } from '@/app/store/gameSlice';
import CustomTextField from '@/app/utils/CustomTextField';
import { LucideArrowDown, LucideArrowUp } from 'lucide-react';
import React, { useState } from 'react';

interface IQuestionBoxProps {
  questionNumber: number;
  questions: QuestionState[];
}

const QuestionBox: React.FC<IQuestionBoxProps> = ({
  questionNumber,
  questions,
}) => {
  const [opened, setOpened] = useState(true);

  const toggleOpened = () => {
    setOpened(!opened);
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
                <span>{questions[questionNumber]?.question}</span>
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
              {/* <CustomInput
								full={true}
								error={false}
								placeholder="Enter game Question"
								value={questions[questionNumber]?.question}
								readOnly
							/> */}
              <CustomTextField
                placeholder="Enter game Question"
                type="text"
                name="name"
                value={questions[questionNumber]?.question}
                readOnly
              />

              <div className="space-y-3">
                {questions[questionNumber]?.options.map((option, index) => (
                  <div className="flex items-center" key={index}>
                    <div className="flex w-[40%] items-center">
                      <input
                        id={`option-${index}`}
                        type="radio"
                        name={`options-${questionNumber}`}
                        value={option}
                        // checked={index === selectedOptionIndex}
                        checked={
                          questions[questionNumber]?.correctAnswer !== '' &&
                          option === questions[questionNumber]?.correctAnswer
                        }
                        className="text-primary-800 h-8 w-8 cursor-pointer rounded border-none bg-gray-100 focus:outline-none focus:ring-0"
                        readOnly
                      />
                      <label
                        htmlFor={`option-${index}`}
                        className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                      >
                        Option {String.fromCharCode(65 + index)}:
                      </label>
                    </div>
                    <CustomTextField
                      placeholder={`Enter option ${String.fromCharCode(
                        65 + index,
                      )}`}
                      value={option}
                      readOnly
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default QuestionBox;
