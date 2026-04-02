import {
  LayoutDashboard,
  Gamepad2,
  Users,
  ArrowDownToLine,
  TrendingUp,
  Coins,
  Bell,
  ShieldCheck,
  Settings,
  LogOut,
  Trophy,
  Network,
} from 'lucide-react';

export const navs = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: <LayoutDashboard size={18} />,
  },
  { name: 'Game Zone', path: '/game-zone', icon: <Gamepad2 size={18} /> },
  { name: 'Players', path: '/players', icon: <Users size={18} /> },
  {
    name: 'Withdrawals',
    path: '/withdrawal-request',
    icon: <ArrowDownToLine size={18} />,
  },
  { name: 'Sales', path: '/sales', icon: <TrendingUp size={18} /> },
  { name: 'QM Coins', path: '/qm-coins', icon: <Coins size={18} /> },
  { name: 'Leaderboard', path: '/leaderboard', icon: <Trophy size={18} /> },
  {
    name: 'Referral Management',
    path: '/referral-management',
    icon: <Network size={18} />,
  },
  {
    name: 'Push Notifications',
    path: '/push-notification',
    icon: <Bell size={18} />,
  },
  {
    name: 'Admin Management',
    path: '/admin-management',
    icon: <ShieldCheck size={18} />,
  },
  {
    name: 'Platform Settings',
    path: '/platform-settings',
    icon: <Settings size={18} />,
  },
];

export const bottomNav = [
  { name: 'Settings', path: '/settings', icon: <Settings size={18} /> },
  { name: 'Logout', path: null, icon: <LogOut size={18} /> },
];
