import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ProductsApi, {
  AuthenticationError,
  UpdateProductPayload,
} from '@/app/api/productsApi';

export const useProduct = (
  productId: string | null,
  enabled: boolean = true,
) => {
  const [authError, setAuthError] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      if (!productId) throw new Error('Product ID is required');

      try {
        setAuthError(null);
        const response = await ProductsApi.getProductById(productId);
        return response.data.data;
      } catch (error) {
        if (error instanceof AuthenticationError) {
          setAuthError(error.message);
        }
        throw error;
      }
    },
    enabled: !!productId && enabled,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error instanceof AuthenticationError) return false;
      return failureCount < 3;
    },
  });

  const clearAuthError = () => setAuthError(null);

  return {
    ...query,
    authError,
    clearAuthError,
  };
};

export const useUpdateProduct = (
  productId: string | null,
  onSuccess?: () => void,
) => {
  const queryClient = useQueryClient();
  const [authError, setAuthError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (updateData: Omit<UpdateProductPayload, 'productId'>) => {
      if (!productId) throw new Error('Product ID is required');
      try {
        setAuthError(null);
        const response = await ProductsApi.updateProduct({
          ...updateData,
          productId,
        });

        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to update product');
        }

        return response.data;
      } catch (error) {
        if (error instanceof AuthenticationError) {
          setAuthError(error.message);
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
      queryClient.invalidateQueries({ queryKey: ['products'] });

      if (data.success) {
        setTimeout(() => {
          onSuccess?.();
        }, 1000);
      }
    },
    onError: (error) => {
      console.error('Error updating product:', error);
    },
  });

  const clearAuthError = () => setAuthError(null);

  return {
    ...mutation,
    authError,
    clearAuthError,
  };
};

export const useProducts = (payload: {
  searchText?: string;
  pageNumber: number;
  pageSize: number;
}) => {
  const [authError, setAuthError] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ['products', payload],
    queryFn: async () => {
      try {
        setAuthError(null);
        const response = await ProductsApi.getProducts({
          searchText: payload.searchText,
          pageNumber: payload.pageNumber,
          pageSize: payload.pageSize,
        });
        return response.data;
      } catch (error) {
        if (error instanceof AuthenticationError) {
          setAuthError(error.message);
        }
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error instanceof AuthenticationError) return false;
      return failureCount < 3;
    },
  });

  const clearAuthError = () => setAuthError(null);

  return {
    ...query,
    authError,
    clearAuthError,
  };
};

export const useCreateProduct = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const [authError, setAuthError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (productData: {
      name: string;
      price: number;
      quantity: number;
      category?: string;
      description?: string;
    }) => {
      try {
        setAuthError(null);
        const response = await ProductsApi.createProduct(productData);
        return response.data;
      } catch (error) {
        if (error instanceof AuthenticationError) {
          setAuthError(error.message);
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      onSuccess?.();
    },
    onError: (error) => {
      console.error('Error creating product:', error);
    },
  });

  const clearAuthError = () => setAuthError(null);

  return {
    ...mutation,
    authError,
    clearAuthError,
  };
};

export const useDeleteProduct = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const [authError, setAuthError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (productId: string) => {
      try {
        setAuthError(null);
        const response = await ProductsApi.deleteProduct(productId);
        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to delete product');
        }
        return response.data;
      } catch (error) {
        if (error instanceof AuthenticationError) {
          setAuthError(error.message);
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['products'] });
        onSuccess?.();
      }
    },
    onError: (error) => {
      console.error('Error deleting product:', error);
    },
  });

  const clearAuthError = () => setAuthError(null);

  return {
    ...mutation,
    authError,
    clearAuthError,
  };
};
