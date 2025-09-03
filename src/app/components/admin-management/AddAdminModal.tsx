'use client';

import React, { useState, useCallback } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {
  X,
  // Camera,
  ChevronDown,
} from 'lucide-react';
// import { Avatar } from '@radix-ui/themes';
import { motion, AnimatePresence } from 'framer-motion';
import { useCreateAdmin, useAdmins } from '@/app/api/adminApi';
import { toast } from 'sonner';

interface AddAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AdminFormData {
  adminType: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  profileImage?: string;
}

const AddAdminModal: React.FC<AddAdminModalProps> = ({ isOpen, onClose }) => {
  const { mutateAsync, isPending } = useCreateAdmin();

  const { data: managerAdmins } = useAdmins({
    search: '',
    page: 0,
    size: 10,
    adminType: 'MANAGER',
  });

  const [formData, setFormData] = useState<AdminFormData>({
    adminType: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    profileImage: '',
  });

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [errors, setErrors] = useState<Partial<AdminFormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<AdminFormData> = {};

    if (!formData.adminType.trim()) {
      newErrors.adminType = 'Admin type is required';
    }
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^[0-9+\s-]{10,}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }
    // if (!formData.password.trim()) {
    //   newErrors.password = 'Password is required';
    // } else if (formData.password.length < 8) {
    //   newErrors.password = 'Password must be at least 8 characters';
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const adminTypes = [
    'SUPER_ADMIN',
    managerAdmins?.totalElements < 2 ? 'MANAGER' : null,
    'SUPPORT_ADMIN',
  ].filter(Boolean);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1], // Using cubic-bezier values instead of string
      },
    },
  } as const;

  const handleInputChange = (field: keyof AdminFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers, +, and spaces
    if (/^[0-9+\s-]*$/.test(value) || value === '') {
      setFormData((prev) => ({
        ...prev,
        phoneNumber: value,
      }));

      if (errors.phoneNumber) {
        setErrors((prev) => ({
          ...prev,
          phoneNumber: undefined,
        }));
      }
    }
  };

  const handleCreateAdmin = useCallback(async (data) => {
    try {
      await mutateAsync(data);
      onClose();
      toast.success('Admin created successfully');
    } catch (error) {
      console.log('error: ', error);
      if (error?.response?.data?.data?.errorList) {
        error?.response?.data?.data?.errorList?.forEach((element) => {
          toast.error(element);
        });
        return;
      }
      toast.error(error?.response?.data?.message || 'Failed to create admin');
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Format phone number to international format if it starts with 0
      let phoneNumber = formData.phoneNumber.trim();
      if (phoneNumber.startsWith('0')) {
        phoneNumber = `+234${phoneNumber.substring(1)}`;
      } else if (!phoneNumber.startsWith('+')) {
        phoneNumber = `+234${phoneNumber}`;
      }

      const apiPayload: UnknownObject = {
        adminType: formData.adminType,
        firstName: formData.firstName,
        lastName: formData.lastName,
        emailAddress: formData.email,
        phoneNumber: phoneNumber.replace(/[^0-9+]/g, ''),
      };

      return handleCreateAdmin(apiPayload);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          profileImage: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <AnimatePresence>
          {isOpen && (
            <Dialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="fixed left-1/2 top-1/2 max-h-[90vh] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 transform overflow-y-auto rounded-xl bg-white px-8 py-8 shadow-xl focus:outline-none"
              >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <Dialog.Title className="mb-6 text-xl font-semibold text-gray-900">
                    Add New Admin
                  </Dialog.Title>
                </motion.div>

                <form onSubmit={handleSubmit}>
                  <motion.div
                    className="flex flex-col gap-6"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {/* Profile Image Section */}
                    {/* <motion.div
                      variants={itemVariants}
                      className="flex flex-col items-center gap-3"
                    >
                      <div className="relative">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#B8E6FF]">
                          <Avatar
                            src={formData.profileImage}
                            fallback="👤"
                            radius="full"
                            size="4"
                          />
                        </div>
                        <label
                          htmlFor="profile-image"
                          className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-black p-2 transition-colors hover:bg-gray-800"
                        >
                          <Camera className="h-3 w-3 text-white" />
                        </label>
                        <input
                          id="profile-image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          document.getElementById('profile-image')?.click()
                        }
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        Change Profile image
                      </button>
                    </motion.div> */}

                    <motion.div variants={itemVariants}>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Select Admin type
                      </label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setDropdownOpen(!dropdownOpen)}
                          className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3 text-left hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <span className="text-gray-900">
                            {formData.adminType}
                          </span>
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        </button>

                        {dropdownOpen && (
                          <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-300 bg-white shadow-lg">
                            {adminTypes.map((type) => (
                              <button
                                key={type}
                                type="button"
                                onClick={() => {
                                  handleInputChange('adminType', type);
                                  setDropdownOpen(false);
                                }}
                                className="w-full px-4 py-3 text-left first:rounded-t-lg last:rounded-b-lg hover:bg-gray-50"
                              >
                                {type}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) =>
                          handleInputChange('firstName', e.target.value)
                        }
                        placeholder="John"
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {errors.firstName && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.firstName}
                        </p>
                      )}
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) =>
                          handleInputChange('lastName', e.target.value)
                        }
                        placeholder="Doe"
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {errors.lastName && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.lastName}
                        </p>
                      )}
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange('email', e.target.value)
                        }
                        placeholder="john.doe@example.com"
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.email}
                        </p>
                      )}
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={handlePhoneNumberChange}
                        placeholder="+234 800 000 0000"
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {errors.phoneNumber && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.phoneNumber}
                        </p>
                      )}
                    </motion.div>

                    {/* <motion.div variants={itemVariants}>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Password
                      </label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) =>
                          handleInputChange('password', e.target.value)
                        }
                        placeholder="••••••••"
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {errors.password && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.password}
                        </p>
                      )}
                    </motion.div> */}

                    <motion.div variants={itemVariants} className="pt-4">
                      <button
                        type="submit"
                        disabled={isPending}
                        className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isPending ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Adding...
                          </div>
                        ) : (
                          'Add New Admin'
                        )}
                      </button>
                    </motion.div>
                  </motion.div>
                </form>

                <Dialog.Close asChild>
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="absolute right-4 top-4 rounded-full p-2 transition-colors hover:bg-gray-100 focus:outline-none"
                    onClick={onClose}
                  >
                    <X className="h-5 w-5 text-gray-400" />
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

export default AddAdminModal;
