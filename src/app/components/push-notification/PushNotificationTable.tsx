/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search,
  ListFilter,
  ChevronDown,
  MoreVertical,
  Send,
  Edit,
  Trash2,
} from 'lucide-react';
import { CaretSortIcon } from '@radix-ui/react-icons';
import { Avatar, Table } from '@radix-ui/themes';
import classNames from 'classnames';
import Link from 'next/link';
import Pagination from '../leaderboard/Pagination';
import CreateNotificationModal from './PushNotificationModal';
import SendNotificationModal from './SendNotificationModal';

interface StaticPushNotificationData {
  id: string;
  date: string;
  Subject: string;
  notificationBody: string;
  avatarUrl: string;
}

type SortField = 'id' | 'Subject' | 'notificationBody' | 'date';
type SortDirection = 'asc' | 'desc';

const PushNotificationTable = () => {
  const [notifications, setNotifications] = useState<
    StaticPushNotificationData[]
  >([
    {
      id: 'ID1234567',
      date: '21/02/2024 09:00',
      Subject: 'Update on the app',
      notificationBody:
        'Quiz money app has been updated. Download version 2.0.1',
      avatarUrl: 'https://github.com/shadcn.png',
    },
    {
      id: 'ID1234568',
      date: '21/02/2024 10:30',
      Subject: 'New Quiz Available',
      notificationBody:
        'A new quiz has been added to your favorite category. Play now!',
      avatarUrl: 'https://github.com/shadcn.png',
    },
    {
      id: 'ID1234569',
      date: '20/02/2024 14:15',
      Subject: 'Weekly Leaderboard',
      notificationBody:
        "Check out this week's top performers and see where you rank!",
      avatarUrl: 'https://github.com/shadcn.png',
    },
    {
      id: 'ID1234570',
      date: '19/02/2024 16:45',
      Subject: 'Maintenance Notice',
      notificationBody:
        'Scheduled maintenance will occur tonight from 2-4 AM. Sorry for any inconvenience.',
      avatarUrl: 'https://github.com/shadcn.png',
    },
    {
      id: 'ID1234571',
      date: '18/02/2024 11:20',
      Subject: 'Prize Alert',
      notificationBody:
        "Congratulations! You've won a prize in yesterday's tournament.",
      avatarUrl: 'https://github.com/shadcn.png',
    },
    {
      id: 'ID1234572',
      date: '17/02/2024 08:30',
      Subject: 'Feature Update',
      notificationBody:
        'New features added: Dark mode and offline quiz capability.',
      avatarUrl: 'https://github.com/shadcn.png',
    },
    {
      id: 'ID1234573',
      date: '16/02/2024 13:00',
      Subject: 'Daily Challenge',
      notificationBody:
        'Your daily challenge is ready. Complete it before midnight!',
      avatarUrl: 'https://github.com/shadcn.png',
    },
    {
      id: 'ID1234574',
      date: '15/02/2024 19:15',
      Subject: 'Community Update',
      notificationBody:
        'Join our community forum to discuss strategies and tips with other players.',
      avatarUrl: 'https://github.com/shadcn.png',
    },
  ]);

  const [currentPage, setCurrentPage] = useState(1);
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
  const itemsPerPage = 7;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const parseDate = (dateString: string) => {
    // Parse date format "DD/MM/YYYY HH:MM"
    const [datePart, timePart] = dateString.split(' ');
    const [day, month, year] = datePart.split('/');
    const [hours, minutes] = timePart.split(':');
    return new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hours),
      parseInt(minutes),
    );
  };

  const filteredNotifications = useMemo(() => {
    const filtered = notifications.filter((notification) => {
      const matchesSearch =
        searchQuery === '' ||
        notification.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notification.Subject.toLowerCase().includes(
          searchQuery.toLowerCase(),
        ) ||
        notification.notificationBody
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      return matchesSearch;
    });

    filtered.sort((a, b) => {
      let aValue: string | Date;
      let bValue: string | Date;

      if (sortField === 'date') {
        aValue = parseDate(a[sortField]);
        bValue = parseDate(b[sortField]);
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

    return filtered;
  }, [notifications, searchQuery, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredNotifications.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const toggleDropdown = (notificationId: string) => {
    setOpenDropdown(openDropdown === notificationId ? null : notificationId);
  };

  const handleCreateNotification = (data: {
    subject: string;
    body: string;
  }) => {
    const newNotification: StaticPushNotificationData = {
      id: `ID${Date.now()}`,
      date: new Date().toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      Subject: data.subject,
      notificationBody: data.body,
      avatarUrl: 'https://github.com/shadcn.png',
    };

    setNotifications((prev) => [newNotification, ...prev]);
    console.log('New notification created:', newNotification);
  };

  const handleSelectUsers = () => {
    console.log(
      'Select users clicked for notification:',
      selectedNotificationId,
    );
    setIsSendModalOpen(false);
  };

  const handleSendToAll = () => {
    console.log(
      'Send to all users clicked for notification:',
      selectedNotificationId,
    );
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
    console.log(`${action} clicked for notification:`, notificationId);
    setOpenDropdown(null);

    if (action === 'Send') {
      // Find the notification data
      const notification = notifications.find((n) => n.id === notificationId);
      if (notification) {
        setSelectedNotificationData({
          title: notification.Subject,
          body: notification.notificationBody,
        });
        setIsSendModalOpen(true);
      }
    }
  };

  const handleCloseSendModal = () => {
    setIsSendModalOpen(false);
    setSelectedNotificationData(null);
  };

  return (
    <div className="">
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
            className="cursor-pointer whitespace-nowrap rounded-md border border-[#D9D9D9] px-4 py-2 outline-none transition-colors hover:bg-gray-50"
          >
            Create New Notification
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
            {currentData.length > 0 ? (
              currentData.map((notification, index) => (
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
                          {notification.date}
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
                      >
                        <MoreVertical className="h-4 w-4 text-gray-600" />
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
                              className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
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
                  No Push Notifications Found
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Root>
      </div>

      <div className="mt-4 flex flex-col items-center gap-4 p-4 md:flex-row md:justify-between">
        <div className="text-sm text-gray-500">
          Showing data {startIndex + 1} to{' '}
          {Math.min(endIndex, filteredNotifications.length)} of{' '}
          {filteredNotifications.length} entries
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Create Notification Modal */}
      <CreateNotificationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateNotification}
      />

      {/* Send Notification Modal */}
      <SendNotificationModal
        isOpen={isSendModalOpen}
        onClose={handleCloseSendModal}
        notificationData={selectedNotificationData}
      />
      {/* <SendNotificationModal
        isOpen={isSendModalOpen}
        onClose={() => setIsSendModalOpen(false)}
        onSelectUsers={handleSelectUsers}
        onSendToAll={handleSendToAll}
      /> */}
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
