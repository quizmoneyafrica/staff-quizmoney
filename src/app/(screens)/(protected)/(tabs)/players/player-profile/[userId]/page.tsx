import PlayerProfile from '@/app/components/player-profile/PlayerProfile'
import PlayerTransactionHistory from '@/app/components/player-profile/PlayerTransactionHistory'
import SocialAndRankSection from '@/app/components/player-profile/SocialAndRankSection'
import BackButton from '@/app/icons/BackButton'
import React from 'react'

export default function page() {
  return (
   <div className="w-full max-w-full overflow-x-hidden flex flex-col gap-6  py-6">
        <BackButton/>
        <PlayerProfile/>
        <SocialAndRankSection/>
        <PlayerTransactionHistory/>
      </div>
 
  )
}