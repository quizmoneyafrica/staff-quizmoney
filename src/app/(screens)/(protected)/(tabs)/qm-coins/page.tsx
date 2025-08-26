'use client';

import React, { useState } from 'react';
import { ArrowRightLeft, Wallet } from 'lucide-react';
import QmCoinStatCard from '@/app/components/qm-coins/QmCoinStatCard';
import QmCoinsTabs from '@/app/components/qm-coins/QmCoinsTabs';
import { UsersWithCoinsTable } from '@/app/components/qm-coins/UsersWithCoinsTable';
import RedemptionHistoryTable from '@/app/components/qm-coins/RedemptionHistoryTable';
import QmCoinSettings from '@/app/components/qm-coins/QmCoinSettings';
import { convertToLocaleString } from '@/app/utils';
import { useQuery } from '@tanstack/react-query';
import QmCoinsApi from '@/app/api/QmCoinsApi';

function QmCoinsPage() {
  const [activeTab, setActiveTab] = useState('Settings');

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['qm-coin-stats'],
    queryFn: () =>
      QmCoinsApi.getCoinStatsAdmin().then((res) => res.data.result.stats),
  });

  return (
    <div className="flex w-full max-w-full flex-col gap-6 overflow-x-hidden py-6">
      <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
        <QmCoinStatCard
          title="Total Earned Coin"
          value={
            statsLoading ? '...' : convertToLocaleString(statsData?.totalEarned)
          }
          bgColor="lightCyan"
          icon={<Wallet size={20} className="text-cyan-700" />}
        />
        <QmCoinStatCard
          title="Total Redeemed"
          value={
            statsLoading
              ? '...'
              : convertToLocaleString(statsData?.totalRedeemed)
          }
          bgColor="lightBlue"
          icon={<Wallet size={20} className="text-blue-800" />}
        />
        <QmCoinStatCard
          title="Conversion rate"
          bgColor="redError"
          icon={<ArrowRightLeft size={20} className="text-black" />}
        >
          <div className="text-error-800 flex flex-col gap-1 text-sm font-medium">
            <p>1500 = 1 free game & 1 eraser</p>
            <p>3000 = 2 free game & 2 eraser</p>
          </div>
        </QmCoinStatCard>
      </div>

      <div className="mt-4">
        <QmCoinsTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="mt-6">
          {activeTab === 'Users with Coins' && <UsersWithCoinsTable />}
          {activeTab === 'Redemption History' && <RedemptionHistoryTable />}
          {activeTab === 'Settings' && <QmCoinSettings />}
        </div>
      </div>
    </div>
  );
}

export default QmCoinsPage;
