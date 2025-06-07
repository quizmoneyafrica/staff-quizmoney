import React from 'react';
import PlayersParent from '@/app/components/player/PlayersParent';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Players | QM Admin',
  description: 'Manage and view player information in the QM Admin dashboard',
};

function Page() {
  return <PlayersParent />;
}

export default Page;
