import React from "react";
import LeaderboardCard from "@/app/components/leaderboard/LeaderboardCard";
import LeaderboardTable from "@/app/components/leaderboard/LeaderboardTable";

function Page() {
  const exampleData = [
    {
      rank: 1,
      playerName: "Joemicky",
      gamesPlayed: 10,
      prize: "₦50,000",
      avatarUrl: "https://github.com/shadcn.png", // Replace with actual avatar URL or logic
    },
    {
      rank: 2,
      playerName: "Joemicky",
      gamesPlayed: 10,
      prize: "₦30,000",
      avatarUrl: "https://github.com/shadcn.png", // Replace with actual avatar URL or logic
    },
    {
      rank: 3,
      playerName: "Joemicky",
      gamesPlayed: 10,
      prize: "₦25,000",
      avatarUrl: "https://github.com/shadcn.png", // Replace with actual avatar URL or logic
    },
  ];

  return (
    <div className="w-full max-w-full overflow-x-hidden  py-6">
      <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-3 w-full">
        {exampleData.map((data) => (
          <LeaderboardCard
            key={data.rank}
            rank={data.rank}
            playerName={data.playerName}
            gamesPlayed={data.gamesPlayed}
            prize={data.prize}
            avatarUrl={data.avatarUrl}
          />
        ))}
      </div>
      <div className="mt-8">
        <LeaderboardTable /> 
      </div>
    </div>
  );
}

export default Page;