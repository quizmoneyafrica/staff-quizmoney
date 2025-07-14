'use client';

import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  validateProductForm,
  prepareProductData,
  type ProductFormData,
} from '@/app/components/products/productModal.schema';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    price: number;
    quantity: number;
    category?: string;
    description?: string;
  }) => void;
  loading?: boolean;
}

interface FormErrors {
  name?: string;
  price?: string;
  quantity?: string;
  category?: string;
  description?: string;
}

const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    price: '',
    quantity: '',
    category: '',
    description: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle');

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
    setSubmitStatus('idle');
    setIsSubmitting(false);
  };

  const validateForm = (): boolean => {
    const { isValid, errors: validationErrors } = validateProductForm(formData);
    setErrors(validationErrors);
    return isValid;
  };

  const handleInputChange = (field: keyof ProductFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const submitData = prepareProductData(formData);
      await onSubmit(submitData);

      setSubmitStatus('success');

      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (error) {
      console.error('Error creating product:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!loading && !isSubmitting) {
      resetForm();
      onClose();
    }
  };

  const isFormValid =
    formData.name.trim() &&
    formData.price.trim() &&
    formData.quantity.trim() &&
    Object.keys(errors).length === 0;

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
                  Add Products
                </Dialog.Title>

                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="mb-6 text-[15px] font-bold leading-[32px] text-[#3B3B3B]"
                  style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                  }}
                >
                  Enter Product Details
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
                      disabled={loading || isSubmitting}
                      className={`w-full rounded-md border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#17478B] disabled:bg-gray-100 ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
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
                        disabled={loading || isSubmitting}
                        className={`w-full rounded-md border py-3 pl-8 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#17478B] disabled:bg-gray-100 ${
                          errors.price ? 'border-red-500' : 'border-gray-300'
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
                      disabled={loading || isSubmitting}
                      className={`w-full rounded-md border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#17478B] disabled:bg-gray-100 ${
                        errors.quantity ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.quantity && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.quantity}
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
                    disabled={!isFormValid || loading || isSubmitting}
                    className={`
                      flex h-[53px] w-full
                      items-center justify-center space-x-2
                      rounded-[25px] bg-[#17478B] text-base 
                      font-semibold text-white
                      transition duration-200
                      hover:bg-[#133a6e] disabled:cursor-not-allowed disabled:opacity-50 md:w-[538px]
                    `}
                    style={{
                      fontFamily: 'Space Grotesk, sans-serif',
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Creating Product...</span>
                      </>
                    ) : submitStatus === 'success' ? (
                      <>
                        <CheckCircle className="h-5 w-5" />
                        <span>Product Created!</span>
                      </>
                    ) : submitStatus === 'error' ? (
                      <>
                        <AlertCircle className="h-5 w-5" />
                        <span>Try Again</span>
                      </>
                    ) : (
                      <span>Add Product +</span>
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
                    Failed to create product. Please try again.
                  </motion.div>
                )}

                <Dialog.Close asChild>
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    disabled={loading || isSubmitting}
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

export default ProductModal;
