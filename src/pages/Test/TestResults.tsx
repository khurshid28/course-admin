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
    fullName?: string;
    phone?: string;
    avatar?: string;
  };
  test?: {
    title: string;
    passingScore?: number;
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
    return axiosClient.get('/tests/results/all').then(res => res.data);
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
                    className="h-11 pl-10 pr-4 rounded-lg border text-sm bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/20 dark:bg-gray-900 dark:border-gray-700 dark:text-white/90 dark:focus:border-brand-800 focus:outline-hidden"
                  />
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                </div>
              </div>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Talaba
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Telefon
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Test
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      To'g'ri/Jami
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Ball
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      O'tish bali
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Sana
                    </th>
                    <th className="text-right px-6 py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Harakatlar
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                  {currentItems.map((result) => {
                    const displayName = result.user?.fullName || 
                      (result.user?.firstName || result.user?.lastName 
                        ? `${result.user.firstName || ''} ${result.user.lastName || ''}`.trim()
                        : `User #${result.userId}`);
                    const avatar = result.user?.avatar;
                    const phone = result.user?.phone || 'N/A';
                    const calculatedScore = result.totalQuestions > 0 
                      ? Math.round((result.correctAnswers / result.totalQuestions) * 100)
                      : 0;
                    const passingScore = result.test?.passingScore || 70;
                    const isPassed = calculatedScore >= passingScore;
                    
                    return (
                      <tr key={result.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {result.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="size-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-semibold overflow-hidden">
                              {avatar ? (
                                <img src={avatar} alt={displayName} className="size-full object-cover" />
                              ) : (
                                <span>{displayName.charAt(0).toUpperCase()}</span>
                              )}
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {displayName}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                          {phone}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                          {result.test?.title || `Test #${result.testId}`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                          {result.correctAnswers} / {result.totalQuestions}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`font-bold ${
                            isPassed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                          }`}>
                            {calculatedScore}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                          <span className="font-semibold">{passingScore}%</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                            isPassed
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {isPassed ? 'O\'tdi' : 'O\'tmadi'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                          {new Date(result.completedAt).toLocaleDateString('uz-UZ')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => handleDelete(result.id)}
                            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            title="O'chirish"
                          >
                            <DeleteIcon className="size-5 fill-red-500" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6 px-6 py-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Oldingi
                </Button>
                <span className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Keyingi
                </Button>
              </div>
            )}
          </ComponentCard>
        )}
      </div>
    </>
  );
}
