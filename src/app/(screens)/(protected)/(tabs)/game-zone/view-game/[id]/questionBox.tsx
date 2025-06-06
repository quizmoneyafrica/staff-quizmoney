import { QuestionState } from "@/app/store/gameSlice";
import CustomTextField from "@/app/utils/CustomTextField";
import { LucideArrowDown, LucideArrowUp } from "lucide-react";
import React, { useState } from "react";

interface IQuestionBoxProps {
  questionNumber: number;
  questions: QuestionState[];
}

const QuestionBox: React.FC<IQuestionBoxProps> = ({
  questionNumber,
  questions,
}) => {
  const [opened, setOpened] = useState(true);
  return (
    <>
      <div className="bg-white rounded-lg p-4">
        <div className="flex items-start lg:items-center justify-between">
          <div className="w-[80%] lg:w-full flex flex-col gap-2 lg:gap-0 lg:flex-row lg:items-start">
            <p className="font-medium font-heading">
              Question {questionNumber + 1}
            </p>
            {!opened && (
              <div className="flex items-center gap-1 font-heading">
                <span className="hidden lg:block">:</span>{" "}
                <span>{questions[questionNumber]?.question}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setOpened(!opened)}
              className="text-2xl text-neutral-600"
            >
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
                    <div className="flex items-center w-[40%]">
                      <input
                        id={`option-${index}`}
                        type="radio"
                        name={`options-${questionNumber}`}
                        value={option}
                        // checked={index === selectedOptionIndex}
                        checked={
                          questions[questionNumber]?.correctAnswer !== "" &&
                          option === questions[questionNumber]?.correctAnswer
                        }
                        className="w-8 h-8 text-primary-800 bg-gray-100 rounded border-none focus:ring-0 focus:outline-none cursor-pointer"
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
                        65 + index
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
