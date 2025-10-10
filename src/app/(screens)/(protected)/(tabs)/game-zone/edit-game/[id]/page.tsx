/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import GameApi, { GameQuestionResponse, GameQuestion } from '@/app/api/game';
import AppLoader from '@/app/components/loader/loader';
import {
  Game,
  initialGame,
  QuestionState,
  setCurrentGame,
} from '@/app/store/gameSlice';
import CustomTextField from '@/app/utils/CustomTextField';
import { useParams } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'sonner';
import QuestionBox from './questionBox';
import { NoQuestions } from '../../noQuestion';
import { useUpdateGame } from '@/app/hooks/useUpdateGame';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { PlusCircle } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { gameSchema } from '@/lib/validation';

interface QuestionWithId extends QuestionState {
  id: string;
  optionIds?: Record<string, string>;
  originalOptions?: Array<{
    option: string;
    optionId?: string;
  }>;
}

interface GameWithIds extends Omit<Game, 'questions'> {
  questions: QuestionWithId[];
}

function Page() {
  const params = useParams();
  const dispatch = useDispatch();
  const [fetchedData, setFetchedData] = useState<GameWithIds>({
    ...initialGame,
    questions: [],
  });

  const [datetimeInput, setDatetimeInput] = useState('');
  const [fetchingData, setFetchingData] = useState(true);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const { updateGame } = useUpdateGame();

  const toStringValue = (value: string | number | undefined): string => {
    if (value === undefined || value === null) return '';
    return String(value);
  };

  const transformApiQuestionToQuestionState = (
    apiQuestion: GameQuestion,
  ): QuestionWithId => {
    const correctOption = apiQuestion.options.find((option) => option.answer);

    const question: QuestionWithId = {
      id: apiQuestion.questionId,
      number: String(apiQuestion.order),
      question: apiQuestion.question,
      options: apiQuestion.options.map((option) => option.option),
      correctAnswer: correctOption?.option || '',
    };

    question.originalOptions = apiQuestion.options.map((option) => ({
      option: option.option,
      optionId: option.optionId,
    }));

    return question;
  };

  const transformQuestionStateToApiQuestion = (
    question: QuestionWithId,
    order: number,
  ): GameQuestion => {
    const options = question.options.map((option, index) => {
      const optionData: {
        optionId?: string;
        option: string;
        answer: boolean;
      } = {
        option: option,
        answer: option === question.correctAnswer,
      };

      if (
        !question.id.startsWith('new-question-') &&
        question.originalOptions
      ) {
        const originalOption = question.originalOptions.find(
          (o) => o.option === option,
        );
        if (originalOption?.optionId) {
          optionData.optionId = originalOption.optionId;
        }
      }

      return optionData;
    });

    const questionData: GameQuestion = {
      question: question.question,
      order: order,
      options: options.map((opt) => ({
        ...(opt.optionId && { optionId: opt.optionId }),
        option: opt.option,
        answer: opt.answer,
      })),
    };

    if (!question.id.startsWith('new-question-')) {
      questionData.questionId = question.id;
    }

    return questionData;
  };

  React.useEffect(() => {
    const fetchGames = async () => {
      if (!params.id) return;
      try {
        setFetchingData(true);
        const res = await GameApi.getGameDetailsV2(`${params.id}`);
        const result = res?.data?.data as GameQuestionResponse;

        const questionsWithIds: QuestionWithId[] =
          result?.questions?.map((question) =>
            transformApiQuestionToQuestionState({
              questionId: question.questionId,
              order: question.order,
              question: question.question,
              options: question.options,
            }),
          ) || [];

        const transformedGame: GameWithIds = {
          objectId: result?.gameId,
          name: result?.name,
          startDate: {
            iso: result?.startTime,
          },
          completed: false,
          entryFee: String(result?.fee),
          gamePrize: result?.prize,
          coinPrize: result?.coinPrize,
          prizeBetween: result?.prizeBetween ?? 0,
          coinPrizeBetween: result?.coinPrizeBetween ?? 0,
          winners: [],
          users: [],
          userTimes: [],
          videoAds: { name: '', url: '' },
          music: { name: '', url: '' },
          createdAt: '',
          updatedAt: '',
          questions: questionsWithIds,
          gameDescription: result?.description || '',
          leaderboardLimit: result?.leaderboardLimit || 0,
          leaderboardPercentage: result?.leaderboardPercentage || 0,
        };

        setFetchedData(transformedGame);
        dispatch(setCurrentGame(transformedGame));

        const isoString = result?.startTime;
        if (isoString) {
          const dateObj = new Date(isoString);

          const nigerianDate = new Date(dateObj.getTime() + 60 * 60 * 1000);

          const year = nigerianDate.getFullYear();
          const month = String(nigerianDate.getMonth() + 1).padStart(2, '0');
          const day = String(nigerianDate.getDate()).padStart(2, '0');
          const hours = String(nigerianDate.getHours()).padStart(2, '0');
          const minutes = String(nigerianDate.getMinutes()).padStart(2, '0');

          const datetimeLocalValue = `${year}-${month}-${day}T${hours}:${minutes}`;
          setDatetimeInput(datetimeLocalValue);
        }

        setFetchingData(false);
      } catch (error: any) {
        console.error('error: ', error);
        toast.error('An error occurred loading games, please refresh.');
        setFetchingData(false);
      }
    };

    fetchGames();
  }, [params.id, dispatch]);

  React.useEffect(() => {
    if (datetimeInput) {
      const localDate = new Date(datetimeInput);
      const utcDate = new Date(localDate.getTime() - 60 * 60 * 1000);

      setFetchedData((prev) => ({
        ...prev,
        startDate: {
          iso: utcDate.toISOString(),
        },
      }));
    }
  }, [datetimeInput]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'startDateTime') {
      setDatetimeInput(value);
      return;
    }

    if (
      [
        'name',
        'entryFee',
        'gamePrize',
        'prizeBetween',
        'coinPrize',
        'coinPrizeBetween',
        'leaderboardLimit',
        'leaderboardPercentage',
      ].includes(name)
    ) {
      const numericValue = [
        'entryFee',
        'gamePrize',
        'prizeBetween',
        'coinPrize',
        'coinPrizeBetween',
        'leaderboardLimit',
        'leaderboardPercentage',
      ].includes(name)
        ? Number(value) || 0
        : value;

      // Auto-calculate coinPrizeBetween when prizeBetween changes
      if (name === 'prizeBetween') {
        const prizeBetweenValue = Number(value);
        const coinPrizeBetweenValue = 100 - prizeBetweenValue;

        setFetchedData((prev) => ({
          ...prev,
          prizeBetween: prizeBetweenValue,
          coinPrizeBetween: coinPrizeBetweenValue,
        }));
      } else {
        setFetchedData((prev) => ({
          ...prev,
          [name]: numericValue,
        }));
      }

      if (name === 'name') {
        dispatch(
          setCurrentGame({
            ...fetchedData,
            name: value,
          }),
        );
      }
    }
  };

  const handleQuestionUpdate = (
    questionIndex: number,
    updatedQuestion: QuestionState,
  ) => {
    setFetchedData((prev) => ({
      ...prev,
      questions: prev.questions.map((question, index) =>
        index === questionIndex
          ? { ...updatedQuestion, id: question.id }
          : question,
      ),
    }));
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result?.destination) {
      return;
    }

    const sourceIndex = result?.source.index;
    const destinationIndex = result?.destination.index;

    if (sourceIndex === destinationIndex) {
      return;
    }

    setFetchedData((prev) => {
      const newQuestions = Array.from(prev.questions);
      const [reorderedItem] = newQuestions.splice(sourceIndex, 1);
      newQuestions.splice(destinationIndex, 0, reorderedItem);

      return {
        ...prev,
        questions: newQuestions,
      };
    });

    toast.success('Question order updated');
  };

  const handleAddNewQuestion = () => {
    const newQuestion: QuestionWithId = {
      id: `new-question-${Date.now()}`,
      number: String(fetchedData.questions.length + 1),
      question: '',
      options: ['', '', '', ''],
      correctAnswer: '',
    };
    setFetchedData((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));
    toast.success('New question added');
  };

  const handleDeleteQuestion = (questionId: string) => {
    setFetchedData((prev) => {
      const updatedQuestions = prev.questions.filter(
        (q) => q.id !== questionId,
      );

      const renumberedQuestions = updatedQuestions.map((q, index) => ({
        ...q,
        number: String(index + 1),
      }));

      return {
        ...prev,
        questions: renumberedQuestions,
      };
    });
  };

  const handleSave = async () => {
    setValidationErrors({});

    const dataToValidate = {
      name: fetchedData.name,
      entryFee: Number(fetchedData.entryFee),
      gamePrize: fetchedData.gamePrize,
      coinPrize: fetchedData.coinPrize,
      questions: fetchedData.questions,
    };

    const { error } = gameSchema.validate(dataToValidate, {
      abortEarly: false,
    });

    if (error) {
      const newErrors: Record<string, string> = {};
      let generalErrorShown = false;
      error.details.forEach((detail) => {
        const isQuestionError = detail.path[0] === 'questions';

        if (isQuestionError && detail.path.length > 1) {
          const questionIndex = detail.path[1] as number;
          const questionId = fetchedData.questions[questionIndex]?.id;
          if (questionId && !newErrors[questionId]) {
            newErrors[questionId] = detail.message;
          }
        } else if (!generalErrorShown) {
          toast.error(detail.message);
          generalErrorShown = true;
        }
      });

      setValidationErrors(newErrors);

      if (Object.keys(newErrors).length > 0 && !generalErrorShown) {
        toast.error('Please fix the errors in the questions below.');
      }
      return;
    }

    try {
      if (!params.id || !fetchedData) {
        toast.error('Game ID or data is missing');
        return;
      }

      if (!datetimeInput) {
        toast.error('Please select a game date and time');
        const dateTimeField = document.querySelector(
          'input[name="startDateTime"]',
        ) as HTMLInputElement;
        dateTimeField?.focus();
        return;
      }

      const selectedDate = new Date(datetimeInput);
      const now = new Date();
      if (selectedDate <= now) {
        toast.error('Game date and time must be in the future');
        const dateTimeField = document.querySelector(
          'input[name="startDateTime"]',
        ) as HTMLInputElement;
        dateTimeField?.focus();
        return;
      }

      const prizeSum =
        Number(fetchedData.prizeBetween) + Number(fetchedData.coinPrizeBetween);
      if (Math.abs(prizeSum - 100) > 0.01) {
        toast.error('Prize percentages must sum to 100%');
        const prizeBetweenField = document.querySelector(
          'input[name="prizeBetween"]',
        ) as HTMLInputElement;
        prizeBetweenField?.focus();
        return;
      }

      const transformedQuestions = fetchedData.questions.map(
        (question, index) =>
          transformQuestionStateToApiQuestion(question, index + 1),
      );

      const startDate = new Date(datetimeInput);
      startDate.setSeconds(startDate.getSeconds() + 10);
      const adjustedStartTime = startDate.toISOString();

      const payload = {
        fee: Number(fetchedData.entryFee),
        duration: 30,
        startTime: adjustedStartTime,
        description: fetchedData.gameDescription ?? '',
        prize: fetchedData.gamePrize,
        coinPrize: fetchedData.coinPrize,
        name: fetchedData.name,
        questionLimit: fetchedData.questions.length,
        questions: transformedQuestions,
        prizeBetween: fetchedData.prizeBetween ?? 0,
        coinPrizeBetween: fetchedData.coinPrizeBetween ?? 0,
      };

      await updateGame(params.id as string, payload);
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error('Failed to save game. Please try again.');
    }
  };

  if (fetchingData) {
    return <AppLoader />;
  }

  return (
    <>
      <div className="p-4 md:p-8">
        <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-semibold text-gray-800">
            Edit Game Details
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <CustomTextField
              label="Game Name"
              placeholder="Enter game name"
              name="name"
              value={fetchedData?.name || ''}
              className="capitalize"
              onChange={handleChange}
            />

            <CustomTextField
              label="Entry Fee (₦)"
              placeholder="1000"
              type="number"
              name="entryFee"
              value={toStringValue(fetchedData?.entryFee)}
              inputMode="numeric"
              pattern="[0-9]*"
              onChange={handleChange}
            />

            <CustomTextField
              label="Game Prize (₦)"
              name="gamePrize"
              type="number"
              value={toStringValue(fetchedData?.gamePrize)}
              onChange={handleChange}
              inputMode="numeric"
              pattern="[0-9]*"
            />

            <CustomTextField
              label="Coin Prize (QM)"
              placeholder="5000"
              name="coinPrize"
              type="number"
              value={toStringValue(fetchedData?.coinPrize)}
              onChange={handleChange}
              inputMode="numeric"
              pattern="[0-9]*"
              required
            />

            <CustomTextField
              label="Game Date & Time"
              type="datetime-local"
              name="startDateTime"
              value={datetimeInput}
              onChange={handleChange}
              required
            />

            <CustomTextField
              label="Share Prize Between Winners (%)"
              name="prizeBetween"
              type="number"
              value={toStringValue(fetchedData?.prizeBetween)}
              onChange={handleChange}
              inputMode="decimal"
              min={0}
              max={100}
              required
            />
            <CustomTextField
              label="Share Coin Between Winners (%)"
              name="coinPrizeBetween"
              type="number"
              value={toStringValue(fetchedData?.coinPrizeBetween)}
              onChange={handleChange}
              inputMode="decimal"
              disabled
              required
            />

            <CustomTextField
              label="Leaderboard Limit"
              name="leaderboardLimit"
              type="number"
              value={fetchedData?.leaderboardLimit}
              onChange={handleChange}
              required
            />

            <CustomTextField
              label="Leaderboard Percentage"
              name="leaderboardPercentage"
              type="number"
              value={fetchedData?.leaderboardPercentage}
              onChange={handleChange}
              inputMode="decimal"
              max={100}
              required
            />
          </div>
        </div>

        {/* Questions with Drag and Drop */}
        {fetchedData?.questions?.length > 0 ? (
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
                  {fetchedData.questions.map((question, index) => (
                    <QuestionBox
                      key={question.id}
                      questionNumber={index}
                      question={question}
                      questionId={question.id}
                      onQuestionUpdate={handleQuestionUpdate}
                      onQuestionDelete={handleDeleteQuestion}
                      errorMessage={validationErrors[question.id]}
                    />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        ) : (
          <NoQuestions />
        )}

        <div className="mt-6 flex items-center justify-between gap-4">
          <button
            onClick={handleSave}
            className="rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Save Changes
          </button>
          <button
            onClick={handleAddNewQuestion}
            className="flex items-center rounded-md bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
          >
            <PlusCircle className="mr-2 h-5 w-5" />
            Add New Question
          </button>
        </div>
      </div>
    </>
  );
}

export default Page;
