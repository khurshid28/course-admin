import React from "react";
import Button from "../button/Button";
import { ArrowRightIcon } from "../../../icons";

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
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const delta = 2; // Number of pages to show around current page

    // Always show first page
    if (1 < currentPage - delta) {
      pages.push(1);
      if (2 < currentPage - delta) {
        pages.push("...");
      }
    }

    // Show pages around current page
    for (
      let i = Math.max(1, currentPage - delta);
      i <= Math.min(totalPages, currentPage + delta);
      i++
    ) {
      pages.push(i);
    }

    // Always show last page
    if (totalPages > currentPage + delta) {
      if (totalPages - 1 > currentPage + delta) {
        pages.push("...");
      }
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-row items-center gap-2 text-start">
      <Button
        size="sm"
        variant="outline"
        className="w-10 h-10"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ArrowRightIcon className="rotate-180 fill-gray-500 dark:fill-gray-400 scale-200" />
      </Button>

      {pageNumbers.map((page, index) => (
        <React.Fragment key={index}>
          {page === "..." ? (
            <span className="px-2 py-1 text-gray-500 dark:text-gray-400">...</span>
          ) : (
            <Button
              size="sm"
              variant={currentPage === page ? "primary" : "outline"}
              className="w-10 h-10"
              onClick={() => onPageChange(page as number)}
            >
              {page}
            </Button>
          )}
        </React.Fragment>
      ))}

      <Button
        size="sm"
        variant="outline"
        className="w-10 h-10"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <ArrowRightIcon className="fill-gray-500 dark:fill-gray-400 scale-200" />
      </Button>
    </div>
  );
};

export default Pagination;