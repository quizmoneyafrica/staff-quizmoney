'use client'
import React from 'react'
import { motion } from 'framer-motion'
import CustomImage from '../CustomImage'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  }
}

export default function PlayerRank() {
  return (
    <motion.div 
      className="bg-white rounded-xl p-3 sm:p-6 flex flex-row justify-between items-center gap-2 sm:gap-4"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="space-y-1 sm:space-y-3 w-full">
        <motion.h2 
          className="text-base sm:text-lg font-semibold text-gray-900"
          variants={itemVariants}
        >
          Rank on Leaderboard
        </motion.h2>
       <div className='flex-col space-y-0.5 sm:space-y-2'>
         <motion.p 
           className="text-cyan-500 font-medium text-xs sm:text-base"
           variants={itemVariants}
         >
           Joemicky is Ranked 1<sup>st</sup> position
         </motion.p>
        <motion.p 
          className="text-green-500 font-medium flex items-center gap-1.5 sm:gap-2 text-xs sm:text-base"
          variants={itemVariants}
        >
          Joemicky Played <CustomImage alt='' src={'/icons/gamePad.svg'} className='size-3.5 sm:size-5'/> 10 games
        </motion.p>
        <motion.p 
          className="text-primary-900 font-medium text-xs sm:text-base"
          variants={itemVariants}
        >
          Joemicky has Earned <span className="text-yellow-500">₦50,000</span>
        </motion.p>
       </div>
      </div>
      <motion.div 
        className="relative w-16 h-16 sm:w-24 sm:h-24 flex-shrink-0"
        variants={itemVariants}
      >
        <CustomImage alt='' src={'/icons/rank.svg'} className="w-full h-full object-contain"/>
      </motion.div>
    </motion.div>
  )
}