import UserStatsComponent from "@/app/components/player/UserStatsComponent";
import PlayersTable from "@/app/components/player/PlayersTable";
import React from "react";

function Page() {
  return (
       <div className="w-full max-w-full overflow-x-hiddengap-12 grid gap-6  py-6">
      <UserStatsComponent/>
      <PlayersTable />
    </div>
  );
}

export default Page;
