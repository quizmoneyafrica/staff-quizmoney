import * as React from "react";
import { motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/app/hooks/useAuth";
import LeaderboardAPI from "@/app/api/leaderboardApi";
import { toast } from "sonner";
import Link from "next/link";
import { setLastGameLeaderboard } from "@/app/store/leaderboardSlice";
import { Avatar } from "@radix-ui/themes";
import { formatNaira } from "@/app/utils/utils";

const LastGameWinners: React.FunctionComponent = () => {
  const dispatch = useAppDispatch();
  const { lastGame } = useAppSelector((state) => state.leaderboard);
  const [fetching, setFetching] = React.useState(false);

  const fetchLastGameWinners = React.useCallback(async () => {
    if (lastGame.length > 0) return;
    setFetching(true);
    try {
      const res = await LeaderboardAPI.getLastGameLeaderboard();
      dispatch(setLastGameLeaderboard(res.data.result.rankings));
      setFetching(false);
    } catch {
      toast.error("Error loading Last Game Winners, please refresh");
      setFetching(false);
    }
  }, [dispatch, lastGame]);

  React.useEffect(() => {
    fetchLastGameWinners();
  }, [fetchLastGameWinners]);

  if (fetching) {
    return (
      <motion.div
        layout
        className="animate-pulse p-4 bg-neutral-300 rounded-lg h-[323px] w-full lg:col-span-1"
      ></motion.div>
    );
  }


  return (
    <>
      <motion.div className="order-2 lg:order-1 p-4 bg-white rounded-lg h-[323px] w-full lg:col-span-1">
        <div className="flex items-center justify-between">
          <p>Last Game Winners</p>
          <Link
            href="/leaderboard"
            className="underline font-heading text-secondary-900"
          >
            Show all
          </Link>
        </div>

        <div className="space-y-4 mt-3">
          {lastGame.slice(0, 6).map((item, index) => {
            return (
              <UserTable
                key={index}
                num={item.position}
                image={item.user.avatar}
                name={item.user.firstName}
                amount={item.prize}
              />
            );
          })}
        </div>
      </motion.div>
    </>
  );
};

export default LastGameWinners;

interface UserTableProp {
  num: number;
  image: string;
  name: string;
  amount: number;
}
const UserTable: React.FunctionComponent<UserTableProp> = ({
  num,
  image,
  name,
  amount,
}) => {
  return (
    <div className="grid grid-cols-2 items-center">
      <div className="flex items-center gap-2 overflow-clip">
        <p className="font-heading text-neutral-900">{num}</p>
        <div className="w-[40px] h-[40px] flex items-center justify-center rounded-full bg-primary-50">
          <Avatar
            src={image}
            fallback={name?.charAt(0).toUpperCase()}
            radius="full"
            className="bg-primary-50"
          />
        </div>
        <p className="capitalize text-primary-800 font-bold">{name}</p>
      </div>

      <div className="flex items-center justify-end overflow-clip">
        <p className="inline-block text-primary-800 bg-primary-50 rounded-xl px-2 py-1">
          {formatNaira(Number(amount), true)}
        </p>
      </div>
    </div>
  );
};
