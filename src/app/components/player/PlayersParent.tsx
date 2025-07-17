/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useEffect, useCallback } from 'react';
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
import { useDebounce } from '@/app/hooks/useDebounce';

export default function PlayersParent() {
  const {
    currentPage,
    itemsPerPage,
    searchQuery,
    selectedAccountType,
    dateRange,
  } = useSelector(selectPlayers);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const fetchPlayersData = useCallback(async () => {
    try {
      store.dispatch(setLoadingPlayers(true));

      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
      };

      if (selectedAccountType) {
        params.accountType = selectedAccountType;
      }

      if (debouncedSearchQuery) {
        params.search = debouncedSearchQuery;
      }

      if (dateRange) {
        params.dateRange = dateRange;
      }

      const res = await PlayersApi.fetchPlayers(params);

      if (res.data.result) {
        store.dispatch(
          setPlayersData({
            ...res.data.result,
            totalNoOfUsers: res.data.result.totalNoOfUsers,
            totalActiveUsers: res.data.result.totalActiveUsers,
            totalInactiveUsers: res.data.result.totalInactiveUsers,
          }),
        );
      }
    } catch (error) {
      console.error('Error fetching players:', error);
    } finally {
      store.dispatch(setLoadingPlayers(false));
    }
  }, [
    currentPage,
    itemsPerPage,
    debouncedSearchQuery,
    selectedAccountType,
    dateRange,
  ]);

  useEffect(() => {
    fetchPlayersData();
  }, [fetchPlayersData]);

  return (
    <div className="flex w-full max-w-full flex-col gap-5 overflow-x-hidden py-6">
      <UserStatsComponent />

      <PlayersTable />
    </div>
  );
}
