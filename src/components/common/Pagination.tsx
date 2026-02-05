import React from 'react';
import Button from '../ui/button/Button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}) => {
  // Agar sahifalar soni 1 dan kam bo'lsa, pagination ko'rsatmaymiz
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];

    // Agar jami sahifalar 7 dan kam bo'lsa, barcha sahifalarni ko'rsatamiz
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    // Har doim 1-chi sahifani ko'rsatamiz
    pages.push(1);

    // Agar joriy sahifa 4 dan katta bo'lsa, "..." qo'shamiz
    if (currentPage > 4) {
      pages.push('...');
    }

    // Joriy sahifadan oldingi va keyingi sahifalarni qo'shamiz
    const start = Math.max(2, currentPage - 2);
    const end = Math.min(totalPages - 1, currentPage + 2);

    for (let i = start; i <= end; i++) {
      if (i !== 1 && i !== totalPages) {
        pages.push(i);
      }
    }

    // Agar joriy sahifa oxirgi sahifadan 2 tagacha bo'lsa, "..." qo'shamiz
    if (currentPage < totalPages - 2) {
      pages.push('...');
    }

    // Agar jami sahifalar soni 1 dan ko'proq bo'lsa, oxirgi sahifani qo'shamiz
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      {/* Previous button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2"
      >
        ← Oldingi
      </Button>

      {/* Page numbers */}
      <div className="flex items-center gap-1">
        {pageNumbers.map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className="px-3 py-2 text-gray-500 dark:text-gray-400">
                ...
              </span>
            ) : (
              <Button
                variant={page === currentPage ? 'primary' : 'outline'}
                size="sm"
                onClick={() => onPageChange(page as number)}
                className={`px-3 py-2 min-w-10 ${
                  page === currentPage
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-blue-300 dark:border-blue-600'
                }`}
              >
                {page}
              </Button>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Next button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2"
      >
        Keyingi →
      </Button>
    </div>
  );
};

export default Pagination;