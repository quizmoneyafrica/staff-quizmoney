'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Search, Plus, AlertCircle, RefreshCw } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ProductModal from '@/app/components/products/ProductModal';
import EditProductModal from '@/app/components/products/EditProductModal';
import ProductDeleteModal from '@/app/components/products/ProductDeleteModal';
import ProductCard from '@/app/components/products/ProductCard';

import ProductsApi, {
  Product,
  GetProductsPayload,
  AuthenticationError,
  ApiError,
} from '@/app/api/productsApi';

interface ProductsPageProps {
  products?: Product[];
  onAddProduct?: () => void;
  onEditProduct?: (product: Product) => void;
  onDeleteProduct?: (productId: string) => void;
}

const ProductsPage: React.FC<ProductsPageProps> = () => {
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editProductId, setEditProductId] = useState<string | null>(null);
  const [editProductData, setEditProductData] = useState<Product | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const PRODUCTS_PER_PAGE = 12;

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const {
    data: productsResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['products', debouncedSearchTerm, currentPage],
    queryFn: async () => {
      try {
        setAuthError(null);

        const payload: GetProductsPayload = {
          search: debouncedSearchTerm,
          page: currentPage,
          limit: PRODUCTS_PER_PAGE,
          dateRange: {
            start: '2024-01-01T00:00:00.000Z',
            end: new Date().toISOString(),
          },
        };

        const response = await ProductsApi.getProducts(payload);
        return response.data.result;
      } catch (error) {
        if (error instanceof AuthenticationError) {
          setAuthError(error.message);
        }
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error instanceof AuthenticationError) return false;
      return failureCount < 3;
    },
    refetchOnWindowFocus: false,
  });

  const createProductMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      price: number;
      quantity: number;
      category?: string;
      description?: string;
    }) => {
      try {
        setAuthError(null);
        const response = await ProductsApi.createProduct(data);
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
      setIsModalOpen(false);
    },
    onError: (error) => {
      console.error('Failed to create product:', error);
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      try {
        setAuthError(null);

        const response = await ProductsApi.deleteProduct(productId);
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

      setIsDeleteModalOpen(false);
      setProductToDelete(null);
    },
    onError: (error) => {
      console.error('Failed to delete product:', error);
    },
  });

  const allProducts = useMemo(() => {
    return productsResponse?.data || [];
  }, [productsResponse?.data]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleAddProduct = useCallback(
    async (data: {
      name: string;
      price: number;
      quantity: number;
      category?: string;
      description?: string;
    }) => {
      createProductMutation.mutate(data);
    },
    [createProductMutation.mutate],
  );

  const handleEditProduct = useCallback((product: Product) => {
    setEditProductId(product.objectId);
    setEditProductData(product);
    setIsEditModalOpen(true);
  }, []);

  const handleOpenDeleteModal = useCallback(
    (productId: string) => {
      const product = allProducts.find((p) => p.objectId === productId);
      if (product) {
        setProductToDelete(product);
        setIsDeleteModalOpen(true);
      }
    },
    [allProducts],
  );

  const confirmDeleteProduct = useCallback(async () => {
    if (!productToDelete) return;

    deleteProductMutation.mutate(productToDelete.objectId);
  }, [productToDelete, deleteProductMutation.mutate]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleRetry = useCallback(() => {
    setAuthError(null);
    refetch();
  }, [refetch]);

  const handleEditModalClose = useCallback(() => {
    setIsEditModalOpen(false);
    setEditProductId(null);
    setEditProductData(null);
  }, []);

  const handleEditSuccess = useCallback(() => {}, []);

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="flex flex-wrap justify-center" style={{ gap: '25px' }}>
      {Array.from({ length: PRODUCTS_PER_PAGE }).map((_, index) => (
        <div
          key={index}
          className="h-[280px] w-[300px] animate-pulse rounded-lg bg-gray-200 p-4"
        >
          <div className="mb-4 h-4 w-3/4 rounded bg-gray-300"></div>
          <div className="mb-2 h-3 w-1/2 rounded bg-gray-300"></div>
          <div className="mb-2 h-3 w-2/3 rounded bg-gray-300"></div>
          <div className="mt-4 h-8 w-full rounded bg-gray-300"></div>
        </div>
      ))}
    </div>
  );

  // Authentication error component
  const AuthErrorComponent = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="mb-6 rounded-lg bg-red-50 p-6 text-center">
        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
        <h3 className="mb-2 text-lg font-semibold text-red-800">
          Authentication Required
        </h3>
        <p className="text-sm text-red-600">
          {authError || 'Please login to continue'}
        </p>
      </div>
      <div className="flex space-x-4">
        <button
          onClick={handleRetry}
          className="flex items-center space-x-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Retry</span>
        </button>
        <button
          onClick={() => (window.location.href = '/login')}
          className="rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
        >
          Go to Login
        </button>
      </div>
    </div>
  );

  // Pagination component
  const Pagination = () => {
    const pagination = productsResponse?.pagination;
    if (!pagination || pagination.totalPages <= 1) return null;

    const { currentPage: _apiCurrentPage, totalPages, totalItems } = pagination;

    return (
      <div className="mt-8 flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="text-sm text-gray-600">
          Showing {allProducts.length} of {totalItems} products
          {debouncedSearchTerm && (
            <span className="ml-1 font-medium">
              for &quot;{debouncedSearchTerm}&quot;
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNumber;
            if (totalPages <= 5) {
              pageNumber = i + 1;
            } else {
              const startPage = Math.max(1, currentPage - 2);
              const endPage = Math.min(totalPages, startPage + 4);
              pageNumber = startPage + i;
              if (pageNumber > endPage) return null;
            }

            return (
              <button
                key={pageNumber}
                onClick={() => handlePageChange(pageNumber)}
                className={`rounded-md border px-3 py-2 text-sm font-medium ${
                  currentPage === pageNumber
                    ? 'border-[#17478B] bg-[#17478B] text-white'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {pageNumber}
              </button>
            );
          })}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white px-4 py-6 md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl lg:text-4xl">
            All available Products
          </h1>

          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-x-4 md:space-y-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400 md:h-5 md:w-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-700 md:w-80 md:py-3 md:text-base"
              />
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              disabled={createProductMutation.isPending}
              className="flex items-center justify-center space-x-2 whitespace-nowrap bg-[#17478B] px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-[#0f3a75] disabled:cursor-not-allowed disabled:opacity-50 md:px-6 md:py-3 md:text-base"
            >
              <Plus size={16} />
              <span>
                {createProductMutation.isPending
                  ? 'Adding...'
                  : 'Add New Product'}
              </span>
            </button>
          </div>
        </div>

        {/* Authentication Error */}
        {authError && <AuthErrorComponent />}

        {/* Loading State */}
        {isLoading && !authError && <LoadingSkeleton />}

        {/* Error State */}
        {isError && !authError && (
          <div className="py-12 text-center">
            <div className="mb-4 text-lg text-red-600">
              Error loading products
            </div>
            <div className="mb-4 text-sm text-gray-500">
              {error instanceof ApiError
                ? `${error.message} (Code: ${error.code})`
                : error instanceof Error
                ? error.message
                : 'Something went wrong'}
            </div>
            <button
              onClick={() => refetch()}
              className="rounded-md bg-[#17478B] px-4 py-2 text-sm font-medium text-white hover:bg-[#0f3a75]"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Products Grid */}
        {!isLoading && !isError && !authError && (
          <>
            <div
              className="flex flex-wrap justify-center"
              style={{ gap: '25px' }}
            >
              {allProducts.map((product) => (
                <ProductCard
                  key={product.objectId}
                  product={{
                    id: product.objectId,
                    name: product.productName,
                    quantity: product.productQuantity,
                    price: product.productPrice,
                    currency: '₦',
                    iconName: product.productImage?.name,
                  }}
                  onEdit={() => handleEditProduct(product)}
                  onDelete={handleOpenDeleteModal}
                />
              ))}
            </div>

            <Pagination />
          </>
        )}

        {!isLoading && !isError && !authError && allProducts.length === 0 && (
          <div className="py-12 text-center">
            <div className="mb-4 text-lg text-gray-500 md:text-xl">
              {debouncedSearchTerm
                ? `No products found for "${debouncedSearchTerm}"`
                : 'No products available'}
            </div>
            {debouncedSearchTerm && (
              <div className="mb-4 text-sm text-gray-400 md:text-base">
                Try adjusting your search terms
              </div>
            )}
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center space-x-2 bg-[#17478B] px-6 py-3 font-medium text-white transition-colors duration-200 hover:bg-[#0f3a75]"
            >
              <Plus size={16} />
              <span>Add Your First Product</span>
            </button>
          </div>
        )}

        <ProductModal
          isOpen={isModalOpen}
          onClose={() => {
            if (!createProductMutation.isPending) {
              setIsModalOpen(false);
            }
          }}
          onSubmit={handleAddProduct}
        />

        <EditProductModal
          isOpen={isEditModalOpen}
          onClose={handleEditModalClose}
          productId={editProductId}
          productData={editProductData}
          onSuccess={handleEditSuccess}
        />

        <ProductDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            if (!deleteProductMutation.isPending) {
              setIsDeleteModalOpen(false);
              setProductToDelete(null);
            }
          }}
          onConfirm={confirmDeleteProduct}
          title={`Are you sure you want to delete ${
            productToDelete?.productName || 'this Product'
          }?`}
          isLoading={deleteProductMutation.isPending}
        />
      </div>
    </div>
  );
};

export default ProductsPage;
