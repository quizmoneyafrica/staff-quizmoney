'use client';

import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Camera } from 'lucide-react';
import { Avatar } from '@radix-ui/themes';
import { motion, AnimatePresence } from 'framer-motion';

interface AdminDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (data: AdminUpdateData) => Promise<void>;
  adminData: AdminData | null;
  loading?: boolean;
}

interface AdminData {
  id: string;
  username: string;
  email: string;
  accountType: 'Super Admin' | 'Sub Admin';
  registrationDate: string;
  status: 'Active' | 'Inactive';
  avatar?: string;
  firstName?: string;
  lastName?: string;
}

interface AdminUpdateData {
  adminType: 'Super Admin' | 'Sub Admin';
  firstName: string;
  lastName: string;
  email: string;
  profileImage?: string;
}

const AdminDetailsModal: React.FC<AdminDetailsModalProps> = ({
  isOpen,
  onClose,
  onUpdate,
  adminData,
  loading = false,
}) => {
  const [formData, setFormData] = useState<AdminUpdateData>({
    adminType: 'Super Admin',
    firstName: '',
    lastName: '',
    email: '',
    profileImage: '',
  });

  const [errors, setErrors] = useState<Partial<AdminUpdateData>>({});
  const [isEditing, setIsEditing] = useState(false);

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
      transition: { duration: 0.3, ease: 'easeOut' },
    },
  };

  useEffect(() => {
    if (adminData) {
      const nameParts = adminData.username.split(' ');
      const firstName = adminData.firstName || nameParts[0] || '';
      const lastName = adminData.lastName || nameParts.slice(1).join(' ') || '';

      setFormData({
        adminType: adminData.accountType,
        firstName,
        lastName,
        email: adminData.email,
        profileImage: adminData.avatar || '',
      });
    }
  }, [adminData]);

  const handleInputChange = (field: keyof AdminUpdateData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<AdminUpdateData> = {};

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onUpdate(formData);
      setErrors({});
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating admin:', error);
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

  if (!adminData) return null;

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
                    Admin details
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
                    <motion.div
                      variants={itemVariants}
                      className="flex flex-col items-center gap-3"
                    >
                      <div className="relative">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#B8E6FF] p-2">
                          {formData.profileImage || adminData.avatar ? (
                            <img
                              src={formData.profileImage || adminData.avatar}
                              alt="Profile"
                              className="h-16 w-16 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-lg font-semibold text-gray-600">
                              {adminData.username.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        {isEditing && (
                          <label
                            htmlFor="profile-image-edit"
                            className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-black p-2 transition-colors hover:bg-gray-800"
                          >
                            <Camera className="h-3 w-3 text-white" />
                          </label>
                        )}
                        {isEditing && (
                          <input
                            id="profile-image-edit"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        )}
                      </div>
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() =>
                            document
                              .getElementById('profile-image-edit')
                              ?.click()
                          }
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          Change Profile image
                        </button>
                      )}
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Select Admin type
                      </label>
                      {isEditing ? (
                        <select
                          value={formData.adminType}
                          onChange={(e) =>
                            handleInputChange(
                              'adminType',
                              e.target.value as 'Super Admin' | 'Sub Admin',
                            )
                          }
                          className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Super Admin">Super Admin</option>
                          <option value="Sub Admin">Sub Admin</option>
                        </select>
                      ) : (
                        <div className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900">
                          {adminData.accountType}
                        </div>
                      )}
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        First Name
                      </label>
                      {isEditing ? (
                        <>
                          <input
                            type="text"
                            value={formData.firstName}
                            onChange={(e) =>
                              handleInputChange('firstName', e.target.value)
                            }
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          {errors.firstName && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.firstName}
                            </p>
                          )}
                        </>
                      ) : (
                        <div className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900">
                          {formData.firstName || 'Mahfuzul'}
                        </div>
                      )}
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Last
                      </label>
                      {isEditing ? (
                        <>
                          <input
                            type="text"
                            value={formData.lastName}
                            onChange={(e) =>
                              handleInputChange('lastName', e.target.value)
                            }
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          {errors.lastName && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.lastName}
                            </p>
                          )}
                        </>
                      ) : (
                        <div className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900">
                          {formData.lastName || 'Islam'}
                        </div>
                      )}
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Email Address
                      </label>
                      {isEditing ? (
                        <>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                              handleInputChange('email', e.target.value)
                            }
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          {errors.email && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.email}
                            </p>
                          )}
                        </>
                      ) : (
                        <div className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900">
                          {adminData.email}
                        </div>
                      )}
                    </motion.div>

                    <motion.div variants={itemVariants} className="pt-4">
                      {isEditing ? (
                        <div className="flex gap-3">
                          <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {loading ? (
                              <div className="flex items-center justify-center gap-2">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                Updating...
                              </div>
                            ) : (
                              'Save Changes'
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="flex-1 rounded-lg bg-gray-300 px-4 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-400"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setIsEditing(true)}
                          className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700"
                        >
                          Edit Admin
                        </button>
                      )}
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

export default AdminDetailsModal;
