'use client'
import CustomImage from '@/app/components/CustomImage';
import { ListFilter } from 'lucide-react';
import React, { useState } from 'react';
import Pagination from './Pagination';
import PlayerProfileModal from './PlayerProfileModal';
import { motion } from 'framer-motion';



const LeaderboardTable= () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any 
  const itemsPerPage = 5; // Show 5 items per page

  const exampleData = [
    {
      id: 1,
      rank: 4,
      date: "27/02/2024",
      username: "Joemicky",
      games: 10,
      price: "₦50,000",
      avatarUrl: "https://github.com/shadcn.png",
    },
    {
      id: 2,
      rank: 5,
      date: "25/02/2024",
      username: "Joemicky",
      games: 10,
      price: "₦50,000",
      avatarUrl: "https://github.com/shadcn.png",
    },
    {
      id: 3,
      rank: 6,
      date: "23/02/2024",
      username: "Inioluwa",
      games: 10,
      price: "₦50,000",
      avatarUrl: "https://github.com/shadcn.png",
    },
     {
      id: 4,
      rank: 7,
      date: "20/02/2024",
      username: "Inioluwa",
      games: 10,
      price: "₦50,000",
      avatarUrl: "https://github.com/shadcn.png",
    },
     {
      id: 5,
      rank: 8,
      date: "19/02/2024",
      username: "Inioluwa",
      games: 10,
      price: "₦50,000",
      avatarUrl: "https://github.com/shadcn.png",
    },
     {
      id: 6,
      rank: 9,
      date: "16/02/2024",
      username: "Inioluwa",
      games: 10,
      price: "₦50,000",
      avatarUrl: "https://github.com/shuding.png",
    },
     {
      id: 7,
      rank: 10,
      date: "10/02/2024",
      username: "Inioluwa",
      games: 10,
      price: "₦50,000",
      avatarUrl: "https://github.com/shuding.png",
    },
    // Add more example data to demonstrate pagination
    {
      id: 8,
      rank: 11,
      date: "08/02/2024",
      username: "TestUser1",
      games: 8,
      price: "₦40,000",
      avatarUrl: "https://github.com/shadcn.png",
    },
    {
      id: 9,
      rank: 12,
      date: "05/02/2024",
      username: "TestUser2",
      games: 12,
      price: "₦35,000",
      avatarUrl: "https://github.com/shuding.png",
    },
    {
      id: 10,
      rank: 13,
      date: "03/02/2024",
      username: "TestUser3",
      games: 15,
      price: "₦30,000",
      avatarUrl: "https://github.com/shadcn.png",
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
    player: any // eslint-disable-line @typescript-eslint/no-explicit-any 


  ) => {
    setSelectedPlayer(player);
    setIsModalOpen(true);
  };

  const rowVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    hover: { scale: 1.01, y: -2 } // Slightly scale up and move up, removed background color
  };

  const rowTransition = {
    duration: 0.5, // Default duration for initial/animate
    hover: {
      duration: 0.2 // Faster transition for hover
    }
  };

  return (
    <div className="w-full">
      <div className="flex md:gap-5 gap-2 bg-white py-5 px-5 rounded-md items-center mb-4">
        <div className="relative w-full md:w-fit border rounded-md border-[#F5F5F5] focus:border-[#F5F5F5]">
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-10 pr-4 py-2 border-none  rounded-md outline-none focus:ring-primary-900 focus:ring-0 "
          />
          {/* Add search icon */}
          <svg
            className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2"
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
        <button className="flex cursor-pointer gap-1 items-center px-4 py-2 border rounded-md  outline-none border-[#F5F5F5]">
          {/* Add filter icon */}
         <ListFilter className=' size-5 text-[#1B212D]'/>
          <span className=' md:block hidden  '>Filter by</span>
        </button>
      </div>
      <div className="w-full overflow-x-auto rounded-lg  shadow-sm max-w-full">
        <table className="min-w-full">
          <thead className="bg-inherit">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">Rank</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Username</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Games Played</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentData.map((row) => (
              <motion.tr 
                key={row.id} 
                variants={rowVariants}
                initial="initial"
                animate="animate"
                whileHover="hover"
                transition={rowTransition}
                className='cursor-pointer'
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className=' flex items-center gap-8'>
                    <input type="checkbox" className="form-checkbox size-5" />
                    <div className=' p-1 size-8 items-center justify-center flex rounded-full bg-[#F9F9F9]'>
                      {row.rank}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center text-primary-900">
                    <CustomImage src={row.avatarUrl} alt={`${row.username}'s avatar`} className="w-8 h-8 rounded-full mr-2" />
                    {row.username}
                  </div>
                </td>
              
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className=' flex items-center gap-3'>
<CustomImage alt='' src={'/icons/game.svg'}/>
                  {row.games} games
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.price}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button onClick={() => handleViewDetails(row)} className="text-primary-900 hover:text-primary-900">View Details</button>
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