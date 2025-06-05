'use client'
import React from 'react'
import CustomImage from '../CustomImage'
import { motion } from 'framer-motion'

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

const profileDetails = [
  { label: 'First name', value: 'Joseph' },
  { label: 'Last name', value: 'Micheal' },
  { label: 'Email Address', value: 'Sample@gmail.com', breakAll: true },
  { label: 'Date of Birth', value: '01 January 2000' },
  { label: 'Gender', value: 'Male' },
  { 
    label: 'Country', 
    value: 'Nigeria',
    icon: '🇳🇬',
    hasIcon: true
  },
  { label: 'Referred By', value: 'Null' }
]

export default function PlayerInfoSection() {
  return (
    <motion.div 
      className="bg-white rounded-xl"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="bg-white rounded-xl overflow-hidden">
            <motion.div 
              className="bg-[#E4F1FA] px-8 pb-16 pt-8 flex items-center justify-between rounded-t-xl relative"
              variants={itemVariants}
            >
              <h2 className="text-2xl font-bold text-black">Profile Details</h2>
              <div className="text-right ">
                <div className="text-base font-medium text-gray-800">User ID</div>
                <div className="text-lg font-bold text-gray-900">ID1234567</div>
              </div>

              {/* Avatar */}
              <motion.div 
                className="absolute left-6 -bottom-12"
                variants={itemVariants}
              >
                <div className="size-24 rounded-full bg-[#BCDDF4] p-6">
                  <CustomImage src={'https://github.com/shadcn.png'} className='rounded-full' alt=''/>
                </div>
              </motion.div>
            </motion.div>

            <div className="h-20" />
      </div>

      <motion.div 
        className="space-y-4 sm:space-y-6 px-4 sm:px-8 w-full pb-6"
        variants={containerVariants}
      >
        {profileDetails.map((detail) => (
          <motion.div 
            key={detail.label}
            variants={itemVariants} 
            className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4"
          >
            <div className=" text-black font-semibold">{detail.label}</div>
            <div className={`text-sm sm:text-base text-gray-900 ${detail.breakAll ? 'break-all' : ''} sm:flex sm:justify-end items-center gap-2`}>
              {detail.hasIcon && <span className="text-lg sm:text-xl">{detail.icon}</span>}
              {detail.value}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}