'use client';

import React, { useState, useEffect, useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  ChevronDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product, ApiError } from '@/app/api/productsApi';

import { useProduct, useUpdateProduct } from '@/app/hooks/useProduct';

interface ProductFormData {
  name: string;
  price: string;
  quantity: string;
  category: string;
  description: string;
}

interface FormErrors {
  name?: string;
  price?: string;
  quantity?: string;
  category?: string;
  description?: string;
}

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string | null;
  productData?: Product | null;
  onSuccess?: () => void;
}

const EditProductModal: React.FC<EditProductModalProps> = ({
  isOpen,
  onClose,
  productId,
  productData: initialProductData,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    price: '',
    quantity: '',
    category: '',
    description: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    data: apiProductData,
    isLoading: isLoadingProduct,
    error: productError,
    refetch,
    authError: productAuthError,
    clearAuthError: clearProductAuthError,
  } = useProduct(productId, isOpen && !initialProductData);

  const {
    mutateAsync: updateProduct,
    isPending: isSubmitting,
    isSuccess,
    isError,
    error: updateError,
    authError: updateAuthError,
    clearAuthError: clearUpdateAuthError,
    reset: resetUpdateMutation,
  } = useUpdateProduct(productId, () => {
    onSuccess?.();
    handleClose();
  });

  const authError = productAuthError || updateAuthError;

  const productData = initialProductData || apiProductData;
  const isLoadingProductData = !initialProductData && isLoadingProduct;

  useEffect(() => {
    if (productData && isOpen) {
      setFormData({
        name: productData.name || '',
        price: productData.price?.toString() || '',
        quantity: productData.quantity?.toString() || '',
        category: productData.category || '',
        description: productData.description || '',
      });
    }
  }, [productData, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      quantity: '',
      category: '',
      description: '',
    });
    setErrors({});
    clearProductAuthError();
    clearUpdateAuthError();
    resetUpdateMutation();
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Product name must be at least 2 characters';
    }

    if (!formData.price.trim()) {
      newErrors.price = 'Product price is required';
    } else {
      const priceNum = parseFloat(formData.price);
      if (isNaN(priceNum) || priceNum <= 0) {
        newErrors.price = 'Price must be a positive number';
      }
    }

    if (!formData.quantity.trim()) {
      newErrors.quantity = 'Product quantity is required';
    } else {
      const quantityNum = parseInt(formData.quantity);
      if (isNaN(quantityNum) || quantityNum < 0) {
        newErrors.quantity = 'Quantity must be a non-negative number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof ProductFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const updateData = {
      name: formData.name.trim(),
      price: parseFloat(formData.price),
      quantity: parseInt(formData.quantity),
      category: formData.category,
    };

    await updateProduct(updateData);

    handleClose();
  };

  const handleClose = () => {
    if (!isLoadingProductData && !isSubmitting) {
      resetForm();
      onClose();
    }
  };

  const handleRetry = () => {
    clearProductAuthError();
    clearUpdateAuthError();
    if (refetch) {
      refetch();
    }
  };

  const isFormValid =
    formData.name.trim() &&
    formData.price.trim() &&
    formData.quantity.trim() &&
    Object.keys(errors).length === 0;

  const submitStatus = isSuccess ? 'success' : isError ? 'error' : 'idle';

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50" />

        <AnimatePresence>
          {isOpen && (
            <Dialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 transform overflow-y-auto rounded-[20px] bg-white px-8 py-8 shadow-xl focus:outline-none"
              >
                <Dialog.Title className="mb-6 text-xl font-bold text-gray-900">
                  Edit Product
                </Dialog.Title>

                {/* Authentication Error */}
                {authError && (
                  <div className="mb-6 rounded-lg bg-red-50 p-4">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                      <span className="ml-2 text-red-700">{authError}</span>
                    </div>
                    <div className="mt-2 flex space-x-2">
                      <button
                        onClick={handleRetry}
                        className="text-sm text-red-600 underline hover:text-red-800"
                      >
                        Try again
                      </button>
                      <button
                        onClick={() => (window.location.href = '/login')}
                        className="text-sm text-red-600 underline hover:text-red-800"
                      >
                        Go to login
                      </button>
                    </div>
                  </div>
                )}

                {isLoadingProductData && !authError && (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-[#17478B]" />
                    <span className="ml-2 text-gray-600">
                      Loading product...
                    </span>
                  </div>
                )}

                {productError && !authError && (
                  <div className="mb-6 rounded-lg bg-red-50 p-4">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                      <span className="ml-2 text-red-700">
                        {productError instanceof ApiError
                          ? `${productError.message} (Code: ${productError.code})`
                          : productError instanceof Error
                          ? productError.message
                          : 'Failed to load product'}
                      </span>
                    </div>
                    <button
                      onClick={handleRetry}
                      className="mt-2 text-sm text-red-600 underline hover:text-red-800"
                    >
                      Try again
                    </button>
                  </div>
                )}

                {/* Form */}
                {!isLoadingProductData && !productError && !authError && (
                  <>
                    <motion.h2
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                      className="mb-6 text-[15px] font-bold leading-[32px] text-[#3B3B3B]"
                      style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                    >
                      Update Product Details
                    </motion.h2>

                    <motion.div
                      className="flex flex-col gap-6"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                    >
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Product Name *
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) =>
                            handleInputChange('name', e.target.value)
                          }
                          placeholder="Enter product name..."
                          disabled={isSubmitting}
                          className={`w-full rounded-md border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#17478B] disabled:bg-gray-100 ${
                            errors.name ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.name && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.name}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Product Price *
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-700">
                            ₦
                          </span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.price}
                            onChange={(e) =>
                              handleInputChange('price', e.target.value)
                            }
                            placeholder="0.00"
                            disabled={isSubmitting}
                            className={`w-full rounded-md border py-3 pl-8 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#17478B] disabled:bg-gray-100 ${
                              errors.price
                                ? 'border-red-500'
                                : 'border-gray-300'
                            }`}
                          />
                        </div>
                        {errors.price && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.price}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Product Quantity *
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.quantity}
                          onChange={(e) =>
                            handleInputChange('quantity', e.target.value)
                          }
                          placeholder="Enter product quantity..."
                          disabled={isSubmitting}
                          className={`w-full rounded-md border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#17478B] disabled:bg-gray-100 ${
                            errors.quantity
                              ? 'border-red-500'
                              : 'border-gray-300'
                          }`}
                        />
                        {errors.quantity && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.quantity}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Product Category *
                        </label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            disabled={isSubmitting}
                            className={`flex h-[46px] w-full items-center justify-between rounded-md border px-4 py-3 text-sm transition-colors ${
                              errors.category
                                ? 'border-red-500'
                                : 'border-gray-300'
                            } ${
                              isSubmitting
                                ? 'cursor-not-allowed bg-gray-100'
                                : 'bg-white hover:border-gray-400'
                            }`}
                          >
                            <span
                              className={
                                formData.category
                                  ? 'text-gray-900'
                                  : 'text-gray-500'
                              }
                            >
                              {formData.category || 'Select category'}
                            </span>
                            <ChevronDown
                              size={20}
                              className={`text-gray-500 transition-transform ${
                                isDropdownOpen ? 'rotate-180' : ''
                              }`}
                            />
                          </button>

                          {isDropdownOpen && !isSubmitting && (
                            <div
                              ref={dropdownRef}
                              className="absolute right-0 top-full z-10 mt-1 w-full rounded-md border border-gray-200 bg-white py-1 shadow-lg"
                            >
                              {[
                                'ERASER',
                                'SPINS',
                                // 'MOVES', 'TRIALS'
                              ].map((option) => (
                                <button
                                  key={option}
                                  type="button"
                                  onClick={() => {
                                    handleInputChange('category', option);
                                    setIsDropdownOpen(false);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-900 hover:bg-gray-50"
                                >
                                  {option}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        {errors.category && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.category}
                          </p>
                        )}
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 }}
                      className="mt-8 flex justify-center"
                    >
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!isFormValid || isSubmitting}
                        className={`
                          flex h-[53px] w-full
                          items-center justify-center space-x-2
                          rounded-[25px] bg-[#17478B] text-base 
                          font-semibold text-white
                          transition duration-200
                          hover:bg-[#133a6e] disabled:cursor-not-allowed disabled:opacity-50 md:w-[538px]
                        `}
                        style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>Updating Product...</span>
                          </>
                        ) : submitStatus === 'success' ? (
                          <>
                            <CheckCircle className="h-5 w-5" />
                            <span>Product Updated!</span>
                          </>
                        ) : submitStatus === 'error' ? (
                          <>
                            <AlertCircle className="h-5 w-5" />
                            <span>Try Again</span>
                          </>
                        ) : (
                          <span>Update Product</span>
                        )}
                      </button>
                    </motion.div>

                    {/* Status Messages */}
                    {submitStatus === 'error' && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-4 text-center text-sm text-red-600"
                      >
                        {updateError instanceof ApiError
                          ? `${updateError.message} (Code: ${updateError.code})`
                          : updateError instanceof Error
                          ? updateError.message
                          : 'Failed to update product. Please try again.'}
                      </motion.div>
                    )}
                  </>
                )}

                <Dialog.Close asChild>
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    disabled={isLoadingProductData || isSubmitting}
                    className="absolute right-4 top-4 rounded-full p-2 transition-colors hover:bg-gray-100 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={handleClose}
                  >
                    <X className="h-5 w-5 text-black" />
                  </motion.button>
                </Dialog.Close>
              </motion.div>
            </Dialog.Content>
          )}
        </AnimatePresence>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default EditProductModal;
