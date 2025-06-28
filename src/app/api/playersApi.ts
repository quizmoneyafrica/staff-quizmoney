import axios, { AxiosResponse } from 'axios';
import { BASE_URL, getSessionTokenHeaders } from './userApi';

interface FetchPlayersParams {
  page: number;
  limit: number;
  accountType?: string;
  search?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  // sorting parameters if backend supports it
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
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
  status: 'active' | 'inactive'; //
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

  // Fetch all users by paginating
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
};

export default PlayersApi;
