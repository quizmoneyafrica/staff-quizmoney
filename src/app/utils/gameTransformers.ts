// utils/gameTransformers.ts
import { Game, QuestionState } from '../store/gameSlice';
import { CreateGamePayload, CreateGameQuestion } from '../api/typesGame';

export const transformGameDataForAPI = (
  gameDetails: Game,
  questions: QuestionState[],
): CreateGamePayload => {
  // Transform questions to match API format
  const transformedQuestions: CreateGameQuestion[] = questions.map(
    (question, index) => ({
      number: index + 1,
      question: question.question,
      options: question.options,
      correctAnswer: question.correctAnswer || '',
    }),
  );

  // Transform game details to match API format
  return {
    name: gameDetails.name || '',
    description: gameDetails.gameDescription || '',
    questions: transformedQuestions,
    gamePrize: gameDetails.gamePrize || 0,
    numOfShare: gameDetails.numOfShare || 0,
    entryFee: String(gameDetails.entryFee || 0),
    startDate: gameDetails.startDate?.iso
      ? gameDetails.startDate.iso.split('T')[0]
      : new Date().toISOString().split('T')[0],
  };
};
