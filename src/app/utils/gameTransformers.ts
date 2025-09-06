import { Game } from '../store/gameSlice';
import { CreateGamePayload } from '../api/game';

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

interface TransformedQuestion {
  order: number;
  question: string;
  options: string[];
  correctAnswer: string;
}

export const transformGameDataForAPI = (
  gameDetails: Game,
  questions: Question[],
): CreateGamePayload => {
  const startTime = gameDetails.startDate?.iso
    ? gameDetails.startDate.iso
    : new Date().toISOString();

  const duration = 30;

  return {
    name: gameDetails.name || '',
    prize: Number(gameDetails.gamePrize) || 0,
    coinPrize: Number(gameDetails.coinPrize) || 0,
    fee: Number(gameDetails.entryFee) || 0,
    startTime: startTime,
    questionLimit: questions.length,
    description: gameDetails.gameDescription || '',
    duration: duration,
    prizeBetween: gameDetails.prizeBetween || 0,
    coinPrizeBetween: gameDetails.coinPrizeBetween || 0,
  };
};

export const transformGameDataWithQuestions = (
  gameDetails: Game,
  questions: Question[],
): CreateGamePayload & { questions?: TransformedQuestion[] } => {
  const basePayload = transformGameDataForAPI(gameDetails, questions);

  const transformedQuestions: TransformedQuestion[] = questions.map(
    (question, index) => ({
      order: index + 1,
      question: question.question,
      options: question.options.map((option) => option.text),
      correctAnswer: question.options[question.correctOptionIndex]?.text || '',
    }),
  );

  return {
    ...basePayload,
    questions: transformedQuestions,
  };
};

export const validateGamePayload = (payload: CreateGamePayload): string[] => {
  const errors: string[] = [];

  if (!payload.name?.trim()) {
    errors.push('Game name is required');
  }

  if (payload.fee < 100) {
    errors.push('Entry fee must be at least ₦100');
  }

  if (payload.prize < 500) {
    errors.push('Game prize must be at least ₦500');
  }

  if (payload.coinPrize < 50) {
    errors.push('Game coin prize must be at least 50QM');
  }

  if (!payload.startTime) {
    errors.push('Start time is required');
  } else {
    const startDate = new Date(payload.startTime);
    if (startDate <= new Date()) {
      errors.push('Start time must be in the future');
    }
  }

  // if (payload.questionLimit < 1) {
  //   errors.push('Question limit must be at least 1');
  // }

  if (payload.duration && payload.duration < 1) {
    errors.push('Duration must be at least 1 minute');
  }

  return errors;
};
