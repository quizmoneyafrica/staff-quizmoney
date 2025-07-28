'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';
import classNames from 'classnames';

type Option = {
  label: string;
  onClick: () => void;
};

interface IActionDropdownProps {
  options: Option[];
}

const ActionDropdown: React.FC<IActionDropdownProps> = ({ options }) => {
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

  const handleOptionClick = (onClick: () => void) => {
    onClick();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)}>
        <MoreVertical className="text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-10 mt-2 w-[155px] rounded-lg border border-[#E9E9E9] bg-white shadow-[4px_16px_40px_-4px_rgba(0,0,0,0.15)]">
          <div className="flex flex-col">
            {options.map((option, index) => (
              <button
                key={option.label}
                onClick={() => handleOptionClick(option.onClick)}
                className={classNames(
                  'px-6 py-4 text-left text-sm font-medium leading-5 text-[#3B3B3B] transition-colors hover:bg-gray-50',
                  {
                    'border-b border-[#E9E9E9]': index < options.length - 1,
                  },
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionDropdown;
