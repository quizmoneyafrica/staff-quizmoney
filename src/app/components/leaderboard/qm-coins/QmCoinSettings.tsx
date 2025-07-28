'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Table } from '@radix-ui/themes';
import { ChevronDown } from 'lucide-react';

const FormField = ({
  label,
  placeholder,
  type = 'text',
  infoText,
  isSelect = false,
  options = [],
  size = 'standard',
}: {
  label: string;
  placeholder: string;
  type?: string;
  infoText?: string;
  isSelect?: boolean;
  options?: string[];
  size?: 'standard' | 'long';
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOptionClick = (option: string) => {
    setSelectedValue(option);
    setIsOpen(false);
  };

  const baseClasses =
    'h-[55px] rounded-[5px] border border-[#00000080] bg-white px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors';
  const sizeClasses = size === 'standard' ? 'w-[300px]' : 'w-[621px]';

  if (isSelect) {
    return (
      <div className={`flex flex-col gap-2`}>
        <label className="text-sm font-medium text-gray-800">{label}</label>
        <div className={`relative ${sizeClasses}`} ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`${baseClasses} flex w-full items-center justify-between text-left`}
          >
            <span className={selectedValue ? 'text-gray-800' : 'text-gray-500'}>
              {selectedValue || placeholder}
            </span>
            <ChevronDown
              size={20}
              className={`text-gray-700 transition-transform ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {isOpen && (
            <div className="absolute right-0 top-full z-10 mt-2 w-full rounded-lg border border-[#E9E9E9] bg-white shadow-[4px_16px_40px_-4px_rgba(0,0,0,0.15)]">
              <div className="flex flex-col">
                {options.map((option, index) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleOptionClick(option)}
                    className={`px-4 py-3 text-left text-sm font-medium text-[#3B3B3B] transition-colors hover:bg-gray-50 ${
                      index < options.length - 1
                        ? 'border-b border-[#E9E9E9]'
                        : ''
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        {infoText && <p className="text-xs text-red-600">{infoText}</p>}
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col gap-2 ${size === 'long' ? 'max-w-full' : ''}`}
    >
      <label className="text-sm font-medium text-gray-800">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className={`${baseClasses} ${sizeClasses}`}
      />
      {infoText && <p className="text-xs text-red-600">{infoText}</p>}
    </div>
  );
};

const SettingsCard = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) => (
  <div className="w-full rounded-lg border border-gray-200 bg-white">
    <div className="border-b border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900">{title}</h3>
      {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
    </div>
    <div className="p-6">{children}</div>
  </div>
);

const SettingsHistoryTable = () => {
  const historyData = [
    {
      date: '21/08/2025',
      admin: 'Admin Joseph',
      action: 'Updated Conversion Rate',
    },
    {
      date: '21/08/2025',
      admin: 'Admin Joseph',
      action: 'Updated Conversion Rate',
    },
    {
      date: '21/08/2025',
      admin: 'Admin Joseph',
      action: 'Updated Conversion Rate',
    },
  ];
  return (
    <SettingsCard title="Settings Change History">
      <div className="overflow-x-auto">
        <Table.Root variant="surface">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Date</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Admin</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Action</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {historyData.map((item, index) => (
              <Table.Row key={index}>
                <Table.Cell>{item.date}</Table.Cell>
                <Table.Cell>{item.admin}</Table.Cell>
                <Table.Cell>{item.action}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </div>
    </SettingsCard>
  );
};

const QmCoinSettings = () => {
  return (
    <div className="space-y-8">
      <SettingsCard
        title="QM Coin settings"
        subtitle="Manage all QM coin Configuration"
      >
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-gray-800">Set Conversion rate</h4>
            <p className="mb-4 text-xs text-red-600">
              (1500 = 1 free game & 1 eraser) (3000 = 2 free game & 2 eraser)
            </p>
            <div className="flex flex-wrap gap-4">
              <FormField
                label="Enter Points"
                placeholder="Enter points"
                size="standard"
              />
              <FormField
                label="Free Game"
                placeholder="Select no of free game"
                isSelect
                options={['1 Free Game', '2 Free Games', '3 Free Games']}
                size="standard"
              />
              <FormField
                label="Free Eraser"
                placeholder="Select no of free Eraser"
                isSelect
                options={['1 Free Eraser', '2 Free Erasers', '3 Free Erasers']}
                size="standard"
              />
            </div>
          </div>

          <FormField
            label="Set Monthly Game participation Target"
            placeholder="Enter percentage"
            infoText="User must complete 70% of games in a month to redeem QM coin."
            size="long"
          />

          <FormField
            label="Max Coins Redeemable per User (Monthly)"
            placeholder="Enter Maximum Coin"
            size="long"
          />

          <div className="flex justify-start pt-4">
            <button className="rounded-lg bg-[#2364AA] px-6 py-3 font-bold text-white transition-colors hover:bg-[#1a4a8a]">
              Save Changes
            </button>
          </div>
        </div>
      </SettingsCard>

      <SettingsHistoryTable />
    </div>
  );
};

export default QmCoinSettings;
