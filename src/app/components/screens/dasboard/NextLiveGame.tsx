import * as React from "react";
import { motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/app/hooks/useAuth";
import GameApi, { decryptGameData } from "@/app/api/game";
import { toast } from "sonner";
import { formatNaira, formatQuizDate, toastPosition } from "@/app/utils/utils";
import { Flex, Heading, Link, Text } from "@radix-ui/themes";
import { setCurrentGame } from "@/app/store/gameSlice";

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
      toast.error("Error loading Next Game, please refresh", {
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
        className="animate-pulse p-4 bg-neutral-300 rounded-lg h-[323px] w-full col-span-2"
      ></motion.div>
    );
  }
  return (
    <motion.div
      layout
      className="relative order-1 md:order-2 overflow-clip rounded-lg col-span-2 h-full bg-white flex items-center justify-center"
    >
      <div className="flex flex-col rounded-[20px] overflow-clip h-full">
        <div className="relative overflow-hidden w-full px-4 py-14 h-full">
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
                    <div className="relative h-3 w-3 bg-error-500 rounded-full">
                      <div className="h-3 w-3 bg-error-500 rounded-full animate-ping absolute left-0 top-0" />
                    </div>
                    <p className="text-error-500 font-bold animate-pulse">
                      Live Game in Session
                    </p>
                  </div>
                )}

              <Text className="text-neutral-800">
                Next Game:{" "}
                {currentGame && formatQuizDate(currentGame.startDate.iso)}
              </Text>
              <Text className="text-neutral-800 font-medium">
                Entry Fee: {formatNaira(Number(currentGame?.entryFee), true)}
              </Text>
            </Flex>
          </Flex>
        </div>
      </div>
      <Link href="https://quizmoney.ng/how-it-works" target="_blank">
        <button className="text-white text-xl z-[4] shadow-xl cursor-pointer absolute right-4 top-3 font-bold bg-primary-400 rounded-full h-[1.7rem] w-[1.7rem]">
          ?
        </button>
      </Link>
      <div className="absolute -left-5 -bottom-14 z-[1] opacity-40 h-[150px] w-[150px] lg:h-[180px] lg:w-[180px] rounded-full bg-transparent border-8 border-primary-100" />
      <div className="absolute -right-10 -top-8 z-[1] opacity-40 h-[150px] w-[150px] lg:h-[180px] lg:w-[180px] rounded-full bg-transparent border-8 border-primary-100" />
    </motion.div>
  );
};

export default NextLiveGame;
