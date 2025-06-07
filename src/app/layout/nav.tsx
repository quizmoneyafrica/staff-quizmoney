import {
  CupIcon,
  HomeIcon,
  LogoutIcon,
  SettingIcon,
  StoreIcon,
  SupportIcon,
  WalletIcon,
} from '../icons/icons';

export const navs = [
  {
    icon: <HomeIcon />,
    path: '/dashboard',
    name: 'Dashboard',
  },
  {
    icon: <WalletIcon />,
    path: '/sales',
    name: 'Sales',
  },
  {
    icon: <StoreIcon />,
    path: '/products',
    name: 'Products',
  },
  {
    icon: <CupIcon />,
    path: '/game-zone',
    name: 'Game Zone',
  },
  {
    icon: <SettingIcon />,
    path: '/players',
    name: 'Players',
  },
  {
    icon: <SettingIcon />,
    path: '/wallet',
    name: 'Wallet',
  },
  {
    icon: <SettingIcon />,
    path: '/withdrawal-request',
    name: 'Withdrawal Request',
  },
  {
    icon: <SettingIcon />,
    path: '/leaderboard',
    name: 'Leaderboard',
  },
  {
    icon: <SettingIcon />,
    path: '/admin-management',
    name: 'Admin Management',
  },
  {
    icon: <SettingIcon />,
    path: '/push-notification',
    name: 'Push Notification',
  },
  {
    icon: <SettingIcon />,
    path: '/settings',
    name: 'Settings',
  },
];

export const bottomNav = [
  {
    icon: <SupportIcon />,
    path: '/support',
    name: 'Support',
  },
  {
    icon: <LogoutIcon />,
    name: 'Logout',
  },
];
