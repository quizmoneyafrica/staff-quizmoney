'use client';
import React, { useEffect } from 'react';
import PlayersTable from './PlayersTable';
import UserStatsComponent from './UserStatsComponent';
import {
  selectPlayers,
  setLoadingPlayers,
  setPlayersData,
} from '@/app/store/playersSlice';
import { store } from '@/app/store/store';
import PlayersApi from '@/app/api/playersApi';
import { useSelector } from 'react-redux';

export default function PlayersParent() {
  const { playersData } = useSelector(selectPlayers);
  const fetchPlayersData = React.useCallback(async () => {
    if (!playersData)
      try {
        store.dispatch(setLoadingPlayers(true));
        const res = await PlayersApi.fetchAdminPlayers();

        if (res.data.result) {
          store?.dispatch(setPlayersData(res.data.result));
        }
      } catch (error) {
        console.error('error: ', error);
      } finally {
        store.dispatch(setLoadingPlayers(false));
      }
  }, [playersData]);
  useEffect(() => {
    fetchPlayersData();
  }, [fetchPlayersData]);
  return (
    <div className="flex w-full max-w-full flex-col gap-5 overflow-x-hidden   py-6">
      <UserStatsComponent />
      <PlayersTable />
    </div>
  );
}
