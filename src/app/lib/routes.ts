export const ROUTES = {
  // Public
  HOME: '/',
  LOGIN: '/login',
  FORGOT_PASSWORD: '/forgot-password',
  VERIFY_OTP: '/verify-forgot-password',
  RESET_PASSWORD: '/reset-password',
  PASSWORD_CHANGED: '/password-changed',

  // Protected
  DASHBOARD: '/dashboard',
  GAME_ZONE: '/game-zone',
  GAME_ZONE_ADD: '/game-zone/add-new-game',
  GAME_ZONE_EDIT: (id: string) => `/game-zone/edit-game/${id}`,
  GAME_ZONE_VIEW: (id: string) => `/game-zone/view-game/${id}`,
  PLAYERS: '/players',
  PLAYER_PROFILE: (id: string) => `/players/player-profile/${id}`,
  PLAYER_GAME_HISTORY: (playerId: string, game_id: string) =>
    `/players/player-profile/${playerId}/game-history/${game_id}`,
  WITHDRAWAL_REQUEST: '/withdrawal-request',
  PUSH_NOTIFICATION: '/push-notification',
  QM_COINS: '/qm-coins',
  LEADERBOARD: '/leaderboard',
  REFERRAL_MANAGEMENT: '/referral-management',
  SALES: '/sales',
  ADMIN_MANAGEMENT: '/admin-management',
  SETTINGS: '/settings',
  SETTINGS_CHANGE_PASSWORD: '/settings/change-password',
  PLATFORM_SETTINGS: '/platform-settings',
} as const;
