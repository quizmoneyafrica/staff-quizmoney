import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useQuery } from '@tanstack/react-query';
import {
  X,
  Users,
  UserPlus,
  Send,
  AlertCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import {
  useSendNotificationToAll,
  useSendNotificationToUsers,
} from '@/app/hooks/useMutation';
import PlayersApi, {
  type FetchPlayersApiResponse,
  type PaginatedUsersResponse,
  type User,
} from '@/app/api/playersApi';
import NotificationSuccessPopup from './NotificationSuccessPopup';
import { AxiosError } from 'axios';

interface SendNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notificationData?: {
    id: string;
    title: string;
    body: string;
  };
}

const SendNotificationModal: React.FC<SendNotificationModalProps> = ({
  isOpen,
  onClose,
  notificationData,
}) => {
  const [showUserSelection, setShowUserSelection] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  const sendToAllMutation = useSendNotificationToAll();
  const sendToUsersMutation = useSendNotificationToUsers();

  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successData, setSuccessData] = useState<{
    recipientCount: number;
    isAllUsers: boolean;
    notificationTitle: string;
  }>({
    recipientCount: 0,
    isAllUsers: false,
    notificationTitle: '',
  });

  const {
    data: playersData,
    isLoading: isLoadingUsers,
    error: usersError,
    refetch: refetchUsers,
  } = useQuery<FetchPlayersApiResponse, AxiosError, PaginatedUsersResponse>({
    queryKey: ['adminPlayers', currentPage, searchQuery, usersPerPage],
    queryFn: async () => {
      const result = await PlayersApi.fetchPlayers({
        page: currentPage,
        limit: usersPerPage,
        search: searchQuery || undefined,
      });
      return result.data;
    },
    enabled: showUserSelection,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if ((error as AxiosError)?.code === 'ECONNABORTED') return false;
      return failureCount < 2;
    },
    select: (data) => data.result,
    placeholderData: (previousData) => previousData,
  });

  const { data: totalUsersData, isLoading: isLoadingTotalUsers } = useQuery<
    FetchPlayersApiResponse,
    AxiosError,
    PaginatedUsersResponse
  >({
    queryKey: ['totalUsers'],
    queryFn: async () => {
      const result = await PlayersApi.fetchPlayers({
        page: 1,
        limit: 1,
      });
      return result.data;
    },
    enabled: isOpen && !showUserSelection,
    staleTime: 5 * 60 * 1000,
    select: (data) => data.result,
  });

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setCurrentPage(1);
      setSelectedUsers([]);
    }
  }, [isOpen]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const users = playersData?.data || [];
  const totalUsers =
    totalUsersData?.totalNoOfUsers || playersData?.totalNoOfUsers || 0;
  const activeUsers =
    totalUsersData?.totalActiveUsers || playersData?.totalActiveUsers || 0;
  const totalPages = playersData?.pagination?.totalPages || 1;

  const handleClose = () => {
    setShowUserSelection(false);
    setSearchQuery('');
    setSelectedUsers([]);
    setCurrentPage(1);

    sendToAllMutation.reset();
    sendToUsersMutation.reset();

    onClose();
  };

  const handleSelectUsersClick = () => {
    sendToAllMutation.reset();
    sendToUsersMutation.reset();
    setShowUserSelection(true);
  };

  const handleBackClick = () => {
    sendToAllMutation.reset();
    sendToUsersMutation.reset();
    setShowUserSelection(false);
    setSearchQuery('');
    setCurrentPage(1);
    setSelectedUsers([]);
  };

  const handleUserToggle = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const handleSelectAll = () => {
    const currentUserIds = users.map((user) => user.objectId);

    if (
      selectedUsers.length === currentUserIds.length &&
      currentUserIds.every((id) => selectedUsers.includes(id))
    ) {
      setSelectedUsers((prev) =>
        prev.filter((id) => !currentUserIds.includes(id)),
      );
    } else {
      setSelectedUsers((prev) => {
        const newSelected = [...prev];
        currentUserIds.forEach((id) => {
          if (!newSelected.includes(id)) {
            newSelected.push(id);
          }
        });
        return newSelected;
      });
    }
  };

  const handleSendToAll = async () => {
    if (!notificationData || typeof notificationData.id !== 'string') {
      console.error('No notification id provided');
      return;
    }

    try {
      await sendToAllMutation.mutateAsync({
        notificationId: String(notificationData.id),
      });

      setSuccessData({
        recipientCount: totalUsers,
        isAllUsers: true,
        notificationTitle: notificationData.title,
      });
      setShowSuccessPopup(true);
    } catch (error) {}
  };

  const handleSendToSelected = async () => {
    if (!notificationData || selectedUsers.length === 0) {
      console.error('No notification data or selected users');
      return;
    }

    const selectedUserEmails = users
      .filter((user) => selectedUsers.includes(user.objectId))
      .map((user) => user.email);

    try {
      await sendToUsersMutation.mutateAsync({
        userEmails: selectedUserEmails,
        title: notificationData.title,
        body: notificationData.body,
      });

      setSuccessData({
        recipientCount: selectedUsers.length,
        isAllUsers: false,
        notificationTitle: notificationData.title,
      });
      setShowSuccessPopup(true);
    } catch (error) {}
  };

  const handleSuccessPopupClose = () => {
    setShowSuccessPopup(false);
    setSuccessData({
      recipientCount: 0,
      isAllUsers: false,
      notificationTitle: '',
    });
    handleClose();
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setCurrentPage(1);
  };

  const isLoading =
    sendToAllMutation.isPending || sendToUsersMutation.isPending;

  const isSuccess =
    (sendToAllMutation.isSuccess || sendToUsersMutation.isSuccess) &&
    !showSuccessPopup;
  const error =
    sendToAllMutation.error || sendToUsersMutation.error || usersError;

  const currentPageUserIds = users.map((user) => user.objectId);
  const isCurrentPageFullySelected =
    currentPageUserIds.length > 0 &&
    currentPageUserIds.every((id) => selectedUsers.includes(id));

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleClose}>
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
                className="fixed left-1/2 top-1/2 max-h-[90vh] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 transform overflow-y-auto rounded-xl bg-white px-6 py-6 shadow-xl focus:outline-none"
              >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <div className="mb-6 flex items-center gap-4">
                    {showUserSelection && (
                      <button
                        onClick={handleBackClick}
                        disabled={isLoading}
                        className="rounded-full p-2 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <ArrowLeft className="h-5 w-5 text-gray-600" />
                      </button>
                    )}
                    <Dialog.Title className="flex-1 text-xl font-bold text-gray-900">
                      Send Push Notification
                    </Dialog.Title>
                  </div>
                </motion.div>

                {/* User Stats */}
                {!showUserSelection && totalUsersData && (
                  <div className="mb-4 flex items-center gap-4 rounded-md bg-blue-50 p-3">
                    <Users className="h-5 w-5 text-blue-600" />
                    <div className="text-sm text-blue-800">
                      <span className="font-medium">
                        {totalUsers.toLocaleString()}
                      </span>{' '}
                      total users
                      {' • '}
                      <span className="font-medium">
                        {activeUsers.toLocaleString()}
                      </span>{' '}
                      active
                    </div>
                  </div>
                )}

                {error && (
                  <div className="mb-4 flex items-center gap-2 rounded-md bg-red-50 p-3">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <div className="flex-1">
                      <p className="text-sm text-red-600">
                        {error.message || 'Failed to send notification'}
                      </p>
                      {usersError && (
                        <button
                          onClick={() => refetchUsers()}
                          className="mt-1 text-xs text-red-500 underline hover:text-red-700"
                        >
                          Retry loading users
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {isSuccess && (
                  <div className="mb-4 flex items-center gap-2 rounded-md bg-green-50 p-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <p className="text-sm text-green-600">
                      Notification sent successfully!
                    </p>
                  </div>
                )}

                {/* Notification Preview */}
                {notificationData && (
                  <div className="mb-6 rounded-md bg-gray-50 p-4">
                    <h4 className="mb-2 font-medium text-gray-900">
                      Notification Preview:
                    </h4>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-700">
                        <span className="text-gray-500">Title:</span>{' '}
                        {notificationData.title}
                      </p>
                      <p className="text-sm text-gray-700">
                        <span className="text-gray-500">Body:</span>{' '}
                        {notificationData.body}
                      </p>
                    </div>
                  </div>
                )}

                <AnimatePresence mode="wait">
                  {!showUserSelection ? (
                    <motion.div
                      key="initial"
                      className="flex flex-col gap-6"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div>
                        <p className="mb-4 text-sm font-bold text-gray-600">
                          Who should receive this notification?
                        </p>

                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={handleSelectUsersClick}
                            disabled={isLoading}
                            className="flex items-center justify-center gap-2 whitespace-nowrap rounded-md border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <span>Select User(s)</span>
                            <UserPlus className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={handleSendToAll}
                            disabled={
                              isLoading ||
                              !notificationData ||
                              isLoadingTotalUsers
                            }
                            className="flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-blue-800 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isLoading && sendToAllMutation.isPending ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Sending...</span>
                              </>
                            ) : (
                              <>
                                <span>Send to all users</span>
                                <Send className="h-4 w-4" />
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full border border-red-500">
                          <span className="text-xs font-bold text-red-500">
                            !
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">
                          Once notifications are sent, they can&apos;t be
                          undone.
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="user-selection"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col gap-6"
                    >
                      <div>
                        <h3 className="mb-2 text-sm font-medium text-gray-900">
                          Search Users
                        </h3>
                        <form
                          onSubmit={handleSearchSubmit}
                          className="relative"
                        >
                          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                          <input
                            type="text"
                            placeholder="Enter username or email"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            disabled={isLoading || isLoadingUsers}
                            className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 text-sm outline-none focus:border-blue-800 focus:ring-1 focus:ring-blue-800 disabled:cursor-not-allowed disabled:bg-gray-50"
                          />
                        </form>
                      </div>

                      {isLoadingUsers && (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                          <span className="ml-2 text-sm text-gray-500">
                            Loading users...
                          </span>
                        </div>
                      )}

                      {/* User List */}
                      {!isLoadingUsers && playersData && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 border-b border-gray-200 pb-3">
                            <input
                              type="checkbox"
                              id="select-all"
                              checked={isCurrentPageFullySelected}
                              onChange={handleSelectAll}
                              disabled={isLoading}
                              className="h-4 w-4 rounded border-gray-300 text-blue-800 focus:ring-blue-800 disabled:cursor-not-allowed"
                            />
                            <label
                              htmlFor="select-all"
                              className="text-sm font-medium text-gray-900"
                            >
                              Select All Users ({users.length})
                            </label>
                          </div>

                          <div className="max-h-60 space-y-2 overflow-y-auto">
                            {users.map((user) => (
                              <div
                                key={user.objectId}
                                className="flex items-center gap-3 rounded-md p-2 hover:bg-gray-50"
                              >
                                <input
                                  type="checkbox"
                                  id={`user-${user.objectId}`}
                                  checked={selectedUsers.includes(
                                    user.objectId,
                                  )}
                                  onChange={() =>
                                    handleUserToggle(user.objectId)
                                  }
                                  disabled={isLoading}
                                  className="h-4 w-4 rounded border-gray-300 text-blue-800 focus:ring-blue-800 disabled:cursor-not-allowed"
                                />
                                <div className="flex flex-1 items-center gap-3">
                                  <img
                                    src={user.avatar}
                                    alt={user.firstName}
                                    className="h-8 w-8 flex-shrink-0 rounded-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                        user.firstName,
                                      )}&background=3b82f6&color=fff`;
                                    }}
                                  />
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-gray-900">
                                      {user.firstName} {user.lastName || ''}
                                    </p>
                                    <p className="truncate text-xs text-gray-500">
                                      {user.email}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {users.length === 0 && !isLoadingUsers && (
                            <div className="py-8 text-center text-gray-500">
                              {searchQuery
                                ? 'No users found matching your search.'
                                : 'No users available.'}
                            </div>
                          )}

                          {totalPages > 1 && (
                            <div className="flex items-center justify-between border-t border-gray-200 pt-3">
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() =>
                                    handlePageChange(currentPage - 1)
                                  }
                                  disabled={
                                    currentPage === 1 ||
                                    isLoading ||
                                    isLoadingUsers
                                  }
                                  className="rounded-md p-2 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  <ChevronLeft className="h-4 w-4" />
                                </button>

                                {Array.from(
                                  { length: Math.min(totalPages, 5) },
                                  (_, i) => {
                                    const page =
                                      currentPage <= 3
                                        ? i + 1
                                        : currentPage >= totalPages - 2
                                        ? totalPages - 4 + i
                                        : currentPage - 2 + i;
                                    return page;
                                  },
                                ).map((page) => (
                                  <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    disabled={isLoading || isLoadingUsers}
                                    className={`rounded-md px-3 py-1 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                                      currentPage === page
                                        ? 'bg-blue-800 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                  >
                                    {page}
                                  </button>
                                ))}

                                <button
                                  onClick={() =>
                                    handlePageChange(currentPage + 1)
                                  }
                                  disabled={
                                    currentPage === totalPages ||
                                    isLoading ||
                                    isLoadingUsers
                                  }
                                  className="rounded-md p-2 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  <ChevronRight className="h-4 w-4" />
                                </button>
                              </div>

                              <div className="text-xs text-gray-500">
                                Page {currentPage} of {totalPages}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={handleSendToSelected}
                          disabled={
                            selectedUsers.length === 0 ||
                            isLoading ||
                            !notificationData ||
                            isLoadingUsers
                          }
                          className="flex items-center gap-2 rounded-md bg-blue-800 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isLoading && sendToUsersMutation.isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>Sending...</span>
                            </>
                          ) : (
                            <>
                              <span>Send Message ({selectedUsers.length})</span>
                              <Send className="h-4 w-4" />
                            </>
                          )}
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full border border-red-500">
                          <span className="text-xs font-bold text-red-500">
                            !
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">
                          Once notifications are sent, they can&apos;t be
                          undone.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <NotificationSuccessPopup
                  isOpen={showSuccessPopup}
                  onClose={handleSuccessPopupClose}
                  recipientCount={successData.recipientCount}
                  isAllUsers={successData.isAllUsers}
                  notificationTitle={successData.notificationTitle}
                />

                <Dialog.Close asChild>
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="absolute right-4 top-4 rounded-full p-2 transition-colors hover:bg-gray-100 focus:outline-none"
                    disabled={isLoading}
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

export default SendNotificationModal;
