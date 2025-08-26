'use client';

import React from 'react';
import AdminManagementTable from '@/app/components/admin-management/AdminManagementTable';
import AdminStatsCards from '@/app/components/admin-management/AdminStatsCard';

function Page() {
  return (
    <div className="flex w-full max-w-full flex-col gap-5 overflow-x-hidden py-6">
      <AdminStatsCards />
      <AdminManagementTable />
    </div>
  );
}

export default Page;
