import { BellIcon } from "@/app/icons/icons";
import React from "react";

function EmptyState() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-neutral-500">
      <BellIcon width={100} height={100} className="-rotate-12" />

      <p>You currently have no notifications</p>
    </div>
  );
}

export default EmptyState;
