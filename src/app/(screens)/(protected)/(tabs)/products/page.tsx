'use client';

import React, { useState, useMemo } from 'react';
import { Search, Plus } from 'lucide-react';
import ProductModal from '@/app/components/products/ProductModal';
import ProductDeleteModal from '@/app/components/products/ProductDeleteModal';
import ProductCard from '@/app/components/products/ProductCard';

interface Product {
  id: string;
  name: string;
  quantity: number;
  price: number;
  currency: string;
  iconName?: string;
}

interface ProductsPageProps {
  products?: Product[];
  onAddProduct?: () => void;
  onEditProduct?: (product: Product) => void;
  onDeleteProduct?: (productId: string) => void;
}

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Solo Eraser',
    quantity: 1,
    price: 500,
    currency: '₦',
  },
  {
    id: '2',
    name: 'Quick fix pack',
    quantity: 3,
    price: 1000,
    currency: '₦',
  },
  {
    id: '3',
    name: 'Smart Saver',
    quantity: 9,
    price: 2000,
    currency: '₦',
  },
  {
    id: '4',
    name: 'Quick Bundle Hero',
    quantity: 15,
    price: 4000,
    currency: '₦',
  },
  {
    id: '5',
    name: 'Ultimate Pack',
    quantity: 40,
    price: 10000,
    currency: '₦',
  },
  {
    id: '6',
    name: 'Legend Deal',
    quantity: 60,
    price: 15000,
    currency: '₦',
  },
];

const ProductsPage: React.FC<ProductsPageProps> = ({
  products = mockProducts,
  onAddProduct = () => 'Add product clicked',
  onEditProduct = (product) => '',
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [allProducts, setAllProducts] = useState<Product[]>(products);

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return allProducts;
    return allProducts.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [allProducts, searchTerm]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleAddProduct = (data) => {
    const newProduct: Product = {
      id: Date.now().toString(),
      name: data.productName,
      price: parseFloat(data.productPrice),
      quantity: parseInt(data.productQuantity),
      currency: '₦',
    };
    setAllProducts((prev) => [newProduct, ...prev]);
    setIsModalOpen(false);
  };

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpenDeleteModal = (productId: string) => {
    const product = allProducts.find((p) => p.id === productId);
    if (product) {
      setProductToDelete(product);
      setIsDeleteModalOpen(true);
    }
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;

    setIsDeleting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setAllProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
    } catch (error) {
      console.error('Failed to delete:', error);
    } finally {
      setIsDeleting(false);
    }
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
                placeholder="Search"
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-700 md:w-80 md:py-3 md:text-base"
              />
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center space-x-2 whitespace-nowrap bg-[#17478B] px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-[#0f3a75] md:px-6 md:py-3 md:text-base"
            >
              <Plus size={16} />
              <span>Add New Product</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap justify-center" style={{ gap: '25px' }}>
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={onEditProduct}
              onDelete={handleOpenDeleteModal}
            />
          ))}
        </div>

        <ProductModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleAddProduct}
        />

        <ProductDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            if (!isDeleting) {
              setIsDeleteModalOpen(false);
              setProductToDelete(null);
            }
          }}
          onConfirm={confirmDeleteProduct}
          title={`Are you sure you want to delete ${
            productToDelete?.name || 'this Product'
          }?`}
          isLoading={isDeleting}
        />

        {filteredProducts.length === 0 && searchTerm.trim() && (
          <div className="py-12 text-center">
            <div className="mb-2 text-lg text-gray-500 md:text-xl">
              No products found
            </div>
            <div className="text-sm text-gray-400 md:text-base">
              Try adjusting your search terms
            </div>
          </div>
        )}

        {allProducts.length === 0 && (
          <div className="py-12 text-center">
            <div className="mb-4 text-lg text-gray-500 md:text-xl">
              No products available
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center space-x-2 bg-[#17478B] px-6 py-3 font-medium text-white transition-colors duration-200 hover:bg-[#0f3a75]"
            >
              <Plus size={16} />
              <span>Add Your First Product</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
