/* eslint-disable @typescript-eslint/no-empty-object-type */
// ─── Auth ────────────────────────────────────────────────────

export type PlayerRole =
  | 'player'
  | 'super_admin'
  | 'finance_admin'
  | 'support_admin'
  | 'game_admin'
  | 'read_only_admin';

export interface AuthUser {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
  email: string;
  role: PlayerRole;
  is_admin: boolean;
  is_active: boolean;
  created_at: string;
  last_seen_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface AuthState {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
}

// ─── API ─────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

// ─── Dashboard ───────────────────────────────────────────────

export interface DashboardStats {
  players: {
    total: number;
    active_last_30_days: number;
  };
  games: {
    total: number;
    recent: RecentGame[];
  };
  withdrawals: {
    pending: number;
  };
  revenue: {
    total_deposits_kobo: number;
    total_deposits_formatted: string;
    total_withdrawals_kobo: number;
    total_withdrawals_formatted: string;
  };
}

export interface BasicDashboardStats {
  players: { total: number };
  games: { total: number; recent: RecentGame[] };
}

export interface RecentGame {
  id: string;
  status: GameStatus;
  scheduled_start_time: string;
  total_players: number;
  total_entry_collected_kobo: number;
}

// ─── Games ───────────────────────────────────────────────────

export type GameStatus =
  | 'scheduled'
  | 'lobby'
  | 'locked'
  | 'active'
  | 'finished'
  | 'cancelled';

export interface Game {
  id: string;
  status: GameStatus;
  scheduled_start_time: string;
  entry_fee_kobo: number;
  prize_percent: number;
  prize_pool_max_kobo: number | null;
  winner_count_percent: number;
  winner_count_max: number;
  ngn_winner_percent: number;
  qmcoin_prize_total: number;
  title: string | null;
  description: string | null;
  min_players: number;
  total_players: number;
  total_entry_collected_kobo: number;
  actual_start_time: string | null;
  actual_end_time: string | null;
  cancelled_at: string | null;
  cancelled_by?: string | null;
  cancel_reason: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
  // Sponsorship
  is_sponsored?: boolean;
  sponsor_name?: string | null;
  sponsor_logo_url?: string | null;
  sponsor_video_url?: string | null;
  sponsor_prize_boost_kobo?: number | null;
  // Music
  music_url?: string | null;
  music_artist_name?: string | null;
  music_track_title?: string | null;
  music_platform?: 'soundcloud' | 'spotify' | 'direct' | null;
}

export interface GameDetails extends Game {
  question_count: number;
  registration_count: number;
  questions_ready: boolean;
  prizes: GamePrize[] | null;
  questions: Question[];
}

export interface GamePrize {
  prize_type: 'ngn' | 'qmcoin';
  amount: number;
  rank: number;
}

export interface CreateGameInput {
  scheduled_start_time: string;
  entry_fee_kobo: number;
  prize_percent: number;
  prize_pool_max_kobo?: number;
  winner_count_percent: number;
  winner_count_max: number;
  ngn_winner_percent: number;
  qmcoin_prize_total: number;
  title?: string;
  description?: string;
  // Sponsorship
  is_sponsored?: boolean;
  sponsor_name?: string | null;
  sponsor_logo_url?: string | null;
  sponsor_video_url?: string | null;
  sponsor_prize_boost_kobo?: number | null;
  // Music
  music_url?: string | null;
  music_artist_name?: string | null;
  music_track_title?: string | null;
  music_platform?: 'soundcloud' | 'spotify' | 'direct' | null;
}

export interface UpdateGameInput extends Partial<CreateGameInput> {}

// ─── Players ─────────────────────────────────────────────────

export interface Player {
  id: string;
  username: string;
  email: string;
  avatar_url: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  phone_number: string | null;
  is_active: boolean;
  role: PlayerRole;
  referral_code: string;
  referred_by: string;
  created_at: string;
  social_facebook: string;
  social_instagram: string;
  social_twitter: string;
  social_tiktok: string;
  last_seen_at: string | null;
  suspended_reason: string | null;
  suspended_at: string | null;
  verifications: {
    phone_verified: boolean;
    bvn_verified: boolean;
    phone_verified_at: string | null;
    bvn_verified_at: string | null;
  } | null;
  wallets?: {
    ngn_balance: number;
    qmcoin_balance: number;
  } | null;
  ngn_balance_formatted?: string;
}

export interface PlayerDetails extends Player {
  stats: {
    games_played: number;
  };
}
interface FinancialsGame {
  id: string;
  game_id: string;
  title: string;
  status: string;
  played_at: string;
  scheduled_start_time: string;
  score: number;
  rank: null;
  total_time_ms: number;
  prize_type: null;
  prize_amount: number;
  prize_won: null;
  qm_coins_won: null;
  status_label: string;
}
export interface PlayerFinancials extends Player {
  games: FinancialsGame[];
  stats: {
    games_played: number;
    total_ngn_won_kobo: number;
    total_ngn_won_formatted: string;
    total_qmcoin_won: number;
  };
  wallet: {
    ngn_balance: number;
    ngn_balance_formatted: string;
    qmcoin_balance: number;
    updated_at: string;
  } | null;
  recent_transactions: Transaction[];
  recent_withdrawals: WithdrawalRequest[];
}

// ─── Withdrawals ─────────────────────────────────────────────

export type WithdrawalStatus =
  | 'pending'
  | 'approved'
  | 'processing'
  | 'rejected';

export interface WithdrawalRequest {
  id: string;
  amount: number;
  amount_formatted: string;
  reference: string;
  status: WithdrawalStatus;
  admin_note: string | null;
  created_at: string;
  reviewed_at: string | null;
  player_id: string;
  bank_account_id: string;
  players: {
    id: string;
    username: string;
    email: string;
  } | null;
  player_bank_accounts: {
    account_number: string;
    bank_name: string;
    account_name: string;
  } | null;
}

// ─── Transactions ─────────────────────────────────────────────

export interface Transaction {
  id: string;
  type: string;
  direction: 'credit' | 'debit';
  amount: number;
  currency: 'NGN' | 'QMCoin';
  status: string;
  description: string;
  created_at: string;
}

// ─── Admin Management ─────────────────────────────────────────

export type AdminRoleInput =
  | 'finance_admin'
  | 'support_admin'
  | 'game_admin'
  | 'read_only_admin';

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: PlayerRole;
  created_at: string;
  last_seen_at: string | null;
}

// ─── Platform Settings ────────────────────────────────────────

export interface PlatformSettings {
  id: string;
  qmcoin_entry_rate: number;
  scratch_card_price_kobo: number;
  qmcoin_prize_total: number;
  updated_at: string;
}

// ─── Push Notifications ───────────────────────────────────────

export interface PushNotification {
  title: string;
  body: string;
  url?: string;
}

// ─── Leaderboard ─────────────────────────────────────────────

export interface LastGameLeaderboard {
  meta: {
    gameId: string;
    date: string;
    totalPlayers: number;
  };
  leaderboard: LeaderboardEntry[];
}

export interface LeaderboardEntry {
  rank: number;
  player_id: string;
  username: string;
  score: number;
  prize: GamePrize | null;
  prize_type: string | null;
}

// ─── Questions ───────────────────────────────────────────────

export interface Question {
  id: string;
  game_id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: 'a' | 'b' | 'c' | 'd';
  question_order: number;
}
