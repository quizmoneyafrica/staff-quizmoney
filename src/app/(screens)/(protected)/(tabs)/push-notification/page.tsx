'use client';

import React, { useState, useCallback } from 'react';
import PushNotificationTable from '@/app/components/push-notification/PushNotificationTable';
import PushNotificationCard from '@/app/components/push-notification/PushNotificationCard';

function Page() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleDataChange = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  return (
    <div className="flex w-full max-w-full flex-col gap-5 overflow-x-hidden py-6">
      <PushNotificationCard refreshTrigger={refreshTrigger} />
      <PushNotificationTable onDataChange={handleDataChange} />
    </div>
  );
}

export default Page;
