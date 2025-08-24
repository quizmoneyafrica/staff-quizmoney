'use client';

import * as React from 'react';
import { format, getYear, getMonth, startOfMonth, endOfMonth } from 'date-fns';
import {
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Check,
  ListFilter,
  ChevronDown,
} from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { cn } from '@/app/utils';
import { Button } from './button';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

const isMonthInRange = (month: Date, range?: DateRange) => {
  if (!range?.from || !range.to) return false;
  const monthStart = startOfMonth(month);
  const rangeStart = startOfMonth(range.from);
  const rangeEnd = endOfMonth(range.to);
  return monthStart >= rangeStart && monthStart <= rangeEnd;
};

const isRangeStart = (month: Date, range?: DateRange) => {
  if (!range?.from) return false;
  const monthStart = startOfMonth(month);
  const rangeStart = startOfMonth(range.from);
  return monthStart.getTime() === rangeStart.getTime();
};

const isRangeEnd = (month: Date, range?: DateRange) => {
  if (!range?.to) return false;
  const monthStart = startOfMonth(month);
  const rangeEnd = startOfMonth(range.to);
  return monthStart.getTime() === rangeEnd.getTime();
};

interface ChartPeriodPickerProps {
  period: string;
  onPeriodChange: (period: string) => void;
  range: DateRange | undefined;
  onRangeChange: (range: DateRange | undefined) => void;
  className?: string;
}

export function ChartPeriodPicker({
  period,
  onPeriodChange,
  range,
  onRangeChange,
  className,
}: ChartPeriodPickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [view, setView] = React.useState<'periods' | 'months' | 'days'>(
    'months',
  );
  const [displayYear, setDisplayYear] = React.useState(
    new Date().getFullYear(),
  );
  const [hoveredMonth, setHoveredMonth] = React.useState<Date | undefined>();

  const [tempRange, setTempRange] = React.useState<DateRange | undefined>();

  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const [startDate, setStartDate] = React.useState<Date | null>(null);
  const [endDate, setEndDate] = React.useState<Date | null>(null);
  const [isSelectingEnd, setIsSelectingEnd] = React.useState(false);

  const handleMonthClick = (monthIndex: number, year: number) => {
    const clickedMonth = new Date(year, monthIndex, 1);

    if (!tempRange?.from || tempRange.to) {
      setTempRange({ from: clickedMonth, to: undefined });
    } else {
      const newRange =
        clickedMonth < tempRange.from
          ? { from: clickedMonth, to: endOfMonth(tempRange.from) }
          : { from: tempRange.from, to: endOfMonth(clickedMonth) };
      setTempRange(newRange);
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

  const handlePeriodSelect = (selectedPeriod: string) => {
    if (selectedPeriod === 'Months') {
      setView('days');

      if (range?.from && range?.to) {
        setStartDate(range.from);
        setEndDate(range.to);
      } else {
        setStartDate(null);
        setEndDate(null);
        setIsSelectingEnd(false);
      }
    } else if (selectedPeriod === 'Years') {
      setView('months');
    } else {
      onPeriodChange(selectedPeriod);
      onRangeChange(undefined);
      setTempRange(undefined);
      setIsOpen(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    // if (open) {
    setView('days');

    setTempRange(range);
    // }
    // } else {
    //   setTempRange(undefined);
    //   setStartDate(null);
    //   setEndDate(null);
    //   setIsSelectingEnd(false);
    // }
    setIsOpen(true);
  };

  const handleApply = () => {
    if (tempRange?.from && tempRange?.to) {
      onRangeChange(tempRange);
      onPeriodChange('Years');
      setIsOpen(false);
    }
  };

  const handleCancel = () => {
    setTempRange(undefined);
    setView('periods');
  };

  const handleDayApply = () => {
    if (startDate && endDate) {
      onRangeChange({ from: startDate, to: endDate });
      onPeriodChange('Months');
      setIsOpen(false);
    }
  };

  const handleDayCancel = () => {
    setStartDate(null);
    setEndDate(null);
    setIsSelectingEnd(false);
    // setView('periods');
    setIsOpen(false);
  };

  const formatDateRange = (start: Date, end: Date) => {
    if (view === 'months') {
      return `${format(start, 'do MMM yyyy')} - ${format(end, 'do MMM yyyy')}`;
    } else {
      const formatOptions: Intl.DateTimeFormatOptions = {
        month: 'short',
        day: 'numeric',
      };
      const startStr = start.toLocaleDateString('en-US', formatOptions);
      const endStr = end.toLocaleDateString('en-US', formatOptions);
      return `${startStr} - ${endStr}`;
    }
  };

  const getButtonText = () => {
    if ((period === 'Years' || period === 'Months') && range?.from) {
      return range.to
        ? formatDateRange(range.from, range.to)
        : format(range.from, period === 'Years' ? 'MMM yyyy' : 'MMM d');
    }
    return period || 'Months';
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

  const months = Array.from({ length: 12 }, (_, i) => i);
  const periodOptions = ['Months', 'Years'];

  return (
    <div className={cn('relative', className)}>
      <DropdownMenu.Root open={isOpen} onOpenChange={handleOpenChange}>
        <DropdownMenu.Trigger asChild>
          <button
            className="inline-flex min-w-[160px] cursor-pointer select-none items-center justify-between gap-3 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 outline-none transition-colors hover:bg-gray-50 data-[state=open]:border-gray-400"
            aria-label="Select chart period"
          >
            <ListFilter className="h-4 w-4 text-gray-500" />
            <span className="flex-1 truncate text-left font-medium">
              {getButtonText()}
            </span>
            <ChevronDown
              className={`h-4 w-4 flex-shrink-0 text-gray-500 transition-transform ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Content
          className="z-50 mt-2 rounded-md border border-gray-200 bg-white shadow-lg"
          sideOffset={5}
          align="start"
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          {view === 'periods' ? (
            <div className="min-w-[180px] p-1">
              {periodOptions.map((option) => (
                <DropdownMenu.Item
                  key={option}
                  className={cn(
                    'flex cursor-pointer select-none items-center justify-between rounded px-2 py-1.5 text-sm outline-none transition-colors',
                    period === option && !range
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-900 focus:bg-gray-100',
                  )}
                  onSelect={(e) => {
                    if (option === 'Years' || option === 'Months') {
                      e.preventDefault();
                      handlePeriodSelect(option);
                    }
                  }}
                >
                  {option}
                  {period === option && !range && <Check className="h-4 w-4" />}
                </DropdownMenu.Item>
              ))}
            </div>
          ) : view === 'months' ? (
            <div className="p-4">
              <div className="mb-4 flex items-center justify-start">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setView('periods')}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
              </div>
              <div className="flex items-center justify-center space-x-4">
                {/* Year 1 */}
                <div className="flex flex-col items-center space-y-2">
                  <div className="flex w-full items-center justify-between px-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDisplayYear(displayYear - 1)}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div className="text-lg font-bold">{displayYear}</div>
                    <div className="w-8"></div>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {months.map((m) => {
                      const monthDate = new Date(displayYear, m, 1);
                      const isStart = isRangeStart(monthDate, tempRange);
                      const isEnd = isRangeEnd(monthDate, tempRange);
                      const isInRange = isMonthInRange(monthDate, tempRange);
                      const isSingleSelection = isStart && isEnd;

                      const isHovered =
                        hoveredMonth &&
                        getMonth(hoveredMonth) === m &&
                        getYear(hoveredMonth) === displayYear;

                      const isInHoverRange =
                        tempRange?.from &&
                        !tempRange.to &&
                        hoveredMonth &&
                        ((tempRange.from <= hoveredMonth &&
                          monthDate >= startOfMonth(tempRange.from) &&
                          monthDate <= hoveredMonth) ||
                          (tempRange.from > hoveredMonth &&
                            monthDate >= hoveredMonth &&
                            monthDate <= startOfMonth(tempRange.from)));

                      return (
                        <button
                          key={m}
                          onClick={() => handleMonthClick(m, displayYear)}
                          onMouseEnter={() => setHoveredMonth(monthDate)}
                          onMouseLeave={() => setHoveredMonth(undefined)}
                          className={cn(
                            'relative h-9 w-16 cursor-pointer text-xs font-medium transition-colors',

                            !isInRange &&
                              !isStart &&
                              !isEnd &&
                              !isInHoverRange &&
                              'rounded text-gray-700 hover:bg-gray-100',

                            (isStart || isEnd) && 'bg-blue-600 text-white',

                            isInRange &&
                              !isStart &&
                              !isEnd &&
                              'bg-blue-100 text-blue-800',

                            !isInRange &&
                              !isStart &&
                              !isEnd &&
                              isInHoverRange &&
                              'bg-blue-100 text-blue-800',

                            isHovered &&
                              tempRange?.from &&
                              !tempRange.to &&
                              'bg-blue-600 text-white',

                            isStart && !isEnd && 'rounded-l',
                            isEnd && !isStart && 'rounded-r',
                            isSingleSelection && 'rounded',
                          )}
                        >
                          {format(monthDate, 'MMM')}
                        </button>
                      );
                    })}
                  </div>
                </div>
                {/* Year 2 */}
                <div className="flex flex-col items-center space-y-2">
                  <div className="flex w-full items-center justify-between px-2">
                    <div className="w-8"></div>
                    <div className="text-lg font-bold">{displayYear + 1}</div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDisplayYear(displayYear + 1)}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {months.map((m) => {
                      const monthDate = new Date(displayYear + 1, m, 1);
                      const isStart = isRangeStart(monthDate, tempRange);
                      const isEnd = isRangeEnd(monthDate, tempRange);
                      const isInRange = isMonthInRange(monthDate, tempRange);
                      const isSingleSelection = isStart && isEnd;

                      const isHovered =
                        hoveredMonth &&
                        getMonth(hoveredMonth) === m &&
                        getYear(hoveredMonth) === displayYear + 1;

                      const isInHoverRange =
                        tempRange?.from &&
                        !tempRange.to &&
                        hoveredMonth &&
                        ((tempRange.from <= hoveredMonth &&
                          monthDate >= startOfMonth(tempRange.from) &&
                          monthDate <= hoveredMonth) ||
                          (tempRange.from > hoveredMonth &&
                            monthDate >= hoveredMonth &&
                            monthDate <= startOfMonth(tempRange.from)));

                      return (
                        <button
                          key={m}
                          onClick={() => handleMonthClick(m, displayYear + 1)}
                          onMouseEnter={() => setHoveredMonth(monthDate)}
                          onMouseLeave={() => setHoveredMonth(undefined)}
                          className={cn(
                            'relative h-9 w-16 cursor-pointer text-xs font-medium transition-colors',

                            !isInRange &&
                              !isStart &&
                              !isEnd &&
                              !isInHoverRange &&
                              'rounded text-gray-700 hover:bg-gray-100',

                            (isStart || isEnd) && 'bg-blue-600 text-white',

                            isInRange &&
                              !isStart &&
                              !isEnd &&
                              'bg-blue-100 text-blue-800',

                            !isInRange &&
                              !isStart &&
                              !isEnd &&
                              isInHoverRange &&
                              'bg-blue-100 text-blue-800',

                            isHovered &&
                              tempRange?.from &&
                              !tempRange.to &&
                              'bg-blue-600 text-white',

                            isStart && !isEnd && 'rounded-l',
                            isEnd && !isStart && 'rounded-r',
                            isSingleSelection && 'rounded',
                          )}
                        >
                          {format(monthDate, 'MMM')}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Bottom controls for Years selection */}
              <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-2">
                <div className="text-xs">
                  {tempRange?.from && tempRange?.to ? (
                    <span className="text-green-600">
                      {formatDateRange(tempRange.from, tempRange.to)}
                    </span>
                  ) : (
                    <span className="text-gray-500">Select month range</span>
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
                    disabled={!tempRange?.from || !tempRange?.to}
                    className="rounded bg-blue-600 px-3 py-1 text-xs text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-72 p-3">
              <div className="mb-3 flex items-center justify-between">
                {/* <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setView('periods')}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button> */}
                <h3 className="text-sm font-medium text-gray-900">
                  Select Date Range
                </h3>
              </div>

              <div className="flex justify-center">{renderCalendar()}</div>

              {/* Bottom controls for Days selection */}
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
                    onClick={handleDayCancel}
                    className="px-2 py-1 text-xs text-gray-600 transition-colors hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDayApply}
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
}
