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

const TimeRangeDropdown = ({ options, selected, onSelect }: TimeRangeDropdownProps) => {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger 
        className="inline-flex items-center justify-center px-4 py-2 border rounded-md gap-2 cursor-pointer text-[#6D6D6D] select-none border-[#D9D9D9] outline-none focus:ring-0"
        aria-label="Select time range"
      >
        <ListFilter/>{selected}
        <ChevronDownIcon className="ml-2 w-4 h-4" />
      </DropdownMenu.Trigger>

      <DropdownMenu.Content 
        className="bg-white rounded-md shadow-md z-[100] p-2 mt-2 min-w-[150px] border border-gray-200"
        sideOffset={5}
      >
        {options.map((option) => (
          <DropdownMenu.Item
            key={option}
            className={`px-3 py-2 rounded-md cursor-pointer select-none 
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