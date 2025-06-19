'use client';

import React, { useState } from 'react';
import CustomImage from '../CustomImage';
import * as Dialog from '@radix-ui/react-dialog';
import GameHistoryModal from './GameHistoryModal';

type GameHistoryItem = {
  id: string;
  date: string;
  reward: {
    type: 'money' | 'item';
    value: string;
    itemCount?: number;
  };
  status: 'Won' | 'Loss';
  correctScore: number;
  incorrectScore: number;
  totalTime: string;
};

const gameHistoryData: GameHistoryItem[] = [
  {
    id: 'ID1234567',
    date: '21/02/2024 09:00',
    reward: {
      type: 'money',
      value: '₦50,000',
    },
    status: 'Won',
    correctScore: 20,
    incorrectScore: 0,
    totalTime: '00:50 minutes',
  },
  {
    id: 'ID1234567',
    date: '21/02/2024 09:00',
    reward: {
      type: 'money',
      value: '₦10,000',
    },
    status: 'Loss',
    correctScore: 15,
    incorrectScore: 5,
    totalTime: '01:10 minutes',
  },
  {
    id: 'ID1234567',
    date: '21/02/2024 09:00',
    reward: {
      type: 'item',
      value: 'cleaner',
      itemCount: 2,
    },
    status: 'Won',
    correctScore: 25,
    incorrectScore: 2,
    totalTime: '00:45 minutes',
  },

  {
    id: 'ID1234568',
    date: '22/02/2024 10:30',
    reward: {
      type: 'money',
      value: '₦25,000',
    },
    status: 'Won',
    correctScore: 18,
    incorrectScore: 2,
    totalTime: '01:05 minutes',
  },
  {
    id: 'ID1234569',
    date: '23/02/2024 14:15',
    reward: {
      type: 'item',
      value: 'soap',
      itemCount: 1,
    },
    status: 'Loss',
    correctScore: 12,
    incorrectScore: 8,
    totalTime: '01:20 minutes',
  },
  {
    id: 'ID1234570',
    date: '24/02/2024 16:45',
    reward: {
      type: 'money',
      value: '₦75,000',
    },
    status: 'Won',
    correctScore: 22,
    incorrectScore: 1,
    totalTime: '00:42 minutes',
  },
];

const ITEMS_PER_PAGE = 5;

export default function PlayerGameHistorySection() {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(gameHistoryData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentData = gameHistoryData.slice(startIndex, endIndex);

  const generatePageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div
      className="rounded-xl bg-white p-6"
      data-aos="fade-left"
      data-aos-duration="800"
    >
      <h2
        className="mb-6 text-2xl font-semibold text-gray-900"
        data-aos="fade-up"
        data-aos-delay="100"
      >
        Game History
      </h2>

      <div className="relative w-full overflow-x-auto rounded-lg">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                    data-aos="fade-up"
                    data-aos-delay="200"
                  >
                    Game ID
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                    data-aos="fade-up"
                    data-aos-delay="300"
                  >
                    Rewards
                  </th>
                  <th
                    scope="col"
                    className="whitespace-nowrap px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                    data-aos="fade-up"
                    data-aos-delay="400"
                  >
                    Game Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                    data-aos="fade-up"
                    data-aos-delay="500"
                  >
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {currentData.map((game, index) => (
                  <tr
                    key={`${game.id}-${index}`}
                    data-aos="fade-up"
                    data-aos-delay={600 + index * 100}
                  >
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {game.id}
                      </div>
                      <div className="text-sm text-gray-500">{game.date}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="text-primary-900 inline-flex rounded-full bg-blue-100 px-2 text-xs font-semibold leading-5">
                        {game.reward.type === 'money' ? (
                          game.reward.value
                        ) : (
                          <>
                            <CustomImage
                              src={`/icons/${game.reward.value}.svg`}
                              alt=""
                            />{' '}
                            x{game.reward.itemCount}
                          </>
                        )}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          game.status === 'Won'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {game.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                      <Dialog.Root>
                        <Dialog.Trigger asChild>
                          <button className=" text-primary-900 cursor-pointer ">
                            View
                          </button>
                        </Dialog.Trigger>
                        <GameHistoryModal game={game} />
                      </Dialog.Root>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center">
        <nav className="flex items-center space-x-2" aria-label="Pagination">
          <button
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className={`flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-medium transition-colors ${
              currentPage === 1
                ? 'cursor-not-allowed border-gray-200 text-gray-400'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            &#8249;
          </button>

          {generatePageNumbers().map((pageNumber) => (
            <button
              key={pageNumber}
              onClick={() => handlePageChange(pageNumber)}
              className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                currentPage === pageNumber
                  ? 'bg-blue-900 text-white'
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {pageNumber}
            </button>
          ))}

          <button
            onClick={() =>
              handlePageChange(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
            className={`flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-medium transition-colors ${
              currentPage === totalPages
                ? 'cursor-not-allowed border-gray-200 text-gray-400'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            &#8250;
          </button>
        </nav>
      </div>

      <div className="mt-4 text-center text-sm text-gray-500">
        Showing {startIndex + 1} to {Math.min(endIndex, gameHistoryData.length)}{' '}
        of {gameHistoryData.length} entries
      </div>
    </div>
  );
}
