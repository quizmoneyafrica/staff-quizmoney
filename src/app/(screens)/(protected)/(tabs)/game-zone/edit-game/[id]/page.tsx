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
import { useDispatch } from 'react-redux';

interface QuestionWithId extends QuestionState {
  id: string;
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

  const { updateGame } = useUpdateGame();

  const toStringValue = (value: string | number | undefined): string => {
    if (value === undefined || value === null) return '';
    return String(value);
  };

  const transformApiQuestionToQuestionState = (
    apiQuestion: GameQuestion,
  ): QuestionState => {
    const correctOption = apiQuestion.options.find((option) => option.answer);
    return {
      number: String(apiQuestion.order),
      question: apiQuestion.question,
      options: apiQuestion.options.map((option) => option.option),
      correctAnswer: correctOption?.option || '',
    };
  };

  const transformQuestionStateToApiQuestion = (
    question: QuestionState,
    order: number,
  ): GameQuestion => {
    return {
      questionId: `Q${order}`,
      order: order,
      question: question.question,
      options: question.options.map((option, index) => ({
        optionId: `O${order}${index + 1}`,
        option: option,
        answer: option === question.correctAnswer,
      })),
    };
  };

  React.useEffect(() => {
    const fetchGames = async () => {
      if (!params.id) return;
      try {
        setFetchingData(true);
        const res = await GameApi.getGameDetailsV2(`${params.id}`);
        const result = res?.data?.data;

        const questionsWithIds: QuestionWithId[] =
          result.questions?.map((question: GameQuestion, index: number) => ({
            ...transformApiQuestionToQuestionState(question),
            id: `question-${index}-${Date.now()}`,
          })) || [];

        const transformedGame: GameWithIds = {
          objectId: result.gameId,
          name: result.name,
          startDate: {
            iso: result.startTime,
          },
          completed: false,
          entryFee: String(result.fee),
          gamePrize: result.prize,
          numOfShare: 0, //
          winners: [],
          users: [],
          userTimes: [],
          videoAds: { name: '', url: '' },
          music: { name: '', url: '' },
          createdAt: '',
          updatedAt: '',
          questions: questionsWithIds,
          gameDescription: result.description || '',
        };

        setFetchedData(transformedGame);
        dispatch(setCurrentGame(transformedGame));

        const isoString = result.startTime;
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

    if (['name', 'entryFee', 'gamePrize', 'numOfShare'].includes(name)) {
      setFetchedData((prev) => ({
        ...prev,
        [name]:
          name === 'gamePrize' || name === 'entryFee' || name === 'numOfShare'
            ? Number(value) || 0
            : value,
      }));

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
    if (!result.destination) {
      return;
    }

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

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

  const handleSave = async () => {
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

      const transformedQuestions = fetchedData.questions.map(
        (question, index) =>
          transformQuestionStateToApiQuestion(question, index + 1),
      );

      const payload = {
        fee: Number(fetchedData.entryFee),
        duration: 30, //
        startTime: datetimeInput,
        description: fetchedData.gameDescription || '',
        prize: fetchedData.gamePrize,
        name: fetchedData.name,
        questionLimit: fetchedData.questions.length,
        questions: transformedQuestions,
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
      <div className="space-y-10">
        <div className="w-full space-y-8 rounded-lg bg-white p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-xl font-medium">Game Details</h3>
            <button
              onClick={handleSave}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
            >
              Save Changes
            </button>
          </div>

          <div className="font-heading grid grid-cols-1 gap-5 lg:grid-cols-2">
            <CustomTextField
              label="Game Name"
              placeholder="Trivia"
              type="text"
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
              label="Game Date & Time"
              type="datetime-local"
              name="startDateTime"
              value={datetimeInput}
              onChange={handleChange}
            />

            <CustomTextField
              label="Share Prize Between"
              name="numOfShare"
              type="number"
              value={toStringValue(fetchedData?.numOfShare)}
              onChange={handleChange}
              inputMode="numeric"
              pattern="[0-9]*"
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
      </div>
    </>
  );
}

export default Page;
