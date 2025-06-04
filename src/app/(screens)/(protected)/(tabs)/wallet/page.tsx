import WalletStatCard from "@/app/components/wallet/WalletStatCard";
import TransactionTable from "@/app/components/wallet/TransactionTable";
import React from "react";
import WalletStatsHeader from "@/app/components/wallet/WalletStatsHeader";

type WalletStat = {
  title: string;
  value: string;
  color: 'blue' | 'green'|'default';
  showEye: boolean;
};

function Page() {
  const walletStats: WalletStat[] = [
  {
    title: "Total Wallet Balance",
    value: "₦500,000.00",
    color: "default",
    showEye: true,
  },
  {
    title: "Total Deposit",
    value: "₦500,000.00",
    color: "blue",
    showEye: false,
  },
  {
    title: "Total Withdrawal",
    value: "₦500,000.00",
    color: "green",
    showEye: false,
  },
];
  return  <div className="w-full max-w-full overflow-x-hidden flex flex-col gap-5   py-6">
    <WalletStatsHeader />
     <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-3 w-full">


 {walletStats.map((stat) => (
        <WalletStatCard key={stat.title} {...stat} />
      ))}
     </div>

   <TransactionTable />

  </div>;
}

export default Page;
