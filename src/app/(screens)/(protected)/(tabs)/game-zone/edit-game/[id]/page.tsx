/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import GameApi from '@/app/api/game';
import AppLoader from '@/app/components/loader/loader';
import { Game, initialGame, QuestionState } from '@/app/store/gameSlice';
import CustomTextField from '@/app/utils/CustomTextField';
import { useParams } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'sonner';
import QuestionBox from './questionBox';
import { NoQuestions } from '../../noQuestion';
import { useUpdateGame } from '@/app/hooks/useUpdateGame';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';

interface QuestionWithId extends QuestionState {
  id: string;
}

interface GameWithIds extends Omit<Game, 'questions'> {
  questions: QuestionWithId[];
}

function Page() {
  const params = useParams();
  const [fetchedData, setFetchedData] = useState<GameWithIds>({
    ...initialGame,
    questions: [],
  });
  const [dateInput, setDateInput] = useState('');
  const [timeInput, setTimeInput] = useState('');
  const [fetchingData, setFetchingData] = useState(true);

  const updateGameMutation = useUpdateGame();

  const toStringValue = (value: string | number | undefined): string => {
    if (value === undefined || value === null) return '';
    return String(value);
  };

  React.useEffect(() => {
    const fetchGames = async () => {
      if (!params.id) return;
      try {
        setFetchingData(true);
        const res = await GameApi.getGameById(`${params.id}`);
        const result = res.data.result;

        const questionsWithIds: QuestionWithId[] =
          result.questions?.map((question: QuestionState, index: number) => ({
            ...question,
            id: `question-${index}-${Date.now()}`,
          })) || [];

        setFetchedData({
          ...result,
          questions: questionsWithIds,
        });

        const isoString = result?.startDate?.iso;
        const dateObj = isoString ? new Date(isoString) : null;

        if (dateObj) {
          const formattedDate = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Africa/Lagos',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          }).format(dateObj);

          const formattedTime = new Intl.DateTimeFormat('en-GB', {
            timeZone: 'Africa/Lagos',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }).format(dateObj);

          setDateInput(formattedDate);
          setTimeInput(formattedTime);
        }

        setFetchingData(false);
      } catch (error: any) {
        console.error('error: ', error);
        toast.error('An error occurred loading games, please refresh.');
        setFetchingData(false);
      }
    };

    fetchGames();
  }, [params.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'fullDate') {
      setDateInput(value);
    } else if (name === 'time') {
      setTimeInput(value);
    }

    const selectedDate = name === 'fullDate' ? value : dateInput;
    const selectedTime = name === 'time' ? value : timeInput;

    if (selectedDate && selectedTime) {
      const nigerianTimeString = `${selectedDate}T${selectedTime}:00`;
      const nigerianDate = new Date(nigerianTimeString);
      const utcDate = new Date(nigerianDate.getTime() - 1 * 60 * 60 * 1000);

      setFetchedData((prev) => ({
        ...prev,
        startDate: {
          iso: utcDate.toISOString(),
        },
      }));
    }

    if (['name', 'entryFee', 'gamePrize', 'numOfShare'].includes(name)) {
      setFetchedData((prev) => ({
        ...prev,
        [name]:
          name === 'gamePrize' || name === 'entryFee' || name === 'numOfShare'
            ? Number(value) || 0
            : value,
      }));
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

      const transformedQuestions = fetchedData.questions.map(
        (question, index) => ({
          number: index + 1,
          question: question.question,
          options: question.options,
          correctAnswer: question.correctAnswer,
        }),
      );

      const payload = {
        objectId: String(params.id),
        name: fetchedData.name,
        description: '',
        questions: transformedQuestions,
        gamePrize: fetchedData.gamePrize,
        numOfShare: fetchedData.numOfShare,
        entryFee: String(fetchedData.entryFee),
        startDate: dateInput,
      };

      updateGameMutation.mutate(payload);
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
              disabled={updateGameMutation.isPending}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
            >
              {updateGameMutation.isPending ? 'Saving...' : 'Save Changes'}
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
              label="Start Date"
              type="date"
              name="fullDate"
              value={dateInput}
              onChange={handleChange}
            />

            <CustomTextField
              label="Game Time"
              type="time"
              name="time"
              value={timeInput}
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
