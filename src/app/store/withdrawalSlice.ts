import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type WithdrawalStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'PROCESSED'
  | 'FAILED'
  | 'PROCESSING';

export interface WithdrawalRequest {
  id: string;
  purpose: string;
  comment: string;
  amount: number;
  status: WithdrawalStatus;
  processAt: string;
  createdAt:
    | {
        __type: 'Date';
        iso: string;
      }
    | string;
  firstName: string;
  lastName: string;
  email: string;
  balance: number;
  availableBalance: number;
  customerId: string;
  avatarUrl?: string;
  kycVerified?: boolean;
  approvedBy?: string;
  bankAccount: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  transactionId: string;
}

interface WithdrawalState {
  requests: WithdrawalRequest[];
}

const initialState: WithdrawalState = {
  requests: [],
};

const withdrawalSlice = createSlice({
  name: 'withdrawals',
  initialState,
  reducers: {
    setWithdrawalRequests: (
      state,
      action: PayloadAction<WithdrawalRequest[]>,
    ) => {
      state.requests = action.payload;
    },
    addWithdrawalRequest: (state, action: PayloadAction<WithdrawalRequest>) => {
      state.requests.unshift(action.payload);
    },
    updateWithdrawalStatus: (
      state,
      action: PayloadAction<{
        id: string;
        status: WithdrawalStatus;
      }>,
    ) => {
      const index = state.requests.findIndex(
        (req) => req.id === action.payload.id,
      );
      if (index !== -1) {
        state.requests[index].status = action.payload.status;
      }
    },
    clearWithdrawals: (state) => {
      state.requests = [];
    },
  },
});

export const {
  setWithdrawalRequests,
  addWithdrawalRequest,
  updateWithdrawalStatus,
  clearWithdrawals,
} = withdrawalSlice.actions;

export default withdrawalSlice.reducer;
