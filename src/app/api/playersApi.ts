import axios, { AxiosResponse } from 'axios';
import { BASE_URL, getSessionTokenHeaders } from './userApi';
import { useRequestInstance } from './config';
import { useMutation } from '@tanstack/react-query';

interface FetchPlayersParams {
  page: number;
  limit: number;
  accountType?: string;
  search?: string;
  dateRange?: {
    start: string;
    end: string;
  };

  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface ExportPlayersParams {
  accountType?: string;
  search?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

interface User {
  objectId: string;
  firstName: string;
  lastName?: string;
  email: string;
  accountType: 'user' | 'admin';
  createdAt: {
    __type: 'Date';
    iso: string;
  };
  avatar?: string;
  status: 'active' | 'inactive';
}

interface PaginatedUsersResponse {
  totalNoOfUsers: number;
  totalActiveUsers: number;
  totalInactiveUsers: number;
  data: User[];
  pagination: {
    currentPage: number;
    limit: number;
    totalPages: number;
    totalItems: number;
  };
}

interface FetchPlayersApiResponse {
  result: PaginatedUsersResponse;
}

interface AllUsersResponse {
  totalNoOfUsers: number;
  totalActiveUsers: number;
  totalInactiveUsers: number;
  data: User[];
}

interface ExportPlayersResponse {
  result: {
    csvData: string;
    filename: string;
  };
}

const PlayersApi = {
  fetchPlayers(
    params: FetchPlayersParams,
  ): Promise<AxiosResponse<FetchPlayersApiResponse>> {
    const requestParams = {
      ...params,
      limit: params.limit || 10,
    };

    return axios.post(`${BASE_URL}/fetchPlayers`, requestParams, {
      headers: getSessionTokenHeaders(),
    });
  },

  exportPlayersData(
    params: ExportPlayersParams = {},
  ): Promise<AxiosResponse<ExportPlayersResponse>> {
    const requestParams = {
      ...(params.accountType && { accountType: params.accountType }),
      ...(params.search && { search: params.search }),
      ...(params.dateRange && { dateRange: params.dateRange }),
    };

    return axios.post(`${BASE_URL}/exportPlayersData`, requestParams, {
      headers: getSessionTokenHeaders(),
    });
  },

  async fetchAllUsers(
    accountType?: string,
    search?: string,
    dateRange?: { start: string; end: string },
    batchSize: number = 100,
  ): Promise<AllUsersResponse> {
    const allUsers: User[] = [];
    let totalNoOfUsers = 0;
    let totalActiveUsers = 0;
    let totalInactiveUsers = 0;

    try {
      const firstResponse = await axios.post<FetchPlayersApiResponse>(
        `${BASE_URL}/fetchPlayers`,
        {
          page: 1,
          limit: batchSize,
          ...(accountType && { accountType }),
          ...(search && { search }),
          ...(dateRange && { dateRange }),
        },
        {
          headers: getSessionTokenHeaders(),
        },
      );

      const { result } = firstResponse.data;
      const totalPages = result.pagination.totalPages;
      totalNoOfUsers = result.totalNoOfUsers;
      totalActiveUsers = result.totalActiveUsers;
      totalInactiveUsers = result.totalInactiveUsers;

      allUsers.push(...result.data);

      if (totalPages > 1) {
        const remainingRequests = [];

        for (let page = 2; page <= totalPages; page++) {
          remainingRequests.push(
            axios.post<FetchPlayersApiResponse>(
              `${BASE_URL}/fetchPlayers`,
              {
                page,
                limit: batchSize,
                ...(accountType && { accountType }),
                ...(search && { search }),
                ...(dateRange && { dateRange }),
              },
              {
                headers: getSessionTokenHeaders(),
              },
            ),
          );
        }

        const responses = await Promise.all(remainingRequests);

        responses.forEach((response) => {
          allUsers.push(...response.data.result.data);
        });
      }

      return {
        totalNoOfUsers,
        totalActiveUsers,
        totalInactiveUsers,
        data: allUsers,
      };
    } catch (error) {
      console.error('Error fetching all users:', error);
      throw error;
    }
  },

  async fetchUsersWithFilters(
    filters: {
      accountType?: string;
      search?: string;
      dateRange?: { start: string; end: string };
      status?: 'active' | 'inactive';
    } = {},
    pagination: {
      page?: number;
      limit?: number;
    } = {},
  ): Promise<AxiosResponse<FetchPlayersApiResponse>> {
    const requestParams = {
      page: pagination.page || 1,
      limit: pagination.limit || 10,
      ...filters,
    };

    return axios.post(`${BASE_URL}/fetchPlayers`, requestParams, {
      headers: getSessionTokenHeaders(),
    });
  },
};

export type {
  User,
  PaginatedUsersResponse,
  FetchPlayersApiResponse,
  AllUsersResponse,
  FetchPlayersParams,
  ExportPlayersParams,
  ExportPlayersResponse,
};

export default PlayersApi;

export const useDeletePlayer = () => {
  const request = useRequestInstance();

  return useMutation({
    mutationFn: (values: unknown) =>
      request
        .post(`/deletePlayer`, values)
        .then((res) => res.data)
        .catch((error) => {
          throw error.response?.data || error;
        }),
  });
};
