import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { decryptData, encryptData } from '../utils/crypto';

interface AuthState {
  isAuthenticated: boolean;
  userEncryptedData?: string | null;
  rehydrated: boolean;
}

const initialState: AuthState = {
  isAuthenticated: false,
  userEncryptedData: null,
  rehydrated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, action: PayloadAction<string>) {
      state.isAuthenticated = true;
      state.userEncryptedData = action.payload;
    },
    logout(state) {
      state.isAuthenticated = false;
      state.userEncryptedData = null;
    },
    setRehydrated(state, action: PayloadAction<boolean>) {
      state.rehydrated = action.payload;
    },
    updateUser(state, action: PayloadAction<string>) {
      // const currentDecrypted = decryptData(state.userEncryptedData || '') ?? {};
      // const currentDecrypted = state.userEncryptedData
      // const updated = { ...currentDecrypted, ...action.payload };
      // state.userEncryptedData = encryptData(updated);
      state.userEncryptedData = action.payload;
    },
  },
});

export const { login, logout, setRehydrated, updateUser } = authSlice.actions;
export default authSlice.reducer;
