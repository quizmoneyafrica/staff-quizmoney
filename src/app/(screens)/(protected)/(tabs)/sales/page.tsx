import React from "react";
import SalesParent from "@/app/components/sales/SalesParent";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sales Dashboard",
  description: "View and manage your sales data and analytics",
};

function Page() {
  return <SalesParent/>;
}

export default Page;
