'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Tag } from 'lucide-react';
import classNames from 'classnames';

interface CategoryDropdownProps {
  selected: string;
  options: string[];
  onSelect: (category: string) => void;
}

const CategoryDropdown: React.FC<CategoryDropdownProps> = ({
  selected,
  options,
  onSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);
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

  const handleSelect = (option: string) => {
    onSelect(option);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={classNames(
          'flex items-center gap-2 rounded-md border border-[#D9D9D9] bg-white px-3 py-2 text-sm text-gray-700 transition-colors',
          'hover:bg-gray-50 focus:outline-none',
        )}
      >
        <Tag className="h-4 w-4 text-gray-400" />
        <span>{selected === 'All' ? 'Categories' : selected}</span>
        <ChevronDown
          className={classNames(
            'h-4 w-4 text-gray-400 transition-transform',
            isOpen ? 'rotate-180' : '',
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-10 mt-1 w-full min-w-[180px] rounded-lg border border-[#E9E9E9] bg-white shadow-[4px_16px_40px_-4px_rgba(0,0,0,0.15)]">
          <div className="flex flex-col p-1">
            {options.map((option) => (
              <button
                key={option}
                onClick={() => handleSelect(option)}
                className={classNames(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-gray-700',
                  'hover:bg-gray-50',
                  option === selected ? 'bg-blue-50 text-blue-600' : '',
                )}
              >
                {option === 'All' ? 'All Categories' : option}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryDropdown;
