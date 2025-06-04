'use client'

import React from 'react'
import { motion } from 'framer-motion'
import CustomImage from '../CustomImage'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
}

const socials = [
  {
    label: 'Facebook',
    icon: '/icons/face.svg',
    handle: '@baddestplayer_A49',
  },
  {
    label: 'Instagram',
     icon: '/icons/insta.svg',

    handle: '@baddestplayer_A49',
  },
  {
    label: 'Twitter',
     icon: '/icons/x.svg',

    handle: '@baddestplayer_A49',
  },
]

export default function PlayerSocialLinks() {
  return (
    <motion.div
      className="bg-white rounded-xl p-4 sm:p-6 w-full"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.h2
        className="text-base sm:text-lg font-semibold text-black mb-3 sm:mb-4"
        variants={itemVariants}
      >
        Socials
      </motion.h2>

      <div className="space-y-3 sm:space-y-4">
        {socials.map((social) => {
        
          return (
            <motion.div
              key={social.label}
              className="flex items-center justify-between flex-wrap gap-2"
              variants={itemVariants}
            >
              <div className="flex items-center gap-2 sm:gap-3 text-black">
                <CustomImage alt='' src={social.icon} className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-sm font-medium">{social.label}</span>
              </div>
              <span className="text-xs sm:text-sm text-muted-foreground">
                {social.handle}
              </span>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
