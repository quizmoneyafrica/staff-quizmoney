'use client';

import React, { useState } from 'react';
import { Users2, Gift, Wallet, Trophy, UserPlus } from 'lucide-react';
import { Avatar } from '@radix-ui/themes';
import { GreenVerifiedIcon } from '@/app/icons/icons';

import ReferralStatCard from '@/app/components/referral-management/ReferralStatCard';

import ReferralSettingsConfiguration from '@/app/components/referral-management/ReferralSettingsConfiguration';
import ReferralLeaderboardTable from '@/app/components/referral-management/ReferralLeaderboardTable';
import ReferralSettingsModal from '@/app/components/referral-management/ReferralSettingsModal';

type ReferralStatus = 'ACTIVE' | 'BANNED' | 'PENDING';

interface ReferralUser {
  id: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  totalReferrals: number;
  thisMonthReferrals: number;
  qmCoinsEarned: number;
  status: ReferralStatus;
  createdAt?: string;
}

interface ReferralSettings {
  id: string;
  rewardPerReferral: number;
  minimumPayout: number;
  autoPayoutEnabled: boolean;
}

interface UpdateReferralSettingsPayload {
  rewardPerReferral: number;
  monthlyLeaderboardRewards: number;
  referralExpiryPolicy: string;
  enableReferrals: boolean;
}

const mockReferralUsers: ReferralUser[] = [
  {
    id: '1',
    firstName: 'Joemicky',
    lastName: '',
    username: 'JONOW',
    email: 'joemicky@example.com',
    totalReferrals: 20,
    thisMonthReferrals: 3,
    qmCoinsEarned: 150,
    status: 'BANNED',
    createdAt: '2024-08-15T10:30:00Z',
  },
  {
    id: '2',
    firstName: 'Joemicky',
    lastName: '',
    username: 'FHGUI',
    email: 'joemicky2@example.com',
    totalReferrals: 12,
    thisMonthReferrals: 6,
    qmCoinsEarned: 300,
    status: 'ACTIVE',
    createdAt: '2024-08-10T14:20:00Z',
  },
  {
    id: '3',
    firstName: 'Joemicky',
    lastName: '',
    username: 'JKOLU',
    email: 'joemicky3@example.com',
    totalReferrals: 10,
    thisMonthReferrals: 2,
    qmCoinsEarned: 100,
    status: 'BANNED',
    createdAt: '2024-08-12T09:15:00Z',
  },
  {
    id: '4',
    firstName: 'Joemicky',
    lastName: '',
    username: 'RTEWQ',
    email: 'joemicky4@example.com',
    totalReferrals: 7,
    thisMonthReferrals: 5,
    qmCoinsEarned: 250,
    status: 'ACTIVE',
    createdAt: '2024-08-08T16:45:00Z',
  },
  {
    id: '5',
    firstName: 'Joemicky',
    lastName: '',
    username: 'KYUOI',
    email: 'joemicky5@example.com',
    totalReferrals: 2,
    thisMonthReferrals: 2,
    qmCoinsEarned: 100,
    status: 'ACTIVE',
    createdAt: '2024-08-20T11:30:00Z',
  },
];

const mockReferralSettings: ReferralSettings = {
  id: 'settings-1',
  rewardPerReferral: 10,
  minimumPayout: 1000,
  autoPayoutEnabled: true,
};

const formatNumber = (num: number) => {
  return num.toLocaleString();
};

const formatQMCoins = (amount: number) => {
  return amount.toLocaleString();
};

function ReferralPage() {
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsMode, setSettingsMode] = useState<'view' | 'edit'>('view');
  const [referralSettings, setReferralSettings] =
    useState(mockReferralSettings);

  const statsValues = {
    totalReferrals: 2847,
    totalRewardsDistributed: 14235,
    activeReferrers: 4235,
    topReferrer: {
      name: 'Joemicky',
      referrals: 20,
      isActive: true,
      rewardsDistributed: 500,
    },
  };

  const handleViewSettings = () => {
    setSettingsMode('view');
    setShowSettingsModal(true);
  };

  const handleSettingsSubmit = async (data: UpdateReferralSettingsPayload) => {
    try {
      setReferralSettings((prev) => ({
        ...prev,
        rewardPerReferral: data.rewardPerReferral,
        minimumPayout: data.monthlyLeaderboardRewards,
        autoPayoutEnabled: data.enableReferrals,
      }));
      setShowSettingsModal(false);
    } catch (error) {
      console.error('Failed to update referral settings:', error);
    }
  };

  const settingsData = {
    rewardPerReferral: referralSettings.rewardPerReferral,
    minimumPayout: referralSettings.minimumPayout,
    autoPayoutEnabled: referralSettings.autoPayoutEnabled,
  };

  const referralStats = [
    {
      title: 'Total Referrals',
      value: statsValues.totalReferrals,
      bgColor: 'lightBlue' as const,
      icon: <Users2 className="h-6 w-6" />,

      format: formatNumber,
      isLoading: false,
      subtitle: 'Across all platforms',
    },
    {
      title: 'Rewards distributed',
      value: statsValues.totalRewardsDistributed,
      bgColor: 'lightCyan' as const,
      icon: <Wallet className="h-6 w-6" />,
      format: formatQMCoins,
      isLoading: false,
      showQmCoin: true,
      subtitle: 'Users with @ least 1 referrals',
    },
    {
      title: 'Active Referrers',
      value: statsValues.activeReferrers,
      bgColor: 'redError' as const,
      icon: <UserPlus className="h-6 w-6" />,
      format: formatNumber,
      isLoading: false,
    },
    {
      title: 'Top Referrer of the Month',
      value: 20,
      bgColor: 'lightGreen' as const,
      icon: <Trophy className="h-6 w-6" />,
      format: () => (
        <div className="flex max-w-full items-center gap-2 overflow-hidden">
          <Avatar
            fallback="J"
            radius="full"
            size="2"
            style={{
              backgroundColor: '#D0F7E1',
              color: '#0A7C3D',
              fontWeight: 700,
            }}
          />
          <div className="min-w-0">
            <div className="flex flex-col">
              <div className="flex items-center truncate">
                <span className="truncate text-sm font-medium">Joemicky</span>
                <GreenVerifiedIcon
                  width={12}
                  height={12}
                  className="ml-0.5 shrink-0"
                />
              </div>
              <span className="-mt-0.5 text-xs text-gray-600">
                20 Referrals
              </span>
            </div>
          </div>
        </div>
      ),
      isLoading: false,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold"></h1>
      </div>

      <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-4 md:gap-6">
        {referralStats.map((stat) => (
          <ReferralStatCard key={stat.title} {...stat} />
        ))}
      </div>

      <ReferralSettingsConfiguration onConfigure={handleViewSettings} />

      <ReferralLeaderboardTable />

      <ReferralSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        mode={settingsMode}
        onSubmit={handleSettingsSubmit}
        initialData={settingsData}
        loading={false}
      />
    </div>
  );
}

export default ReferralPage;
