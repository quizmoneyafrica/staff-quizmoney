'use client';
import React, {
  useState,
  useMemo,
  useCallback,
  memo,
  useEffect,
  useRef,
} from 'react';
import { Search, Loader2, UserCheck, UserX, MoreVertical } from 'lucide-react';
import { CaretSortIcon } from '@radix-ui/react-icons';
import { Avatar, Table } from '@radix-ui/themes';
import { toast } from 'sonner';
import classNames from 'classnames';
import {
  useAdmins,
  useUpdateAdminStatus,
  UpdateAdminStatusPayload,
} from '@/app/api/adminApi';
import type { AdminResponse } from '@/app/api/adminApi';
import { useDebounce } from '@/app/hooks/useDebounce';
import { formatDateTime } from '@/app/utils/utils';
import { useAppSelector } from '@/app/hooks/useAuth';

interface AdminUpdateData {
  adminType: 'ADMIN';
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password?: string;
  profileImage?: string;
}
import Pagination from '../leaderboard/Pagination';
import AddAdminModal from './AddAdminModal';
import AdminDetailsModal from './AdminDetailsModal';

interface AdminData extends Omit<AdminResponse, 'status'> {
  username: string;
  status: string;
  avatar?: string;
  accountType: string;
  registrationDate: string;
  email: string;
  id: string;
}

type SortField =
  | 'username'
  | 'email'
  | 'accountType'
  | 'registrationDate'
  | 'status';
type SortDirection = 'asc' | 'desc';

const mapApiToAdminData = (admin: AdminResponse): AdminData => {
  return {
    ...admin,
    username: `${admin.firstName} ${admin.lastName}`,
    status: admin.status,
    registrationDate: `${formatDateTime(admin.dateJoined).fullDate} ${
      formatDateTime(admin.dateJoined).time
    }`,
    accountType: admin.adminType,
    avatar: admin.avatarUrl,
    email: admin.emailAddress,
    id: admin.adminId,
  };
};

interface ActionDropdownProps {
  options: Array<{
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
    className?: string;
  }>;
}

const ActionDropdown: React.FC<ActionDropdownProps> = ({ options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOptionClick = (onClick: () => void) => {
    onClick();
    setIsOpen(false);
  };

  const calculatePosition = () => {
    if (!dropdownRef.current) return { top: 0, left: 0 };

    const rect = dropdownRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const dropdownHeight = options.length * 56 + 8;
    const dropdownWidth = 155;

    let top = rect.bottom + 4;
    let left = rect.right - dropdownWidth;

    if (top + dropdownHeight > viewportHeight) {
      top = rect.top - dropdownHeight - 4;
    }

    if (left < 8) {
      left = rect.left;
    }

    if (left + dropdownWidth > viewportWidth - 8) {
      left = viewportWidth - dropdownWidth - 8;
    }

    if (top < 8) {
      top = 8;
    }

    return { top, left };
  };

  const handleToggle = () => {
    if (!isOpen) {
      const newPosition = calculatePosition();
      setPosition(newPosition);
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="p-1.5 text-gray-500 transition-colors hover:text-gray-700 focus:outline-none"
        aria-label="More actions"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {isOpen && (
        <div
          className="fixed z-[9999] w-[155px] rounded-lg border border-[#E9E9E9] bg-white shadow-[4px_16px_40px_-4px_rgba(0,0,0,0.15)]"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
          }}
        >
          <div className="py-1">
            {options.map((option, index) => (
              <button
                key={`${option.label}-${index}`}
                onClick={() => handleOptionClick(option.onClick)}
                className={classNames(
                  'flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-gray-50',
                  option.className || 'text-gray-700',
                )}
              >
                {option.icon && (
                  <span className="flex-shrink-0">{option.icon}</span>
                )}
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface SearchHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onAddNewAdmin: () => void;
  addLoading: boolean;
  isLoading: boolean;
}

const SearchHeader = memo<SearchHeaderProps>(
  ({ searchQuery, onSearchChange, onAddNewAdmin, addLoading }) => {
    const user = useAppSelector((s) => s.auth.userEncryptedData);

    const handleSearchChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onSearchChange(e.target.value);
      },
      [onSearchChange],
    );

    return (
      <div className="mb-4 flex flex-col items-start justify-between gap-4 rounded-md bg-white px-5 py-5 md:flex-row md:items-center">
        <div className="flex items-center gap-4 ">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
            <input
              type="text"
              placeholder="Search Admin"
              value={searchQuery}
              onChange={handleSearchChange}
              className="focus:ring-primary-900 w-full rounded-md border border-[#D9D9D9] py-2 pl-10 pr-4 outline-none focus:ring-0 "
            />
          </div>
        </div>
        {user?.role === 'SUPER_ADMIN' && (
          <div className="flex-shrink-0">
            <button
              onClick={onAddNewAdmin}
              disabled={addLoading}
              className="cursor-pointer whitespace-nowrap rounded-md bg-[#1B4F72] px-4 py-2 text-white outline-none transition-colors hover:bg-[#154360] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {addLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Adding...
                </div>
              ) : (
                'Add New Admin'
              )}
            </button>
          </div>
        )}
      </div>
    );
  },
);

SearchHeader.displayName = 'SearchHeader';

const AdminManagementTable: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminData | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('username');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [addLoading, setAddLoading] = useState(false);
  const pageSize = 10;

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const { data, isLoading, refetch } = useAdmins({
    search: debouncedSearchQuery,
    page: currentPage - 1,
    size: pageSize,
  });

  const totalPages = data?.totalPages || 1;
  const totalElements = data?.totalElements;

  const updateStatusMutation = useUpdateAdminStatus();

  const handleAddAdmin = useCallback(() => {
    setIsAddModalOpen(true);
  }, []);

  const handleStatusToggle = useCallback(
    async (adminId: string, currentStatus) => {
      try {
        const newStatus = currentStatus === 'DEACTIVATED';
        await updateStatusMutation.mutateAsync(
          {
            adminId,
            activate: newStatus,
          },
          {
            onSuccess: () => {
              toast.success(
                `Admin ${newStatus ? 'activated' : 'deactivated'} successfully`,
              );
              refetch();
            },
            onError: (error: unknown) => {
              const errorMessage =
                error instanceof Error
                  ? error.message
                  : 'Failed to update admin status';
              toast.error(errorMessage);
              console.error('Error updating admin status:', error);
            },
          },
        );
      } catch (error) {
        toast.error('Failed to update admin status');
        console.error('Error updating admin status:', error);
      }
    },
    [updateStatusMutation, refetch],
  );

  const handleUpdateAdmin = useCallback(
    async (data: AdminUpdateData) => {
      if (!selectedAdmin) return;

      try {
        const updateData: UpdateAdminStatusPayload = {
          adminId: selectedAdmin.id,
          activate: selectedAdmin.status === 'Inactive',
        };

        await updateStatusMutation.mutateAsync(updateData);
        toast.success('Admin updated successfully');
        refetch();
        setIsDetailsModalOpen(false);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to update admin';
        toast.error(errorMessage);
        console.error('Error updating admin:', error);
      }
    },
    [refetch, updateStatusMutation, selectedAdmin],
  );

  const admins = useMemo(
    () => data?.content?.map(mapApiToAdminData) || [],
    [data],
  );

  const getActionOptions = useCallback(
    (admin: AdminData) => {
      return [
        // {
        //   label: 'View Details',
        //   onClick: () => {
        //     setSelectedAdmin(admin);
        //     setIsDetailsModalOpen(true);
        //   },
        //   icon: <Eye className="h-4 w-4" />,
        //   className: 'text-gray-700 hover:text-blue-600',
        // },
        ['ACTIVE', 'DEACTIVATED'].includes(admin?.status) && {
          label: admin.status === 'ACTIVE' ? 'Deactivate' : 'Activate',
          onClick: () => handleStatusToggle(admin.id, admin.status),
          icon:
            admin.status === 'ACTIVE' ? (
              <UserX className="h-4 w-4" />
            ) : (
              <UserCheck className="h-4 w-4" />
            ),
          className:
            admin.status === 'ACTIVE'
              ? 'text-red-600 hover:text-red-700'
              : 'text-green-600 hover:text-green-700',
        },
      ].filter(Boolean);
    },
    [handleStatusToggle],
  );

  if (isLoading && !data) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#0F4F80]" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SearchHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddNewAdmin={handleAddAdmin}
        addLoading={addLoading}
        isLoading={isLoading}
      />

      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-[#0F4F80]" />
        </div>
      ) : admins.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          No admins found. Try adjusting your search.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <Table.Root>
            <Table.Header>
              <Table.Row className="bg-gray-50">
                <Th
                  label="Name"
                  sortField="username"
                  currentSort={sortField}
                  sortDirection={sortDirection}
                  onSort={setSortField}
                />
                <Th
                  label="Email"
                  sortField="email"
                  currentSort={sortField}
                  sortDirection={sortDirection}
                  onSort={setSortField}
                />
                <Th
                  label="Account Type"
                  sortField="accountType"
                  currentSort={sortField}
                  sortDirection={sortDirection}
                  onSort={setSortField}
                />
                <Th
                  label="Registration Date"
                  sortField="registrationDate"
                  currentSort={sortField}
                  sortDirection={sortDirection}
                  onSort={setSortField}
                />
                <Th
                  label="Status"
                  sortField="status"
                  currentSort={sortField}
                  sortDirection={sortDirection}
                  onSort={setSortField}
                />
                <Table.ColumnHeaderCell className="w-12">
                  Actions
                </Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {admins.map((admin) => (
                <Table.Row key={admin.id}>
                  <Table.Cell className="space-x-2">
                    <Avatar
                      src={admin.avatar}
                      fallback={admin.username?.charAt(0)?.toUpperCase() || 'A'}
                      size="1"
                      radius="full"
                      className="border border-gray-200"
                    />
                    <span className="font-medium">{admin.username}</span>
                  </Table.Cell>
                  <Table.Cell className="text-gray-600">
                    {admin.email}
                  </Table.Cell>
                  <Table.Cell>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        admin.accountType === 'Super Admin'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {admin.accountType}
                    </span>
                  </Table.Cell>
                  <Table.Cell className="text-gray-600">
                    {admin.registrationDate}
                  </Table.Cell>
                  <Table.Cell>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        admin.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {admin.status}
                    </span>
                  </Table.Cell>
                  <Table.Cell className="text-right">
                    <div className="flex items-center justify-end">
                      <ActionDropdown options={getActionOptions(admin)} />
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </div>
      )}

      <div className="mt-6 flex flex-col items-center gap-4 p-4 md:flex-row md:justify-between">
        <div className="text-sm text-gray-500">
          Showing {admins.length} of {totalElements} entries
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      <AddAdminModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {selectedAdmin && (
        <AdminDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          onUpdate={handleUpdateAdmin}
          adminData={selectedAdmin}
          loading={updateStatusMutation.isPending}
        />
      )}
    </div>
  );
};

export default AdminManagementTable;

interface ThProps {
  label: string;
  className?: string;
  sortField?: SortField;
  currentSort?: SortField;
  sortDirection?: SortDirection;
  onSort?: (field: SortField) => void;
  children?: React.ReactNode;
}

const Th: React.FC<ThProps> = ({
  label,
  className = '',
  sortField,
  onSort,
  currentSort,
  sortDirection,
  children,
}) => {
  return (
    <Table.Cell className={`px-4 py-2 text-left ${className || ''}`}>
      <div className="flex items-center gap-1">
        <span>{label}</span>
        {sortField && onSort && (
          <button
            onClick={() => onSort(sortField)}
            className="cursor-pointer"
            aria-label={`Sort by ${label}`}
          >
            <CaretSortIcon />
          </button>
        )}
        {!sortField && <CaretSortIcon />}
      </div>
      {children}
    </Table.Cell>
  );
};
