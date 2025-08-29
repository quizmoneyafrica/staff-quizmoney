'use client';

import React, { useState, useCallback } from 'react';
import TopMissedQuestionCards from '@/app/components/top-missed-questions/TopMissedQuestionCards';
import TopMissedQuestionTable from '@/app/components/top-missed-questions/TopMissedQuestionTable';

function TopMissedQuestionPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleDataChange = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  return (
    <div className="flex w-full max-w-full flex-col gap-5 overflow-x-hidden py-6">
      <div>
        <p className="mt-1 text-gray-600">
          Track and analyze frequently missed quiz questions
        </p>
      </div>

      <TopMissedQuestionCards refreshTrigger={refreshTrigger} />

      <TopMissedQuestionTable onDataChange={handleDataChange} />
    </div>
  );
}

export default TopMissedQuestionPage;
