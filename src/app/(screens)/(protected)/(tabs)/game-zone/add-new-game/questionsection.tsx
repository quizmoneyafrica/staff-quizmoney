'use client';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { Plus, Trash2, ChevronDown, ChevronUp, X } from 'lucide-react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd';
import { joiResolver } from '@hookform/resolvers/joi';
import { questionsFormSchema } from '@/app/(screens)/(protected)/(tabs)/game-zone/add-new-game/joiValidationSchema';

interface Option {
  id: string;
  text: string;
}

interface Question {
  id: string;
  question: string;
  options: Option[];
  correctOptionIndex: number;
  isExpanded: boolean;
}

interface QuestionsFormData {
  questions: Question[];
}

interface QuestionsSectionProps {
  onQuestionsChange?: (questions: Question[]) => void;
  onSubmit?: (questions: Question[]) => Promise<void>;
  isSubmitting?: boolean;
  questionsLimit?: number;
}

interface FormError {
  message?: string;
  type?: string;
}

interface FieldError {
  message: string;
  type?: string;
}

const QuestionsSection: React.FC<QuestionsSectionProps> = ({
  onQuestionsChange,
  onSubmit,
  isSubmitting = false,
  questionsLimit = 10,
}) => {
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitted },
    trigger,
  } = useForm<QuestionsFormData>({
    resolver: joiResolver(questionsFormSchema),
    defaultValues: {
      questions: [
        {
          id: `question-${Date.now()}`,
          question: '',
          options: [
            { id: `option-${Date.now()}-a`, text: '' },
            { id: `option-${Date.now()}-b`, text: '' },
            { id: `option-${Date.now()}-c`, text: '' },
            { id: `option-${Date.now()}-d`, text: '' },
          ],
          correctOptionIndex: -1,
          isExpanded: true,
        },
      ],
    },
    mode: 'onSubmit',
  });

  const {
    fields: questions,
    append: appendQuestion,
    remove: removeQuestion,
    move: moveQuestion,
  } = useFieldArray({
    control,
    name: 'questions',
  });

  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(
    new Set([0]),
  );
  const [errorMessage, setErrorMessage] = useState<string>('');

  const [errorQueue, setErrorQueue] = useState<string[]>([]);
  const [currentErrorIndex, setCurrentErrorIndex] = useState(0);

  React.useEffect(() => {
    const currentQuestions = getValues('questions');
    onQuestionsChange?.(currentQuestions);
  }, [questions, onQuestionsChange, getValues]);

  const scrollToErrorField = (fieldPath: string) => {
    const element = document.querySelector(
      `[name="${fieldPath}"]`,
    ) as HTMLElement;
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.focus();
    }
  };

  const collectAllErrors = () => {
    const allErrors: string[] = [];
    const questionsData = getValues('questions');

    questionsData.forEach((question, qIndex) => {
      if (!question.question?.trim()) {
        allErrors.push(`Question ${qIndex + 1} text is required`);
      }
      question.options.forEach((option, oIndex) => {
        if (!option.text?.trim()) {
          allErrors.push(
            `Question ${qIndex + 1}, Option ${String.fromCharCode(
              65 + oIndex,
            )} is required`,
          );
        }
      });
      if (question.correctOptionIndex === -1) {
        allErrors.push(
          `Question ${qIndex + 1} must have a correct answer selected`,
        );
      }
    });

    if (questionsData.length < questionsLimit) {
      allErrors.unshift(
        `You must add exactly ${questionsLimit} questions (currently ${questionsData.length})`,
      );
    }

    return allErrors;
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) {
      return;
    }

    moveQuestion(sourceIndex, destinationIndex);

    setExpandedQuestions((prev) => {
      const newSet = new Set<number>();

      prev.forEach((expandedIndex) => {
        let newIndex = expandedIndex;

        if (expandedIndex === sourceIndex) {
          newIndex = destinationIndex;
        } else if (sourceIndex < destinationIndex) {
          if (
            expandedIndex > sourceIndex &&
            expandedIndex <= destinationIndex
          ) {
            newIndex = expandedIndex - 1;
          }
        } else {
          if (
            expandedIndex >= destinationIndex &&
            expandedIndex < sourceIndex
          ) {
            newIndex = expandedIndex + 1;
          }
        }

        newSet.add(newIndex);
      });

      return newSet;
    });

    toast.success('Question order updated');
  };

  const addNewQuestion = async () => {
    if (questions.length >= questionsLimit) {
      // setErrorMessage(`You can only add up to ${questionsLimit} questions`);
      setErrorMessage(`You must have exactly ${questionsLimit} questions`);
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    const timestamp = Date.now();
    const newQuestion: Question = {
      id: `question-${timestamp}`,
      question: '',
      options: [
        { id: `option-${timestamp}-a`, text: '' },
        { id: `option-${timestamp}-b`, text: '' },
        { id: `option-${timestamp}-c`, text: '' },
        { id: `option-${timestamp}-d`, text: '' },
      ],
      correctOptionIndex: -1,
      isExpanded: true,
    };

    appendQuestion(newQuestion);
    setExpandedQuestions(new Set([questions.length]));
    setErrorMessage('');
  };

  const toggleQuestionExpansion = (index: number) => {
    setExpandedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const addOptionToQuestion = async (questionIndex: number) => {
    const currentQuestion = getValues(`questions.${questionIndex}`);
    if (!currentQuestion) return;

    if (currentQuestion.options.length >= 6) {
      setErrorMessage('Each question can have at most 6 options');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    const nextLetter = String.fromCharCode(97 + currentQuestion.options.length);
    const newOption: Option = {
      id: `option-${Date.now()}-${nextLetter}`,
      text: '',
    };

    const updatedOptions = [...currentQuestion.options, newOption];
    setValue(`questions.${questionIndex}.options`, updatedOptions);

    setErrorMessage('');
  };

  const removeOptionFromQuestion = async (
    questionIndex: number,
    optionIndex: number,
  ) => {
    const currentQuestion = getValues(`questions.${questionIndex}`);
    if (!currentQuestion) return;

    if (currentQuestion.options.length <= 4) {
      setErrorMessage(
        'Each question must have at least 4 options (A, B, C, D)',
      );
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    setErrorMessage('');
    const updatedOptions = currentQuestion.options.filter(
      (_, index) => index !== optionIndex,
    );
    setValue(`questions.${questionIndex}.options`, updatedOptions);

    const currentCorrectIndex = currentQuestion.correctOptionIndex;
    if (currentCorrectIndex >= optionIndex && currentCorrectIndex > 0) {
      setValue(
        `questions.${questionIndex}.correctOptionIndex`,
        currentCorrectIndex - 1,
      );
    } else if (currentCorrectIndex === optionIndex) {
      setValue(`questions.${questionIndex}.correctOptionIndex`, -1);
    }
  };

  const handleCorrectOptionChange = async (
    questionIndex: number,
    optionIndex: number,
  ) => {
    setValue(`questions.${questionIndex}.correctOptionIndex`, optionIndex);
  };

  const getQuestionError = (
    questionIndex: number,
    field?: string,
  ): string | null => {
    if (!isSubmitted) return null;

    const questionErrors = errors.questions?.[questionIndex];
    if (!questionErrors) return null;

    const extractMessage = (error: unknown): string | null => {
      if (typeof error === 'string') {
        return error;
      }

      if (error && typeof error === 'object') {
        const errorObj = error as FormError;

        if ('message' in errorObj && typeof errorObj.message === 'string') {
          return errorObj.message;
        }

        if ('type' in errorObj && 'message' in errorObj) {
          return errorObj.message || null;
        }
      }

      return null;
    };

    if (field) {
      const fieldError = questionErrors[field as keyof typeof questionErrors];
      return extractMessage(fieldError);
    }

    return extractMessage(questionErrors);
  };

  const getOptionError = (
    questionIndex: number,
    optionIndex: number,
  ): string | null => {
    if (!isSubmitted) return null;

    const questionErrors = errors.questions?.[questionIndex];
    if (!questionErrors?.options) return null;

    const optionErrors = questionErrors.options[optionIndex];
    if (!optionErrors) return null;

    if (typeof optionErrors === 'string') {
      return optionErrors;
    }

    const errorObj = optionErrors as Record<string, unknown>;

    if (errorObj.text) {
      if (typeof errorObj.text === 'string') {
        return errorObj.text;
      }

      const textError = errorObj.text as FormError;
      return textError.message || null;
    }

    if (typeof errorObj === 'object' && 'message' in errorObj) {
      return (errorObj as FormError).message || null;
    }

    return null;
  };

  const showNextError = () => {
    if (currentErrorIndex < errorQueue.length - 1) {
      const nextIndex = currentErrorIndex + 1;
      setCurrentErrorIndex(nextIndex);
      toast.error(errorQueue[nextIndex]);
    }
  };

  const handleFormSubmit = handleSubmit(
    async (data) => {
      try {
        if (onSubmit) {
          await onSubmit(data.questions);
        }
      } catch (error) {
        console.error('Form submission error:', error);
        toast.error('Failed to submit questions. Please try again.');
      }
    },
    (errors) => {
      const allErrors = collectAllErrors();
      setErrorQueue(allErrors);
      setCurrentErrorIndex(0);

      if (allErrors.length > 0) {
        toast.error(allErrors[0]);

        const questionsData = getValues('questions');
        let found = false;

        for (
          let qIndex = 0;
          qIndex < questionsData.length && !found;
          qIndex++
        ) {
          if (!questionsData[qIndex].question?.trim()) {
            scrollToErrorField(`questions.${qIndex}.question`);
            found = true;
          } else {
            for (
              let oIndex = 0;
              oIndex < questionsData[qIndex].options.length && !found;
              oIndex++
            ) {
              if (!questionsData[qIndex].options[oIndex].text?.trim()) {
                scrollToErrorField(
                  `questions.${qIndex}.options.${oIndex}.text`,
                );
                found = true;
              }
            }
          }
        }
      }
    },
  );

  return (
    <div className="mt-10 space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-0">
        <div className="flex-1">
          <h2 className="text-base font-black">Questions</h2>
          <p className="mt-1 text-sm text-gray-600">
            Enter the question and answers, check the right option on the check
            box.
            {/* Maximum {questionsLimit} questions allowed. You can drag and */}
            {/* drop questions to reorder them. */}
          </p>
        </div>

        <button
          type="button"
          onClick={addNewQuestion}
          style={{ cursor: 'pointer' }}
          disabled={questions.length >= questionsLimit}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 transition-colors ${
            questions.length >= questionsLimit
              ? 'cursor-not-allowed bg-gray-100 text-gray-400'
              : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
          }`}
        >
          <div
            className={`flex h-5 w-5 items-center justify-center rounded-full ${
              questions.length >= questionsLimit ? 'bg-gray-400' : 'bg-blue-600'
            }`}
          >
            <Plus className="h-3 w-3 text-white" />
          </div>
          Add new question{' '}
          {questions.length >= questionsLimit &&
            `(${questions.length}/${questionsLimit})`}
        </button>
      </div>

      <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
        <span className="text-sm font-medium text-gray-700">
          Questions Added: {questions.length} / {questionsLimit}
        </span>
        <div className="flex h-2 w-32 overflow-hidden rounded-full bg-gray-200">
          <div
            className="bg-blue-600 transition-all duration-300"
            style={{ width: `${(questions.length / questionsLimit) * 100}%` }}
          />
        </div>
      </div>

      {isSubmitted && errors.questions && !Array.isArray(errors.questions) && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
          <div className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-red-500">
            <X className="h-2 w-2 text-white" />
          </div>
          <p className="text-sm font-medium text-red-700">
            {(errors.questions as FormError).message}
          </p>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
          <div className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-red-500">
            <X className="h-2 w-2 text-white" />
          </div>
          <p className="text-sm font-medium text-red-700">{errorMessage}</p>
        </div>
      )}

      <div className="w-full space-y-4 rounded-lg bg-white p-4">
        <form onSubmit={handleFormSubmit}>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="questions-list">
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={`space-y-4 ${
                    snapshot.isDraggingOver ? 'bg-blue-50' : ''
                  } transition-colors duration-200`}
                >
                  {questions.map((question, questionIndex) => {
                    const questionData = watch(`questions.${questionIndex}`);
                    const isExpanded = expandedQuestions.has(questionIndex);
                    const hasQuestionError = getQuestionError(questionIndex);

                    return (
                      <Draggable
                        key={question.id}
                        draggableId={question.id}
                        index={questionIndex}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`rounded-lg border p-4 transition-all duration-200 ${
                              hasQuestionError
                                ? 'border-red-300 bg-red-50'
                                : 'border-gray-200'
                            } ${
                              snapshot.isDragging
                                ? 'shadow-lg ring-2 ring-blue-500 ring-opacity-50'
                                : 'shadow-sm hover:shadow-md'
                            }`}
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
                                    toggleQuestionExpansion(questionIndex);
                                  }
                                }}
                                title="Click to expand/collapse, drag to reorder"
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-medium text-gray-900">
                                      Question {questionIndex + 1}
                                      {!isExpanded &&
                                        questionData?.question && (
                                          <span className="font-normal text-gray-600">
                                            : {questionData.question}
                                          </span>
                                        )}
                                    </h3>
                                    {snapshot.isDragging && (
                                      <span className="flex-shrink-0 rounded bg-blue-100 px-2 py-1 text-xs text-blue-600">
                                        Moving...
                                      </span>
                                    )}

                                    {hasQuestionError && isSubmitted && (
                                      <span className="flex-shrink-0 rounded bg-red-100 px-2 py-1 text-xs text-red-600">
                                        Has errors
                                      </span>
                                    )}

                                    <div className="ml-auto flex-shrink-0">
                                      {isExpanded ? (
                                        <ChevronUp className="h-4 w-4 text-gray-500" />
                                      ) : (
                                        <ChevronDown className="h-4 w-4 text-gray-500" />
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="ml-2 flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeQuestion(questionIndex);
                                  }}
                                  className="cursor-pointer rounded p-1 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700"
                                  title="Delete question"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>

                            {isExpanded && (
                              <div className="space-y-4">
                                <div>
                                  <Controller
                                    name={`questions.${questionIndex}.question`}
                                    control={control}
                                    render={({ field, fieldState }) => (
                                      <div>
                                        <textarea
                                          {...field}
                                          placeholder="Enter your Question"
                                          className={`w-full resize-none rounded-md border px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 ${
                                            fieldState.error && isSubmitted
                                              ? 'border-red-300 focus:ring-red-500'
                                              : 'border-gray-300 focus:ring-blue-500'
                                          }`}
                                          rows={3}
                                        />
                                        {fieldState.error && isSubmitted && (
                                          <p className="mt-1 text-sm text-red-500">
                                            {fieldState.error.message}
                                          </p>
                                        )}
                                      </div>
                                    )}
                                  />
                                </div>

                                <div className="space-y-3">
                                  {questionData?.options?.map(
                                    (option, optionIndex) => {
                                      const optionLetter = String.fromCharCode(
                                        65 + optionIndex,
                                      );
                                      const isCorrect =
                                        questionData.correctOptionIndex ===
                                        optionIndex;
                                      const optionError = getOptionError(
                                        questionIndex,
                                        optionIndex,
                                      );

                                      return (
                                        <div
                                          key={option.id}
                                          className="flex items-center gap-3"
                                        >
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleCorrectOptionChange(
                                                questionIndex,
                                                optionIndex,
                                              )
                                            }
                                            className={`flex h-6 w-6 cursor-pointer items-center justify-center rounded border-2 border-black ${
                                              isCorrect
                                                ? 'bg-black'
                                                : 'bg-white'
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
                                            <Controller
                                              name={`questions.${questionIndex}.options.${optionIndex}.text`}
                                              control={control}
                                              render={({
                                                field,
                                                fieldState,
                                              }) => (
                                                <div className="flex-1">
                                                  <div className="relative">
                                                    <input
                                                      {...field}
                                                      type="text"
                                                      placeholder={`Enter Option ${optionLetter}`}
                                                      className={`w-full rounded-md border px-3 py-2 pr-14 focus:border-transparent focus:outline-none focus:ring-2 ${
                                                        (fieldState.error ||
                                                          optionError) &&
                                                        isSubmitted
                                                          ? 'border-red-300 focus:ring-red-500'
                                                          : 'border-gray-300 focus:ring-blue-500'
                                                      }`}
                                                    />
                                                    <button
                                                      type="button"
                                                      onClick={() =>
                                                        removeOptionFromQuestion(
                                                          questionIndex,
                                                          optionIndex,
                                                        )
                                                      }
                                                      className="absolute right-0 top-0 flex h-full w-12 cursor-pointer items-center justify-center rounded-r-md bg-gray-200 transition-colors hover:bg-gray-300"
                                                    >
                                                      <X className="h-5 w-5 text-gray-600" />
                                                    </button>
                                                  </div>
                                                  {(fieldState.error ||
                                                    optionError) &&
                                                    isSubmitted && (
                                                      <p className="mt-1 text-xs text-red-500">
                                                        {fieldState.error
                                                          ?.message ||
                                                          optionError}
                                                      </p>
                                                    )}
                                                </div>
                                              )}
                                            />
                                          </div>
                                        </div>
                                      );
                                    },
                                  )}

                                  {questionData?.options &&
                                    questionData.options.length < 6 && (
                                      <div className="flex items-center gap-3">
                                        <div className="h-6 w-6"></div>{' '}
                                        <div className="min-w-0 text-sm font-medium text-gray-700 opacity-0">
                                          Option:
                                        </div>{' '}
                                        <div className="ml-4 flex-1">
                                          {' '}
                                          <button
                                            type="button"
                                            style={{ cursor: 'pointer' }}
                                            onClick={() =>
                                              addOptionToQuestion(questionIndex)
                                            }
                                            className="flex items-center gap-2 rounded-md bg-blue-100 px-3 py-2 text-sm text-blue-600 transition-colors hover:bg-blue-200"
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

                                {getQuestionError(
                                  questionIndex,
                                  'correctOptionIndex',
                                ) &&
                                  isSubmitted && (
                                    <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-2">
                                      <div className="flex h-3 w-3 flex-shrink-0 items-center justify-center rounded-full bg-red-500">
                                        <X className="h-1 w-1 text-white" />
                                      </div>
                                      <p className="text-xs text-red-700">
                                        {getQuestionError(
                                          questionIndex,
                                          'correctOptionIndex',
                                        )}
                                      </p>
                                    </div>
                                  )}
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {onSubmit && (
            <div className="pt-8">
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <button
                  type="submit"
                  disabled={isSubmitting || questions.length !== questionsLimit}
                  className={`w-full cursor-pointer rounded-lg px-6 py-3 font-medium text-white transition-colors md:w-auto ${
                    isSubmitting || questions.length !== questionsLimit
                      ? 'cursor-not-allowed bg-gray-400'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isSubmitting
                    ? 'Creating Game...'
                    : `Create Game (${questions.length}/${questionsLimit} questions)`}
                </button>
              </div>

              {questions.length !== questionsLimit && (
                <p className="mt-2 text-sm text-red-600">
                  You need exactly {questionsLimit} questions to create a game.
                  Currently you have {questions.length}.
                </p>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default QuestionsSection;
