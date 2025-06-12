import * as React from 'react';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/app/hooks/useAuth';
import GameApi, { decryptGameData } from '@/app/api/game';
import { toast } from 'sonner';
import { formatNaira, formatQuizDate, toastPosition } from '@/app/utils/utils';
import { Flex, Heading, Link, Text } from '@radix-ui/themes';
import { setCurrentGame } from '@/app/store/gameSlice';

const NextLiveGame: React.FunctionComponent = () => {
  const dispatch = useAppDispatch();
  const { currentGame } = useAppSelector((state) => state.game);
  const [fetching, setFetching] = React.useState(false);

  const fetchNextLiveGame = React.useCallback(async () => {
    if (currentGame !== null) return;
    setFetching(true);
    try {
      const res = await GameApi.fetchNextGame();
      const encryptedGame = res.data.result.errorData;
      const game = decryptGameData(encryptedGame);
      dispatch(setCurrentGame(game));
      setFetching(false);
    } catch {
      toast.error('Error loading Next Game, please refresh', {
        position: toastPosition,
      });
      setFetching(false);
    }
  }, [currentGame, dispatch]);

  React.useEffect(() => {
    fetchNextLiveGame();
  }, [fetchNextLiveGame]);

  if (fetching) {
    return (
      <motion.div
        layout
        className="col-span-2 h-[323px] w-full animate-pulse rounded-lg bg-neutral-300 p-4"
      ></motion.div>
    );
  }
  return (
    <motion.div
      layout
      className="relative order-1 col-span-2 flex h-full items-center justify-center overflow-clip rounded-lg bg-white md:order-2"
    >
      <div className="flex h-full flex-col overflow-clip rounded-[20px]">
        <div className="relative h-full w-full overflow-hidden px-4 py-14">
          <Flex
            direction="column"
            gap="4"
            align="center"
            justify="center"
            className="relative z-[2]"
          >
            <Heading as="h3" size="5" className="text-primary-900 font-bold">
              Game Prize
            </Heading>
            <Heading as="h1" className="text-primary-900 !text-5xl !font-black">
              {formatNaira(Number(currentGame?.gamePrize), true)}
            </Heading>
            <Flex direction="column" gap="2" align="center" justify="center">
              {currentGame &&
                !currentGame.completed &&
                new Date(currentGame.startDate.iso) <= new Date() && (
                  <div className="flex items-center gap-1">
                    <div className="bg-error-500 relative h-3 w-3 rounded-full">
                      <div className="bg-error-500 absolute left-0 top-0 h-3 w-3 animate-ping rounded-full" />
                    </div>
                    <p className="text-error-500 animate-pulse font-bold">
                      Live Game in Session
                    </p>
                  </div>
                )}

              <Text className="text-neutral-800">
                Next Game:{' '}
                {currentGame && formatQuizDate(currentGame.startDate.iso)}
              </Text>
              <Text className="font-medium text-neutral-800">
                Entry Fee: {formatNaira(Number(currentGame?.entryFee), true)}
              </Text>
            </Flex>
          </Flex>
        </div>
      </div>
      <Link href="https://quizmoney.ng/how-it-works" target="_blank">
        <button className="bg-primary-400 absolute right-4 top-3 z-[4] h-[1.7rem] w-[1.7rem] cursor-pointer rounded-full text-xl font-bold text-white shadow-xl">
          ?
        </button>
      </Link>
      <div className="border-primary-100 absolute -bottom-14 -left-5 z-[1] h-[150px] w-[150px] rounded-full border-8 bg-transparent opacity-40 lg:h-[180px] lg:w-[180px]" />
      <div className="border-primary-100 absolute -right-10 -top-8 z-[1] h-[150px] w-[150px] rounded-full border-8 bg-transparent opacity-40 lg:h-[180px] lg:w-[180px]" />
    </motion.div>
  );
};

export default NextLiveGame;
