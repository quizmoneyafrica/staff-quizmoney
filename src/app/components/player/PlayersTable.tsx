/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import React, { useState, useMemo } from 'react';
import { Search, ListFilter, ChevronDown } from 'lucide-react';
import { CaretSortIcon } from '@radix-ui/react-icons';
import { Avatar, Table } from '@radix-ui/themes';
import classNames from 'classnames';
import Link from 'next/link';
import Pagination from '../leaderboard/Pagination';

import CustomImage from '@/app/components/CustomImage';
import { useSelector } from 'react-redux';
import { Player, selectPlayers } from '@/app/store/playersSlice';

type SortField =
  | 'objectId'
  | 'firstName'
  | 'email'
  | 'accountType'
  | 'createdAt';
type SortDirection = 'asc' | 'desc';

const PlayersTable = () => {
  const { playersData } = useSelector(selectPlayers);
  const players: Player[] = playersData?.data ?? [];
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAccountType, setSelectedAccountType] = useState<string | null>(
    null,
  );
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const itemsPerPage = 7;

  const filteredAndSortedPlayers = useMemo(() => {
    let filtered = players.filter((player) => {
      const matchesSearch =
        searchQuery === '' ||
        player.objectId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        player.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        player.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesAccountType =
        !selectedAccountType ||
        player.accountType.toLowerCase() === selectedAccountType.toLowerCase();

      return matchesSearch && matchesAccountType;
    });

    if (sortField) {
      filtered = [...filtered].sort((a, b) => {
        let aValue: string | number | Date;
        let bValue: string | number | Date;

        switch (sortField) {
          case 'objectId':
            aValue = a.objectId.toLowerCase();
            bValue = b.objectId.toLowerCase();
            break;
          case 'firstName':
            aValue = a.firstName.toLowerCase();
            bValue = b.firstName.toLowerCase();
            break;
          case 'email':
            aValue = a.email.toLowerCase();
            bValue = b.email.toLowerCase();
            break;
          case 'accountType':
            aValue = a.accountType.toLowerCase();
            bValue = b.accountType.toLowerCase();
            break;
          case 'createdAt':
            aValue = new Date(a.createdAt.iso);
            bValue = new Date(b.createdAt.iso);
            break;
          default:
            return 0;
        }

        if (aValue < bValue) {
          return sortDirection === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortDirection === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [players, searchQuery, selectedAccountType, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredAndSortedPlayers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredAndSortedPlayers.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleFilterSelect = (accountType: string | null) => {
    setSelectedAccountType(accountType);
    setIsFilterOpen(false);
    setCurrentPage(1);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  return (
    <div className="">
      <div className="mb-4 flex flex-col items-start justify-between gap-4 rounded-md bg-white px-5 py-5 md:flex-row md:items-center">
        <div className="flex items-center gap-4 ">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
            <input
              type="text"
              placeholder="Search by ID, name or email"
              value={searchQuery}
              onChange={handleSearch}
              className="focus:ring-primary-900 w-full rounded-md border border-[#D9D9D9] py-2 pl-10 pr-4 outline-none focus:ring-0 "
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex cursor-pointer items-center gap-1 rounded-md border border-[#D9D9D9] px-4 py-2 outline-none"
            >
              <ListFilter className="size-5 text-[#1B212D]" />
              <span className="hidden md:block">Filter by</span>
              <ChevronDown className="size-4 text-[#1B212D]" />
            </button>

            {isFilterOpen && (
              <div className="absolute right-0 z-10 mt-2 w-48 rounded-md border border-gray-200 bg-white shadow-lg">
                <div className="py-1">
                  <button
                    onClick={() => handleFilterSelect(null)}
                    className={classNames(
                      'w-full px-4 py-2 text-left text-sm hover:bg-gray-100',
                      !selectedAccountType && 'bg-gray-50',
                    )}
                  >
                    All
                  </button>
                  <button
                    onClick={() => handleFilterSelect('user')}
                    className={classNames(
                      'w-full px-4 py-2 text-left text-sm hover:bg-gray-100',
                      selectedAccountType === 'user' && 'bg-gray-50',
                    )}
                  >
                    User
                  </button>
                  <button
                    onClick={() => handleFilterSelect('admin')}
                    className={classNames(
                      'w-full px-4 py-2 text-left text-sm hover:bg-gray-100',
                      selectedAccountType === 'admin' && 'bg-gray-50',
                    )}
                  >
                    Admin
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex-shrink-0">
          <button className="cursor-pointer whitespace-nowrap rounded-md border border-[#D9D9D9] px-4 py-2 outline-none">
            Export CSV
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
                label="User ID"
                sortField="objectId"
                currentSortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
              <Th
                label="Username"
                sortField="firstName"
                currentSortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
              <Th
                label="Email address"
                sortField="email"
                currentSortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
              <Th
                label="Account Type"
                sortField="accountType"
                currentSortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
              <Th
                label="Date of Registration"
                sortField="createdAt"
                currentSortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
              <Table.Cell className="px-4 py-2 text-left">Action</Table.Cell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {currentData.length > 0 ? (
              currentData.map((player, index) => (
                <Table.Row key={player.objectId} className="cursor-pointer">
                  <Table.Cell className="whitespace-nowrap px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-[48px] w-[48px] items-center justify-center rounded-full bg-neutral-50">
                        {startIndex + index + 1}
                      </div>
                      <div>
                        <p className="font-heading font-bold uppercase text-neutral-800">
                          {player.objectId}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {new Date(player.createdAt.iso).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </Table.Cell>
                  <Table.Cell className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="bg-primary-50 flex h-[40px] w-[40px] items-center justify-center rounded-full p-1">
                        <Avatar
                          src=""
                          fallback={player.firstName?.charAt(0).toUpperCase()}
                          radius="full"
                          className="bg-primary-50"
                        />
                      </div>
                      <p className="text-primary-800 capitalize">
                        {player.firstName}
                      </p>
                    </div>
                  </Table.Cell>
                  <Table.Cell className="px-4 py-4">
                    <div className="text-sm text-gray-900">{player.email}</div>
                  </Table.Cell>
                  <Table.Cell className="px-4 py-4">
                    <p
                      className={`font-heading w-fit rounded-full px-4 py-2 text-center capitalize ${
                        player.accountType === 'admin'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {player.accountType}
                    </p>
                  </Table.Cell>
                  <Table.Cell className="px-4 py-4 text-sm text-gray-500">
                    {new Date(player.createdAt.iso).toLocaleDateString()}
                  </Table.Cell>
                  <Table.Cell className="px-4 py-4 text-sm font-medium">
                    <Link
                      href={`/players/player-profile/${player.objectId}`}
                      className="text-blue-900"
                    >
                      View Details
                    </Link>
                  </Table.Cell>
                </Table.Row>
              ))
            ) : (
              <Table.Row>
                <Table.Cell
                  colSpan={6}
                  className="text-error-500 py-12 text-center font-bold"
                >
                  No Players Found
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Root>
      </div>

      <div className="mt-4 flex flex-col items-center gap-4 p-4 md:flex-row md:justify-between">
        <div className="text-sm text-gray-500">
          Showing data {startIndex + 1} to{' '}
          {Math.min(endIndex, filteredAndSortedPlayers.length)} of{' '}
          {filteredAndSortedPlayers.length} entries
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default PlayersTable;

interface ThProps {
  label: string;
  sortField: SortField;
  currentSortField: SortField | null;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
}

const Th: React.FC<ThProps> = ({
  label,
  sortField,
  currentSortField,
  sortDirection,
  onSort,
}) => (
  <Table.Cell className="px-4 py-2 text-left">
    <div
      className="flex cursor-pointer items-center gap-1"
      onClick={() => onSort(sortField)}
    >
      <span>{label}</span>
      <CaretSortIcon />
    </div>
  </Table.Cell>
);
