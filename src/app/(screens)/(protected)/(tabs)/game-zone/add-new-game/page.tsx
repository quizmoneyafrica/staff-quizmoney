'use client';
import { useAppDispatch, useAppSelector } from '@/app/hooks/useAuth';
import { Game, setCreateGameField } from '@/app/store/gameSlice';
import CustomButton from '@/app/utils/CustomBtn';
import CustomTextField from '@/app/utils/CustomTextField';
import React, { useState } from 'react';
import { toast } from 'sonner';
import QuestionsSection from './questionsection';

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

interface GameCreationData {
  gameDetails: Game;
  questions: Question[];
}

function Page() {
  const dispatch = useAppDispatch();
  const game = useAppSelector((state) => state.game.createGame);
  const [datetimeInput, setDatetimeInput] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  React.useEffect(() => {
    if (datetimeInput) {
      const localDate = new Date(datetimeInput);
      const utcDate = new Date(localDate.getTime() - 60 * 60 * 1000);

      dispatch(
        setCreateGameField({
          field: 'startDate',
          value: { iso: utcDate.toISOString() },
        }),
      );
    }
  }, [datetimeInput, dispatch]);

  const handleGameDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'startDateTime') {
      setDatetimeInput(value);
      return;
    }

    const allowedFields: (keyof Game)[] = [
      'name',
      'gameDescription',
      'entryFee',
      'gamePrize',
      'numOfShare',
    ];

    if (allowedFields.includes(name as keyof Game)) {
      dispatch(
        setCreateGameField({
          field: name as keyof Game,
          value: ['entryFee', 'gamePrize', 'numOfShare'].includes(name)
            ? Number(value)
            : value,
        }),
      );
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'music' | 'videoAds',
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'music' && file.size > 10 * 1024 * 1024) {
      toast.error('Music file size must be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];

      dispatch(
        setCreateGameField({
          field: 'videoAds',
          value: {
            name: file.name,
            url: base64,
          },
        }),
      );
    };

    reader.readAsDataURL(file);
  };

  const handleQuestionsChange = (updatedQuestions: Question[]) => {
    setQuestions(updatedQuestions);
  };

  const validateGameData = () => {
    if (
      !game.name?.trim() ||
      !game.entryFee ||
      !game.gamePrize ||
      !game.numOfShare ||
      !datetimeInput
    ) {
      toast.error('Please fill in all required game details');
      return false;
    }

    if (!questions || questions.length === 0) {
      toast.error('Please add at least one question');
      return false;
    }

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];

      if (!question.question?.trim()) {
        toast.error(`Question ${i + 1} is missing question text`);
        return false;
      }

      if (question.correctOptionIndex === -1) {
        toast.error(`Question ${i + 1} has no correct option selected`);
        return false;
      }

      if (!question.options || question.options.length < 4) {
        toast.error(`Question ${i + 1} must have at least 4 options`);
        return false;
      }

      for (let j = 0; j < question.options.length; j++) {
        const option = question.options[j];
        if (!option.text?.trim()) {
          const optionLetter = String.fromCharCode(65 + j);
          toast.error(`Question ${i + 1}, Option ${optionLetter} is empty`);
          return false;
        }
      }

      if (question.correctOptionIndex >= question.options.length) {
        toast.error(`Question ${i + 1} has invalid correct option selection`);
        return false;
      }
    }

    return true;
  };

  const handleSubmitGame = async (submittedQuestions: Question[]) => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const questionsToValidate = submittedQuestions || questions;

      setQuestions(questionsToValidate);

      if (!validateGameData()) {
        return;
      }

      const combinedData: GameCreationData = {
        gameDetails: game,
        questions: questionsToValidate,
      };

      console.log('Creating game with data:', combinedData);

      // make an API call to create the game
      // await createGameAPI(combinedData);

      toast.success('Game created successfully!');
    } catch (error) {
      console.error('Error creating game:', error);
      toast.error('Failed to create game. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-0">
          <h2 className="text-base font-black">Add New Game</h2>
        </div>

        <div className="w-full space-y-8 rounded-lg bg-white p-4">
          <h3 className="font-heading text-xl font-medium">
            Enter Game Details
          </h3>

          <div className="font-heading grid grid-cols-1 gap-5 lg:grid-cols-2">
            <CustomTextField
              label="Game Name"
              placeholder="Trivia"
              type="text"
              name="name"
              value={game.name}
              className="capitalize"
              onChange={handleGameDetailsChange}
              required
            />

            <CustomTextField
              label="Entry Fee (₦)"
              placeholder="1000"
              type="number"
              name="entryFee"
              value={game.entryFee}
              inputMode="numeric"
              pattern="[0-9]*"
              onChange={handleGameDetailsChange}
              required
            />

            <CustomTextField
              label="Game Prize (₦)"
              name="gamePrize"
              type="text"
              value={`${game.gamePrize}`}
              onChange={handleGameDetailsChange}
              inputMode="numeric"
              pattern="[0-9]*"
              required
            />

            <CustomTextField
              label="Game Date & Time"
              type="datetime-local"
              name="startDateTime"
              value={datetimeInput}
              onChange={handleGameDetailsChange}
              required
            />

            <CustomTextField
              label="Share Prize Between"
              name="numOfShare"
              type="text"
              value={`${game.numOfShare}`}
              onChange={handleGameDetailsChange}
              inputMode="numeric"
              pattern="[0-9]*"
              required
            />

            <CustomTextField
              label="Set Questions Limit"
              name="questionsLimit"
              type="number"
              value="10"
              readOnly
              disabled
              required
            />

            <CustomTextField
              label="Game Description"
              placeholder="Type something here"
              type="text"
              name="gameDescription"
              value={game.gameDescription || ''}
              onChange={handleGameDetailsChange}
            />

            <CustomTextField
              label="Game Background music (Ad)"
              type="file"
              accept="audio/mpeg"
              name="music"
              onChange={(e) => handleFileChange(e, 'music')}
            />

            <CustomTextField
              label="Game Video Ad"
              type="file"
              accept="video/mp4"
              name="videoAds"
              onChange={(e) => handleFileChange(e, 'videoAds')}
            />
          </div>
        </div>
      </div>

      {/* Questions Section */}
      <QuestionsSection
        onQuestionsChange={handleQuestionsChange}
        onSubmit={handleSubmitGame}
        isSubmitting={isSubmitting}
        questionsLimit={10}
      />
    </>
  );
}

export default Page;
