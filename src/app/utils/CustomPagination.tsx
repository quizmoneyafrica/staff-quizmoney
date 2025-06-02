import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "classnames";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalEntries: number;
  entriesPerPage: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalEntries,
  entriesPerPage,
  onPageChange,
}) => {
  const startEntry = (currentPage - 1) * entriesPerPage + 1;
  const endEntry = Math.min(currentPage * entriesPerPage, totalEntries);

  // Calculate visible page links
  let pages = [];
  const maxPageLinks = 5;

  if (totalPages <= maxPageLinks) {
    pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  } else {
    // Always show first page
    pages.push(1);

    // Calculate range around current page
    let rangeStart = Math.max(2, currentPage - 1);
    let rangeEnd = Math.min(totalPages - 1, currentPage + 1);

    // Adjust range to show 3 pages when possible
    if (rangeEnd - rangeStart < 2) {
      if (rangeStart === 2) {
        rangeEnd = Math.min(4, totalPages - 1);
      } else {
        rangeStart = Math.max(2, totalPages - 3);
      }
    }

    // Add ellipsis if needed
    if (rangeStart > 2) {
      pages.push("...");
    }

    // Add pages in range
    for (let i = rangeStart; i <= rangeEnd; i++) {
      pages.push(i);
    }

    // Add ellipsis if needed
    if (rangeEnd < totalPages - 1) {
      pages.push("...");
    }

    // Always show last page
    pages.push(totalPages);
  }

  return (
    <div className="mt-6 flex flex-col sm:flex-row items-center justify-between text-sm text-gray-500">
      <div>
        Showing data {startEntry} to {endEntry} of {totalEntries} entries
      </div>
      <div className="flex items-center space-x-1 mt-4 sm:mt-0">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-md text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
        >
          <ChevronLeft size={16} />
        </button>

        {pages.map((page, index) => (
          <div key={index}>
            {page === "..." ? (
              <span className="px-2 py-1.5">...</span>
            ) : (
              <button
                onClick={() => onPageChange(page as number)}
                className={clsx(
                  "w-8 h-8 rounded-md flex items-center justify-center transition-colors",
                  currentPage === page
                    ? "bg-primary-700 text-white"
                    : "text-gray-500 hover:bg-gray-100"
                )}
              >
                {page}
              </button>
            )}
          </div>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-md text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
