import axios, { AxiosResponse } from 'axios';
import { BASE_URL, getSessionTokenHeaders } from './userApi';
import { ApiResponse } from './interface';

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
  lastName: string;
  email: string;
  accountType: string;
  createdAt: {
    __type: string;
    iso: string;
  };
  avatar: string;
  status: string;
}

interface PaginatedApiResponse {
  result: {
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
  };
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
  ): Promise<AxiosResponse<ApiResponse>> {
    const requestParams = {
      ...params,
      limit: 10,
    };

    return axios.post(`${BASE_URL}/fetchPlayers`, requestParams, {
      headers: getSessionTokenHeaders(),
    });
  },

  // Fetch all users by paginating through all pages
  async fetchAllUsers(
    accountType?: string,
    search?: string,
    batchSize: number = 100,
  ): Promise<AllUsersResponse> {
    const allUsers: User[] = [];
    let totalNoOfUsers = 0;
    let totalActiveUsers = 0;
    let totalInactiveUsers = 0;

    try {
      const firstResponse = await axios.post<PaginatedApiResponse>(
        `${BASE_URL}/fetchPlayers`,
        {
          page: 1,
          limit: batchSize,
          ...(accountType && { accountType }),
          ...(search && { search }),
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
            axios.post<PaginatedApiResponse>(
              `${BASE_URL}/fetchPlayers`,
              {
                page,
                limit: batchSize,
                ...(accountType && { accountType }),
                ...(search && { search }),
              },
              {
                headers: getSessionTokenHeaders(),
              },
            ),
          );
        }

        const responses = await Promise.all(remainingRequests);

        // Collect all users
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

  // Alternative: Fetch users in batches with a callback for progress updates
  async fetchAllUsersWithProgress(
    onProgress: (progress: {
      current: number;
      total: number;
      users: User[];
    }) => void,
    accountType?: string,
    search?: string,
    batchSize: number = 100,
  ): Promise<AllUsersResponse> {
    const allUsers: User[] = [];
    let totalNoOfUsers = 0;
    let totalActiveUsers = 0;
    let totalInactiveUsers = 0;

    try {
      const firstResponse = await axios.post<PaginatedApiResponse>(
        `${BASE_URL}/fetchPlayers`,
        {
          page: 1,
          limit: batchSize,
          ...(accountType && { accountType }),
          ...(search && { search }),
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

      onProgress({
        current: 1,
        total: totalPages,
        users: [...allUsers],
      });

      for (let page = 2; page <= totalPages; page++) {
        const response = await axios.post<PaginatedApiResponse>(
          `${BASE_URL}/fetchPlayers`,
          {
            page,
            limit: batchSize,
            ...(accountType && { accountType }),
            ...(search && { search }),
          },
          {
            headers: getSessionTokenHeaders(),
          },
        );

        allUsers.push(...response.data.result.data);

        onProgress({
          current: page,
          total: totalPages,
          users: [...allUsers],
        });

        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      return {
        totalNoOfUsers,
        totalActiveUsers,
        totalInactiveUsers,
        data: allUsers,
      };
    } catch (error) {
      console.error('Error fetching all users with progress:', error);
      throw error;
    }
  },

  // old method for backward compatibility
  /**
   * @deprecated Use fetchAllUsers() instead for better handling of large datasets
   */
  fetchAdminPlayers(): Promise<AxiosResponse<ApiResponse>> {
    console.warn(
      'fetchAdminPlayers is deprecated. Use fetchAllUsers() instead.',
    );
    return axios.post(
      `${BASE_URL}/fetchPlayers`,
      {
        page: 1,
        limit: 1000, // This is problematic for large datasets
      },
      {
        headers: getSessionTokenHeaders(),
      },
    );
  },
};

export default PlayersApi;
