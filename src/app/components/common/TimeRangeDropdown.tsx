'use client';

import React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import { ListFilter } from 'lucide-react';

interface TimeRangeDropdownProps {
  options: string[];
  selected: string;
  onSelect: (option: string) => void;
}

const TimeRangeDropdown = ({
  options,
  selected,
  onSelect,
}: TimeRangeDropdownProps) => {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        className="inline-flex cursor-pointer select-none items-center justify-center gap-2 rounded-md border border-[#D9D9D9] px-4 py-2 text-[#6D6D6D] outline-none focus:ring-0"
        aria-label="Select time range"
      >
        <ListFilter />
        {selected}
        <ChevronDownIcon className="ml-2 h-4 w-4" />
      </DropdownMenu.Trigger>

      <DropdownMenu.Content
        className="z-[100] mt-2 min-w-[150px] rounded-md border border-gray-200 bg-white p-2 shadow-md"
        sideOffset={5}
      >
        {options.map((option) => (
          <DropdownMenu.Item
            key={option}
            className={`cursor-pointer select-none rounded-md px-3 py-2 
              ${
                option === selected
                  ? 'bg-primary-800 text-white'
                  : 'text-gray-900 hover:bg-gray-100'
              }`}
            onSelect={() => onSelect(option)}
          >
            {option}
          </DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};

export default TimeRangeDropdown;
