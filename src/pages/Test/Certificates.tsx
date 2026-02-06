import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import axiosClient from '../../service/axios.service';
import { useFetchWithLoader } from '../../hooks/useFetchWithLoader';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import PageMeta from '../../components/common/PageMeta';
import ComponentCard from '../../components/common/ComponentCard';
import { SearchIcon, DownloadIcon, EditIcon } from '../../icons';
import { LoadSpinner } from '../../components/spinner/load-spinner';

interface Certificate {
  id: number;
  userId: number;
  certificateNo: string;
  pdfUrl?: string;
  issuedAt: string;
  user?: {
    firstName?: string;
    lastName?: string;
  };
}

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [filteredCertificates, setFilteredCertificates] = useState<Certificate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

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
      const filtered = certificates.filter(cert =>
        cert.certificateNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
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
                        {certificate.user?.firstName || certificate.user?.lastName
                          ? `${certificate.user.firstName || ''} ${certificate.user.lastName || ''}`.trim()
                          : `User #${certificate.userId}`
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {new Date(certificate.issuedAt).toLocaleDateString('uz-UZ', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-2">
                          {certificate.pdfUrl && (
                            <a
                              href={certificate.pdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                              title="Ko'rish"
                            >
                              <EditIcon className="size-5" />
                            </a>
                          )}
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
    </>
  );
}
