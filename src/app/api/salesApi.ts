import axios, { AxiosResponse } from 'axios';
import { BASE_URL, getSessionTokenHeaders } from './userApi';
import { ApiResponse } from './interface';

type SalesChartStatsPayload = {
  chartType: 'month' | 'year';
  dateRange: {
    start: string;
    end: string;
  };
};

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

const SalesApi = {
  getSalesDetails(): Promise<AxiosResponse<ApiResponse>> {
    return axios.post(
      `${BASE_URL}/getSalesDetails`,
      {},
      { headers: getSessionTokenHeaders() },
    );
  },

  getSalesTransactionsChartStats(
    payload: SalesChartStatsPayload,
  ): Promise<AxiosResponse<{ result: SalesChartStatsResult }>> {
    return axios.post(`${BASE_URL}/getSalesTransactionsChartStats`, payload, {
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
