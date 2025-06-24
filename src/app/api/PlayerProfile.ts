export interface ViewPlayerProfileRequest {
  userId: string;
  gameHistoryPage: number;
  gameHistoryLimit: number;
  transactionPage: number;
  transactionLimit: number;
  transactionType: string;
  transactionStatus: string;
  transactionDateRange: {
    start: string;
    end: string;
  };
}

export interface PlayerProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  country: string;
  countryFlag: string;
  referredBy: string;
  profileImage: string;
  userId: string;
}

export interface GameHistory {
  id: string;
  date: string;
  reward: {
    type: 'money' | 'item';
    value: string;
    itemCount?: number;
  };
  status: 'Won' | 'Loss';
  correctScore: number;
  incorrectScore: number;
  totalTime: string;
}

export interface Transaction {
  id: number;
  transactionId: string;
  transactionType: string;
  amount: string;
  dateTime: string;
  action: string;
  type: 'credit' | 'debit';
  status: string;
}

export interface ViewPlayerProfileResponse {
  success: boolean;
  data: {
    profile: PlayerProfile;
    gameHistory: {
      items: GameHistory[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        hasNext: boolean;
        hasPrev: boolean;
      };
    };
    transactions: {
      items: Transaction[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        hasNext: boolean;
        hasPrev: boolean;
      };
    };
  };
  message?: string;
}
