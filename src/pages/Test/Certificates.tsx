import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import axiosClient, { getImageUrl } from '../../service/axios.service';
import { useFetchWithLoader } from '../../hooks/useFetchWithLoader';
import { useModal } from '../../hooks/useModal';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import PageMeta from '../../components/common/PageMeta';
import ComponentCard from '../../components/common/ComponentCard';
import Button from '../../components/ui/button/Button';
import { Modal } from '../../components/ui/modal';
import { SearchIcon, DownloadIcon, EyeIcon } from '../../icons';
import { LoadSpinner } from '../../components/spinner/load-spinner';

interface Certificate {
  id: number;
  userId: number;
  courseId?: number;
  testResultId?: number;
  certificateNo: string;
  pdfUrl?: string;
  issuedAt: string;
  user?: {
    id: number;
    firstName?: string;
    surname?: string;
    fullName?: string;
    phone?: string;
    avatar?: string | null;
  };
  testResult?: {
    id: number;
    test?: {
      id: number;
      title: string;
      passingScore: number;
      course?: {
        id: number;
        title: string;
        thumbnail?: string | null;
      };
    };
  };
}

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [filteredCertificates, setFilteredCertificates] = useState<Certificate[]>([]);
  const [viewingCertificate, setViewingCertificate] = useState<Certificate | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  
  const { isOpen: isViewOpen, openModal: openViewModal, closeModal: closeViewModal } = useModal();

  const fetchCertificates = useCallback(() => {
    return axiosClient.get('/tests/certificates/all').then(res => res.data);
  }, []);

  const { data, isLoading, refetch } = useFetchWithLoader({
    fetcher: fetchCertificates,
  });

  useEffect(() => {
    if (data) {
      setCertificates(data);
      setFilteredCertificates(data);
    }
  }, [data]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = certificates.filter(cert => {
        const fullName = cert.user?.fullName || `${cert.user?.firstName || ''} ${cert.user?.surname || ''}`.trim();
        const courseName = cert.testResult?.test?.course?.title || '';
        const testName = cert.testResult?.test?.title || '';
        return (
          cert.certificateNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          testName.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
      setFilteredCertificates(filtered);
    } else {
      setFilteredCertificates(certificates);
    }
    setCurrentPage(1);
  }, [searchTerm, certificates]);

  const handleDownload = async (certificateNo: string) => {
    try {
      const response = await axiosClient.get(`/tests/certificates/download/${certificateNo}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate-${certificateNo}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Sertifikat yuklandi');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
    }
  };

  const handleViewClick = (certificate: Certificate) => {
    setViewingCertificate(certificate);
    openViewModal();
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCertificates.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCertificates.length / itemsPerPage);

  return (
    <>
      <PageMeta title="Sertifikatlar | Admin Panel" description="Sertifikatlar" />
      <PageBreadcrumb pageTitle="Sertifikatlar" />

      <div className="space-y-6">
        {isLoading ? (
          <div className="min-h-[450px] flex justify-center items-center">
            <LoadSpinner />
          </div>
        ) : (
          <ComponentCard
            title="Sertifikatlar"
            action={
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
                      Sertifikat №
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Talaba
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Kurs
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Test
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Berilgan sana
                    </th>
                    <th className="text-right px-6 py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Harakatlar
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                  {currentItems.map((certificate) => (
                    <tr key={certificate.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {certificate.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-sm text-brand-600 dark:text-brand-400">
                          {certificate.certificateNo}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {certificate.user?.fullName || 
                          (certificate.user?.firstName || certificate.user?.surname
                            ? `${certificate.user.firstName || ''} ${certificate.user.surname || ''}`.trim()
                            : `User #${certificate.userId}`)
                        }
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {certificate.testResult?.test?.course?.title || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {certificate.testResult?.test?.title || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {new Date(certificate.issuedAt).toLocaleDateString('uz-UZ', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        }).replace(/\//g, '.')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleViewClick(certificate)}
                            className="p-2 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                            title="Ko'rish"
                          >
                            <EyeIcon className="size-5 fill-green-600 dark:fill-green-400" />
                          </button>
                          <button
                            onClick={() => handleDownload(certificate.certificateNo)}
                            className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                            title="Yuklab olish"
                          >
                            <DownloadIcon className="size-5 fill-blue-600 dark:fill-blue-400" />
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

      {/* View Certificate Modal */}
      <Modal isOpen={isViewOpen} onClose={closeViewModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Sertifikat ma'lumotlari
            </h4>
          </div>

          {viewingCertificate && (
            <div className="px-2 mt-6">
              <div className="space-y-6">
                {/* Certificate Number */}
                <div className="p-4 bg-gradient-to-br from-brand-50 to-brand-100 dark:from-brand-900/20 dark:to-brand-900/10 rounded-xl border border-brand-200 dark:border-brand-800">
                  <p className="text-xs text-brand-600 dark:text-brand-400 font-semibold mb-2 uppercase tracking-wider">
                    Sertifikat raqami
                  </p>
                  <p className="text-2xl font-mono font-bold text-brand-700 dark:text-brand-300">
                    {viewingCertificate.certificateNo}
                  </p>
                </div>

                {/* User Info */}
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-2 uppercase tracking-wider">
                    Talaba
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {viewingCertificate.user?.fullName || 
                      (viewingCertificate.user?.firstName || viewingCertificate.user?.surname
                        ? `${viewingCertificate.user.firstName || ''} ${viewingCertificate.user.surname || ''}`.trim()
                        : `User #${viewingCertificate.userId}`)
                    }
                  </p>
                </div>

                {/* Course */}
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-2 uppercase tracking-wider">
                    Kurs
                  </p>
                  <p className="text-lg font-medium text-gray-800 dark:text-gray-200">
                    {viewingCertificate.testResult?.test?.course?.title || 'N/A'}
                  </p>
                </div>

                {/* Test */}
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-2 uppercase tracking-wider">
                    Test
                  </p>
                  <p className="text-lg font-medium text-gray-800 dark:text-gray-200">
                    {viewingCertificate.testResult?.test?.title || 'N/A'}
                  </p>
                </div>

                {/* Issue Date */}
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-2 uppercase tracking-wider">
                    Berilgan sana
                  </p>
                  <p className="text-lg font-medium text-gray-800 dark:text-gray-200">
                    {new Date(viewingCertificate.issuedAt).toLocaleDateString('uz-UZ', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                {/* PDF Preview */}
                {viewingCertificate.pdfUrl && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-3 uppercase tracking-wider">
                      Sertifikat PDF
                    </p>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                      <iframe
                        src={getImageUrl(viewingCertificate.pdfUrl) || viewingCertificate.pdfUrl}
                        className="w-full h-[500px]"
                        title="Certificate PDF"
                      />
                    </div>
                    <div className="mt-3 flex gap-2">
                      <a
                        href={getImageUrl(viewingCertificate.pdfUrl) || viewingCertificate.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1"
                      >
                        <Button size="sm" variant="outline" className="w-full">
                          <EyeIcon className="size-4 mr-2" />
                          Yangi oynada ochish
                        </Button>
                      </a>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleDownload(viewingCertificate.certificateNo)}
                        className="flex-1"
                      >
                        <DownloadIcon className="size-4 mr-2" />
                        Yuklab olish
                      </Button>
                    </div>
                  </div>
                )}

                {!viewingCertificate.pdfUrl && (
                  <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl text-center">
                    <p className="text-yellow-800 dark:text-yellow-200">
                      Sertifikat PDF fayli hali yaratilmagan
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 px-2 mt-8 lg:justify-end">
            <Button size="sm" variant="outline" onClick={closeViewModal}>
              Yopish
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
