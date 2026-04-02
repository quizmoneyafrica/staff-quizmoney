/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';
import {
  authApi,
  dashboardApi,
  gamesApi,
  playersApi,
  withdrawalsApi,
  adminsApi,
  settingsApi,
  pushApi,
  leaderboardApi,
  profileApi,
} from './api';
import { useAuthStore } from './auth-store';
import type {
  CreateGameInput,
  UpdateGameInput,
  AdminRoleInput,
  PushNotification,
} from './types';
import { toast } from 'sonner';

// ─── Query Keys ───────────────────────────────────────────────

export const queryKeys = {
  // Dashboard
  dashboardStats: ['dashboard', 'stats'] as const,
  dashboardBasic: ['dashboard', 'basic'] as const,

  // Games
  games: (params?: object) => ['games', params] as const,
  game: (id: string) => ['games', id] as const,
  gameQuestions: (id: string) => ['games', id, 'questions'] as const,

  // Players
  players: (params?: object) => ['players', params] as const,
  player: (id: string) => ['players', id] as const,
  playerFinancials: (id: string) => ['players', id, 'financials'] as const,

  // Withdrawals
  withdrawals: (params?: object) => ['withdrawals', params] as const,

  // Admins
  admins: ['admins'] as const,

  // Settings
  settings: ['settings'] as const,

  // Leaderboard
  leaderboardLastGame: ['leaderboard', 'last-game'] as const,
  leaderboardAllTime: (params?: object) =>
    ['leaderboard', 'all-time', params] as const,

  // Profile
  me: ['profile', 'me'] as const,
};

// ─── Auth Mutations ───────────────────────────────────────────

export const useLogin = () => {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: (data) => {
      setAuth(data.player, {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Login failed');
    },
  });
};

// export async function registerFcmToken() {
//   const permission = await messaging().requestPermission();
//   if (!permission) return;

//   const token = await messaging().getToken();
//   await api.post('/api/players/fcm-token', { token });

//   // Refresh if token rotates
//   messaging().onTokenRefresh(newToken => {
//     api.post('/api/players/fcm-token', { token: newToken });
//   });
// }

export const useLogout = () => {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      clearAuth();
      queryClient.clear();
    },
  });
};

export const useForgotPassword = () =>
  useMutation({
    mutationFn: (email: string) => authApi.forgotPassword(email),
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to send reset email',
      );
    },
  });

export const useVerifyOtp = () =>
  useMutation({
    mutationFn: ({ email, otp }: { email: string; otp: string }) =>
      authApi.verifyOtp(email, otp),
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Invalid OTP');
    },
  });

export const useResetPassword = () =>
  useMutation({
    mutationFn: ({
      email,
      otp,
      password,
    }: {
      email: string;
      otp: string;
      password: string;
    }) => authApi.resetPassword(email, otp, password),
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to reset password');
    },
  });

export const useChangePassword = () =>
  useMutation({
    mutationFn: ({
      current_password,
      new_password,
    }: {
      current_password: string;
      new_password: string;
    }) => authApi.changePassword(current_password, new_password),
    onSuccess: () => toast.success('Password changed successfully'),
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to change password',
      );
    },
  });

// ─── Dashboard Queries ────────────────────────────────────────

export const useDashboardStats = () =>
  useQuery({
    queryKey: queryKeys.dashboardStats,
    queryFn: dashboardApi.getStats,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

export const useBasicDashboardStats = () =>
  useQuery({
    queryKey: queryKeys.dashboardBasic,
    queryFn: dashboardApi.getBasicStats,
    staleTime: 1000 * 60 * 2,
  });

// ─── Game Queries & Mutations ─────────────────────────────────

export const useGames = (params?: {
  status?: string;
  page?: number;
  limit?: number;
}) =>
  useQuery({
    queryKey: queryKeys.games(params),
    queryFn: () => gamesApi.list(params),
    staleTime: 1000 * 30,
  });

export const useGame = (gameId: string) =>
  useQuery({
    queryKey: queryKeys.game(gameId),
    queryFn: () => gamesApi.get(gameId),
    enabled: !!gameId,
  });

// export const useGameQuestions = (gameId: string) =>
//   useQuery({
//     queryKey: queryKeys.gameQuestions(gameId),
//     queryFn: () => gamesApi.getQuestions(gameId),
//     enabled: !!gameId,
//   });

export const useCreateGame = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateGameInput) => gamesApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
      toast.success('Game created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create game');
    },
  });
};

export const useUpdateGame = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      gameId,
      input,
    }: {
      gameId: string;
      input: UpdateGameInput;
    }) => gamesApi.update(gameId, input),
    onSuccess: (_, { gameId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.game(gameId) });
      queryClient.invalidateQueries({ queryKey: ['games'] });
      toast.success('Game updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update game');
    },
  });
};

export const useCancelGame = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ gameId, reason }: { gameId: string; reason: string }) =>
      gamesApi.cancel(gameId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
      toast.success('Game cancelled. Players refunded.');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to cancel game');
    },
  });
};

export const useUploadQuestions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ gameId, file }: { gameId: string; file: File }) =>
      gamesApi.uploadQuestions(gameId, file),
    onSuccess: (_, { gameId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.gameQuestions(gameId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.game(gameId) });
      toast.success('Questions uploaded successfully');
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to upload questions',
      );
    },
  });
};

// ─── Player Queries & Mutations ───────────────────────────────

export const usePlayers = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  is_active?: boolean;
  is_verified?: boolean;
  is_admin?: boolean;
}) =>
  useQuery({
    queryKey: queryKeys.players(params),
    queryFn: () => playersApi.list(params),
    staleTime: 1000 * 30,
  });

export const usePlayer = (playerId: string) =>
  useQuery({
    queryKey: queryKeys.player(playerId),
    queryFn: () => playersApi.get(playerId),
    enabled: !!playerId,
  });

export const usePlayerFinancials = (playerId: string, enabled = true) =>
  useQuery({
    queryKey: queryKeys.playerFinancials(playerId),
    queryFn: () => playersApi.getFinancials(playerId),
    enabled: !!playerId && enabled,
  });

export const useSuspendPlayer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ playerId, reason }: { playerId: string; reason: string }) =>
      playersApi.suspend(playerId, reason),
    onSuccess: (_, { playerId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.player(playerId) });
      queryClient.invalidateQueries({ queryKey: ['players'] });
      toast.success('Player suspended');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to suspend player');
    },
  });
};

export const useUnsuspendPlayer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (playerId: string) => playersApi.unsuspend(playerId),
    onSuccess: (_, playerId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.player(playerId) });
      queryClient.invalidateQueries({ queryKey: ['players'] });
      toast.success('Player unsuspended');
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to unsuspend player',
      );
    },
  });
};

// ─── Withdrawal Queries & Mutations ───────────────────────────

export const useWithdrawals = (params?: {
  page?: number;
  limit?: number;
  status?: string;
}) =>
  useQuery({
    queryKey: queryKeys.withdrawals(params),
    queryFn: () => withdrawalsApi.list(params),
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60, // auto-refresh every minute
  });

export const useApproveWithdrawal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      withdrawalId,
      note,
    }: {
      withdrawalId: string;
      note?: string;
    }) => withdrawalsApi.approve(withdrawalId, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdrawals'] });
      toast.success('Withdrawal approved');
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to approve withdrawal',
      );
    },
  });
};

export const useRejectWithdrawal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      withdrawalId,
      note,
    }: {
      withdrawalId: string;
      note: string;
    }) => withdrawalsApi.reject(withdrawalId, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdrawals'] });
      toast.success('Withdrawal rejected');
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to reject withdrawal',
      );
    },
  });
};

export const useWithdrawalSummary = () =>
  useQuery({
    queryKey: ['withdrawals', 'summary'],
    queryFn: withdrawalsApi.summary,
    staleTime: 1000 * 60,
    refetchInterval: 1000 * 60,
  });

// ─── Admin Management ─────────────────────────────────────────

export const useAdmins = () =>
  useQuery({
    queryKey: queryKeys.admins,
    queryFn: adminsApi.list,
  });

export const useCreateAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      player_id,
      role,
    }: {
      player_id: string;
      role: AdminRoleInput;
    }) => adminsApi.create(player_id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admins });
      toast.success('Admin created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create admin');
    },
  });
};

export const useRemoveAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (playerId: string) => adminsApi.remove(playerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admins });
      toast.success('Admin removed successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to remove admin');
    },
  });
};

// ─── Settings ─────────────────────────────────────────────────

export const useSettings = () =>
  useQuery({
    queryKey: queryKeys.settings,
    queryFn: settingsApi.get,
  });

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: settingsApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings });
      toast.success('Settings updated successfully');
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to update settings',
      );
    },
  });
};

// ─── Push Notifications ───────────────────────────────────────

export const useBroadcastPush = () =>
  useMutation({
    mutationFn: (notification: PushNotification) =>
      pushApi.broadcast(notification),
    onSuccess: () => toast.success('Notification sent successfully'),
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to send notification',
      );
    },
  });

// ─── Leaderboard ─────────────────────────────────────────────

export const useLastGameLeaderboard = () =>
  useQuery({
    queryKey: queryKeys.leaderboardLastGame,
    queryFn: leaderboardApi.getLastGame,
  });

export const useAllTimeLeaderboard = (params?: {
  page?: number;
  limit?: number;
}) =>
  useQuery({
    queryKey: queryKeys.leaderboardAllTime(params),
    queryFn: () => leaderboardApi.getAllTime(params),
  });

// ─── Profile ─────────────────────────────────────────────────

export const useMe = () =>
  useQuery({
    queryKey: queryKeys.me,
    queryFn: profileApi.getMe,
  });

export const useUpdateMe = () => {
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((s) => s.updateUser);

  return useMutation({
    mutationFn: profileApi.updateMe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.me });
      toast.success('Profile updated');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update profile');
    },
  });
};
