'use client';
import React, { useState, useMemo, useCallback, memo, useEffect } from 'react';
import { Search, Loader2, Eye, UserCheck, UserX } from 'lucide-react';
import { CaretSortIcon } from '@radix-ui/react-icons';
import { Avatar, Table } from '@radix-ui/themes';
import { toast } from 'sonner';
import {
  useAdmins,
  useUpdateAdminStatus,
  useCreateAdmin,
  UpdateAdminStatusPayload,
} from '@/app/api/adminApi';
import type { AdminResponse } from '@/app/api/adminApi';

interface AdminUpdateData {
  adminType: 'Super Admin' | 'Sub Admin';
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
  status: 'Active' | 'Inactive';
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
    status: admin.status === 'ACTIVE' ? 'Active' : 'Inactive',
    registrationDate: new Date(admin.dateJoined).toLocaleDateString(),
    accountType: admin.adminType === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin',
    avatar: admin.avatarUrl,
    email: admin.emailAddress,
    id: admin.adminId,
  };
};

interface AdminManagementTableProps {
  onDataChange?: () => void;
}

interface SearchHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onAddNewAdmin: () => void;
  addLoading: boolean;
  isFetching: boolean;
}

const SearchHeader = memo<SearchHeaderProps>(
  ({ searchQuery, onSearchChange, onAddNewAdmin, addLoading }) => {
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
      </div>
    );
  },
);

SearchHeader.displayName = 'SearchHeader';

const AdminManagementTable: React.FC<AdminManagementTableProps> = ({
  onDataChange,
}: AdminManagementTableProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminData | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('username');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [addLoading, setAddLoading] = useState(false);
  const pageSize = 10;

  const { data, isFetching, refetch } = useAdmins({
    search: searchQuery,
    page: currentPage - 1,
    size: pageSize,
    status: 'ACTIVE',
  });

  const updateStatusMutation = useUpdateAdminStatus();
  const createAdminMutation = useCreateAdmin();

  const handleAddAdmin = useCallback(() => {
    setIsAddModalOpen(true);
  }, []);

  const handleCreateAdmin = useCallback(
    async (formData: {
      adminType: 'Super Admin' | 'Sub Admin';
      firstName: string;
      lastName: string;
      email: string;
      phoneNumber: string;
      password: string;
      profileImage?: string;
    }) => {
      try {
        const adminType =
          formData.adminType === 'Super Admin' ? 'ADMIN' : 'USER';

        let phoneNumber = formData.phoneNumber?.trim() || '';
        if (phoneNumber.startsWith('0')) {
          phoneNumber = `+234${phoneNumber.substring(1)}`;
        } else if (phoneNumber && !phoneNumber.startsWith('+')) {
          phoneNumber = `+234${phoneNumber}`;
        }

        const adminData = {
          adminType,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          emailAddress: formData.email,
          phoneNumber: phoneNumber.replace(/[^0-9+]/g, ''),
          password: formData.password,
          ...(formData.profileImage && { profileImage: formData.profileImage }),
        };

        console.log('Creating admin with data:', adminData);
        await createAdminMutation.mutateAsync(adminData);
        setIsAddModalOpen(false);
        refetch();
        onDataChange?.();
        toast.success('Admin created successfully');
      } catch (error) {
        console.error('Error creating admin:', error);
        toast.error(error?.response?.data?.message || 'Failed to create admin');
      }
    },
    [createAdminMutation, refetch, onDataChange],
  );

  const handleStatusToggle = useCallback(
    async (adminId: string, currentStatus: 'Active' | 'Inactive') => {
      try {
        const newStatus = currentStatus === 'Inactive';
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

  const totalPages = data?.totalPages || 1;

  const filteredAdmins = useMemo(() => {
    if (!admins) return [];
    return admins.filter(
      (admin) =>
        admin.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        '' ||
        admin.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        '',
    );
  }, [admins, searchQuery]);

  const sortedAdmins = useMemo(() => {
    if (!filteredAdmins) return [];

    return [...filteredAdmins].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'username':
          comparison = (a.username || '').localeCompare(b.username || '');
          break;
        case 'email':
          comparison = (a.email || '').localeCompare(b.email || '');
          break;
        case 'accountType':
          comparison = (a.accountType || '').localeCompare(b.accountType || '');
          break;
        case 'registrationDate':
          comparison =
            new Date(a.registrationDate).getTime() -
            new Date(b.registrationDate).getTime();
          break;
        case 'status':
          comparison = (a.status || '').localeCompare(b.status || '');
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredAdmins, sortField, sortDirection]);

  if (isFetching && !data) {
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
        isFetching={isFetching}
      />

      {isFetching ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-[#0F4F80]" />
        </div>
      ) : filteredAdmins.length === 0 ? (
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
              {sortedAdmins.map((admin) => (
                <Table.Row key={admin.id}>
                  <Table.Cell className="flex items-center gap-3">
                    <Avatar
                      src={admin.avatar}
                      fallback={admin.username?.charAt(0)?.toUpperCase() || 'A'}
                      size="2"
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
                        admin.status === 'Active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {admin.status}
                    </span>
                  </Table.Cell>
                  <Table.Cell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedAdmin(admin);
                          setIsDetailsModalOpen(true);
                        }}
                        className="p-1.5 text-gray-500 transition-colors hover:text-gray-700"
                        title="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() =>
                          handleStatusToggle(admin.id, admin.status)
                        }
                        className={`p-1.5 transition-colors ${
                          admin.status === 'Active'
                            ? 'text-red-500 hover:text-red-700'
                            : 'text-green-500 hover:text-green-700'
                        }`}
                        title={
                          admin.status === 'Active' ? 'Deactivate' : 'Activate'
                        }
                        disabled={updateStatusMutation.isPending}
                      >
                        {admin.status === 'Active' ? (
                          <UserX className="h-4 w-4" />
                        ) : (
                          <UserCheck className="h-4 w-4" />
                        )}
                      </button>
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
          Showing {filteredAdmins.length} of {admins.length} entries
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
        onSubmit={handleCreateAdmin}
      />

      {selectedAdmin && (
        <AdminDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          onUpdate={handleUpdateAdmin}
          adminData={{
            ...selectedAdmin,

            accountType:
              selectedAdmin.accountType === 'Super Admin'
                ? 'Super Admin'
                : 'Sub Admin',

            firstName:
              selectedAdmin.firstName || selectedAdmin.username.split(' ')[0],
            lastName:
              selectedAdmin.lastName ||
              selectedAdmin.username.split(' ')[1] ||
              '',
          }}
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
