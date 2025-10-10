'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import ProgressCircle from '@/app/components/player-profile/ProgressCircle';
import GameHeader from '@/app/components/player-profile/game-history/GameHeader';
import GameInfoSection from '@/app/components/player-profile/game-history/GameInfoSection';
import AnswersSection from '@/app/components/player-profile/game-history/AnswersSection';
import QuestionsList from '@/app/components/player-profile/game-history/QuestionsList';
import BackButton from '@/app/icons/BackButton';
import GameHistoryActions from '@/app/components/player-profile/game-history/GameHistoryActions';
import DeleteUserModal from '@/app/components/player-profile/DeleteUserModal';
import { usePlayerGameDetails } from '@/app/hooks/usePlayerGameDetails';
import type {
  PlayerGameQuestion,
  GetPlayerGameDetailsResult,
} from '@/app/api/PlayerProfileApi';
import { useGameStats } from '@/app/hooks/useGameStats';
import FlagUserModal from '@/app/components/player-profile/FlagUserModal';
import PlayerApi from '@/app/api/PlayerProfileApi';
import { toast } from 'sonner';
import { usePlayerProfile } from '@/app/hooks/usePlayerProfile';

const GameHistoryPage: React.FC = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const userId = params.userId as string;
  const gameId = params['game-id'] as string;
  const statusFromQuery = searchParams.get('status');
  const customerId = searchParams.get('customerId') || userId;

  const [isBlacklisted, setIsBlacklisted] = useState(false);
  const [isFlagModalOpen, setIsFlagModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const handleOpenDeleteModal = () => setIsDeleteModalOpen(true);
  const handleCloseDeleteModal = () => setIsDeleteModalOpen(false);

  const {
    data: gameStatsData,
    isLoading,
    isError,
  } = useGameStats(gameId, customerId);

  const { data: fallbackData } = usePlayerGameDetails(userId, gameId);

  const { data: playerData, refetch } = usePlayerProfile(userId);

  useEffect(() => {
    if (playerData) {
      setIsBlacklisted(playerData?.status === 'FLAGGED' || false);
    }
  }, [playerData]);

  if (isLoading) return <p>Loading...</p>;
  if (isError || (!gameStatsData && !fallbackData))
    return <p>Failed to load game details.</p>;

  const isNewAPI = !!gameStatsData;

  let gameDetails,
    totalEarned,
    totalTimeTaken,
    correctQuestionNumbers,
    incorrectQuestionNumbers,
    questions;

  if (isNewAPI && gameStatsData) {
    const questionsAnswered = gameStatsData.questionsAnswered || [];

    const correctAnswers = questionsAnswered
      .map((q, index) => (q.isCorrect ? index + 1 : null))
      .filter((num) => num !== null);
    const incorrectAnswers = questionsAnswered
      .map((q, index) => (!q.isCorrect ? index + 1 : null))
      .filter((num) => num !== null);

    gameDetails = {
      gameId: gameStatsData.gameId,
      status: 'COMPLETED',
      startDate: { iso: new Date().toISOString() },
    };
    totalEarned = 0;
    totalTimeTaken = '00:00';
    correctQuestionNumbers = correctAnswers;
    incorrectQuestionNumbers = incorrectAnswers;
    questions = questionsAnswered.map((q, index) => ({
      questionNumber: index + 1,
      questionText: q.questionText,
      questionOptions: q.questionOptions,
      customerAnswer: q.customerAnswer,
      isCorrect: q.isCorrect,
      eraserUsed: q.eraserUsed,
    }));
  } else {
    // old data structure
    const legacy = fallbackData as GetPlayerGameDetailsResult | undefined;
    gameDetails = legacy?.gameDetails;
    totalEarned = legacy?.totalEarned ?? gameDetails?.totalEarned ?? 0;
    totalTimeTaken =
      legacy?.totalTimeTaken ?? gameDetails?.totalTimeTaken ?? '';
    correctQuestionNumbers =
      legacy?.correctQuestionNumbers ??
      gameDetails?.correctQuestionNumbers ??
      [];
    incorrectQuestionNumbers =
      legacy?.incorrectQuestionNumbers ??
      gameDetails?.incorrectQuestionNumbers ??
      [];
    questions = legacy?.questions ?? gameDetails?.questions ?? [];
  }

  const gameInfo = {
    id: gameDetails?.gameId || 'Unknown',
    date: gameDetails?.startDate?.iso
      ? new Date(gameDetails.startDate.iso).toLocaleDateString()
      : new Date().toLocaleDateString(),
    time: gameDetails?.startDate?.iso
      ? new Date(gameDetails.startDate.iso).toLocaleTimeString()
      : new Date().toLocaleTimeString(),
    playTime: totalTimeTaken,
    totalEarned: `${totalEarned}`,
  };

  const correctAnswers = Array.isArray(correctQuestionNumbers)
    ? correctQuestionNumbers.map(Number)
    : [];
  const missedAnswers = Array.isArray(incorrectQuestionNumbers)
    ? incorrectQuestionNumbers.map(Number)
    : [];

  type NewApiOption = { optionId: string; option: string; answer: boolean };
  type NewApiQuestion = {
    questionText: string;
    questionOptions: NewApiOption[];
    customerAnswer: string;
    isCorrect: boolean;
    eraserUsed: boolean;
  };

  const mappedQuestions = Array.isArray(questions)
    ? [...questions].map(
        (q: NewApiQuestion | PlayerGameQuestion, idx: number) => {
          // New
          if ('questionText' in q && 'questionOptions' in q) {
            const correctOption = (q.questionOptions as NewApiOption[]).find(
              (o: NewApiOption) => o.answer,
            );
            return {
              id: idx + 1,
              question: q.questionText,
              correctAnswer: correctOption ? correctOption.option : undefined,
              userAnswer: q.customerAnswer,
              isCorrect: !!q.isCorrect,
              answeredTime: undefined,
              databaseTime: undefined,
              hasEraser: !!q.eraserUsed,
            };
          }

          // Legacy
          const questionNumberParsed = parseInt(q.questionNumber);
          return {
            id: isNaN(questionNumberParsed) ? idx + 1 : questionNumberParsed,
            question: q.question,
            correctAnswer: q.correctAnswer,
            userAnswer: q.userAnswer,
            isCorrect: q.userAnswer === q.correctAnswer,
            answeredTime: q.timeTaken,
            databaseTime: q.createdAt?.iso
              ? new Date(q.createdAt.iso).toLocaleString()
              : undefined,
            hasEraser: q.usedEraser,
          };
        },
      )
    : [];

  const correctCount = correctAnswers.length;
  const totalQuestions = Array.isArray(questions) ? questions.length : 0;

  const handleOpenFlagModal = () => setIsFlagModalOpen(true);
  const handleCloseFlagModal = () => setIsFlagModalOpen(false);

  const handleFlagUser = async () => {
    try {
      const newFlagStatus = !isBlacklisted;
      await PlayerApi.flagPlayer({ userId, flag: newFlagStatus });
      setIsBlacklisted(newFlagStatus);
      toast.success(`User has been ${newFlagStatus ? 'flagged' : 'unflagged'}`);
      refetch();
    } catch (err) {
      toast.error('Failed to update flag status.');
      throw err;
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] p-4 md:p-6 lg:p-8">
      <div className="mb-4 flex items-center justify-between gap-4">
        <BackButton />
        <GameHistoryActions
          onFlagClick={handleOpenFlagModal}
          isBlacklisted={isBlacklisted}
          userId={userId}
          onDeleteClick={handleOpenDeleteModal}
        />
        {isDeleteModalOpen && (
          <DeleteUserModal onClose={handleCloseDeleteModal} userId={userId} />
        )}
      </div>
      <div className="mx-auto max-w-[1108px] rounded-[20px] bg-white p-6 md:p-8 lg:p-12">
        <GameHeader status={statusFromQuery ?? gameDetails.status ?? 'N/A'} />

        <GameInfoSection gameInfo={gameInfo} />

        <div className="mt-6 flex justify-center lg:mt-0 lg:justify-end">
          <ProgressCircle correct={correctCount} total={totalQuestions} />
        </div>

        <div className="mb-8 flex flex-col lg:flex-row lg:items-start lg:justify-between">
          <AnswersSection
            correctAnswers={correctAnswers}
            missedAnswers={missedAnswers}
          />
        </div>

        {mappedQuestions.length > 0 ? (
          <QuestionsList questions={mappedQuestions} />
        ) : (
          <div className="py-8 text-center text-gray-500">
            No questions found for this game.
          </div>
        )}

        {isFlagModalOpen && (
          <FlagUserModal
            onClose={handleCloseFlagModal}
            onFlag={handleFlagUser}
            isBlacklisted={isBlacklisted}
          />
        )}
      </div>
    </div>
  );
};

export default GameHistoryPage;
