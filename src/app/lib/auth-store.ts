import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser, AuthTokens } from './types';
import { tokenStorage } from './api-client';

interface AuthStore {
  user: AuthUser | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  // Actions
  setAuth: (user: AuthUser, tokens: AuthTokens) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<AuthUser>) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      hasHydrated: false,
      setHasHydrated: (state) => set({ hasHydrated: state }),

      setAuth: (user, tokens) => {
        tokenStorage.setTokens(tokens.access_token, tokens.refresh_token);
        set({ user, isAuthenticated: true });
      },

      clearAuth: () => {
        tokenStorage.clearTokens();
        set({ user: null, isAuthenticated: false });
      },

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
    }),
    {
      name: 'qm_admin_auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
