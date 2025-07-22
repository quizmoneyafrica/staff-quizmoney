export interface GameInfo {
  id: string;
  date: string;
  time: string;
  playTime: string;
  totalEarned: string;
}

export interface Question {
  id: number;
  question: string;
  userAnswer?: string;
  correctAnswer: string;
  isCorrect: boolean;
  answeredTime: string;
  databaseTime: string;
  hasEraser?: boolean;
}
