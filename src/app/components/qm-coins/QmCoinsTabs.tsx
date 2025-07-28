'use client';
import React from 'react';
import classNames from 'classnames';
import { Users, History, Settings } from 'lucide-react';

interface IQmCoinsTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const QmCoinsTabs: React.FC<IQmCoinsTabsProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const tabs = [
    { name: 'Users with Coins', icon: <Users size={20} /> },
    { name: 'Redemption History', icon: <History size={20} /> },
    { name: 'Settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            className={classNames(
              'flex items-center gap-2 whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors',
              activeTab === tab.name
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
            )}
          >
            {tab.icon}
            {tab.name}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default QmCoinsTabs;
