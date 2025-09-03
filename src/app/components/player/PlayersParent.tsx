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
import { useDebounce } from '@/app/hooks/useDebounce';
import { useQuery } from '@tanstack/react-query';
import { useAppSelector } from '@/app/hooks/useAuth';

export default function PlayersParent() {
  const { currentPage, itemsPerPage, searchQuery, dateRange } =
    useSelector(selectPlayers);

  const user = useAppSelector((s) => s.auth.userEncryptedData);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const { data, isLoading } = useQuery({
    queryKey: [
      'customers',
      currentPage,
      itemsPerPage,
      debouncedSearchQuery,
      dateRange,
    ],
    queryFn: () =>
      PlayersApi.getCustomers({
        page: currentPage,
        size: itemsPerPage,
        search: debouncedSearchQuery || undefined,
        startDate: dateRange?.start,
        endDate: dateRange?.end,
      }).then((res) => res.data),
  });

  useEffect(() => {
    store.dispatch(setLoadingPlayers(isLoading));
  }, [isLoading]);

  useEffect(() => {
    if (data?.data) {
      const { content, pageNo, pageSize, totalElements, totalPages } =
        data.data;

      store.dispatch(
        setPlayersData({
          totalNoOfUsers: 0,
          totalActiveUsers: 0,
          totalInactiveUsers: 0,
          data: content.map((c) => ({
            objectId: c.id,
            firstName: c.firstName,
            lastName: c.lastName,
            email: c.email,
            accountType: 'user',
            createdAt: { __type: 'Date', iso: c.dateJoined },
            avatar: '',
            status: 'active',
          })),
          pagination: {
            currentPage: (pageNo || 0) + 1,
            limit: pageSize,
            totalPages: totalPages,
            totalItems: totalElements,
          },
        }),
      );
    }
  }, [data]);

  return (
    <div className="flex w-full max-w-full flex-col gap-5 overflow-x-hidden py-6">
      {['SUPER_ADMIN', 'MANAGER'].includes(user?.role) && (
        <UserStatsComponent />
      )}
      <PlayersTable />
    </div>
  );
}
