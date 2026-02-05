import React, { useState } from 'react';
import PageBreadcrumb from '../components/common/PageBreadCrumb';
import ComponentCard from '../components/common/ComponentCard';
import PageMeta from '../components/common/PageMeta';
import Pagination from '../components/common/Pagination';

export default function PaginationDemo() {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(100);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <>
      <PageMeta
        title="Pagination Demo - Mahad Test Web"
        description="Google-style pagination component demo"
      />
      <PageBreadcrumb pageTitle="Pagination Demo" />

      <div className="space-y-6">
        <ComponentCard title="Google-Style Pagination Demo">
          <div className="space-y-6">
            {/* Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Joriy sahifa: {currentPage}
                </label>
                <input
                  type="range"
                  min="1"
                  max={totalPages}
                  value={currentPage}
                  onChange={(e) => setCurrentPage(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Jami sahifalar: {totalPages}
                </label>
                <input
                  type="range"
                  min="1"
                  max="200"
                  value={totalPages}
                  onChange={(e) => {
                    const newTotal = Number(e.target.value);
                    setTotalPages(newTotal);
                    if (currentPage > newTotal) {
                      setCurrentPage(newTotal);
                    }
                  }}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
              </div>
            </div>

            {/* Pagination Component */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Pagination Component
              </h3>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                className="mt-4"
              />
            </div>

            {/* Examples */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="text-md font-semibold text-gray-800 dark:text-white mb-3">
                  Misol 1: Sahifa 5/100
                </h4>
                <Pagination
                  currentPage={5}
                  totalPages={100}
                  onPageChange={() => {}}
                />
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Ko'rsatadi: 1 ... 4, 5, 6, ... 100
                </p>
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="text-md font-semibold text-gray-800 dark:text-white mb-3">
                  Misol 2: Sahifa 98/100
                </h4>
                <Pagination
                  currentPage={98}
                  totalPages={100}
                  onPageChange={() => {}}
                />
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Ko'rsatadi: 1 ... 97, 98, 99, 100
                </p>
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="text-md font-semibold text-gray-800 dark:text-white mb-3">
                  Misol 3: Sahifa 3/10
                </h4>
                <Pagination
                  currentPage={3}
                  totalPages={10}
                  onPageChange={() => {}}
                />
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Ko'rsatadi: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
                </p>
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="text-md font-semibold text-gray-800 dark:text-white mb-3">
                  Misol 4: Sahifa 1/5
                </h4>
                <Pagination
                  currentPage={1}
                  totalPages={5}
                  onPageChange={() => {}}
                />
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Ko'rsatadi: 1, 2, 3, 4, 5
                </p>
              </div>
            </div>
          </div>
        </ComponentCard>
      </div>
    </>
  );
}