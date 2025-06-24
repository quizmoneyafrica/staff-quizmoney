export interface FetchPlayersRequest {
  page: number;
  limit: number;
  accountType: 'admin' | 'user';
  search?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface User {
  objectId: string;
  firstName: string;
  lastName: string;
  email: string;
  accountType: 'admin' | 'user';
  createdAt: {
    __type: 'Date';
    iso: string;
  };
  avatar: string;
  status: 'active' | 'inactive';
}

export interface FetchPlayersResponse {
  result: {
    totalNoOfUsers: number;
    totalActiveUsers: number;
    totalInactiveUsers: number;
    data: User[];
  };
}
