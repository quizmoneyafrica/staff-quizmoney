/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import { Search, X } from 'lucide-react';
import { CaretSortIcon } from '@radix-ui/react-icons';
import { Avatar, Table } from '@radix-ui/themes';
import classNames from 'classnames';
import Link from 'next/link';
import {
  useQueryState,
  parseAsString,
  parseAsStringEnum,
  parseAsInteger,
} from 'nuqs';
import { useRouter, useSearchParams } from 'next/navigation';
import Pagination from '../leaderboard/Pagination';
import { useSelector, useDispatch } from 'react-redux';
import {
  Player,
  selectPlayers,
  setCurrentPage,
  setSearchQuery,
  setSelectedAccountType,
  setSelectedTimeRange,
  setCustomDateRange,
  setDateRange,
  resetFilters,
  setExportLoading,
} from '@/app/store/playersSlice';
import { formatDateTime } from '@/app/utils/utils';
import { serializeDateRange, isValidDateRange } from '@/app/utils/dateUtils';
import PlayersApi from '@/app/api/playersApi';
import TimeRangeDropdown from '@/app/components/common/TimeRangeDropdown';
import { calculateDateRange } from '@/app/utils/date-range';
import { VerifiedIcon } from '@/app/icons/icons';
import { useAppSelector } from '@/app/hooks/useAuth';
import { convertToLocaleString } from '@/app/utils';

type SortField =
  | 'objectId'
  | 'firstName'
  | 'email'
  | 'accountType'
  | 'createdAt';
type SortDirection = 'asc' | 'desc';

interface ExportParams {
  accountType?: string;
  search?: string;
  dateRange?: { start: string; end: string } | null;
}

const PlayersTable = () => {
  const dispatch = useDispatch();
  const {
    playersData,
    isLoading,
    isExporting,
    currentPage,
    searchQuery,
    selectedAccountType,
    selectedTimeRange,
    customDateRange,
  } = useSelector(selectPlayers);

  const handleExportCSV = useCallback(async () => {
    try {
      dispatch(setExportLoading(true));

      const exportParams: ExportParams = {};

      if (selectedAccountType) {
        exportParams.accountType = selectedAccountType;
      }

      if (searchQuery) {
        exportParams.search = searchQuery;
      }

      const currentDateRange =
        customDateRange ||
        (selectedTimeRange !== 'All Time'
          ? calculateDateRange(selectedTimeRange, null)
          : null);

      if (currentDateRange) {
        exportParams.dateRange = currentDateRange;
      }

      const response = await PlayersApi.exportPlayersData(exportParams);

      if (response.data.result) {
        const blob = new Blob([response.data.result.csvData], {
          type: 'text/csv;charset=utf-8;',
        });

        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute(
          'download',
          response.data.result.filename || 'players_export.csv',
        );
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting CSV:', error);
    } finally {
      dispatch(setExportLoading(false));
    }
  }, [
    dispatch,
    selectedAccountType,
    searchQuery,
    customDateRange,
    selectedTimeRange,
  ]);

  const players: Player[] = playersData?.data ?? [];

  const totalPages = playersData?.pagination?.totalPages || 0;
  const totalItems = playersData?.pagination?.totalItems || 0;
  const currentLimit = playersData?.pagination?.limit || 10;
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [sortField, setSortField] = useQueryState<SortField | null>(
    'sortField',
    parseAsStringEnum<SortField>([
      'objectId',
      'firstName',
      'email',
      'accountType',
      'createdAt',
    ]).withDefault(null),
  );

  const [sortDirection, setSortDirection] = useQueryState<SortDirection>(
    'sortDirection',
    parseAsStringEnum<SortDirection>(['asc', 'desc']).withDefault('asc'),
  );

  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));

  const [urlAccountType, setUrlAccountType] = useQueryState(
    'accountType',
    parseAsString.withDefault(''),
  );

  const [urlTimeRange, setUrlTimeRange] = useQueryState(
    'timeRange',
    parseAsString.withDefault('All Time'),
  );

  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchParam, setSearchParam] = useQueryState('search');
  const [localSearchValue, setLocalSearchValue] = useState(searchParam || '');
  const [cursorPosition, setCursorPosition] = useState<number>(0);
  const router = useRouter();
  const searchParams = useSearchParams();

  const user = useAppSelector((s) => s.auth.userEncodedData);

  const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const filterDropdownRef = useRef<HTMLDivElement>(null);

  const timeRangeOptions = ['All Time', 'This week', 'Last 30 days', 'Custom'];

  useEffect(() => {
    const hasUrlParams = searchParams.toString().length > 0;

    if (!hasUrlParams) {
      dispatch(resetFilters());
      dispatch(setSelectedTimeRange('All Time'));
      dispatch(setDateRange(null));
    } else {
      if (urlAccountType) {
        dispatch(setSelectedAccountType(urlAccountType));
      }
      if (urlTimeRange) {
        dispatch(setSelectedTimeRange(urlTimeRange));
      }
      if (page) {
        dispatch(setCurrentPage(page));
      }
    }
  }, [dispatch, searchParams, urlAccountType, urlTimeRange, page]);

  useEffect(() => {
    if (searchParam !== localSearchValue) {
      setLocalSearchValue(searchParam || '');
      dispatch(setSearchQuery(searchParam || ''));
    }
  }, [searchParam]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (localSearchValue !== searchParam) {
        setSearchParam(localSearchValue || null);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [localSearchValue, searchParam, setSearchParam]);

  const maintainFocus = useCallback(() => {
    if (
      searchInputRef.current &&
      document.activeElement === searchInputRef.current
    ) {
      if (focusTimeoutRef.current) {
        clearTimeout(focusTimeoutRef.current);
      }

      const currentPosition = searchInputRef.current.selectionStart || 0;
      setCursorPosition(currentPosition);

      const restoreFocus = () => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
          searchInputRef.current.setSelectionRange(
            currentPosition,
            currentPosition,
          );
        }
      };

      restoreFocus();
      focusTimeoutRef.current = setTimeout(restoreFocus, 0);
      requestAnimationFrame(restoreFocus);
    }
  }, [cursorPosition]);

  const handleInputFocus = useCallback(() => {
    maintainFocus();
  }, [maintainFocus]);

  const handleInputSelect = useCallback(() => {
    if (searchInputRef.current) {
      setCursorPosition(searchInputRef.current.selectionStart || 0);
    }
  }, []);

  const handleTimeRangeChange = useCallback(
    async (range: string) => {
      await setUrlTimeRange(range);
      await setPage(1);
      dispatch(setSelectedTimeRange(range));
      dispatch(setCurrentPage(1));

      if (range === 'Custom') {
        return;
      }

      const dateRange =
        range !== 'All Time' ? calculateDateRange(range, null) : null;
      if (dateRange) {
        dispatch(setDateRange(dateRange));
        dispatch(setCustomDateRange(dateRange));
      }
    },
    [dispatch, setUrlTimeRange, setPage],
  );

  const handleTimeRangeSelect = useCallback(
    (range: string) => {
      handleTimeRangeChange(range);
    },
    [handleTimeRangeChange],
  );

  const handlePageChange = useCallback(
    async (newPage: number) => {
      await setPage(newPage);
      dispatch(setCurrentPage(newPage));
    },
    [dispatch, setPage],
  );

  const handleClearSearch = useCallback(() => {
    setSearchParam('');
    setLocalSearchValue('');
    dispatch(setSearchQuery(''));
    dispatch(setCurrentPage(1));
    setPage(1);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [dispatch, setSearchParam, setPage]);

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      const cursorPos = e.target.selectionStart || 0;
      setSearchParam(value);
      setLocalSearchValue(value);
      setCursorPosition(cursorPos);
      dispatch(setSearchQuery(value));
      dispatch(setCurrentPage(1));
      setPage(1);
    },
    [dispatch, setSearchParam, setPage],
  );

  const handleSort = useCallback(
    async (field: SortField) => {
      if (sortField === field) {
        const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        await setSortDirection(newDirection);
      } else {
        await setSortField(field);
        await setSortDirection('asc');
      }
      dispatch(setCurrentPage(1));
      await setPage(1);
    },
    [
      sortField,
      sortDirection,
      setSortField,
      setSortDirection,
      setPage,
      dispatch,
    ],
  );

  const handleCustomDateChange = useCallback(
    (dateRange: { startDate: Date; endDate: Date } | null) => {
      if (!dateRange) {
        dispatch(setCustomDateRange(null));
        return;
      }

      const standardFormat = {
        start: dateRange.startDate.toISOString(),
        end: dateRange.endDate.toISOString(),
      };

      if (isValidDateRange(standardFormat)) {
        const serializedRange = serializeDateRange(standardFormat);
        setUrlTimeRange('Custom');
        dispatch(setCustomDateRange(serializedRange));
        dispatch(setDateRange(serializedRange));
      } else {
        console.error('Invalid date range received:', dateRange);
        setUrlTimeRange('All Time');
        dispatch(setCustomDateRange(null));
        dispatch(setDateRange(null));
      }
    },
    [dispatch, setUrlTimeRange],
  );

  const handleFilterSelect = useCallback(
    (type: string | null) => {
      setUrlAccountType(type || null);
      setPage(1);
      dispatch(setSelectedAccountType(type || ''));
      dispatch(setCurrentPage(1));
      setIsFilterOpen(false);
    },
    [dispatch, setUrlAccountType, setPage],
  );
  const sortedPlayers = React.useMemo(() => {
    if (!sortField) return players;

    return [...players].sort((a, b) => {
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
  }, [players, sortField, sortDirection]);

  const startItem = Math.max(1, (currentPage - 1) * currentLimit + 1);
  const endItem = Math.min(currentPage * currentLimit, totalItems);

  const customDateRangeForDropdown = useMemo(() => {
    if (!customDateRange) return null;
    return {
      startDate: new Date(customDateRange.start),
      endDate: new Date(customDateRange.end),
    };
  }, [customDateRange]);

  return (
    <div className="">
      <div className="mb-4 flex flex-col items-start justify-between gap-4 rounded-md bg-white px-5 py-5 md:flex-row md:items-center">
        <div className="flex items-center gap-4 ">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search by ID, name or email"
              value={localSearchValue}
              onChange={handleSearch}
              onFocus={handleInputFocus}
              onSelect={handleInputSelect}
              onKeyUp={handleInputSelect}
              onClick={handleInputSelect}
              className="focus:ring-primary-900 w-full rounded-md border border-[#D9D9D9] py-2 pl-10 pr-10 outline-none focus:ring-0"
            />
            {localSearchValue && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {/* <div className="relative" ref={filterDropdownRef}>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              disabled={isLoading}
              className={classNames(
                'flex cursor-pointer items-center gap-1 rounded-md border border-[#D9D9D9] px-4 py-2 outline-none',
                isLoading && 'cursor-not-allowed opacity-50',
              )}
            >
              <ListFilter className="size-5 text-[#1B212D]" />
              <span className="hidden md:block">Filter by</span>
              <ChevronDown className="size-4 text-[#1B212D]" />
            </button>

            {isFilterOpen && !isLoading && (
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
          </div> */}
        </div>

        <div className="flex items-center gap-4">
          <TimeRangeDropdown
            options={timeRangeOptions}
            selected={selectedTimeRange}
            onSelect={handleTimeRangeSelect}
            customDateRange={customDateRangeForDropdown}
            onCustomDateChange={handleCustomDateChange}
          />

          {['SUPER_ADMIN', 'MANAGER'].includes(user?.role) && (
            <button
              onClick={handleExportCSV}
              disabled={isLoading || isExporting}
              className={classNames(
                'cursor-pointer whitespace-nowrap rounded-md border border-[#D9D9D9] px-4 py-2 outline-none',
                (isLoading || isExporting) && 'cursor-not-allowed opacity-50',
              )}
            >
              {isExporting ? 'Exporting...' : 'Export CSV'}
            </button>
          )}
        </div>
      </div>

      <div className="relative min-h-[400px] rounded-md bg-white">
        {isLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center rounded-md bg-white bg-opacity-75 backdrop-blur-sm">
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
              <span className="text-sm font-medium text-gray-700">
                Loading players...
              </span>
            </div>
          </div>
        )}

        <div
          className={classNames(
            'overflow-x-auto transition-opacity duration-200',
            isLoading && 'opacity-30',
          )}
        >
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
                  disabled={isLoading}
                />
                <Th
                  label="Username"
                  sortField="firstName"
                  currentSortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  disabled={isLoading}
                />
                <Th
                  label="Email address"
                  sortField="email"
                  currentSortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  disabled={isLoading}
                />
                {/* <Th
                  label="Account Type"
                  sortField="accountType"
                  currentSortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  disabled={isLoading}
                /> */}
                <Th
                  label="Date of Registration"
                  sortField="createdAt"
                  currentSortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  disabled={isLoading}
                />
                <Table.Cell className="px-4 py-2 text-left">Action</Table.Cell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {!isLoading && sortedPlayers.length > 0 ? (
                sortedPlayers.map((player, index) => {
                  const { time, fullDate } = formatDateTime(
                    player.createdAt.iso,
                  );

                  return (
                    <Table.Row key={player.objectId} className="cursor-pointer">
                      <Table.Cell className="whitespace-nowrap px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex h-[48px] w-[48px] items-center justify-center rounded-full bg-neutral-50">
                            {startItem + index}
                          </div>
                          <div>
                            <p className="font-heading font-bold uppercase text-neutral-800">
                              {player.objectId}
                            </p>
                            <p className="text-xs text-neutral-500">
                              {fullDate} • {time}
                            </p>
                          </div>
                        </div>
                      </Table.Cell>
                      <Table.Cell className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="bg-primary-50 relative flex h-[40px] w-[40px] items-center justify-center rounded-full p-1">
                            <Avatar
                              src={player.avatar || ''}
                              fallback={player.firstName
                                ?.charAt(0)
                                .toUpperCase()}
                              radius="full"
                              className="bg-primary-50"
                            />
                            {player?.kycVerified && (
                              <div className="absolute -right-2 top-0 rounded-full">
                                <VerifiedIcon className="size-5" />
                              </div>
                            )}
                          </div>
                          <p className="text-primary-800 capitalize">
                            {player.firstName}
                          </p>
                        </div>
                      </Table.Cell>
                      <Table.Cell className="px-4 py-4">
                        <div className="text-sm text-gray-900">
                          {player.email}
                        </div>
                      </Table.Cell>
                      {/* <Table.Cell className="px-4 py-4">
                        <p
                          className={`font-heading w-fit rounded-full px-4 py-2 text-center capitalize ${
                            player.accountType === 'admin'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {player.accountType}
                        </p>
                      </Table.Cell> */}
                      <Table.Cell className="px-4 py-4 text-sm text-gray-500">
                        {fullDate}
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
                  );
                })
              ) : !isLoading && sortedPlayers.length === 0 ? (
                <Table.Row>
                  <Table.Cell
                    colSpan={6}
                    className="text-error-500 py-12 text-center font-bold"
                  >
                    No Players Found
                  </Table.Cell>
                </Table.Row>
              ) : null}
            </Table.Body>
          </Table.Root>
        </div>

        <div
          className={classNames(
            'mt-4 flex flex-col items-center gap-4 p-4 transition-opacity duration-200 md:flex-row md:justify-between',
            isLoading && 'opacity-50',
          )}
        >
          <div className="text-sm text-gray-500">
            {totalItems > 0 ? (
              <>
                Showing data {startItem} to {endItem} of{' '}
                {convertToLocaleString(totalItems)} entries
              </>
            ) : (
              'No entries found'
            )}
          </div>

          {totalPages > 0 && (
            <div
              className={classNames(
                isLoading && 'pointer-events-none opacity-50',
              )}
            >
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
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
  disabled?: boolean;
}

const Th: React.FC<ThProps> = ({
  label,
  sortField,
  currentSortField,
  sortDirection,
  onSort,
  disabled = false,
}) => (
  <Table.Cell className="px-4 py-2 text-left">
    <div
      className={classNames(
        'flex items-center gap-1',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
      )}
      onClick={() => !disabled && onSort(sortField)}
    >
      <span>{label}</span>
      <CaretSortIcon />
    </div>
  </Table.Cell>
);
