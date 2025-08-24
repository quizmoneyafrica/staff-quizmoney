import { AxiosResponse } from 'axios';
import { ApiResponse } from './interface';
import { request } from '@/app/api/config';

const StoreAPI = {
  getProducts(): Promise<AxiosResponse<ApiResponse>> {
    return request.post(`/getProductsAdmin`);
  },

  getProductById(productId: string): Promise<AxiosResponse<ApiResponse>> {
    return request.post(`/fetchSingleProduct`, { productId });
  },
  purchaseItem(productId: string): Promise<AxiosResponse<ApiResponse>> {
    return request.post(`/purchaseItem`, { productId });
  },
  fetchCustomerWallet(): Promise<AxiosResponse<ApiResponse>> {
    return request.post(`/fetchCustomerWallet`);
  },
  fetchTransactions(): Promise<AxiosResponse<ApiResponse>> {
    return request.post(`/fetchTransactions`);
  },
};

export default StoreAPI;
