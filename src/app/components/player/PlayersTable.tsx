'use client'
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
  const {playersData}=useSelector(selectPlayers)
  const players:Player[]=playersData?.data??[]
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAccountType, setSelectedAccountType] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 7;

  const filteredPlayers = useMemo(() => {
    return players.filter(player => {
      const matchesSearch = searchQuery === '' || 
        player.objectId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        player.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        player.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesAccountType = !selectedAccountType || 
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
    hover: { scale: 1.01, y: -2 }
  };

  const rowTransition = {
    duration: 0.5,
    hover: {
      duration: 0.2
    }
  };

  return (
    <div className="">
      <div className="flex md:flex-row flex-col md:items-center items-start justify-between bg-white py-5 px-5 rounded-md mb-4 gap-4">
        <div className="flex gap-4 items-center ">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by ID, name or email"
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border rounded-md border-[#D9D9D9] outline-none focus:ring-primary-900 focus:ring-0 "
            />
          </div>
          <div className="relative">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex cursor-pointer gap-1 items-center px-4 py-2 border rounded-md outline-none border-[#D9D9D9]"
            >
              <ListFilter className='size-5 text-[#1B212D]'/>
              <span className='md:block hidden'>Filter by</span>
              <ChevronDown className='size-4 text-[#1B212D]' />
            </button>
            
            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                <div className="py-1">
                  <button
                    onClick={() => handleFilterSelect(null)}
                    className={classNames(
                      "w-full text-left px-4 py-2 text-sm hover:bg-gray-100",
                      !selectedAccountType && "bg-gray-50"
                    )}
                  >
                    All
                  </button>
                  <button
                    onClick={() => handleFilterSelect('user')}
                    className={classNames(
                      "w-full text-left px-4 py-2 text-sm hover:bg-gray-100",
                      selectedAccountType === 'user' && "bg-gray-50"
                    )}
                  >
                    User
                  </button>
                  <button
                    onClick={() => handleFilterSelect('admin')}
                    className={classNames(
                      "w-full text-left px-4 py-2 text-sm hover:bg-gray-100",
                      selectedAccountType === 'admin' && "bg-gray-50"
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
          <button className="px-4 py-2 border cursor-pointer rounded-md outline-none border-[#D9D9D9] whitespace-nowrap">
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email address</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date of Registration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentData.map((player) => (
                <motion.tr
                  key={player.objectId}
                  variants={rowVariants}
                  initial="initial"
                  animate="animate"
                  whileHover="hover"
                  transition={rowTransition}
                  className='cursor-pointer'
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{player.objectId}</div>
                    <div className="text-sm text-gray-500">{new Date(player.createdAt.iso).toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <CustomImage className="h-10 w-10 rounded-full" src="/default-avatar.png" alt={`${player.firstName}'s avatar`} width={40} height={40} />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-primary-900">{player.firstName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{player.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={classNames("px-2 inline-flex text-xs leading-5 font-semibold rounded-full text-[#3B3B3B]")}>
                      {player.accountType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(player.createdAt.iso).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link href={`/players/player-profile/${player.objectId}`} className="text-blue-900">View Details</Link>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex md:flex-row flex-col md:justify-between items-center mt-4 gap-4 p-4">
        <div className="text-sm text-gray-500">
          Showing data {startIndex + 1} to {Math.min(endIndex, filteredPlayers.length)} of {filteredPlayers.length} entries
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