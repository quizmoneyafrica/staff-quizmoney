import { QuestionState } from '@/app/store/gameSlice';
import CustomTextField from '@/app/utils/CustomTextField';
import { ChevronDown, ChevronUp, X, Plus, GripVertical } from 'lucide-react';
import React, { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';

interface IQuestionBoxProps {
  questionNumber: number;
  question: QuestionState;
  onQuestionUpdate: (
    questionIndex: number,
    updatedQuestion: QuestionState,
  ) => void;
  questionId: string;
  isDragging?: boolean;
}

const QuestionBox: React.FC<IQuestionBoxProps> = ({
  questionNumber,
  question,
  onQuestionUpdate,
  questionId,
  isDragging = false,
}) => {
  const [opened, setOpened] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const toggleOpened = () => {
    setOpened(!opened);
  };

  const handleQuestionTextChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
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

  const addOption = () => {
    if (question.options.length >= 6) {
      setErrorMessage('Each question can have at most 6 options');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    const updatedOptions = [...question.options, ''];
    const updatedQuestion = {
      ...question,
      options: updatedOptions,
    };
    onQuestionUpdate(questionNumber, updatedQuestion);
    setErrorMessage('');
  };

  const removeOption = (optionIndex: number) => {
    if (question.options.length <= 4) {
      setErrorMessage(
        'Each question must have at least 4 options (A, B, C, D)',
      );
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    const updatedOptions = question.options.filter(
      (_, index) => index !== optionIndex,
    );
    let updatedCorrectAnswer = question.correctAnswer;

    if (question.correctAnswer === question.options[optionIndex]) {
      updatedCorrectAnswer = '';
    }

    const updatedQuestion = {
      ...question,
      options: updatedOptions,
      correctAnswer: updatedCorrectAnswer,
    };
    onQuestionUpdate(questionNumber, updatedQuestion);
    setErrorMessage('');
  };

  return (
    <Draggable draggableId={questionId} index={questionNumber}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`rounded-lg border p-4 transition-all duration-200 ${
            snapshot.isDragging
              ? 'border-blue-300 shadow-lg ring-2 ring-blue-500 ring-opacity-50'
              : 'border-gray-200 shadow-sm hover:shadow-md'
          } bg-white`}
          style={{
            ...provided.draggableProps.style,
            transform: snapshot.isDragging
              ? provided.draggableProps.style?.transform
              : 'none',
          }}
        >
          <div className="mb-4 flex items-center justify-between">
            <div
              {...provided.dragHandleProps}
              className="-m-2 flex flex-1 cursor-grab items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50 active:cursor-grabbing"
              onClick={(e) => {
                if (
                  e.target === e.currentTarget ||
                  e.currentTarget.contains(e.target as Node)
                ) {
                  toggleOpened();
                }
              }}
              title="Click to expand/collapse, drag to reorder"
            >
              <GripVertical className="h-4 w-4 flex-shrink-0 text-gray-400" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-gray-900">
                    Question {questionNumber + 1}
                    {!opened && question?.question && (
                      <span className="font-normal text-gray-600">
                        : {question.question}
                      </span>
                    )}
                  </h3>
                  {snapshot.isDragging && (
                    <span className="flex-shrink-0 rounded bg-blue-100 px-2 py-1 text-xs text-blue-600">
                      Moving...
                    </span>
                  )}

                  <div className="ml-auto flex-shrink-0">
                    {opened ? (
                      <ChevronUp className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {errorMessage && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
              <div className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-red-500">
                <X className="h-2 w-2 text-white" />
              </div>
              <p className="text-sm font-medium text-red-700">{errorMessage}</p>
            </div>
          )}

          {opened && (
            <div className="space-y-4">
              <div>
                <textarea
                  placeholder="Enter your Question"
                  className="w-full resize-none rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  value={question.question || ''}
                  onChange={handleQuestionTextChange}
                />
              </div>

              <div className="space-y-3">
                {question.options.map((option, index) => {
                  const optionLetter = String.fromCharCode(65 + index);
                  const isCorrect = option === question.correctAnswer;

                  return (
                    <div key={index} className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleCorrectAnswerChange(option)}
                        className={`flex h-6 w-6 cursor-pointer items-center justify-center rounded border-2 border-black ${
                          isCorrect ? 'bg-black' : 'bg-white'
                        }`}
                      >
                        {isCorrect && (
                          <svg
                            className="h-5 w-5 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </button>

                      <label className="min-w-0 text-sm font-medium text-gray-700">
                        Option {optionLetter}:
                      </label>

                      <div className="relative flex-1">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder={`Enter Option ${optionLetter}`}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 pr-14 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={option || ''}
                            onChange={(e) =>
                              handleOptionChange(index, e.target.value)
                            }
                          />
                          {question.options.length > 4 && (
                            <button
                              type="button"
                              onClick={() => removeOption(index)}
                              className="absolute right-0 top-0 flex h-full w-12 cursor-pointer items-center justify-center rounded-r-md bg-gray-200 transition-colors hover:bg-gray-300"
                            >
                              <X className="h-5 w-5 text-gray-600" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {question.options.length < 6 && (
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-6"></div>
                    <div className="min-w-0 text-sm font-medium text-gray-700 opacity-0">
                      Option:
                    </div>
                    <div className="ml-4 flex-1">
                      <button
                        type="button"
                        onClick={addOption}
                        className="flex cursor-pointer items-center gap-2 rounded-md bg-blue-100 px-3 py-2 text-sm text-blue-600 transition-colors hover:bg-blue-200"
                      >
                        <div className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-600">
                          <Plus className="h-2 w-2 text-white" />
                        </div>
                        Add Option
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {question.correctAnswer && (
                <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3">
                  <p className="text-sm text-green-700">
                    <span className="font-medium">Correct Answer:</span>{' '}
                    {question.correctAnswer}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
};

export default QuestionBox;
