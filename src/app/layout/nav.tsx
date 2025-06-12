import {
  CupIcon,
  HomeIcon,
  LogoutIcon,
  SettingIcon,
  StoreIcon,
  SupportIcon,
  WalletIcon,
  BellIcon,
  UsersIcon,
  GameIconSP,
  WithdrawalIcon,
  AdminManagementIcon,
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
    icon: <GameIconSP />,
    path: ROUTES.GAME_ZONE,
    name: 'Game Zone',
  },
  {
    icon: <UsersIcon />,
    path: ROUTES.PLAYERS,
    name: 'Players',
  },
  {
    icon: <WalletIcon />,
    path: ROUTES.WALLET,
    name: 'Wallet',
  },
  {
    icon: <WithdrawalIcon />,
    path: ROUTES.WITHDRAWAL_REQUEST,
    name: 'Withdrawal Request',
  },
  {
    icon: <CupIcon />,
    path: ROUTES.LEADERBOARD,
    name: 'Leaderboard',
  },
  {
    icon: <AdminManagementIcon />,
    path: ROUTES.ADMIN_MANAGEMENT,
    name: 'Admin Management',
  },
  {
    icon: <BellIcon />,
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
