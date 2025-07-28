'use client';
import React, { useState } from 'react';
import { Avatar, Table } from '@radix-ui/themes';
import { Search, ListFilter } from 'lucide-react';
import { QmCoinIcon } from '@/app/icons/icons';
import classNames from 'classnames';
import ActionDropdown from '@/app/components/ui/ActionDropdown';

import Pagination from '../Pagination';

type RedemptionRowData = {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  coinRedeemed: number;
  amountPaid: string;
  lastTransaction: string;
  status: 'Successful' | 'Failed';
};

const mockData: RedemptionRowData[] = Array.from({ length: 12 }, (_, i) => ({
  id: `ID12345${67 + i}`,
  user: { name: `User ${i + 1}`, avatar: 'https://github.com/shadcn.png' },
  coinRedeemed: 1500 + i * 100,
  amountPaid: `${(i % 2) + 1} free game ${(i % 2) + 1} Eraser`,
  lastTransaction: `21/02/2024 10:${i.toString().padStart(2, '0')}`,
  status: i % 2 === 0 ? 'Successful' : 'Failed',
}));

const RedemptionHistoryTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const totalCount = mockData.length;
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const currentData = mockData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getDropdownOptions = (row: RedemptionRowData) => [
    {
      label: 'View Profile',
      onClick: () => console.log(`Viewing profile for ${row.user.name}`),
    },
    {
      label: 'Adjust Balance',
      onClick: () => console.log(`Adjusting balance for ${row.user.name}`),
    },
  ];

  return (
    <div className="w-full">
      <div className="mb-4 flex flex-col items-start justify-between gap-4 rounded-md bg-white px-5 py-5 md:flex-row md:items-center">
        <div className="flex w-full items-center gap-4 md:w-auto">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
            <input
              type="text"
              placeholder="Search by Users,Name,Transaction..."
              className="w-full rounded-md border border-[#D9D9D9] py-2 pl-10 pr-4 outline-none"
            />
          </div>
          <button className="flex cursor-pointer items-center gap-1 rounded-md border border-[#D9D9D9] px-4 py-2 outline-none">
            <ListFilter className="size-5 text-[#1B212D]" />
            <span>Filter by</span>
          </button>
        </div>
        <div className="flex items-center gap-4">
          <button className="bg-primary-900 hover:bg-primary-800 rounded-full px-6 py-2 text-white">
            Export
          </button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white">
        <Table.Root variant="ghost" className="min-w-full text-sm">
          <Table.Header className="bg-primary-50">
            <Table.Row>
              <Table.Cell className="px-8 py-2 text-left">
                Transaction ID
              </Table.Cell>
              <Table.Cell className="px-8 py-2 text-left">Users</Table.Cell>
              <Table.Cell className="px-8 py-2 text-left">
                Coin Redeemed
              </Table.Cell>
              <Table.Cell className="px-8 py-2 text-left">
                Amount Paid
              </Table.Cell>
              <Table.Cell className="px-8 py-2 text-left">
                Last Transaction
              </Table.Cell>
              <Table.Cell className="px-8 py-2 text-left">Status</Table.Cell>
              <Table.Cell className="px-8 py-2 text-left">Action</Table.Cell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {currentData.map((row) => (
              <Table.Row
                key={row.id}
                className="h-20 border-b border-[#F2F2F2]"
              >
                <Table.Cell className="px-8 py-5 text-base font-bold leading-6 text-[#3B3B3B]">
                  {row.id}
                </Table.Cell>
                <Table.Cell className="px-8 py-5">
                  <div className="flex items-center gap-2">
                    <Avatar
                      src={row.user.avatar}
                      fallback={row.user.name.charAt(0)}
                      radius="full"
                    />
                    <span className="text-base font-medium leading-6 text-[#2364AA]">
                      {row.user.name}
                    </span>
                  </div>
                </Table.Cell>
                <Table.Cell className="px-8 py-5">
                  <div className="text-positive-800 flex items-center gap-1">
                    <QmCoinIcon className="h-4 w-4" /> {row.coinRedeemed}coin
                  </div>
                </Table.Cell>
                <Table.Cell className="px-8 py-5">{row.amountPaid}</Table.Cell>
                <Table.Cell className="px-8 py-5 text-sm font-medium leading-tight text-[#1B1B1B]">
                  {row.lastTransaction}
                </Table.Cell>
                <Table.Cell className="px-8 py-5">
                  <span
                    className={classNames('rounded-full px-3 py-1', {
                      'bg-green-100 text-green-800':
                        row.status === 'Successful',
                      'bg-red-100 text-red-800': row.status === 'Failed',
                    })}
                  >
                    {row.status}
                  </span>
                </Table.Cell>
                <Table.Cell className="px-8 py-5">
                  <ActionDropdown options={getDropdownOptions(row)} />
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </div>

      {totalCount > 0 && (
        <div className="mt-4 flex flex-col items-center gap-4 rounded-md bg-white p-4 md:flex-row md:justify-between">
          <div className="text-sm text-gray-500">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount}{' '}
            entries
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default RedemptionHistoryTable;
