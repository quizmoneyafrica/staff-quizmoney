import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  // Generate page numbers for pagination
  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show ellipsis logic
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(
          1,
          '...',
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages,
        );
      } else {
        pages.push(
          1,
          '...',
          currentPage - 1,
          currentPage,
          currentPage + 1,
          '...',
          totalPages,
        );
      }
    }

    return pages;
  };

  return (
    <div className="mt-6 flex items-center justify-center gap-2 md:justify-end">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`rounded-lg p-2 ${
          currentPage === 1
            ? 'cursor-not-allowed bg-gray-100 text-gray-400'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {/* Page Numbers */}
      <div className="flex gap-2">
        {generatePageNumbers().map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className="px-3 py-2 text-gray-500">...</span>
            ) : (
              <button
                onClick={() => onPageChange(page as number)}
                className={`rounded-lg px-4 py-2 font-medium ${
                  currentPage === page
                    ? 'bg-primary-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`rounded-lg p-2 ${
          currentPage === totalPages
            ? 'cursor-not-allowed bg-gray-100 text-gray-400'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
};

export default Pagination;
