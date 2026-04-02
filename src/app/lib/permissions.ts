import type { PlayerRole } from './types';

// ─── Role Permissions ─────────────────────────────────────────

export const ROLE_PERMISSIONS = {
  super_admin: [
    'dashboard.full',
    'dashboard.basic',
    'games.read',
    'games.write',
    'players.read',
    'players.financials',
    'players.write',
    'withdrawals.read',
    'withdrawals.write',
    'settings.read',
    'settings.write',
    'admins.read',
    'admins.write',
    'push.write',
    'qmcoins.read',
    'leaderboard.read',
    'referrals.read',
    'sales.read',
    'notifications.write',
  ],
  finance_admin: [
    'dashboard.full',
    'dashboard.basic',
    'withdrawals.read',
    'withdrawals.write',
    'settings.read',
    'sales.read',
    'qmcoins.read',
  ],
  support_admin: [
    'dashboard.basic',
    'players.read',
    'players.financials',
    'players.write',
    'leaderboard.read',
    'referrals.read',
    'games.read',
  ],
  game_admin: [
    'dashboard.basic',
    'games.read',
    'games.write',
    'leaderboard.read',
  ],
  read_only_admin: [
    'dashboard.basic',
    'players.read',
    'leaderboard.read',
    'referrals.read',
    'games.read',
  ],
  player: [],
} as const satisfies Record<PlayerRole, string[]>;

export type Permission =
  (typeof ROLE_PERMISSIONS)[keyof typeof ROLE_PERMISSIONS][number];

// ─── Permission Check ─────────────────────────────────────────

export function hasPermission(role: PlayerRole, permission: string): boolean {
  const perms = ROLE_PERMISSIONS[role] as readonly string[];
  return perms.includes(permission);
}

// ─── Nav Visibility ───────────────────────────────────────────

export function getNavItems(role: PlayerRole) {
  const all = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      permission: 'dashboard.basic',
      icon: 'LayoutDashboard',
    },
    {
      label: 'Game Zone',
      href: '/game-zone',
      permission: 'games.read',
      icon: 'Gamepad2',
    },
    {
      label: 'Players',
      href: '/players',
      permission: 'players.read',
      icon: 'Users',
    },
    {
      label: 'Withdrawals',
      href: '/withdrawal-request',
      permission: 'withdrawals.read',
      icon: 'ArrowDownToLine',
    },
    {
      label: 'Sales',
      href: '/sales',
      permission: 'sales.read',
      icon: 'TrendingUp',
    },
    {
      label: 'QM Coins',
      href: '/qm-coins',
      permission: 'qmcoins.read',
      icon: 'Coins',
    },
    {
      label: 'Leaderboard',
      href: '/leaderboard',
      permission: 'leaderboard.read',
      icon: 'Trophy',
    },
    {
      label: 'Referral Management',
      href: '/referral-management',
      permission: 'referrals.read',
      icon: 'Trophy',
    },
    {
      label: 'Push Notifications',
      href: '/push-notification',
      permission: 'push.write',
      icon: 'Bell',
    },
    {
      label: 'Admin Management',
      href: '/admin-management',
      permission: 'admins.read',
      icon: 'ShieldCheck',
    },
    {
      label: 'Platform Settings',
      href: '/platform-settings',
      permission: 'settings.read',
      icon: 'Settings',
    },
  ];

  return all.filter((item) => hasPermission(role, item.permission));
}

// ─── Role Display ─────────────────────────────────────────────

export const ROLE_LABELS: Record<PlayerRole, string> = {
  super_admin: 'Super Admin',
  finance_admin: 'Finance Admin',
  support_admin: 'Support Admin',
  game_admin: 'Game Admin',
  read_only_admin: 'Read Only',
  player: 'Player',
};

export const ROLE_COLORS: Record<PlayerRole, string> = {
  super_admin: 'bg-purple-100 text-purple-800',
  finance_admin: 'bg-green-100 text-green-800',
  support_admin: 'bg-blue-100 text-blue-800',
  game_admin: 'bg-orange-100 text-orange-800',
  read_only_admin: 'bg-gray-100 text-gray-800',
  player: 'bg-neutral-100 text-neutral-800',
};
