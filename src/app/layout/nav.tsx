import {
  CupIcon,
  HomeIcon,
  LogoutIcon,
  SettingIcon,
  StoreIcon,
  SupportIcon,
  WalletIcon,
} from '../icons/icons';
import { ROUTES } from '@/app/utils';

export const navs = [
  {
    icon: <HomeIcon />,
    path: ROUTES.DASHBOARD,
    name: 'Dashboard',
  },
  {
    icon: <WalletIcon />,
    path: ROUTES.SALES,
    name: 'Sales',
  },
  {
    icon: <StoreIcon />,
    path: ROUTES.PRODUCTS,
    name: 'Products',
  },
  {
    icon: <CupIcon />,
    path: ROUTES.GAME_ZONE,
    name: 'Game Zone',
  },
  {
    icon: <SettingIcon />,
    path: ROUTES.PLAYERS,
    name: 'Players',
  },
  {
    icon: <SettingIcon />,
    path: ROUTES.WALLET,
    name: 'Wallet',
  },
  {
    icon: <SettingIcon />,
    path: ROUTES.WITHDRAWAL_REQUEST,
    name: 'Withdrawal Request',
  },
  {
    icon: <SettingIcon />,
    path: ROUTES.LEADERBOARD,
    name: 'Leaderboard',
  },
  {
    icon: <SettingIcon />,
    path: ROUTES.ADMIN_MANAGEMENT,
    name: 'Admin Management',
  },
  {
    icon: <SettingIcon />,
    path: ROUTES.PUSH_NOTIFICATION,
    name: 'Push Notification',
  },
  {
    icon: <SettingIcon />,
    path: ROUTES.SETTINGS,
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
