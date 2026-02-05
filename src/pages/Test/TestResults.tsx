import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import axiosClient from '../../service/axios.service';
import { useFetchWithLoader } from '../../hooks/useFetchWithLoader';
import { useModal } from '../../hooks/useModal';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import PageMeta from '../../components/common/PageMeta';
import ComponentCard from '../../components/common/ComponentCard';
import Button from '../../components/ui/button/Button';
import { Modal } from '../../components/ui/modal';
import Label from '../../components/form/Label';
import Input from '../../components/form/input/InputField';
import Select from '../../components/form/Select';
import { PlusIcon, EditIcon, DeleteIcon, SearchIcon } from '../../icons';
import { LoadSpinner } from '../../components/spinner/load-spinner';

interface TestResult {
  id: number;
  userId: number;
  testId: number;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  isPassed: boolean;
  completedAt: string;
  user?: {
    firstName?: string;
    lastName?: string;
  };
  test?: {
    title: string;
  };
}

export default function TestResultsPage() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<TestResult[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'passed' | 'failed'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const fetchResults = useCallback(() => {
    return axiosClient.get('/tests/results/my').then(res => res.data);
  }, []);

  const { data, isLoading, refetch } = useFetchWithLoader({
    fetcher: fetchResults,
  });

  useEffect(() => {
    if (data) {
      setResults(data);
      setFilteredResults(data);
    }
  }, [data]);

  useEffect(() => {
    let filtered = results;

    if (searchTerm) {
      filtered = filtered.filter(result =>
        result.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.test?.title?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(result => 
        filterStatus === 'passed' ? result.isPassed : !result.isPassed
      );
    }

    setFilteredResults(filtered);
    setCurrentPage(1);
  }, [searchTerm, filterStatus, results]);

  const handleDelete = async (id: number) => {
    if (!confirm('O\'chirishni tasdiqlaysizmi?')) return;
    try {
      await axiosClient.delete(`/tests/results/${id}`);
      toast.success('Natija o\'chirildi');
      await refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredResults.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);

  return (
    <>
      <PageMeta title="Test natijalari" description="Kurs Platformasi - Test natijalari" />
      <PageBreadcrumb pageTitle="Test natijalari" />

      <div className="space-y-6">
        {isLoading ? (
          <div className="min-h-[450px] flex justify-center items-center">
            <LoadSpinner />
          </div>
        ) : (
          <ComponentCard
            title="Test natijalari"
            action={
              <div className="flex gap-2">
                <div className="w-48">
                  <Select
                    options={[
                      { value: 'all', label: 'Hammasi' },
                      { value: 'passed', label: "O'tganlar" },
                      { value: 'failed', label: "O'tmaganlar" },
                    ]}
                    defaultValue={filterStatus}
                    onChange={(value) => setFilterStatus(value as any)}
                    placeholder="Status tanlang"
                  />
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Qidirish..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                  />
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                </div>
              </div>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="text-left p-4">ID</th>
                    <th className="text-left p-4">Talaba</th>
                    <th className="text-left p-4">Test</th>
                    <th className="text-left p-4">Ball</th>
                    <th className="text-left p-4">To'g'ri/Jami</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Sana</th>
                    <th className="text-right p-4">Harakatlar</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((result) => (
                    <tr key={result.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="p-4">{result.id}</td>
                      <td className="p-4">
                        {result.user?.firstName || result.user?.lastName 
                          ? `${result.user.firstName || ''} ${result.user.lastName || ''}`.trim()
                          : `User #${result.userId}`
                        }
                      </td>
                      <td className="p-4">{result.test?.title || `Test #${result.testId}`}</td>
                      <td className="p-4">
                        <span className={`font-bold ${
                          result.score >= 70 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {result.score}%
                        </span>
                      </td>
                      <td className="p-4">
                        {result.correctAnswers} / {result.totalQuestions}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          result.isPassed
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {result.isPassed ? 'O\'tdi' : 'O\'tmadi'}
                        </span>
                      </td>
                      <td className="p-4">
                        {new Date(result.completedAt).toLocaleDateString('uz-UZ')}
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleDelete(result.id)}
                            className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                          >
                            <DeleteIcon className="size-5 fill-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border rounded disabled:opacity-50 dark:border-gray-700"
                >
                  Oldingi
                </button>
                <span className="px-4 py-2">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border rounded disabled:opacity-50 dark:border-gray-700"
                >
                  Keyingi
                </button>
              </div>
            )}
          </ComponentCard>
        )}
      </div>
    </>
  );
}
