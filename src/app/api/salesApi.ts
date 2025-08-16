import axios, { AxiosResponse } from 'axios';
import { BASE_URL, getSessionTokenHeaders } from './userApi';
import { ApiResponse } from './interface';

export interface SalesSummaryData {
  totalPurchases: number;
  netSales: number;
  mostPurchased?: string;
}

export interface SalesSummaryResponse {
  success: boolean;
  code: string;
  message: string;
  data: SalesSummaryData;
}

export interface SalesChartResponse {
  date: string;
  sales: number;
}

export interface SalesChartApiResponse {
  success: boolean;
  code: string;
  message: string;
  data: {
    salesChartResponses: SalesChartResponse[];
  };
}

export interface CustomerOrderResponse {
  name: string;
  customerId: string;
  orderId: string;
  description: string;
  amount: number;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
}

export interface SalesOrdersApiResponse {
  success: boolean;
  code: string;
  message: string;
  data: PageResponse<CustomerOrderResponse>;
}

export interface PageResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

const formatDateForApi = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export interface SalesChartData {
  date: string;
  amount: number;
}

interface MostPurchasedProduct {
  id: string;
  name: string;
  count: number;
}

interface SalesStatistics {
  totalDistinctUsers: number;
  totalAmount: number;
  mostPurchasedProduct: MostPurchasedProduct;
}

interface SalesChartStatsResult {
  statistics: SalesStatistics;
  chartData: SalesChartData[];
}

type SalesTransactionsListPayload = {
  page: number;
  limit: number;
  search?: string;
  status?: 'pending' | 'completed' | 'failed' | '';
  dateRange?: {
    start: string;
    end: string;
  };
};

export interface ApiTransaction {
  id: string;
  createdAt: {
    __type: string;
    iso: string;
  };
  title: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  user: {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    blacklisted: boolean;
    kycVerified: boolean;
    avatar?: string;
  };
}

export interface SalesTransactionsListResponse {
  message: string;
  pagination: {
    currentPage: number;
    limit: number;
    totalPages: number;
    totalItems: number;
  };
  results: ApiTransaction[];
}

const SalesApi = {
  getSalesSummary(): Promise<AxiosResponse<SalesSummaryResponse>> {
    return axios.get(`${BASE_URL}/sales/summary`, {
      headers: getSessionTokenHeaders(),
    });
  },

  getSalesChart(
    startDate: string,
    endDate: string,
  ): Promise<AxiosResponse<SalesChartApiResponse>> {
    const params = new URLSearchParams();

    const formattedStartDate = startDate.includes('T')
      ? startDate.split('T')[0]
      : startDate;
    const formattedEndDate = endDate.includes('T')
      ? endDate.split('T')[0]
      : endDate;

    params.append('start-date', formattedStartDate);
    params.append('end-date', formattedEndDate);

    return axios.get(`${BASE_URL}/sales/chart?${params.toString()}`, {
      headers: getSessionTokenHeaders(),
    });
  },

  getSalesOrders(params: {
    startDate?: string;
    endDate?: string;
    status?: 'COMPLETED' | 'PENDING' | 'FAILED';
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<AxiosResponse<SalesOrdersApiResponse>> {
    const urlParams = new URLSearchParams();

    if (params.startDate) {
      const formattedStartDate = params.startDate.includes('T')
        ? params.startDate.split('T')[0]
        : params.startDate;
      urlParams.append('start-date', formattedStartDate);
    }

    if (params.endDate) {
      const formattedEndDate = params.endDate.includes('T')
        ? params.endDate.split('T')[0]
        : params.endDate;
      urlParams.append('end-date', formattedEndDate);
    }

    if (params.status) urlParams.append('status', params.status);
    if (params.search) urlParams.append('search', params.search);
    if (params.page) urlParams.append('page', params.page.toString());
    if (params.limit) urlParams.append('limit', params.limit.toString());

    return axios.get(`${BASE_URL}/sales/orders?${urlParams.toString()}`, {
      headers: getSessionTokenHeaders(),
    });
  },

  getSalesTransactionsList(
    payload: SalesTransactionsListPayload,
  ): Promise<AxiosResponse<{ result: SalesTransactionsListResponse }>> {
    return axios.post(`${BASE_URL}/getSalesTransactionsList`, payload, {
      headers: getSessionTokenHeaders(),
    });
  },
};

export default SalesApi;
