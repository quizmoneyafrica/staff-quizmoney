import React from 'react'
import CustomImage from '../CustomImage'
import * as Dialog from '@radix-ui/react-dialog'
import GameHistoryModal from './GameHistoryModal'

type GameHistoryItem = {
  id: string
  date: string
  reward: {
    type: 'money' | 'item'
    value: string
    itemCount?: number
  }
  status: 'Won' | 'Loss'
  correctScore: number
  incorrectScore: number
  totalTime: string
}

const gameHistoryData: GameHistoryItem[] = [
  {
    id: 'ID1234567',
    date: '21/02/2024 09:00',
    reward: {
      type: 'money',
      value: '₦50,000'
    },
    status: 'Won',
    correctScore: 20,
    incorrectScore: 0,
    totalTime: '00:50 minutes'
  },
  {
    id: 'ID1234567',
    date: '21/02/2024 09:00',
    reward: {
      type: 'money',
      value: '₦10,000'
    },
    status: 'Loss',
    correctScore: 15,
    incorrectScore: 5,
    totalTime: '01:10 minutes'
  },
  {
    id: 'ID1234567',
    date: '21/02/2024 09:00',
    reward: {
      type: 'item',
      value: 'cleaner',
      itemCount: 2
    },
    status: 'Won',
    correctScore: 25,
    incorrectScore: 2,
    totalTime: '00:45 minutes'
  }
]

export default function PlayerGameHistorySection() {
  return (
    <div className="bg-white rounded-xl p-6" data-aos="fade-left" data-aos-duration="800">
      <h2 className="text-2xl font-semibold mb-6 text-gray-900" data-aos="fade-up" data-aos-delay="100">Game History</h2>

      <div className="relative w-full overflow-x-auto rounded-lg">
        <div className="min-w-full inline-block align-middle">
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" data-aos="fade-up" data-aos-delay="200">Game ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" data-aos="fade-up" data-aos-delay="300">Rewards</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" data-aos="fade-up" data-aos-delay="400">Game Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" data-aos="fade-up" data-aos-delay="500">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {gameHistoryData.map((game, index) => (
                  <tr key={`${game.id}-${index}`} data-aos="fade-up" data-aos-delay={600 + (index * 100)}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{game.id}</div>
                      <div className="text-sm text-gray-500">{game.date}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-primary-900">
                        {game.reward.type === 'money' ? (
                          game.reward.value
                        ) : (
                          <>
                            <CustomImage src={`/icons/${game.reward.value}.svg`} alt='' /> x{game.reward.itemCount}
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        game.status === 'Won' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {game.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Dialog.Root>
                        <Dialog.Trigger asChild>
                          <button className=" cursor-pointer text-primary-900 ">View</button>
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
    </div>
  )
}
