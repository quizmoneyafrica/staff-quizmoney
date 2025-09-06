'use client';

import { useAppDispatch, useAppSelector } from '@/app/hooks/useAuth';
import {
  Game,
  setCreateGameField,
  clearCreateGame,
} from '@/app/store/gameSlice';
import CustomTextField from '@/app/utils/CustomTextField';
import React, { useState } from 'react';
import { toast } from 'sonner';
// import QuestionsSection from './questionsection';
import { useCreateGame } from '@/app/hooks/useGameCreate';
import {
  validateGamePayload,
  transformGameDataForAPI,
} from '@/app/utils/gameTransformers';

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

const toNumber = (value: string | number | undefined): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number(value) || 0;
  return 0;
};

const toString = (value: string | number | undefined): string => {
  if (value === undefined || value === null) return '';
  return String(value);
};

function Page() {
  const dispatch = useAppDispatch();
  const game = useAppSelector((state) => state.game.createGame);
  const [datetimeInput, setDatetimeInput] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionsLimit] = useState(10);

  const createGameMutation = useCreateGame({
    onSuccess: () => {
      toast.success('Game created successfully!');
      dispatch(clearCreateGame());
      setDatetimeInput('');
      setQuestions([]);
    },
    onError: (error) => {
      console.error('Failed to create game:', error);
    },
    redirectOnSuccess: true,
    redirectPath: '/game-zone',
  });

  React.useEffect(() => {
    if (datetimeInput) {
      const localDate = new Date(datetimeInput);

      dispatch(
        setCreateGameField({
          field: 'startDate',
          value: { iso: localDate.toISOString() },
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
      'prizeBetween',
    ];

    if (allowedFields.includes(name as keyof Game)) {
      dispatch(
        setCreateGameField({
          field: name as keyof Game,
          value: ['entryFee', 'gamePrize', 'prizeBetween'].includes(name)
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
          field: type,
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

  const validateGameDetailsStepByStep = () => {
    if (!game.name?.trim()) {
      toast.error('Please enter a game name');
      const nameField = document.querySelector(
        'input[name="name"]',
      ) as HTMLInputElement;
      nameField?.focus();
      return false;
    }

    if (!game.entryFee || toNumber(game.entryFee) < 100) {
      toast.error('Please enter a valid entry fee (minimum ₦100)');
      const entryFeeField = document.querySelector(
        'input[name="entryFee"]',
      ) as HTMLInputElement;
      entryFeeField?.focus();
      return false;
    }

    if (!game.gamePrize || toNumber(game.gamePrize) < 500) {
      toast.error('Please enter a valid game prize (minimum ₦500)');
      const gamePrizeField = document.querySelector(
        'input[name="gamePrize"]',
      ) as HTMLInputElement;
      gamePrizeField?.focus();
      return false;
    }

    if (!game.coinPrize || toNumber(game.coinPrize) < 50) {
      toast.error('Please enter a valid coin prize (minimum 50QM)');
      const coinPrizeField = document.querySelector(
        'input[name="coinPrize"]',
      ) as HTMLInputElement;
      coinPrizeField?.focus();
      return false;
    }

    if (!datetimeInput) {
      toast.error('Please select a game date and time');
      const dateTimeField = document.querySelector(
        'input[name="startDateTime"]',
      ) as HTMLInputElement;
      dateTimeField?.focus();
      return false;
    }

    const selectedDate = new Date(datetimeInput);
    const now = new Date();
    if (selectedDate <= now) {
      toast.error('Game date and time must be in the future');
      const dateTimeField = document.querySelector(
        'input[name="startDateTime"]',
      ) as HTMLInputElement;
      dateTimeField?.focus();
      return false;
    }

    if (!game.prizeBetween || toNumber(game.prizeBetween) < 1) {
      toast.error('Please enter the number of winners to share prize');
      const prizeBetweenField = document.querySelector(
        'input[name="prizeBetween"]',
      ) as HTMLInputElement;
      prizeBetweenField?.focus();
      return false;
    }

    if (!game.coinPrizeBetween || toNumber(game.coinPrizeBetween) < 1) {
      toast.error('Please enter the number of winners to share coin prize');
      const coinPrizeBetweenField = document.querySelector(
        'input[name="coinPrizeBetween"]',
      ) as HTMLInputElement;
      coinPrizeBetweenField?.focus();
      return false;
    }

    return true;
  };

  const validateQuestions = () => {
    if (!questions || questions.length === 0) {
      toast.error('Please add at least one question');
      return false;
    }

    if (questions.length < questionsLimit) {
      toast.error(
        `Please add exactly ${questionsLimit} questions. You currently have ${
          questions.length
        } question${questions.length === 1 ? '' : 's'}.`,
      );
      return false;
    }

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];

      if (!question.question?.trim()) {
        toast.error(`Question ${i + 1}: Please enter the question text`);
        return false;
      }

      if (question.question.trim().length < 10) {
        toast.error(
          `Question ${i + 1}: Question must be at least 10 characters long`,
        );
        return false;
      }

      if (question.correctOptionIndex === -1) {
        toast.error(`Question ${i + 1}: Please select the correct answer`);
        return false;
      }

      if (!question.options || question.options.length < 4) {
        toast.error(`Question ${i + 1}: Must have at least 4 answer options`);
        return false;
      }

      for (let j = 0; j < question.options.length; j++) {
        const option = question.options[j];
        if (!option.text?.trim()) {
          const optionLetter = String.fromCharCode(65 + j);
          toast.error(
            `Question ${
              i + 1
            }, Option ${optionLetter}: Please enter option text`,
          );
          return false;
        }
      }

      if (question.correctOptionIndex >= question.options.length) {
        toast.error(`Question ${i + 1}: Selected correct answer is invalid`);
        return false;
      }
    }

    return true;
  };

  const handleSubmitGameWithQuestions = async (
    submittedQuestions: Question[],
  ) => {
    try {
      const questionsToValidate = submittedQuestions || questions;
      setQuestions(questionsToValidate);

      if (!validateGameDetailsStepByStep()) {
        return;
      }

      if (!validateQuestions()) {
        return;
      }

      const apiPayload = transformGameDataForAPI(game, questionsToValidate);

      const validationErrors = validateGamePayload(apiPayload);
      if (validationErrors.length > 0) {
        toast.error(validationErrors[0]);
        return;
      }

      await createGameMutation.mutateAsync(apiPayload);
    } catch (error) {
      console.error('Error creating game:', error);
    }
  };

  const handleSubmitGame = async () => {
    try {
      if (!validateGameDetailsStepByStep()) {
        return;
      }

      const apiPayload = transformGameDataForAPI(game, []);

      const validationErrors = validateGamePayload(apiPayload);
      if (validationErrors.length > 0) {
        toast.error(validationErrors[0]);
        return;
      }

      await createGameMutation.mutateAsync(apiPayload);
    } catch (error) {
      console.error('Error creating game:', error);
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
              placeholder="Trivia Showdown"
              type="text"
              name="name"
              value={game.name}
              className="capitalize"
              onChange={handleGameDetailsChange}
              required
            />

            <CustomTextField
              label="Entry Fee (₦)"
              placeholder="100"
              type="number"
              name="entryFee"
              value={toString(game.entryFee)}
              inputMode="numeric"
              pattern="[0-9]*"
              onChange={handleGameDetailsChange}
              required
            />

            <CustomTextField
              label="Game Prize (₦)"
              placeholder="5000"
              name="gamePrize"
              type="number"
              value={toString(game.gamePrize)}
              onChange={handleGameDetailsChange}
              inputMode="numeric"
              pattern="[0-9]*"
              required
            />
            <CustomTextField
              label="Coin Prize (QM)"
              placeholder="5000"
              name="coinPrize"
              type="number"
              value={toString(game.coinPrize)}
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
              label="Share Prize Between (Winners)"
              name="prizeBetween"
              type="number"
              value={toString(game.prizeBetween)}
              onChange={handleGameDetailsChange}
              inputMode="numeric"
              pattern="[0-9]*"
              required
            />

            <CustomTextField
              label="Share Coin Between (Winners)"
              name="coinPrizeBetween"
              type="number"
              value={toString(game.coinPrizeBetween)}
              onChange={handleGameDetailsChange}
              inputMode="numeric"
              pattern="[0-9]*"
              required
            />

            <CustomTextField
              label="Questions Limit"
              name="questionsLimit"
              type="number"
              value={toString(questionsLimit)}
              readOnly
              disabled
              required
            />

            <CustomTextField
              label="Game Description (Optional)"
              placeholder="A fast-paced trivia game with cash rewards"
              type="text"
              name="gameDescription"
              value={game.gameDescription || ''}
              onChange={handleGameDetailsChange}
            />

            <CustomTextField
              label="Game Background Music (Optional)"
              type="file"
              accept="audio/mpeg,audio/mp3,audio/wav"
              name="music"
              onChange={(e) => handleFileChange(e, 'music')}
            />

            <CustomTextField
              label="Game Video Ad (Optional)"
              type="file"
              accept="video/mp4,video/webm,video/ogg"
              name="videoAds"
              onChange={(e) => handleFileChange(e, 'videoAds')}
            />
          </div>
        </div>
      </div>

      <button
        disabled={createGameMutation.isPending}
        onClick={handleSubmitGame}
        className={`mt-5 w-full cursor-pointer rounded-lg px-6 py-3 font-medium text-white transition-colors md:w-auto ${
          createGameMutation.isPending
            ? 'cursor-not-allowed bg-gray-400'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {createGameMutation.isPending ? 'Creating Game...' : `Create Game`}
      </button>

      {/* <QuestionsSection
        onQuestionsChange={handleQuestionsChange}
        onSubmit={handleSubmitGame}
        isSubmitting={createGameMutation.isPending}
        questionsLimit={questionsLimit}
      /> */}
    </>
  );
}

export default Page;
