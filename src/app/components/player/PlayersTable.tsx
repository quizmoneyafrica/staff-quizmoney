'use client';
import React, { useState, useMemo } from 'react';
import { Search, ListFilter, ChevronDown } from 'lucide-react';
import classNames from 'classnames';
import Link from 'next/link';
import Pagination from '../leaderboard/Pagination';
import { motion } from 'framer-motion';
import CustomImage from '@/app/components/CustomImage';
import { useSelector } from 'react-redux';
import { Player, selectPlayers } from '@/app/store/playersSlice';

const PlayersTable = () => {
  const { playersData } = useSelector(selectPlayers);
  const players: Player[] = playersData?.data ?? [];
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAccountType, setSelectedAccountType] = useState<string | null>(
    null,
  );
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 7;

  const filteredPlayers = useMemo(() => {
    return players.filter((player) => {
      const matchesSearch =
        searchQuery === '' ||
        player.objectId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        player.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        player.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesAccountType =
        !selectedAccountType ||
        player.accountType.toLowerCase() === selectedAccountType.toLowerCase();

      return matchesSearch && matchesAccountType;
    });
  }, [players, searchQuery, selectedAccountType]);

  const totalPages = Math.ceil(filteredPlayers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredPlayers.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleFilterSelect = (accountType: string | null) => {
    setSelectedAccountType(accountType);
    setIsFilterOpen(false);
    setCurrentPage(1);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const rowVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    hover: { scale: 1.01, y: -2 },
  };

  const rowTransition = {
    duration: 0.5,
    hover: {
      duration: 0.2,
    },
  };

  return (
    <div className="">
      <div className="mb-4 flex flex-col items-start justify-between gap-4 rounded-md bg-white px-5 py-5 md:flex-row md:items-center">
        <div className="flex items-center gap-4 ">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
            <input
              type="text"
              placeholder="Search by ID, name or email"
              value={searchQuery}
              onChange={handleSearch}
              className="focus:ring-primary-900 w-full rounded-md border border-[#D9D9D9] py-2 pl-10 pr-4 outline-none focus:ring-0 "
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex cursor-pointer items-center gap-1 rounded-md border border-[#D9D9D9] px-4 py-2 outline-none"
            >
              <ListFilter className="size-5 text-[#1B212D]" />
              <span className="hidden md:block">Filter by</span>
              <ChevronDown className="size-4 text-[#1B212D]" />
            </button>

            {isFilterOpen && (
              <div className="absolute right-0 z-10 mt-2 w-48 rounded-md border border-gray-200 bg-white shadow-lg">
                <div className="py-1">
                  <button
                    onClick={() => handleFilterSelect(null)}
                    className={classNames(
                      'w-full px-4 py-2 text-left text-sm hover:bg-gray-100',
                      !selectedAccountType && 'bg-gray-50',
                    )}
                  >
                    All
                  </button>
                  <button
                    onClick={() => handleFilterSelect('user')}
                    className={classNames(
                      'w-full px-4 py-2 text-left text-sm hover:bg-gray-100',
                      selectedAccountType === 'user' && 'bg-gray-50',
                    )}
                  >
                    User
                  </button>
                  <button
                    onClick={() => handleFilterSelect('admin')}
                    className={classNames(
                      'w-full px-4 py-2 text-left text-sm hover:bg-gray-100',
                      selectedAccountType === 'admin' && 'bg-gray-50',
                    )}
                  >
                    Admin
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex-shrink-0">
          <button className="cursor-pointer whitespace-nowrap rounded-md border border-[#D9D9D9] px-4 py-2 outline-none">
            Export CSV
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  User ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Username
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Email address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Account Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Date of Registration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {currentData.map((player) => (
                <motion.tr
                  key={player.objectId}
                  variants={rowVariants}
                  initial="initial"
                  animate="animate"
                  whileHover="hover"
                  transition={rowTransition}
                  className="cursor-pointer"
                >
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {player.objectId}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(player.createdAt.iso).toLocaleString()}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <CustomImage
                          className="h-10 w-10 rounded-full"
                          src="/default-avatar.png"
                          alt={`${player.firstName}'s avatar`}
                          width={40}
                          height={40}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-primary-900 text-sm font-medium">
                          {player.firstName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm text-gray-900">{player.email}</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={classNames(
                        'inline-flex rounded-full px-2 text-xs font-semibold leading-5 text-[#3B3B3B]',
                      )}
                    >
                      {player.accountType}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {new Date(player.createdAt.iso).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                    <Link
                      href={`/players/player-profile/${player.objectId}`}
                      className="text-blue-900"
                    >
                      View Details
                    </Link>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 flex flex-col items-center gap-4 p-4 md:flex-row md:justify-between">
        <div className="text-sm text-gray-500">
          Showing data {startIndex + 1} to{' '}
          {Math.min(endIndex, filteredPlayers.length)} of{' '}
          {filteredPlayers.length} entries
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default PlayersTable;
