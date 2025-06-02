import axios, { AxiosResponse } from "axios";
import { appHeaders, BASE_URL, getSessionTokenHeaders } from "./userApi";
import { ApiResponse } from "./interface";

const StoreAPI = {
  getProducts(): Promise<AxiosResponse<ApiResponse>> {
    return axios.post(`${BASE_URL}/getProducts`, {}, { headers: appHeaders });
  },

  getProductById(productId: string): Promise<AxiosResponse<ApiResponse>> {
    return axios.post(
      `${BASE_URL}/fetchSingleProduct`,
      { productId },
      { headers: appHeaders }
    );
  },
  purchaseItem(productId: string): Promise<AxiosResponse<ApiResponse>> {
    return axios.post(
      `${BASE_URL}/purchaseItem`,
      { productId },
      { headers: getSessionTokenHeaders() }
    );
  },
  fetchCustomerWallet(): Promise<AxiosResponse<ApiResponse>> {
    return axios.post(`${BASE_URL}/fetchCustomerWallet`, {
      headers: getSessionTokenHeaders(),
    });
  },
  fetchTransactions(): Promise<AxiosResponse<ApiResponse>> {
    return axios.post(`${BASE_URL}/fetchTransactions`, {
      headers: getSessionTokenHeaders(),
    });
  },
};

export default StoreAPI;
