import axios, { AxiosResponse, AxiosError } from 'axios';
import { BASE_URL, getSessionTokenHeaders } from './userApi';
import { ApiResponse } from './interface';

export interface ProductImage {
  __type: 'File';
  name: string;
  url: string;
}

export interface Product {
  productImage?: ProductImage;
  productDescription: string;
  productName: string;
  productPrice: number;
  productQuantity: number;
  productCategory: string;
  stock: string;
  bonus: number;
  totalEraser: number;
  createdAt: string;
  updatedAt: string;
  type: string;
  objectId: string;
  __type: 'Object';
  className: 'Products';
}

export interface PaginationInfo {
  currentPage: number;
  limit: number;
  totalPages: number;
  totalItems: number;
}

export interface ProductsApiResponse {
  result: {
    message: string;
    data: Product[];
    pagination: PaginationInfo;
  };
}

export interface SingleProductApiResponse {
  result: Product;
}

export interface GetProductsPayload {
  search: string;
  page: number;
  limit: number;
  dateRange: {
    start: string;
    end: string;
  };
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
  description?: string;
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
        return await axios.post(`${BASE_URL}/getProducts`, payload, {
          headers: getSessionTokenHeaders(),
        });
      } catch (error) {
        handleApiError(error as AxiosError);
      }
    },

    async createProduct(
      payload: CreateProductPayload,
    ): Promise<AxiosResponse<ApiResponse>> {
      try {
        const response = await axios.post(
          `${BASE_URL}/createProductV2`,
          {
            name: payload.name,
            price: payload.price,
            quantity: payload.quantity,
            ...(payload.category && { category: payload.category }),
            ...(payload.description && { description: payload.description }),
          },
          {
            headers: getSessionTokenHeaders(),
          },
        );

        return response;
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

    async updateProduct(
      payload: UpdateProductPayload,
    ): Promise<AxiosResponse<ApiResponse>> {
      try {
        const updateData: Record<string, string | number> = {
          productId: payload.productId,
        };

        if (payload.name !== undefined) updateData.name = payload.name;
        if (payload.price !== undefined) updateData.price = payload.price;
        if (payload.quantity !== undefined)
          updateData.quantity = payload.quantity;
        if (payload.category !== undefined)
          updateData.category = payload.category;
        if (payload.description !== undefined)
          updateData.description = payload.description;

        return await axios.post(`${BASE_URL}/updateProduct`, updateData, {
          headers: getSessionTokenHeaders(),
        });
      } catch (error) {
        console.error('Update product error:', error);
        handleApiError(error as AxiosError);
      }
    },

    async deleteProduct(
      productId: string,
    ): Promise<AxiosResponse<ApiResponse>> {
      try {
        return await axios.post(
          `${BASE_URL}/deleteProduct`,
          { productId },
          { headers: getSessionTokenHeaders() },
        );
      } catch (error) {
        handleApiError(error as AxiosError);
      }
    },

    async getAllProducts(): Promise<AxiosResponse<ProductsApiResponse>> {
      return this.getProducts({
        search: '',
        page: 1,
        limit: 100,
        dateRange: {
          start: '2024-01-01T00:00:00.000Z',
          end: new Date().toISOString(),
        },
      });
    },

    async getProductsByCategory(
      category: string,
    ): Promise<AxiosResponse<ProductsApiResponse>> {
      try {
        return await axios.post(
          `${BASE_URL}/getProductsByCategory`,
          { category },
          { headers: getSessionTokenHeaders() },
        );
      } catch (error) {
        handleApiError(error as AxiosError);
      }
    },

    async searchProducts(
      searchTerm: string,
    ): Promise<AxiosResponse<ProductsApiResponse>> {
      return this.getProducts({
        search: searchTerm,
        page: 1,
        limit: 50,
        dateRange: {
          start: '2024-01-01T00:00:00.000Z',
          end: new Date().toISOString(),
        },
      });
    },
  };
};

const ProductsApi = createApiClient();

export default ProductsApi;
