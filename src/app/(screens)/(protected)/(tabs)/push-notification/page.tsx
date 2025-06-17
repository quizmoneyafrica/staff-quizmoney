import React from 'react';
import PushNotificationTable from '@/app/components/push-notification/PushNotificationTable';
import PushNotificationCard from '@/app/components/push-notification/PushNotificationCard';

function Page() {
  return (
    <div className="flex w-full max-w-full flex-col gap-5 overflow-x-hidden   py-6">
      <PushNotificationCard />
      <PushNotificationTable />
    </div>
  );
}

export default Page;
