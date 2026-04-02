'use client';

import { motion } from 'framer-motion';
import { useGames } from '@/app/lib/queries';
import { formatNaira, formatNigeriaTime } from '@/app/lib/utils';
import { Coins, Gamepad, Gamepad2 } from 'lucide-react';
import { Flex, Heading, Text } from '@radix-ui/themes';
import { GameIcon, GameIconBig, QmCoinIcon } from '@/app/icons/icons';
import { convertToLocaleString, formatQuizDate } from '@/app/utils';

export default function NextLiveGame() {
  const { data: scheduledData, isLoading: loadingScheduled } = useGames({
    status: 'scheduled',
    limit: 1,
  });
  const { data: activeData, isLoading: loadingActive } = useGames({
    status: 'active',
    limit: 1,
  });
  const isLoading = loadingScheduled || loadingActive;

  if (isLoading) {
    return (
      <motion.div
        layout
        className="h-80.75 col-span-2 w-full animate-pulse rounded-lg bg-neutral-300 p-4"
      ></motion.div>
    );
  }

  // Show active game first, else first scheduled
  // const activeGames = useGames({ status: 'active', limit: 1 })
  const game = activeData?.games?.[0] ?? scheduledData?.games?.[0];

  const isLive =
    game?.status === 'active' ||
    game?.status === 'lobby' ||
    game?.status === 'locked';
  const prizeKobo = game
    ? Math.floor(
        (game.entry_fee_kobo * (game.total_players || 0) * game.prize_percent) /
          100,
      )
    : 0;

  return (
    <motion.div
      layout
      className="h-80.75 relative w-full overflow-hidden rounded-xl bg-white"
    >
      {/* Decorative circles */}
      <div className="border-primary-100 z-1 h-37.5 w-37.5 absolute -bottom-14 -left-5 rounded-full border-8 opacity-40" />
      <div className="border-primary-100 z-1 h-37.5 w-37.5 absolute -right-10 -top-8 rounded-full border-8 opacity-40" />
      <div className="flex h-full flex-col overflow-clip rounded-[20px]">
        <div className="relative h-full w-full place-content-center overflow-hidden px-4 py-14">
          {!game?.scheduled_start_time ? (
            <div className="space-y-6 text-center">
              <div className="text-primary-900 flex w-full place-content-center">
                <Gamepad2 size={60} width={60} />
              </div>
              <Heading size="5" className="text-primary-900 font-bold">
                No upcoming game scheduled
              </Heading>
            </div>
          ) : (
            <Flex
              direction="column"
              gap="4"
              align="center"
              justify="center"
              className="relative z-[2]"
            >
              <Text size="5" className="text-primary-900 font-bold">
                Game Prize
              </Text>
              <Heading className="text-primary-900 text-5xl! font-black! mb-0 text-center">
                {formatNaira(prizeKobo > 0 ? prizeKobo : 10000000)}

                <Text className="text-primary-900 text-3xl! font-black! flex flex-col items-center">
                  <span className="text-primary-900 flex items-center">+</span>
                  <div className="flex items-center">
                    <QmCoinIcon className="h-6 w-6" />
                    &nbsp;
                    {convertToLocaleString(game.qmcoin_prize_total)} QM coins
                  </div>
                </Text>
              </Heading>

              <Flex
                direction="column"
                gap="2"
                align="center"
                justify="center"
                className="pt-2"
              >
                {game && isLive && (
                  <div className="flex items-center gap-1">
                    <div className="bg-error-500 relative h-3 w-3 rounded-full">
                      <div className="bg-error-500 absolute left-0 top-0 h-3 w-3 animate-ping rounded-full" />
                    </div>
                    <p className="text-error-500 animate-pulse font-bold">
                      Live Game in Session
                    </p>
                  </div>
                )}

                {game && (
                  <Text className="text-neutral-800">
                    Info:{' '}
                    {game?.scheduled_start_time
                      ? formatQuizDate(game?.scheduled_start_time)
                      : 'No upcoming game scheduled'}
                  </Text>
                )}
                {game && (
                  <Text className="font-medium text-neutral-800">
                    Entry Fee: {formatNaira(game.entry_fee_kobo)}
                  </Text>
                )}
              </Flex>
            </Flex>
          )}
        </div>
      </div>
    </motion.div>
  );
}
