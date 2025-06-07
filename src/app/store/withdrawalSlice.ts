import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface BankAccount {
  accountNumber: string;
  bankName: string;
  accountName: string;
}

export interface WithdrawalRequest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  balance: number;
  amount: number;
  createdAt: {
    __type: 'Date';
    iso: string;
  };
  status: 'pending' | 'resolved' | 'failed';
  bankAccount: BankAccount;
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
        status: 'pending' | 'resolved' | 'failed';
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
