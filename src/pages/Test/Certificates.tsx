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
    return axiosClient.get('/tests/certificates/my').then(res => res.data);
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
                  className="pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                />
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
              </div>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="text-left p-4">ID</th>
                    <th className="text-left p-4">Sertifikat №</th>
                    <th className="text-left p-4">Talaba</th>
                    <th className="text-left p-4">Berilgan sana</th>
                    <th className="text-right p-4">Harakatlar</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((certificate) => (
                    <tr key={certificate.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="p-4">{certificate.id}</td>
                      <td className="p-4">
                        <span className="font-mono font-bold">{certificate.certificateNo}</span>
                      </td>
                      <td className="p-4">
                        {certificate.user?.firstName || certificate.user?.lastName
                          ? `${certificate.user.firstName || ''} ${certificate.user.lastName || ''}`.trim()
                          : `User #${certificate.userId}`
                        }
                      </td>
                      <td className="p-4">
                        {new Date(certificate.issuedAt).toLocaleDateString('uz-UZ', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          {certificate.pdfUrl && (
                            <a
                              href={certificate.pdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                              title="Ko'rish"
                            >
                              <EditIcon className="size-5" />
                            </a>
                          )}
                          <button
                            onClick={() => handleDownload(certificate.certificateNo)}
                            className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900 rounded"
                            title="Yuklab olish"
                          >
                            <DownloadIcon className="size-5" />
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
