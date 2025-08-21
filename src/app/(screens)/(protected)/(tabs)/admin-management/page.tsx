'use client';

import React, { useState, useCallback } from 'react';
import AdminManagementTable from '@/app/components/admin-management/AdminManagementTable';
import AdminStatsCards from '@/app/components/admin-management/AdminStatsCard';

function Page() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleDataChange = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  return (
    <div className="flex w-full max-w-full flex-col gap-5 overflow-x-hidden py-6">
      <AdminStatsCards refreshTrigger={refreshTrigger} />
      <AdminManagementTable onDataChange={handleDataChange} />
    </div>
  );
}

export default Page;
