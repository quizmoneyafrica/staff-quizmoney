/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import {
  Search,
  MoreVertical,
  Send,
  Edit,
  Trash2,
  Loader2,
} from 'lucide-react';
import { CaretSortIcon } from '@radix-ui/react-icons';
import { Avatar, Table } from '@radix-ui/themes';
import Pagination from '../leaderboard/Pagination';
import CreateNotificationModal from './PushNotificationModal';
import SendNotificationModal from './SendNotificationModal';
import {
  notificationService,
  PushNotificationFromAPI,
} from '@/app/api/pushNotification';
import { formatDateTime } from '@/app/utils/utils';

interface StaticPushNotificationData {
  id: string;
  date: string;
  time: string;
  fullDate: string;
  Subject: string;
  notificationBody: string;
  avatarUrl: string;
  createdAt: string;
  updatedAt: string;
}

type SortField = 'id' | 'Subject' | 'notificationBody' | 'date';
type SortDirection = 'asc' | 'desc';

interface PushNotificationTableProps {
  onDataChange?: () => void;
}

const PushNotificationTable: React.FC<PushNotificationTableProps> = ({
  onDataChange,
}) => {
  const [notifications, setNotifications] = useState<
    StaticPushNotificationData[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState(false);

  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingNotification, setEditingNotification] = useState<{
    id: string;
    subject: string;
    body: string;
    image?: string;
  } | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [selectedNotificationId, setSelectedNotificationId] = useState<
    string | null
  >(null);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const itemsPerPage = 10;

  const transformApiData = (
    apiNotifications: PushNotificationFromAPI[],
  ): StaticPushNotificationData[] => {
    const transformed = apiNotifications.map((notification) => {
      const { time, fullDate } = formatDateTime(notification.createdAt);

      return {
        id: notification.objectId,
        date: notification.createdAt,
        time: time,
        fullDate: fullDate,
        Subject: notification.subject,
        notificationBody: notification.message,
        avatarUrl: notification.image || 'https://github.com/shadcn.png',
        createdAt: notification.createdAt,
        updatedAt: notification.updatedAt,
      };
    });
    return transformed;
  };

  const notifyDataChange = useCallback(() => {
    if (onDataChange) {
      onDataChange();
    }
  }, [onDataChange]);

  useEffect(() => {
    if (createSuccess) {
      const timer = setTimeout(() => {
        setCreateSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [createSuccess]);

  useEffect(() => {
    if (createError) {
      const timer = setTimeout(() => {
        setCreateError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [createError]);

  useEffect(() => {
    if (deleteSuccess) {
      const timer = setTimeout(() => {
        setDeleteSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [deleteSuccess]);

  useEffect(() => {
    if (deleteError) {
      const timer = setTimeout(() => {
        setDeleteError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [deleteError]);

  useEffect(() => {
    if (editSuccess) {
      const timer = setTimeout(() => {
        setEditSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [editSuccess]);

  useEffect(() => {
    if (editError) {
      const timer = setTimeout(() => {
        setEditError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [editError]);

  const fetchNotifications = useCallback(
    async (page: number = 1, searchTerm: string = '') => {
      try {
        setLoading(true);
        setError(null);

        const response = await notificationService.getPushNotifications({
          page,
          limit: itemsPerPage,
          searchTerm, //  search term to API if your API supports it
        });

        if (response.result?.pushNotifications) {
          const transformedData = transformApiData(
            response.result.pushNotifications,
          );

          // If API doesn't support server-side search, filter client-side
          const filteredData = searchTerm
            ? transformedData.filter(
                (notification) =>
                  notification.id
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                  notification.Subject.toLowerCase().includes(
                    searchTerm.toLowerCase(),
                  ) ||
                  notification.notificationBody
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()),
              )
            : transformedData;

          setNotifications(filteredData);

          const actualCount = searchTerm
            ? filteredData.length
            : response.result.totalCount || transformedData.length;

          setTotalCount(actualCount);
        } else {
          setNotifications([]);
          setTotalCount(0);
        }
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to fetch notifications',
        );
        setNotifications([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    },
    [itemsPerPage],
  );

  useEffect(() => {
    fetchNotifications(1, searchQuery);
  }, [fetchNotifications]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1);
      fetchNotifications(1, searchQuery);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, fetchNotifications]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedNotifications = useMemo(() => {
    const sorted = [...notifications].sort((a, b) => {
      let aValue: string | Date;
      let bValue: string | Date;

      if (sortField === 'date') {
        aValue = new Date(a.date);
        bValue = new Date(b.date);
      } else {
        aValue = a[sortField].toLowerCase();
        bValue = b[sortField].toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return sorted;
  }, [notifications, sortField, sortDirection]);

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      fetchNotifications(page, searchQuery);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const toggleDropdown = (notificationId: string) => {
    setOpenDropdown(openDropdown === notificationId ? null : notificationId);
  };

  const handleCreateNotification = async (data: {
    subject: string;
    body: string;
    image?: string;
  }) => {
    try {
      setCreateLoading(true);
      setCreateError(null);

      const response = await notificationService.createPushNotification({
        subject: data.subject,
        message: data.body,
        image: data.image,
      });

      setCreateSuccess(true);
      setIsCreateModalOpen(false);

      setCurrentPage(1);
      await fetchNotifications(1, searchQuery);

      notifyDataChange();
    } catch (error) {
      console.error('Error creating notification:', error);
      setCreateError(
        error instanceof Error
          ? error.message
          : 'Failed to create notification',
      );
    } finally {
      setCreateLoading(false);
    }
  };

  const handleUpdateNotification = async (data: {
    notificationId: string;
    subject: string;
    body: string;
    image?: string;
  }) => {
    try {
      setEditLoading(true);
      setEditError(null);

      const response = await notificationService.updatePushNotification({
        notificationId: data.notificationId,
        subject: data.subject,
        message: data.body,
        image: data.image,
      });

      setEditSuccess(true);
      setIsCreateModalOpen(false);
      setIsEditMode(false);
      setEditingNotification(null);

      await fetchNotifications(currentPage, searchQuery);

      notifyDataChange();
    } catch (error) {
      console.error('Error updating notification:', error);
      setEditError(
        error instanceof Error
          ? error.message
          : 'Failed to update notification',
      );
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      setDeleteLoading(notificationId);
      setDeleteError(null);

      const response = await notificationService.deletePushNotification({
        notificationId: notificationId,
      });

      setDeleteSuccess(true);

      const remainingItems = totalCount - 1;
      const maxPageAfterDelete = Math.ceil(remainingItems / itemsPerPage);

      let pageToLoad = currentPage;
      if (currentPage > maxPageAfterDelete && maxPageAfterDelete > 0) {
        pageToLoad = maxPageAfterDelete;
        setCurrentPage(pageToLoad);
      }

      await fetchNotifications(pageToLoad, searchQuery);

      notifyDataChange();
    } catch (error) {
      console.error('Error deleting notification:', error);
      setDeleteError(
        error instanceof Error
          ? error.message
          : 'Failed to delete notification',
      );
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleSelectUsers = () => {
    setIsSendModalOpen(false);
  };

  const handleSendToAll = () => {
    setIsSendModalOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const clickedOutside = Object.values(dropdownRefs.current).every(
        (ref) => !ref || !ref.contains(event.target as Node),
      );

      if (clickedOutside) {
        setOpenDropdown(null);
      }
    };

    if (openDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown]);

  const [selectedNotificationData, setSelectedNotificationData] = useState<{
    title: string;
    body: string;
  } | null>(null);

  const handleActionClick = (action: string, notificationId: string) => {
    setOpenDropdown(null);

    if (action === 'Send') {
      const notification = notifications.find((n) => n.id === notificationId);
      if (notification) {
        setSelectedNotificationData({
          title: notification.Subject,
          body: notification.notificationBody,
        });
        setIsSendModalOpen(true);
      }
    } else if (action === 'Delete') {
      handleDeleteNotification(notificationId);
    } else if (action === 'Edit') {
      const notification = notifications.find((n) => n.id === notificationId);
      if (notification) {
        setEditingNotification({
          id: notification.id,
          subject: notification.Subject,
          body: notification.notificationBody,
          image:
            notification.avatarUrl !== 'https://github.com/shadcn.png'
              ? notification.avatarUrl
              : undefined,
        });
        setIsEditMode(true);
        setIsCreateModalOpen(true);
      }
    }
  };

  const handleCloseSendModal = () => {
    setIsSendModalOpen(false);
    setSelectedNotificationData(null);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    setCreateError(null);
    setCreateSuccess(false);
    setEditError(null);
    setEditSuccess(false);
    setIsEditMode(false);
    setEditingNotification(null);
  };

  if (loading && notifications.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading notifications...</span>
        </div>
      </div>
    );
  }

  if (error && notifications.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-red-600">Error: {error}</p>
          <button
            onClick={() => fetchNotifications(currentPage, searchQuery)}
            className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      {createSuccess && (
        <div className="mb-4 rounded-md border border-green-200 bg-green-50 p-4">
          <div className="flex">
            <div className="text-sm text-green-800">
              Push notification created successfully!
            </div>
          </div>
        </div>
      )}

      {editSuccess && (
        <div className="mb-4 rounded-md border border-green-200 bg-green-50 p-4">
          <div className="flex">
            <div className="text-sm text-green-800">
              Push notification updated successfully!
            </div>
          </div>
        </div>
      )}

      {deleteSuccess && (
        <div className="mb-4 rounded-md border border-green-200 bg-green-50 p-4">
          <div className="flex">
            <div className="text-sm text-green-800">
              Push notification deleted successfully!
            </div>
          </div>
        </div>
      )}

      {createError && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-4">
          <div className="flex">
            <div className="text-sm text-red-800">Error: {createError}</div>
          </div>
        </div>
      )}

      {editError && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-4">
          <div className="flex">
            <div className="text-sm text-red-800">Error: {editError}</div>
          </div>
        </div>
      )}

      {deleteError && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-4">
          <div className="flex">
            <div className="text-sm text-red-800">Error: {deleteError}</div>
          </div>
        </div>
      )}

      <div className="mb-4 flex flex-col items-start justify-between gap-4 rounded-md bg-white px-5 py-5 md:flex-row md:items-center">
        <div className="flex items-center gap-4 ">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
            <input
              type="text"
              placeholder="Search notifications"
              value={searchQuery}
              onChange={handleSearch}
              className="focus:ring-primary-900 w-full rounded-md border border-[#D9D9D9] py-2 pl-10 pr-4 outline-none focus:ring-0 "
            />
          </div>
        </div>
        <div className="flex-shrink-0">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            disabled={createLoading}
            className="cursor-pointer whitespace-nowrap rounded-md border border-[#D9D9D9] px-4 py-2 outline-none transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {createLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating...
              </div>
            ) : (
              'Create New Notification'
            )}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table.Root
          variant="ghost"
          className="min-w-full border-collapse text-sm"
        >
          <Table.Header className="bg-primary-50">
            <Table.Row>
              <Th
                label="Image"
                sortField="id"
                currentSort={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
              <Th
                label="Subject"
                sortField="Subject"
                currentSort={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
              <Th
                label="Notification body"
                className="w-2/5"
                sortField="notificationBody"
                currentSort={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
              <Table.Cell className="w-20 px-4 py-2 text-left">
                Action
              </Table.Cell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {sortedNotifications.length > 0 ? (
              sortedNotifications.map((notification, index) => (
                <Table.Row key={notification.id}>
                  <Table.Cell className="whitespace-nowrap px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary-50 flex h-[48px] w-[48px] items-center justify-center rounded-full">
                        <Avatar
                          src={notification.avatarUrl}
                          fallback="N"
                          radius="full"
                          className="h-full w-full"
                        />
                      </div>
                      <div>
                        <p className="font-heading font-bold text-neutral-800">
                          {notification.id}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {notification.fullDate} • {notification.time}
                        </p>
                      </div>
                    </div>
                  </Table.Cell>
                  <Table.Cell className="px-4 py-4">
                    <div className="text-sm  text-gray-900">
                      {notification.Subject}
                    </div>
                  </Table.Cell>
                  <Table.Cell className="w-2/5 px-4 py-4">
                    <div className="text-sm leading-relaxed text-gray-700">
                      {notification.notificationBody}
                    </div>
                  </Table.Cell>
                  <Table.Cell className="w-20 px-4 py-4">
                    <div
                      className="relative"
                      ref={(el) =>
                        void (dropdownRefs.current[notification.id] = el)
                      }
                    >
                      <button
                        onClick={() => toggleDropdown(notification.id)}
                        className="cursor-pointer rounded-full p-2 transition-colors hover:bg-gray-100"
                        disabled={deleteLoading === notification.id}
                      >
                        {deleteLoading === notification.id ? (
                          <Loader2 className="h-4 w-4 animate-spin text-gray-600" />
                        ) : (
                          <MoreVertical className="h-4 w-4 text-gray-600" />
                        )}
                      </button>

                      {openDropdown === notification.id && (
                        <div className="absolute right-0 top-full z-10 mt-1 w-32 rounded-md border border-gray-200 bg-white shadow-lg">
                          <div className="py-1">
                            <button
                              onClick={() =>
                                handleActionClick('Send', notification.id)
                              }
                              className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                            >
                              <Send className="h-3 w-3" />
                              Send
                            </button>
                            <button
                              onClick={() =>
                                handleActionClick('Edit', notification.id)
                              }
                              className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                            >
                              <Edit className="h-3 w-3" />
                              Edit
                            </button>
                            <button
                              onClick={() =>
                                handleActionClick('Delete', notification.id)
                              }
                              disabled={deleteLoading === notification.id}
                              className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Trash2 className="h-3 w-3" />
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))
            ) : (
              <Table.Row>
                <Table.Cell
                  colSpan={4}
                  className="text-error-500 py-12 text-center font-bold"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading...
                    </div>
                  ) : (
                    'No Push Notifications Found'
                  )}
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Root>
      </div>

      <div className="mt-4 flex flex-col items-center gap-4 p-4 md:flex-row md:justify-between">
        <div className="text-sm text-gray-500">
          Showing data{' '}
          {Math.min((currentPage - 1) * itemsPerPage + 1, totalCount)} to{' '}
          {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount}{' '}
          entries
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Create/Edit Notification Modal */}
      <CreateNotificationModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onSubmit={handleCreateNotification}
        onUpdate={handleUpdateNotification}
        loading={createLoading || editLoading}
        mode={isEditMode ? 'edit' : 'create'}
        editData={editingNotification}
      />

      {/* Send Notification Modal */}
      <SendNotificationModal
        isOpen={isSendModalOpen}
        onClose={handleCloseSendModal}
        notificationData={selectedNotificationData}
      />
    </div>
  );
};

export default PushNotificationTable;

interface ThProps {
  label: string;
  className?: string;
  sortField?: SortField;
  currentSort?: SortField;
  sortDirection?: SortDirection;
  onSort?: (field: SortField) => void;
}

const Th: React.FC<ThProps> = ({
  label,
  className,
  sortField,
  currentSort,
  sortDirection,
  onSort,
}) => (
  <Table.Cell className={`px-4 py-2 text-left ${className || ''}`}>
    <div className="flex items-center gap-1">
      <span>{label}</span>
      {sortField && onSort && (
        <button onClick={() => onSort(sortField)} className="cursor-pointer">
          <CaretSortIcon />
        </button>
      )}
      {!sortField && <CaretSortIcon />}
    </div>
  </Table.Cell>
);
