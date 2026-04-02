import React from 'react';
import { Metadata } from 'next';
import PlayersPage from './playerpage';

export const metadata: Metadata = {
  title: 'Players | QM Admin',
  description: 'Manage and view player information in the QM Admin dashboard',
};

function Page() {
  return <PlayersPage />;
}

export default Page;
