import React, { useState, useRef, useEffect } from 'react';
import { ListFilter, ChevronDown } from 'lucide-react';

interface GameHistoryHeaderProps {
  activeTab: 'live' | 'zone';
  onTabChange: (tab: 'live' | 'zone') => void;
  onFilterChange?: (filter: string) => void;
}

export default function GameHistoryHeader({
  activeTab,
  onTabChange,
  onFilterChange,
}: GameHistoryHeaderProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('All Games');
  const filterDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(event.target as Node)
      ) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFilterSelect = (filter: string) => {
    setSelectedFilter(filter);
    setIsFilterOpen(false);
    if (onFilterChange) {
      onFilterChange(filter === 'All Games' ? '' : filter.toUpperCase());
    }
  };

  return (
    <div className="flex flex-col items-center justify-between gap-2 sm:flex-row sm:gap-4">
      <div className="inline-flex w-full rounded-lg bg-blue-50 p-0.5 sm:w-auto sm:p-1">
        <button
          onClick={() => onTabChange('live')}
          className={`rounded-md px-2 py-1.5 text-xs font-medium transition-all sm:px-6 sm:py-2 sm:text-sm ${
            activeTab === 'live'
              ? 'bg-[#2B6CB0] text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Live game History
        </button>
        <button
          onClick={() => onTabChange('zone')}
          className={`rounded-md px-2 py-1.5 text-xs font-medium transition-all sm:px-6 sm:py-2 sm:text-sm ${
            activeTab === 'zone'
              ? 'bg-[#2B6CB0] text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Game Zone History
        </button>
      </div>

      <div className="relative w-full sm:w-auto" ref={filterDropdownRef}>
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="flex w-full items-center justify-center gap-1 whitespace-nowrap rounded-md border border-[#D9D9D9] bg-white px-3 py-1.5 text-xs font-medium text-[#1B212D] outline-none transition-colors hover:bg-gray-50 sm:w-auto sm:justify-start sm:px-4 sm:py-2 sm:text-sm"
        >
          <ListFilter className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="text-xs sm:text-sm">
            {selectedFilter === 'All Games' ? 'Filter by' : selectedFilter}
          </span>
          <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
        </button>
        {isFilterOpen && (
          <div className="absolute right-0 top-full z-10 mt-2 w-full overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg sm:w-40">
            <div className="py-1">
              {['All Games', 'Win', 'Loss'].map((status) => (
                <div key={status}>
                  <button
                    className="w-full px-3 py-1.5 text-left text-xs text-gray-700 hover:bg-gray-100 sm:px-4 sm:py-2 sm:text-sm"
                    onClick={() => handleFilterSelect(status)}
                  >
                    {status}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
