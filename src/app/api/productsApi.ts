import { AxiosResponse } from 'axios';
import { request } from '@/app/api/config';

export interface ProductImage {
  __type: 'File';
  name: string;
  url: string;
}

export type ProductCategory = 'ERASER' | 'SPINS' | 'MOVES' | 'TRIALS';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  category: ProductCategory;
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
  category?: string;
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
  //   const handleApiError = (error: AxiosError): never => {
  //     if (
  //       error.response?.status === 401 ||
  //       (error.response?.data as ErrorResponse)?.code === 142
  //     ) {
  //       throw new AuthenticationError('Authentication required. Please login.');
  //     }
  //
  //     const status = error.response?.status || 500;
  //     const code = (error.response?.data as ErrorResponse)?.code;
  //     const message =
  //       (error.response?.data as ErrorResponse)?.error ||
  //       error.message ||
  //       'An unknown error occurred';
  //
  //     throw new ApiError(message, status, code);
  //   };

  return {
    async getProducts(
      payload: GetProductsPayload,
    ): Promise<AxiosResponse<ProductsApiResponse>> {
      const params = {
        search: payload.searchText || '',
        pageNumber: payload.pageNumber,
        pageSize: payload.pageSize,
      };

      return await request.get(`/products/filter`, {
        params,
      });
    },

    async createProduct(payload: CreateProductPayload): Promise<
      AxiosResponse<{
        success: boolean;
        code: string;
        message: string;
        data: { message: string; timestamp: string };
      }>
    > {
      return await request.post(`/products`, {
        name: payload.name,
        price: payload.price,
        quantity: payload.quantity,
        category: payload.category,
      });
    },

    async getProductById(
      productId: string,
    ): Promise<AxiosResponse<SingleProductApiResponse>> {
      return await request.post(`/getProductById`, { productId });
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
      const { productId } = payload;

      const data: Record<string, string | number> = {};
      if (payload.name !== undefined) data.name = payload.name;
      if (payload.price !== undefined) data.price = payload.price;
      if (payload.quantity !== undefined) data.quantity = payload.quantity;
      if (payload.category !== undefined) data.category = payload.category;

      return await request.patch(`/products/${productId}`, data, {});
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
      return await request.delete(`/products/${productId}`, {});
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
