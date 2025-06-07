'use client';
import CustomImage from '@/app/components/CustomImage';
import { ListFilter } from 'lucide-react';
import React, { useState } from 'react';
import Pagination from './Pagination';
import PlayerProfileModal from './PlayerProfileModal';
import { motion } from 'framer-motion';
import Image from 'next/image';

const LeaderboardTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const itemsPerPage = 5; // Show 5 items per page

  const exampleData = [
    {
      id: 1,
      rank: 4,
      date: '27/02/2024',
      username: 'Joemicky',
      games: 10,
      price: '₦50,000',
      avatarUrl: 'https://github.com/shadcn.png',
    },
    {
      id: 2,
      rank: 5,
      date: '25/02/2024',
      username: 'Joemicky',
      games: 10,
      price: '₦50,000',
      avatarUrl: 'https://github.com/shadcn.png',
    },
    {
      id: 3,
      rank: 6,
      date: '23/02/2024',
      username: 'Inioluwa',
      games: 10,
      price: '₦50,000',
      avatarUrl: 'https://github.com/shadcn.png',
    },
    {
      id: 4,
      rank: 7,
      date: '20/02/2024',
      username: 'Inioluwa',
      games: 10,
      price: '₦50,000',
      avatarUrl: 'https://github.com/shadcn.png',
    },
    {
      id: 5,
      rank: 8,
      date: '19/02/2024',
      username: 'Inioluwa',
      games: 10,
      price: '₦50,000',
      avatarUrl: 'https://github.com/shadcn.png',
    },
    {
      id: 6,
      rank: 9,
      date: '16/02/2024',
      username: 'Inioluwa',
      games: 10,
      price: '₦50,000',
      avatarUrl: 'https://github.com/shuding.png',
    },
    {
      id: 7,
      rank: 10,
      date: '10/02/2024',
      username: 'Inioluwa',
      games: 10,
      price: '₦50,000',
      avatarUrl: 'https://github.com/shuding.png',
    },
    // Add more example data to demonstrate pagination
    {
      id: 8,
      rank: 11,
      date: '08/02/2024',
      username: 'TestUser1',
      games: 8,
      price: '₦40,000',
      avatarUrl: 'https://github.com/shadcn.png',
    },
    {
      id: 9,
      rank: 12,
      date: '05/02/2024',
      username: 'TestUser2',
      games: 12,
      price: '₦35,000',
      avatarUrl: 'https://github.com/shuding.png',
    },
    {
      id: 10,
      rank: 13,
      date: '03/02/2024',
      username: 'TestUser3',
      games: 15,
      price: '₦30,000',
      avatarUrl: 'https://github.com/shadcn.png',
    },
  ];

  // Calculate pagination
  const totalPages = Math.ceil(exampleData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = exampleData.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleViewDetails = (
    player: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  ) => {
    setSelectedPlayer(player);
    setIsModalOpen(true);
  };

  const rowVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    hover: { scale: 1.01, y: -2 }, // Slightly scale up and move up, removed background color
  };

  const rowTransition = {
    duration: 0.5, // Default duration for initial/animate
    hover: {
      duration: 0.2, // Faster transition for hover
    },
  };

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center gap-2 rounded-md bg-white px-5 py-5 md:gap-5">
        <div className="relative w-full rounded-md border border-[#F5F5F5] focus:border-[#F5F5F5] md:w-fit">
          <input
            type="text"
            placeholder="Search"
            className="focus:ring-primary-900 w-full rounded-md border-none py-2  pl-10 pr-4 outline-none focus:ring-0 "
          />
          {/* Add search icon */}
          <svg
            className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            ></path>
          </svg>
        </div>
        <button className="flex cursor-pointer items-center gap-1 rounded-md border border-[#F5F5F5] px-4  py-2 outline-none">
          {/* Add filter icon */}
          <ListFilter className=" size-5 text-[#1B212D]" />
          <span className=" hidden md:block  ">Filter by</span>
        </button>
      </div>
      <div className="w-full max-w-full overflow-x-auto   rounded-lg">
        <table className="min-w-full">
          <thead className="bg-inherit">
            <tr>
              <th className="min-w-[80px] px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Rank
              </th>
              <th className="min-w-[120px] px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Date
              </th>
              <th className="min-w-[150px] px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Username
              </th>
              <th className="min-w-[120px] px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Games Played
              </th>
              <th className="min-w-[100px] px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Price
              </th>
              <th className="min-w-[120px] px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {currentData.map((row) => (
              <motion.tr
                key={row.id}
                variants={rowVariants}
                initial="initial"
                animate="animate"
                whileHover="hover"
                transition={rowTransition}
                className="cursor-pointer"
              >
                <td className="whitespace-nowrap px-6 py-4">
                  <div className=" flex items-center gap-8">
                    <input type="checkbox" className="form-checkbox size-5" />
                    <div className=" size-8 flex items-center justify-center rounded-full bg-[#F9F9F9] p-1">
                      {row.rank}
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {row.date}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                  <div className="text-primary-900 flex items-center">
                    <Image
                      src={row.avatarUrl}
                      alt={`${row.username}'s avatar`}
                      className=" mr-2 h-10  w-10 rounded-full"
                      width={40}
                      height={40}
                    />
                    {row.username}
                  </div>
                </td>

                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                  <div className=" flex items-center gap-3">
                    <CustomImage alt="" src={'/icons/game.svg'} />
                    {row.games} games
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {row.price}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                  <button
                    onClick={() => handleViewDetails(row)}
                    className="text-primary-900 hover:text-primary-900"
                  >
                    View Details
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      {/* Player Profile Modal */}
      <PlayerProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        playerData={selectedPlayer}
      />
    </div>
  );
};

export default LeaderboardTable;
