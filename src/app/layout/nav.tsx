import {
  CupIcon,
  HomeIcon,
  LogoutIcon,
  SettingIcon,
  StoreIcon,
  SupportIcon,
  WalletIcon,
  // BellIcon,
  UsersIcon,
  GameIconSP,
  WithdrawalIcon,
  AdminManagementIcon,
  QmCoinNavIcon,
  MissedQuestionIcon,
} from '../icons/icons';
import { ROUTES } from '@/app/utils';

export interface NavItem {
  icon: React.ReactNode;
  path?: string;
  name: string;
  isDropdown?: boolean;
  items?: NavItem[];
}

export const navs: NavItem[] = [
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
    isDropdown: true,
    icon: <GameIconSP />,
    name: 'Game Zone',
    items: [
      {
        name: 'Live Game Questions',
        path: '/game-zone',
        icon: <GameIconSP />,
      },
      {
        name: 'Top Missed Questions',
        path: ROUTES.TOP_MISSED_QUESTION,
        icon: <MissedQuestionIcon />,
      },
      {
        name: 'Memory Game',
        path: '/memory-game',
        icon: <GameIconSP />,
      },
      {
        name: 'Perfect Score',
        path: '/perfect-score',
        icon: <GameIconSP />,
      },
      {
        name: 'Number Guessing',
        path: '/number-guessing',
        icon: <GameIconSP />,
      },
    ],
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
    icon: <QmCoinNavIcon />,
    path: ROUTES.QM_COINS,
    name: 'QM Coins',
  },
  {
    icon: <AdminManagementIcon />,
    path: ROUTES.ADMIN_MANAGEMENT,
    name: 'Admin Management',
  },
  // {
  //   icon: <BellIcon />,
  //   path: ROUTES.PUSH_NOTIFICATION,
  //   name: 'Push Notification',
  // },
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
