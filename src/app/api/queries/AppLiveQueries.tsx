"use client";
import React from "react";
import DashboardQueries from "./DashboardQueries";

function AppLiveQueries() {
  return (
    <>
      <DashboardQueries />
      <WalletQueries />
      <LeaderboardQueries />
    </>
  );
}

export default AppLiveQueries;
