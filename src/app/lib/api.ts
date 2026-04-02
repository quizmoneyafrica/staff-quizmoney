import api from './api-client';
import type {
  ApiResponse,
  PaginatedResponse,
  AuthUser,
  AuthTokens,
  DashboardStats,
  BasicDashboardStats,
  Game,
  GameDetails,
  CreateGameInput,
  UpdateGameInput,
  Player,
  PlayerDetails,
  PlayerFinancials,
  WithdrawalRequest,
  AdminUser,
  AdminRoleInput,
  PlatformSettings,
  PushNotification,
  LastGameLeaderboard,
  LeaderboardEntry,
} from './types';

// ─── Auth ────────────────────────────────────────────────────

export const authApi = {
  login: async (email: string, password: string) => {
    const res = await api.post<
      ApiResponse<{
        access_token: string;
        refresh_token: string;
        player: AuthUser;
      }>
    >('/api/auth/login', { email, password });
    return res.data.data;
  },

  logout: async () => {
    const res = await api.post('/api/auth/logout');
    return res.data;
  },

  forgotPassword: async (email: string) => {
    const res = await api.post('/api/auth/forgot-password', { email });
    return res.data;
  },

  verifyOtp: async (email: string, otp: string) => {
    const res = await api.post('/api/auth/verify-otp', { email, otp });
    return res.data;
  },

  resetPassword: async (email: string, otp: string, password: string) => {
    const res = await api.post('/api/auth/reset-password', {
      email,
      otp,
      new_password: password,
    });
    return res.data;
  },

  changePassword: async (current_password: string, new_password: string) => {
    const res = await api.post('/api/auth/change-password', {
      current_password,
      new_password,
    });
    return res.data;
  },

  refresh: async (refresh_token: string) => {
    const res = await api.post<ApiResponse<AuthTokens>>('/api/auth/refresh', {
      refresh_token,
    });
    return res.data.data;
  },

  me: async () => {
    const res = await api.get<ApiResponse<AuthUser>>('/api/profile/me');
    return res.data.data;
  },
};

// ─── Dashboard ───────────────────────────────────────────────

export const dashboardApi = {
  getStats: async () => {
    const res = await api.get<ApiResponse<DashboardStats>>(
      '/api/admin/dashboard',
    );
    return res.data.data;
  },

  getBasicStats: async () => {
    const res = await api.get<ApiResponse<BasicDashboardStats>>(
      '/api/admin/dashboard/basic',
    );
    return res.data.data;
  },
};

// ─── Games ───────────────────────────────────────────────────

export const gamesApi = {
  list: async (params?: { status?: string; page?: number; limit?: number }) => {
    const res = await api.get<
      ApiResponse<{
        games: Game[];
        pagination: PaginatedResponse<Game>['pagination'];
      }>
    >('/api/admin/games', { params });
    return res.data.data;
  },

  get: async (gameId: string) => {
    const res = await api.get<ApiResponse<GameDetails>>(
      `/api/admin/games/${gameId}`,
    );
    return res.data.data;
  },

  create: async (input: CreateGameInput) => {
    const res = await api.post<ApiResponse<Game>>('/api/admin/games', input);
    return res.data.data;
  },

  update: async (gameId: string, input: UpdateGameInput) => {
    const res = await api.patch<ApiResponse<Game>>(
      `/api/admin/games/${gameId}`,
      input,
    );
    return res.data.data;
  },

  cancel: async (gameId: string, reason: string) => {
    const res = await api.post(`/api/admin/games/${gameId}/cancel`, { reason });
    return res.data;
  },

  uploadQuestions: async (gameId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post(
      `/api/admin/questions/upload/${gameId}`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      },
    );
    return res.data;
  },

  getQuestions: async (gameId: string) => {
    const res = await api.get(`/api/admin/questions/${gameId}`);
    return res.data.data;
  },

  deleteQuestion: async (questionId: string) => {
    const res = await api.delete(`/api/admin/questions/${questionId}`);
    return res.data;
  },
};

// ─── Players ─────────────────────────────────────────────────

export const playersApi = {
  list: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    is_active?: boolean;
    is_verified?: boolean;
    is_admin?: boolean;
  }) => {
    const res = await api.get<
      ApiResponse<{
        players: Player[];
        pagination: PaginatedResponse<Player>['pagination'];
      }>
    >('/api/admin/players', { params });
    return res.data.data;
  },

  get: async (playerId: string) => {
    const res = await api.get<ApiResponse<PlayerDetails>>(
      `/api/admin/players/${playerId}`,
    );
    return res.data.data;
  },

  getFinancials: async (playerId: string) => {
    const res = await api.get<ApiResponse<PlayerFinancials>>(
      `/api/admin/players/${playerId}/financials`,
    );
    return res.data.data;
  },

  suspend: async (playerId: string, reason: string) => {
    const res = await api.post(`/api/admin/players/${playerId}/suspend`, {
      reason,
    });
    return res.data;
  },

  unsuspend: async (playerId: string) => {
    const res = await api.post(`/api/admin/players/${playerId}/unsuspend`);
    return res.data;
  },
  updatePlayer: async (id: string, data: Record<string, unknown>) => {
    await api.patch(`/api/admin/players/${id}`, data).then((r) => r.data);
  },
  // Player game history
  getPlayerGames: async (id: string) =>
    await api.get(`/api/admin/players/${id}/games`).then((r) => r.data),
};

// ─── Withdrawals ─────────────────────────────────────────────

export const withdrawalsApi = {
  list: async (params?: { page?: number; limit?: number; status?: string }) => {
    const res = await api.get<
      ApiResponse<{
        withdrawals: WithdrawalRequest[];
        pagination: PaginatedResponse<WithdrawalRequest>['pagination'];
      }>
    >('/api/admin/withdrawals', { params });
    return res.data.data;
  },

  approve: async (withdrawalId: string, note?: string) => {
    const res = await api.post(
      `/api/admin/withdrawals/${withdrawalId}/approve`,
      { note },
    );
    return res.data;
  },

  reject: async (withdrawalId: string, note: string) => {
    const res = await api.post(
      `/api/admin/withdrawals/${withdrawalId}/reject`,
      { note },
    );
    return res.data;
  },
  summary: async () => {
    const res = await api.get<
      ApiResponse<{
        pending: number;
        approved: number;
        processing: number;
        rejected: number;
      }>
    >('/api/admin/withdrawals/summary');
    return res.data.data;
  },
};

// ─── Admin Management ─────────────────────────────────────────

export const adminsApi = {
  list: async () => {
    const res = await api.get<ApiResponse<AdminUser[]>>('/api/admin/admins');
    return res.data.data;
  },

  create: async (player_id: string, role: AdminRoleInput) => {
    const res = await api.post<ApiResponse<AdminUser>>('/api/admin/admins', {
      player_id,
      role,
    });
    return res.data.data;
  },

  remove: async (playerId: string) => {
    const res = await api.delete(`/api/admin/admins/${playerId}`);
    return res.data;
  },
};

// ─── Platform Settings ────────────────────────────────────────

export const settingsApi = {
  get: async () => {
    const res = await api.get<ApiResponse<PlatformSettings>>(
      '/api/admin/settings',
    );
    return res.data.data;
  },

  update: async (
    input: Partial<Omit<PlatformSettings, 'id' | 'updated_at'>>,
  ) => {
    const res = await api.patch<ApiResponse<PlatformSettings>>(
      '/api/admin/settings',
      input,
    );
    return res.data;
  },
};

// ─── Push Notifications ───────────────────────────────────────

export const pushApi = {
  list: async (params?: { search?: string }) => {
    const res = await api.get('/api/admin/notifications', { params });
    return res.data.data;
  },

  broadcast: async (notification: PushNotification) => {
    const res = await api.post('/api/push/broadcast', notification);
    return res.data;
  },

  getVapidKey: async () => {
    const res = await api.get<ApiResponse<{ vapid_public_key: string }>>(
      '/api/push/vapid-public-key',
    );
    return res.data.data;
  },

  create: async (data: {
    title: string;
    body: string;
    image_url?: string;
    created_by: string;
  }) => {
    const res = await api.post('/api/admin/notifications', data);
    return res.data.data;
  },

  update: async (
    id: string,
    data: { title?: string; body?: string; image_url?: string },
  ) => {
    const res = await api.patch(`/api/admin/notifications/${id}`, data);
    return res.data.data;
  },

  delete: async (id: string) => {
    const res = await api.delete(`/api/admin/notifications/${id}`);
    return res.data;
  },
  // Send a notification — to all users OR specific player_ids, with optional schedule
  send: async (
    id: string,
    payload: {
      send_now?: boolean;
      player_ids?: string[];
      schedules?: { date: string; time: string }[];
    },
  ) => {
    const res = await api.post(`/api/admin/notifications/${id}/send`, payload);
    return res.data;
  },
};

// ─── Leaderboard ─────────────────────────────────────────────

export const leaderboardApi = {
  getLastGame: async () => {
    const res = await api.get<ApiResponse<LastGameLeaderboard>>(
      '/api/leaderboard/last-game',
    );
    return res.data.data;
  },

  getAllTime: async (params?: { page?: number; limit?: number }) => {
    const res = await api.get<ApiResponse<LeaderboardEntry[]>>(
      '/api/leaderboard/all-time',
      {
        params,
      },
    );
    return res.data.data;
  },
};

// ─── Profile (self) ───────────────────────────────────────────

export const profileApi = {
  getMe: async () => {
    const res = await api.get('/api/profile/me');
    return res.data.data;
  },

  updateMe: async (input: { bio?: string; avatar_url?: string }) => {
    const res = await api.patch('/api/profile/me', input);
    return res.data;
  },
};
