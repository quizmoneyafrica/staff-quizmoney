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

  const [isBlacklisted, setIsBlacklisted] = useState(false);
  const [isFlagModalOpen, setIsFlagModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const handleOpenDeleteModal = () => setIsDeleteModalOpen(true);
  const handleCloseDeleteModal = () => setIsDeleteModalOpen(false);

  const { data, isLoading, isError } = usePlayerGameDetails(userId, gameId);

  const { data: playerData, refetch } = usePlayerProfile(userId);

  useEffect(() => {
    if (playerData) {
      // setKycVerified(playerData.userDetails.kycVerified || false);
      setIsBlacklisted(playerData?.status === 'FLAGGED' || false);
    }
  }, [playerData]);

  if (isLoading) return <p>Loading...</p>;
  if (isError || !data) return <p>Failed to load game details.</p>;

  const gameDetails = data.gameDetails;
  const totalEarned = data.totalEarned ?? gameDetails?.totalEarned ?? 0;
  const totalTimeTaken =
    data.totalTimeTaken ?? gameDetails?.totalTimeTaken ?? '';
  const correctQuestionNumbers =
    data.correctQuestionNumbers ?? gameDetails?.correctQuestionNumbers ?? [];
  const incorrectQuestionNumbers =
    data.incorrectQuestionNumbers ??
    gameDetails?.incorrectQuestionNumbers ??
    [];
  const questions = data.questions ?? gameDetails?.questions ?? [];

  // game info for GameInfoSection
  const gameInfo = {
    id: gameDetails.gameId,
    date: new Date(gameDetails.startDate.iso).toLocaleDateString(),
    time: new Date(gameDetails.startDate.iso).toLocaleTimeString(),
    playTime: totalTimeTaken,
    totalEarned: `${totalEarned}`,
  };

  const correctAnswers = Array.isArray(correctQuestionNumbers)
    ? correctQuestionNumbers.map(Number)
    : [];
  const missedAnswers = Array.isArray(incorrectQuestionNumbers)
    ? incorrectQuestionNumbers.map(Number)
    : [];

  const mappedQuestions = Array.isArray(questions)
    ? [...questions]
        .filter((q) => !isNaN(parseInt(q.questionNumber)))
        .sort((a, b) => parseInt(a.questionNumber) - parseInt(b.questionNumber))
        .map((q) => ({
          id: parseInt(q.questionNumber),
          question: q.question,
          correctAnswer: q.correctAnswer,
          userAnswer: q.userAnswer,
          isCorrect: q.userAnswer === q.correctAnswer,
          answeredTime: q.timeTaken,
          databaseTime: new Date(q.createdAt.iso).toLocaleString(),
          hasEraser: q.usedEraser,
        }))
    : [];

  const correctCount = correctAnswers.length;
  const totalQuestions = gameDetails.totalQuestions;

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
      console.error(err);
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
