import React, { useState, useMemo } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
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
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
}

interface SendNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUsers: () => void;
  onSendToAll: () => void;
}

const SendNotificationModal: React.FC<SendNotificationModalProps> = ({
  isOpen,
  onClose,
  onSelectUsers,
  onSendToAll,
}) => {
  const [showUserSelection, setShowUserSelection] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  const users: User[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      avatarUrl: 'https://github.com/shadcn.png',
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      avatarUrl: 'https://github.com/shadcn.png',
    },
    {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike.johnson@example.com',
      avatarUrl: 'https://github.com/shadcn.png',
    },
    {
      id: '4',
      name: 'Sarah Wilson',
      email: 'sarah.wilson@example.com',
      avatarUrl: 'https://github.com/shadcn.png',
    },
    {
      id: '5',
      name: 'David Brown',
      email: 'david.brown@example.com',
      avatarUrl: 'https://github.com/shadcn.png',
    },
    {
      id: '6',
      name: 'Emma Davis',
      email: 'emma.davis@example.com',
      avatarUrl: 'https://github.com/shadcn.png',
    },
    {
      id: '7',
      name: 'Alex Miller',
      email: 'alex.miller@example.com',
      avatarUrl: 'https://github.com/shadcn.png',
    },
    {
      id: '8',
      name: 'Lisa Garcia',
      email: 'lisa.garcia@example.com',
      avatarUrl: 'https://github.com/shadcn.png',
    },
    {
      id: '9',
      name: 'Lisa Garcia',
      email: 'lisa.garcia@example.com',
      avatarUrl: 'https://github.com/shadcn.png',
    },
    {
      id: '10',
      name: 'Lisa Garcia',
      email: 'lisa.garcia@example.com',
      avatarUrl: 'https://github.com/shadcn.png',
    },
    {
      id: '11',
      name: 'Lisa Garcia',
      email: 'lisa.garcia@example.com',
      avatarUrl: 'https://github.com/shadcn.png',
    },
    {
      id: '12',
      name: 'Lisa Garcia',
      email: 'lisa.garcia@example.com',
      avatarUrl: 'https://github.com/shadcn.png',
    },
    {
      id: '13',
      name: 'Lisa Garcia',
      email: 'lisa.garcia@example.com',
      avatarUrl: 'https://github.com/shadcn.png',
    },
    {
      id: '14',
      name: 'Lisa Garcia',
      email: 'lisa.garcia@example.com',
      avatarUrl: 'https://github.com/shadcn.png',
    },
    {
      id: '15',
      name: 'Lisa Garcia',
      email: 'lisa.garcia@example.com',
      avatarUrl: 'https://github.com/shadcn.png',
    },
  ];

  const filteredUsers = useMemo(() => {
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery]);

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  const handleClose = () => {
    setShowUserSelection(false);
    setSearchQuery('');
    setSelectedUsers([]);
    setCurrentPage(1);
    onClose();
  };

  const handleSelectUsersClick = () => {
    setShowUserSelection(true);
  };

  const handleBackClick = () => {
    setShowUserSelection(false);
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleUserToggle = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const handleSelectAll = () => {
    if (
      selectedUsers.length === currentUsers.length &&
      currentUsers.every((user) => selectedUsers.includes(user.id))
    ) {
      setSelectedUsers((prev) =>
        prev.filter((id) => !currentUsers.map((u) => u.id).includes(id)),
      );
    } else {
      const currentUserIds = currentUsers.map((user) => user.id);
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

  const handleSendToSelected = () => {
    console.log('Sending to selected users:', selectedUsers);
    handleClose();
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

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
                        className="rounded-full p-2 transition-colors hover:bg-gray-100"
                      >
                        <ArrowLeft className="h-5 w-5 text-gray-600" />
                      </button>
                    )}
                    <Dialog.Title className="flex-1 text-xl font-bold text-gray-900">
                      {showUserSelection
                        ? 'Send Push Notification'
                        : 'Send Push Notification'}
                    </Dialog.Title>
                  </div>
                </motion.div>

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
                            className="flex items-center justify-center gap-2 whitespace-nowrap rounded-md border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                          >
                            <span>Select User(s)</span>
                            <UserPlus className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={onSendToAll}
                            className="flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-blue-800 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
                          >
                            <span>Send Notification to all users</span>
                            <Send className="h-4 w-4" />
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
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                          <input
                            type="text"
                            placeholder="Enter username"
                            value={searchQuery}
                            onChange={(e) => {
                              setSearchQuery(e.target.value);
                              setCurrentPage(1);
                            }}
                            className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 text-sm outline-none focus:border-blue-800 focus:ring-1 focus:ring-blue-800"
                          />
                        </div>
                      </div>

                      {/* User List */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 border-b border-gray-200 pb-3">
                          <input
                            type="checkbox"
                            id="select-all"
                            checked={
                              currentUsers.length > 0 &&
                              currentUsers.every((user) =>
                                selectedUsers.includes(user.id),
                              )
                            }
                            onChange={handleSelectAll}
                            className="h-4 w-4 rounded border-gray-300 text-blue-800 focus:ring-blue-800"
                          />
                          <label
                            htmlFor="select-all"
                            className="text-sm font-medium text-gray-900"
                          >
                            Select All Users ({currentUsers.length})
                          </label>
                        </div>

                        {/* User Items */}
                        <div className="max-h-60 space-y-2 overflow-y-auto">
                          {currentUsers.map((user) => (
                            <div
                              key={user.id}
                              className="flex items-center gap-3 rounded-md p-2 hover:bg-gray-50"
                            >
                              <input
                                type="checkbox"
                                id={`user-${user.id}`}
                                checked={selectedUsers.includes(user.id)}
                                onChange={() => handleUserToggle(user.id)}
                                className="h-4 w-4 rounded border-gray-300 text-blue-800 focus:ring-blue-800"
                              />
                              <div className="flex flex-1 items-center gap-3">
                                <img
                                  src={user.avatarUrl}
                                  alt={user.name}
                                  className="h-8 w-8 flex-shrink-0 rounded-full object-cover"
                                />
                                <div className="grid min-w-0 flex-1 grid-cols-2 gap-8">
                                  <p className="truncate text-sm font-medium text-gray-900">
                                    {user.name}
                                  </p>
                                  <p className="truncate text-sm text-gray-500">
                                    {user.email}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {currentUsers.length === 0 && (
                          <div className="py-8 text-center text-gray-500">
                            No users found matching your search.
                          </div>
                        )}

                        {totalPages > 1 && (
                          <div className="flex items-center justify-between border-t border-gray-200 pt-3">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() =>
                                  handlePageChange(currentPage - 1)
                                }
                                disabled={currentPage === 1}
                                className="rounded-md p-2 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <ChevronLeft className="h-4 w-4" />
                              </button>

                              {Array.from(
                                { length: totalPages },
                                (_, i) => i + 1,
                              ).map((page) => (
                                <button
                                  key={page}
                                  onClick={() => handlePageChange(page)}
                                  className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
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
                                disabled={currentPage === totalPages}
                                className="rounded-md p-2 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <ChevronRight className="h-4 w-4" />
                              </button>
                            </div>

                            <div className="text-xs text-gray-500">
                              Showing {startIndex + 1} to{' '}
                              {Math.min(endIndex, filteredUsers.length)} of{' '}
                              {filteredUsers.length} users
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={handleSendToSelected}
                          disabled={selectedUsers.length === 0}
                          className="flex items-center gap-2 rounded-md bg-blue-800 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <span>Send Message</span>
                          <Send className="h-4 w-4" />
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

                <Dialog.Close asChild>
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="absolute right-4 top-4 rounded-full p-2 transition-colors hover:bg-gray-100 focus:outline-none"
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
