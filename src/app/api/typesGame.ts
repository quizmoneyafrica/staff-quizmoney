export interface CreateGameQuestion {
  number: number;
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface CreateGamePayload {
  name: string;
  description: string;
  questions: CreateGameQuestion[];
  gamePrize: number;
  numOfShare: number;
  entryFee: string;
  startDate: string;
}

export interface CreateGameResponse {
  success: boolean;
  message: string;
  gameId?: string;
  // Add other response fields as needed
}
