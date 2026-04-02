// 'use client';

// import React, { useState, useMemo, useCallback, useEffect } from 'react';
// import { Search, Plus, AlertCircle, RefreshCw } from 'lucide-react';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import ProductModal from '@/app/components/products/ProductModal';
// import EditProductModal from '@/app/components/products/EditProductModal';
// import ProductDeleteModal from '@/app/components/products/ProductDeleteModal';
// import ProductCard from '@/app/components/products/ProductCard';
// import ErasersCard from '@/app/components/products/ErasersCard';
// import Pagination from '@/app/components/leaderboard/Pagination';

// import ProductsApi, {
//   Product,
//   GetProductsPayload,
//   AuthenticationError,
//   ApiError,
//   ProductCategory,
// } from '@/app/api/productsApi';

// interface ProductsPageProps {
//   products?: Product[];
//   onAddProduct?: () => void;
//   onEditProduct?: (product: Product) => void;
//   onDeleteProduct?: (productId: string) => void;
//   showOnlyErasers?: boolean;
// }

// const ProductsPage: React.FC<ProductsPageProps> = ({
//   showOnlyErasers = false,
// }) => {
//   const queryClient = useQueryClient();

//   const [searchTerm, setSearchTerm] = useState<string>('');
//   const [currentPage, setCurrentPage] = useState<number>(1);
//   const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>('');
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//   const [editProductId, setEditProductId] = useState<string | null>(null);
//   const [editProductData, setEditProductData] = useState<Product | null>(null);
//   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
//   const [productToDelete, setProductToDelete] = useState<Product | null>(null);
//   const [authError, setAuthError] = useState<string | null>(null);

//   const PRODUCTS_PER_PAGE = 9;

//   useEffect(() => {
//     const timeoutId = setTimeout(() => {
//       setDebouncedSearchTerm(searchTerm);
//       setCurrentPage(1);
//     }, 500);

//     return () => clearTimeout(timeoutId);
//   }, [searchTerm]);

//   const {
//     data: productsResponse,
//     isLoading,
//     isError,
//     error,
//     refetch,
//   } = useQuery({
//     queryKey: ['products', debouncedSearchTerm, currentPage],
//     queryFn: async () => {
//       try {
//         setAuthError(null);

//         const payload: GetProductsPayload = {
//           searchText: debouncedSearchTerm,
//           pageNumber: currentPage - 1,
//           pageSize: PRODUCTS_PER_PAGE,
//         };

//         const response = await ProductsApi.getProducts(payload);
//         return response.data;
//       } catch (error) {
//         if (error instanceof AuthenticationError) {
//           setAuthError(error.message);
//         }
//         throw error;
//       }
//     },
//   });

//   const createProductMutation = useMutation({
//     mutationFn: async (data: {
//       name: string;
//       price: number;
//       quantity: number;
//       category?: string;
//       description?: string;
//     }) => {
//       try {
//         setAuthError(null);

//         const payload = {
//           name: data.name,
//           price: data.price,
//           quantity: data.quantity,
//           category: data.category,
//         };
//         const response = await ProductsApi.createProduct(payload);
//         return response.data;
//       } catch (error) {
//         if (error instanceof AuthenticationError) {
//           setAuthError(error.message);
//         }
//         throw error;
//       }
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['products'] });
//       setIsModalOpen(false);
//     },
//     onError: (error) => {
//       console.error('Failed to create product:', error);
//     },
//   });

//   const deleteProductMutation = useMutation({
//     mutationFn: async (productId: string) => {
//       try {
//         setAuthError(null);

//         const response = await ProductsApi.deleteProduct(productId);
//         if (!response.data.success) {
//           throw new Error(response.data.message || 'Failed to delete product');
//         }
//         return response.data;
//       } catch (error) {
//         if (error instanceof AuthenticationError) {
//           setAuthError(error.message);
//         }
//         throw error;
//       }
//     },
//     onSuccess: (data) => {
//       if (data.success) {
//         queryClient.invalidateQueries({ queryKey: ['products'] });
//         setIsDeleteModalOpen(false);
//         setProductToDelete(null);
//       }
//     },
//     onError: (error) => {
//       console.error('Failed to delete product:', error);
//     },
//   });

//   const mockProducts = useMemo(() => {
//     const baseProducts = productsResponse?.data.content || [];

//     if (baseProducts.length > 0) {
//       const mockData: Product[] = [
//         ...baseProducts,
//         {
//           ...baseProducts[0],
//           id: 'mock-spin-1',
//           name: 'Spins',
//           category: 'SPINS' as ProductCategory,
//           price: 5000,
//           quantity: 100,
//           description: 'Spins Description',
//         },
//         {
//           ...baseProducts[0],
//           id: 'mock-moves-1',
//           name: 'Moves',
//           category: 'MOVES' as ProductCategory,
//           price: 7500,
//           quantity: 50,
//           description: 'Moves Description',
//         },
//         {
//           ...baseProducts[0],
//           id: 'mock-trials-1',
//           name: 'Trials',
//           category: 'TRIALS' as ProductCategory,
//           price: 3000,
//           quantity: 75,
//           description: 'Trials Description',
//         },
//       ];
//       return mockData;
//     }
//     return baseProducts;
//   }, [productsResponse?.data.content]);

//   const { eraserProducts, otherProducts } = useMemo(() => {
//     const erasers = mockProducts.filter((p) => p.category === 'ERASER');
//     const others = mockProducts.filter((p) => p.category !== 'ERASER');
//     return { eraserProducts: erasers, otherProducts: others };
//   }, [mockProducts]);

//   const allProducts = useMemo(() => {
//     return showOnlyErasers ? eraserProducts : otherProducts;
//   }, [showOnlyErasers, eraserProducts, otherProducts]);

//   const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setSearchTerm(e.target.value);
//   };

//   const { mutate: mutateCreate } = createProductMutation;

//   const handleAddProduct = useCallback(
//     async (data: {
//       name: string;
//       price: number;
//       quantity: number;
//       category?: string;
//       description?: string;
//     }) => {
//       mutateCreate(data);
//     },
//     [mutateCreate],
//   );

//   const handleEditProduct = useCallback((product: Product) => {
//     setEditProductId(product.id);
//     setEditProductData(product);
//     setIsEditModalOpen(true);
//   }, []);

//   const handleOpenDeleteModal = (product) => {
//     if (product) {
//       setProductToDelete(product);
//       setIsDeleteModalOpen(true);
//     }
//   };

//   const { mutate: mutateDelete } = deleteProductMutation;

//   const confirmDeleteProduct = useCallback(async () => {
//     if (!productToDelete) return;

//     mutateDelete(productToDelete.id);
//   }, [productToDelete, mutateDelete]);

//   const handlePageChange = useCallback((page: number) => {
//     setCurrentPage(page);
//   }, []);

//   const handleRetry = useCallback(() => {
//     setAuthError(null);
//     refetch();
//   }, [refetch]);

//   const handleEditModalClose = useCallback(() => {
//     setIsEditModalOpen(false);
//     setEditProductId(null);
//     setEditProductData(null);
//   }, []);

//   const handleEditSuccess = useCallback(() => {
//     queryClient.invalidateQueries({ queryKey: ['products'] });
//     setIsEditModalOpen(false);
//     setEditProductId(null);
//     setEditProductData(null);
//   }, [queryClient]);

//   // Loading skeleton component
//   const LoadingSkeleton = () => (
//     <div className="flex flex-wrap justify-center" style={{ gap: '25px' }}>
//       {Array.from({ length: PRODUCTS_PER_PAGE }).map((_, index) => (
//         <div
//           key={index}
//           className="h-[280px] w-[300px] animate-pulse rounded-lg bg-gray-200 p-4"
//         >
//           <div className="mb-4 h-4 w-3/4 rounded bg-gray-300"></div>
//           <div className="mb-2 h-3 w-1/2 rounded bg-gray-300"></div>
//           <div className="mb-2 h-3 w-2/3 rounded bg-gray-300"></div>
//           <div className="mt-4 h-8 w-full rounded bg-gray-300"></div>
//         </div>
//       ))}
//     </div>
//   );

//   // Authentication error component
//   const AuthErrorComponent = () => (
//     <div className="flex flex-col items-center justify-center py-12">
//       <div className="mb-6 rounded-lg bg-red-50 p-6 text-center">
//         <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
//         <h3 className="mb-2 text-lg font-semibold text-red-800">
//           Authentication Required
//         </h3>
//         <p className="text-sm text-red-600">
//           {authError || 'Please login to continue'}
//         </p>
//       </div>
//       <div className="flex space-x-4">
//         <button
//           onClick={handleRetry}
//           className="hover:bg-primary-800 flex items-center space-x-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white"
//         >
//           <RefreshCw className="h-4 w-4" />
//           <span>Retry</span>
//         </button>
//         <button
//           onClick={() => (window.location.href = '/login')}
//           className="rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
//         >
//           Go to Login
//         </button>
//       </div>
//     </div>
//   );

//   const renderPaginationSection = () => {
//     if (!productsResponse?.data) return null;

//     const { totalPages, totalElements: totalItems } = productsResponse.data;
//     if (totalPages <= 1) return null;

//     return (
//       <div className="flex flex-col items-end gap-4 pt-6">
//         <div className="text-sm text-gray-600">
//           Showing {allProducts.length} of {totalItems} products
//           {debouncedSearchTerm && (
//             <span className="ml-1 font-medium">
//               for &quot;{debouncedSearchTerm}&quot;
//             </span>
//           )}
//         </div>

//         {totalPages > 0 && (
//           <Pagination
//             currentPage={currentPage}
//             totalPages={totalPages}
//             onPageChange={handlePageChange}
//           />
//         )}
//       </div>
//     );
//   };
//   return (
//     <div className="min-h-screen bg-white px-4 py-6 md:px-6 lg:px-8">
//       <div className="mx-auto max-w-7xl">
//         <div className="mb-8 flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
//           <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
//             {showOnlyErasers ? 'Eraser Products' : 'All Products'}
//           </h1>

//           <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-x-4 md:space-y-0">
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400 md:h-5 md:w-5" />
//               <input
//                 type="text"
//                 placeholder="Search products..."
//                 value={searchTerm}
//                 onChange={handleSearchChange}
//                 className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-700 md:w-80 md:py-3 md:text-base"
//               />
//             </div>

//             <button
//               onClick={() => setIsModalOpen(true)}
//               disabled={createProductMutation.isPending}
//               className="flex items-center justify-center space-x-2 whitespace-nowrap bg-[#17478B] px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-[#0f3a75] disabled:cursor-not-allowed disabled:opacity-50 md:px-6 md:py-3 md:text-base"
//             >
//               <Plus size={16} />
//               <span>
//                 {createProductMutation.isPending
//                   ? 'Adding...'
//                   : 'Add New Product'}
//               </span>
//             </button>
//           </div>
//         </div>

//         {authError && <AuthErrorComponent />}

//         {isLoading && !authError && <LoadingSkeleton />}

//         {/* Error State */}
//         {isError && !authError && (
//           <div className="py-12 text-center">
//             <div className="mb-4 text-lg text-red-600">
//               Error loading products
//             </div>
//             <div className="mb-4 text-sm text-gray-500">
//               {error instanceof ApiError
//                 ? `${error.message} (Code: ${error.code})`
//                 : error instanceof Error
//                 ? error.message
//                 : 'Something went wrong'}
//             </div>
//             <button
//               onClick={() => refetch()}
//               className="rounded-md bg-[#17478B] px-4 py-2 text-sm font-medium text-white hover:bg-[#0f3a75]"
//             >
//               Try Again
//             </button>
//           </div>
//         )}

//         {/* Products Grid */}
//         {!isLoading && !isError && !authError && (
//           <>
//             <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
//               {!showOnlyErasers && (
//                 <React.Fragment>
//                   <ErasersCard
//                     totalErasers={eraserProducts.length}
//                     totalQuantity={eraserProducts.reduce(
//                       (sum, p) => sum + p.quantity,
//                       0,
//                     )}
//                   />
//                 </React.Fragment>
//               )}
//               {allProducts.map((product) => (
//                 <ProductCard
//                   key={product.id}
//                   product={{
//                     id: product.id,
//                     name: product.name,
//                     quantity: product.quantity,
//                     price: product.price,
//                     currency: '₦',
//                     category: product.category || 'ERASER',
//                     iconName: product.productImage?.name,
//                   }}
//                   onEdit={() => handleEditProduct(product)}
//                   onDelete={() => handleOpenDeleteModal(product)}
//                 />
//               ))}
//             </div>
//             {renderPaginationSection()}
//           </>
//         )}

//         {!isLoading && !isError && !authError && allProducts.length === 0 && (
//           <div className="col-span-full py-12 text-center">
//             <div className="mb-4 text-lg text-gray-500">
//               {debouncedSearchTerm
//                 ? `No products found for "${debouncedSearchTerm}"`
//                 : 'No products available'}
//             </div>
//             {debouncedSearchTerm && (
//               <div className="mt-2 text-sm text-gray-400">
//                 Try adjusting your search terms
//               </div>
//             )}
//             <button
//               onClick={() => setIsModalOpen(true)}
//               className="mt-4 inline-flex items-center space-x-2 bg-[#17478B] px-6 py-3 font-medium text-white transition-colors duration-200 hover:bg-[#0f3a75]"
//             >
//               <Plus size={16} />
//               <span>Add Your First Product</span>
//             </button>
//           </div>
//         )}

//         <ProductModal
//           isOpen={isModalOpen}
//           onClose={() => {
//             if (!createProductMutation.isPending) {
//               setIsModalOpen(false);
//             }
//           }}
//           onSubmit={handleAddProduct}
//         />

//         <EditProductModal
//           isOpen={isEditModalOpen}
//           onClose={handleEditModalClose}
//           productId={editProductId}
//           productData={editProductData}
//           onSuccess={handleEditSuccess}
//         />

//         <ProductDeleteModal
//           isOpen={isDeleteModalOpen}
//           onClose={() => {
//             if (!deleteProductMutation.isPending) {
//               setIsDeleteModalOpen(false);
//               setProductToDelete(null);
//             }
//           }}
//           onConfirm={confirmDeleteProduct}
//           title={`Are you sure you want to delete ${
//             productToDelete?.name || 'this Product'
//           }?`}
//           isLoading={deleteProductMutation.isPending}
//         />
//       </div>
//     </div>
//   );
// };

// export default ProductsPage;
import React from 'react';

function Page() {
  return <div></div>;
}

export default Page;
