'use client';

import React, { useState } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import {
  ListFilter,
  Calendar,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface TimeRangeDropdownProps {
  options: string[];
  selected: string;
  onSelect: (option: string) => void;
  customDateRange?: { startDate: Date; endDate: Date } | null;
  onCustomDateChange?: (
    dateRange: { startDate: Date; endDate: Date } | null,
  ) => void;
}

const TimeRangeDropdown = ({
  options,
  selected,
  onSelect,
  customDateRange,
  onCustomDateChange,
}: TimeRangeDropdownProps) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isSelectingEnd, setIsSelectingEnd] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleOptionSelect = (option: string, event?: Event) => {
    if (option === 'Custom') {
      event?.preventDefault();
      setShowDatePicker(true);

      if (customDateRange && selected === 'Custom') {
        setStartDate(customDateRange.startDate);
        setEndDate(customDateRange.endDate);
      } else {
        setStartDate(null);
        setEndDate(null);
        setIsSelectingEnd(false);
      }
    } else {
      setShowDatePicker(false);
      setIsOpen(false);
      onSelect(option);
    }
  };

  const handleDateClick = (date: Date) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate(date);
      setEndDate(null);
      setIsSelectingEnd(true);
    } else if (isSelectingEnd) {
      if (date >= startDate) {
        setEndDate(date);
        setIsSelectingEnd(false);
      } else {
        setStartDate(date);
        setEndDate(null);
      }
    }
  };

  const handleApply = () => {
    if (startDate && endDate) {
      onCustomDateChange?.({ startDate, endDate });
      onSelect('Custom');
      setShowDatePicker(false);
      setIsOpen(false);
    }
  };

  const handleCancel = () => {
    setShowDatePicker(false);
    setStartDate(null);
    setEndDate(null);
    setIsSelectingEnd(false);
  };

  const clearCustomRange = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onCustomDateChange?.(null);
    onSelect('All Time');
    setIsOpen(false);
  };

  const formatDateRange = (start: Date, end: Date) => {
    const formatOptions: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
    };

    const startStr = start.toLocaleDateString('en-US', formatOptions);
    const endStr = end.toLocaleDateString('en-US', formatOptions);

    return `${startStr} - ${endStr}`;
  };

  const getDisplayText = () => {
    if (selected === 'Custom' && customDateRange) {
      return formatDateRange(
        customDateRange.startDate,
        customDateRange.endDate,
      );
    }
    return selected;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentMonth(newMonth);
  };

  const renderCalendar = () => {
    const monthStart = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1,
    );
    const calendarStartDate = new Date(monthStart);
    calendarStartDate.setDate(
      calendarStartDate.getDate() - monthStart.getDay(),
    );

    const days = [];
    const currentDate = new Date(calendarStartDate);

    for (let i = 0; i < 42; i++) {
      const day = new Date(currentDate);
      const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
      const isToday = day.toDateString() === new Date().toDateString();
      const isSelected =
        (startDate && day.toDateString() === startDate.toDateString()) ||
        (endDate && day.toDateString() === endDate.toDateString());
      const isInRange =
        startDate && endDate && day >= startDate && day <= endDate;
      const isDisabled = day > new Date();

      days.push(
        <button
          key={day.toISOString()}
          onClick={() => !isDisabled && handleDateClick(day)}
          disabled={isDisabled}
          className={`
            h-6 w-6 rounded text-xs transition-colors
            ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-700'}
            ${isToday ? 'font-bold ring-1 ring-blue-300' : ''}
            ${isSelected ? 'bg-blue-600 text-white' : ''}
            ${isInRange && !isSelected ? 'bg-blue-100 text-blue-800' : ''}
            ${
              isDisabled
                ? 'cursor-not-allowed opacity-30'
                : 'cursor-pointer hover:bg-gray-100'
            }
            ${isSelected ? 'hover:bg-blue-700' : ''}
          `}
        >
          {day.getDate()}
        </button>,
      );
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return (
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-800">
            {currentMonth.toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric',
            })}
          </h3>
          <div className="flex gap-1">
            <button
              onClick={() => navigateMonth('prev')}
              className="rounded p-1 transition-colors hover:bg-gray-100"
            >
              <ChevronLeft className="h-3 w-3" />
            </button>
            <button
              onClick={() => navigateMonth('next')}
              className="rounded p-1 transition-colors hover:bg-gray-100"
            >
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        <div className="mb-2 grid grid-cols-7 gap-1">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
            <div
              key={day}
              className="flex h-6 w-6 items-center justify-center text-xs font-medium text-gray-500"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">{days}</div>
      </div>
    );
  };

  return (
    <div className="relative">
      <DropdownMenu.Root open={isOpen} onOpenChange={setIsOpen}>
        <div className="relative inline-flex">
          <DropdownMenu.Trigger
            className="inline-flex min-w-[140px] cursor-pointer select-none items-center justify-center gap-2 rounded-md border border-[#D9D9D9] px-3 py-2 text-sm text-[#6D6D6D] outline-none transition-colors hover:border-gray-400 focus:ring-0"
            aria-label="Select time range"
          >
            <ListFilter className="h-3 w-3" />
            <span className="flex-1 truncate text-left">
              {getDisplayText()}
            </span>
            {selected === 'Custom' && customDateRange && (
              <span className="w-4"></span>
            )}
            <ChevronDownIcon className="h-3 w-3 flex-shrink-0" />
          </DropdownMenu.Trigger>
          {selected === 'Custom' && customDateRange && (
            <button
              onClick={clearCustomRange}
              className="absolute right-6 top-1/2 z-10 -translate-y-1/2 rounded p-0.5 transition-colors hover:bg-gray-200"
              title="Clear custom range"
            >
              <X className="h-2 w-2" />
            </button>
          )}
        </div>

        <DropdownMenu.Content
          className="z-[100] mt-2 rounded-md border border-gray-200 bg-white shadow-lg"
          sideOffset={5}
          align="end"
        >
          {!showDatePicker ? (
            <div className="min-w-[160px] p-1">
              {options.map((option) => (
                <DropdownMenu.Item
                  key={option}
                  className={`cursor-pointer select-none rounded px-2 py-1.5 text-sm transition-colors
                    ${
                      option === selected
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-900 hover:bg-gray-100'
                    }`}
                  onSelect={(event) => handleOptionSelect(option, event)}
                >
                  <div className="flex items-center gap-2">
                    {option === 'Custom' && <Calendar className="h-3 w-3" />}
                    <span>{option}</span>
                  </div>
                </DropdownMenu.Item>
              ))}
            </div>
          ) : (
            <div className="w-72 p-3">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900">
                  Select Date Range
                </h3>
                <button
                  onClick={handleCancel}
                  className="rounded p-1 transition-colors hover:bg-gray-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>

              <div className="flex justify-center">{renderCalendar()}</div>

              <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-2">
                <div className="text-xs">
                  {startDate && endDate ? (
                    <span className="text-green-600">
                      {formatDateRange(startDate, endDate)}
                    </span>
                  ) : (
                    <span className="text-gray-500">Select dates</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCancel}
                    className="px-2 py-1 text-xs text-gray-600 transition-colors hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApply}
                    disabled={!startDate || !endDate}
                    className="rounded bg-blue-600 px-3 py-1 text-xs text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </div>
  );
};

export default TimeRangeDropdown;
