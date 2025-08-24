import axios, { AxiosResponse, AxiosError } from 'axios';
import { BASE_URL, getSessionTokenHeaders } from './userApi';
import { ApiResponse } from './interface';

export interface ProductImage {
  __type: 'File';
  name: string;
  url: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  category: string;
  productImage?: ProductImage;
}

export interface PaginatedResponse<T> {
  content: T[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface ProductsApiResponse {
  success: boolean;
  code: string;
  message: string;
  data: PaginatedResponse<Product>;
}

export interface SingleProductApiResponse {
  success: boolean;
  code: string;
  message: string;
  data: Product;
}

export interface GetProductsPayload {
  searchText?: string;
  pageNumber: number;
  pageSize: number;
}

export interface CreateProductPayload {
  name: string;
  price: number;
  quantity: number;
  category?: string;
  description?: string;
}

export interface UpdateProductPayload {
  productId: string;
  name?: string;
  price?: number;
  quantity?: number;
}

export interface DeleteProductPayload {
  objectId: string;
}

export interface GetProductByIdPayload {
  productId: string;
}

interface ErrorResponse {
  error?: string;
  code?: number;
}

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class ApiError extends Error {
  constructor(message: string, public status: number, public code?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

const createApiClient = () => {
  const handleApiError = (error: AxiosError): never => {
    if (
      error.response?.status === 401 ||
      (error.response?.data as ErrorResponse)?.code === 142
    ) {
      throw new AuthenticationError('Authentication required. Please login.');
    }

    const status = error.response?.status || 500;
    const code = (error.response?.data as ErrorResponse)?.code;
    const message =
      (error.response?.data as ErrorResponse)?.error ||
      error.message ||
      'An unknown error occurred';

    throw new ApiError(message, status, code);
  };

  return {
    async getProducts(
      payload: GetProductsPayload,
    ): Promise<AxiosResponse<ProductsApiResponse>> {
      try {
        type QueryParams = {
          pageNumber: number;
          pageSize: number;
          search?: string;
        };

        const params: QueryParams = {
          pageNumber: payload.pageNumber,
          pageSize: payload.pageSize,
        };

        if (payload.searchText && payload.searchText.trim() !== '') {
          params.search = payload.searchText.trim();
        }

        return await axios.get(`${BASE_URL}/products/filter`, {
          params,
          headers: getSessionTokenHeaders(),
          paramsSerializer: {
            indexes: null,
          },
        });
      } catch (error) {
        handleApiError(error as AxiosError);
      }
    },

    async createProduct(payload: CreateProductPayload): Promise<
      AxiosResponse<{
        success: boolean;
        code: string;
        message: string;
        data: { message: string; timestamp: string };
      }>
    > {
      try {
        return await axios.post(
          `${BASE_URL}/products`,
          {
            name: payload.name,
            price: payload.price,
            quantity: payload.quantity,
            productCategory: 'ERASER',
          },
          {
            headers: getSessionTokenHeaders(),
          },
        );
      } catch (error) {
        handleApiError(error as AxiosError);
      }
    },

    async getProductById(
      productId: string,
    ): Promise<AxiosResponse<SingleProductApiResponse>> {
      try {
        return await axios.post(
          `${BASE_URL}/getProductById`,
          { productId },
          { headers: getSessionTokenHeaders() },
        );
      } catch (error) {
        handleApiError(error as AxiosError);
      }
    },

    async updateProduct(payload: UpdateProductPayload): Promise<
      AxiosResponse<{
        success: boolean;
        code: string;
        message: string;
        data: {
          message: string;
          timestamp: string;
        };
      }>
    > {
      try {
        const { productId, ...updateData } = payload;

        const data: Record<string, string | number> = {};
        if (payload.name !== undefined) data.name = payload.name;
        if (payload.price !== undefined) data.price = payload.price;
        if (payload.quantity !== undefined) data.quantity = payload.quantity;

        return await axios.patch(`${BASE_URL}/products/${productId}`, data, {
          headers: getSessionTokenHeaders(),
        });
      } catch (error) {
        console.error('Update product error:', error);
        handleApiError(error as AxiosError);
      }
    },

    async deleteProduct(productId: string): Promise<
      AxiosResponse<{
        success: boolean;
        code: string;
        message: string;
        data: {
          message: string;
          timestamp: string;
        };
      }>
    > {
      try {
        return await axios.delete(`${BASE_URL}/products/${productId}`, {
          headers: getSessionTokenHeaders(),
        });
      } catch (error) {
        console.error('Delete product error:', error);
        handleApiError(error as AxiosError);
      }
    },

    async getAllProducts(): Promise<AxiosResponse<ProductsApiResponse>> {
      return this.getProducts({
        searchText: '',
        pageNumber: 0,
        pageSize: 100,
      });
    },
  };
};

const ProductsApi = createApiClient();

export default ProductsApi;
