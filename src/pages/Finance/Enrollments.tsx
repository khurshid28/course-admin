import { useState, useEffect } from 'react';
import axiosClient, { getImageUrl } from '../../service/axios.service';
import { toast } from 'react-toastify';
import PageMeta from '../../components/common/PageMeta';
import Select from '../../components/form/Select';
import { Modal } from '../../components/ui/modal';
import Button from '../../components/ui/button/Button';
import { EyeIcon } from '../../icons';
import { useModal } from '../../hooks/useModal';

interface Enrollment {
  id: number;
  subscriptionDuration: string;
  isActive: boolean;
  enrolledAt: string;
  expiresAt?: string;
  user: { id: number; firstName?: string; surname?: string; phone: string };
  course: { 
    id: number; 
    title: string; 
    thumbnail?: string;
    banners?: Array<{
      id: number;
      image: string;
      title: string;
    }>;
  };
  payment?: {
    id: number;
    amount: number;
    originalAmount?: number;
    discount?: number;
    subscriptionDuration?: string;
    promoCode?: {
      id: number;
      code: string;
      discount: number;
    };
  } | null;
}

const EnrollmentsPage = () => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [viewingEnrollment, setViewingEnrollment] = useState<Enrollment | null>(null);
  
  const { isOpen: isViewOpen, openModal: openViewModal, closeModal: closeViewModal } = useModal();

  useEffect(() => {
    fetchEnrollments();
  }, [filter]);

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      let url = '/enrollment';
      if (filter !== 'ALL') {
        url += `?isActive=${filter === 'ACTIVE'}`;
      }
      const response = await axiosClient.get(url);
      console.log('Enrollment data:', response.data);
      if (response.data.length > 0) {
        console.log('First enrollment:', response.data[0]);
        console.log('- Course:', response.data[0].course);
        console.log('- Payment:', response.data[0].payment);
        console.log('- Subscription Duration:', response.data[0].subscriptionDuration);
      }
      setEnrollments(response.data);
    } catch (error: any) {
      toast.error('Obunalarni yuklashda xato!');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (enrollment: Enrollment) => {
    try {
      await axiosClient.patch(`/enrollment/${enrollment.id}`, {
        isActive: !enrollment.isActive,
      });
      toast.success('Obuna holati o\'zgartirildi!');
      fetchEnrollments();
    } catch (error: any) {
      toast.error('Xatolik yuz berdi!');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + ' so\'m';
  };

  const getDurationText = (duration: string) => {
    const durations: { [key: string]: string } = {
      ONE_MONTH: '1 oy',
      SIX_MONTHS: '6 oy',
      ONE_YEAR: '1 yil',
    };
    return durations[duration] || duration;
  };

  const getDaysRemaining = (expiresAt?: string) => {
    if (!expiresAt) return null;
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const getExpiryColor = (days: number | null) => {
    if (days === null) return 'text-gray-500';
    if (days < 0) return 'text-red-600';
    if (days < 7) return 'text-orange-600';
    if (days < 30) return 'text-yellow-600';
    return 'text-green-600';
  };

  const handleViewClick = (enrollment: Enrollment) => {
    setViewingEnrollment(enrollment);
    openViewModal();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uz-UZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <PageMeta title="Obunalar" />
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Obunalar</h1>
          <div className="w-64">
            <Select
              options={[
                { value: 'ALL', label: 'Barcha obunalar' },
                { value: 'ACTIVE', label: 'Faol' },
                { value: 'INACTIVE', label: 'Nofaol' },
              ]}
              defaultValue={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter tanlang"
            />
          </div>
        </div>

        {loading && (
          <div className="text-center py-8 text-gray-600 dark:text-gray-400">
            Yuklanmoqda...
          </div>
        )}

        {!loading && enrollments.length === 0 && (
          <div className="text-center py-8 text-gray-600 dark:text-gray-400">
            Obunalar topilmadi
          </div>
        )}

        {!loading && enrollments.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Foydalanuvchi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Kurs
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Davomiyligi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Narx
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Promo kod
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Amal qilish muddati
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Holat
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Amallar
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {enrollments.map((enrollment) => {
                  const daysRemaining = getDaysRemaining(enrollment.expiresAt);
                  return (
                    <tr key={enrollment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        #{enrollment.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        <div>
                          <div className="font-medium">
                            {enrollment.user?.firstName || enrollment.user?.surname
                              ? `${enrollment.user?.firstName || ''} ${enrollment.user?.surname || ''}`.trim()
                              : 'Noma\'lum'}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{enrollment.user?.phone}</div>
                        </div>
                      </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                      <div className="flex items-center gap-3">
                        {(enrollment.course?.banners?.[0]?.image || enrollment.course?.thumbnail) ? (
                          <img
                            src={getImageUrl(enrollment.course.banners?.[0]?.image || enrollment.course.thumbnail || '') || undefined}
                            alt={enrollment.course.title}
                            className="h-12 w-16 rounded object-cover flex-shrink-0 bg-gray-100 dark:bg-gray-700"
                            onLoad={() => {
                              console.log('Image loaded successfully for:', enrollment.course.title);
                            }}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              console.error('Image failed to load for course:', enrollment.course.title);
                              console.error('Banner image:', enrollment.course.banners?.[0]?.image);
                              console.error('Thumbnail:', enrollment.course.thumbnail);
                              console.error('Attempted URL:', target.src);
                              target.onerror = null;
                              target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23e5e7eb"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="12"%3ENo Image%3C/text%3E%3C/svg%3E';
                            }}
                          />
                        ) : (
                          <div className="h-12 w-16 rounded bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {enrollment.course?.title?.substring(0, 2).toUpperCase() || 'NA'}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{enrollment.course?.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">ID: {enrollment.course?.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {getDurationText(enrollment.subscriptionDuration)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {enrollment.payment ? (
                        <div>
                          <div className="font-semibold text-green-600 dark:text-green-400">
                            {formatPrice(Number(enrollment.payment.amount))}
                          </div>
                          {enrollment.payment.originalAmount && Number(enrollment.payment.originalAmount) > Number(enrollment.payment.amount) && (
                            <div className="text-xs text-gray-500 line-through">
                              {formatPrice(Number(enrollment.payment.originalAmount))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {enrollment.payment?.promoCode ? (
                        <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300">
                          <span className="text-xs font-mono font-semibold">{enrollment.payment.promoCode.code}</span>
                          <span className="ml-1 text-xs">(-{enrollment.payment.promoCode.discount}%)</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {enrollment.expiresAt ? (
                        <div>
                          <div className="text-gray-900 dark:text-gray-100">
                            {new Date(enrollment.expiresAt).toLocaleDateString('uz-UZ', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })}
                          </div>
                          {daysRemaining !== null && (
                            <div className={`text-xs font-semibold ${getExpiryColor(daysRemaining)}`}>
                              {daysRemaining < 0
                                ? `${Math.abs(daysRemaining)} kun oldin tugagan`
                                : daysRemaining === 0
                                ? 'Bugun tugaydi'
                                : `${daysRemaining} kun qoldi`}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(enrollment)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
                          enrollment.isActive
                            ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-200'
                        }`}
                      >
                        {enrollment.isActive ? 'Faol' : 'Nofaol'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button
                        size="mini"
                        variant="outline"
                        onClick={() => handleViewClick(enrollment)}
                        aria-label="Ko'rish"
                      >
                        <EyeIcon className="w-4 h-4 text-blue-500" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        )}
      </div>

      {/* View Modal */}
      <Modal isOpen={isViewOpen} onClose={closeViewModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-6 bg-white rounded-3xl dark:bg-gray-900">
          <div className="px-2 pr-14">
            <h4 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Obuna ma'lumotlari
            </h4>
          </div>
          {viewingEnrollment && (
            <div className="px-2 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Obuna ID</p>
                  <p className="text-base font-medium text-gray-800 dark:text-white">#{viewingEnrollment.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Holati</p>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full inline-block ${
                    viewingEnrollment.isActive
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {viewingEnrollment.isActive ? 'Faol' : 'Nofaol'}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Foydalanuvchi</p>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-base font-medium text-gray-800 dark:text-white">
                    {viewingEnrollment.user?.firstName || viewingEnrollment.user?.surname
                      ? `${viewingEnrollment.user?.firstName || ''} ${viewingEnrollment.user?.surname || ''}`.trim()
                      : 'Noma\'lum'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{viewingEnrollment.user?.phone}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Kurs</p>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  {viewingEnrollment.course && (
                    <>
                      {/* Banner image if available, otherwise thumbnail */}
                      {(viewingEnrollment.course.banners?.[0]?.image || viewingEnrollment.course.thumbnail) ? (
                        <img
                          src={getImageUrl(
                            viewingEnrollment.course.banners?.[0]?.image || viewingEnrollment.course.thumbnail || ''
                          ) || undefined}
                          alt={viewingEnrollment.course.title}
                          className="w-full h-40 object-cover rounded-lg mb-3"
                          onLoad={() => {
                            console.log('Modal image loaded for:', viewingEnrollment.course.title);
                          }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            console.error('Modal image failed for:', viewingEnrollment.course.title);
                            console.error('Banner:', viewingEnrollment.course.banners?.[0]?.image);
                            console.error('Thumbnail:', viewingEnrollment.course.thumbnail);
                            console.error('URL:', target.src);
                            target.onerror = null;
                            target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23e5e7eb"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="12"%3ENo Image%3C/text%3E%3C/svg%3E';
                          }}
                        />
                      ) : (
                        <div className="w-full h-40 rounded-lg mb-3 bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-3xl font-bold">
                          {viewingEnrollment.course.title?.substring(0, 2).toUpperCase() || 'NA'}
                        </div>
                      )}
                      <p className="text-base font-medium text-gray-800 dark:text-white">
                        {viewingEnrollment.course.title}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">ID: {viewingEnrollment.course.id}</p>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Davomiyligi</p>
                  <p className="text-base font-medium text-gray-800 dark:text-white">
                    {getDurationText(viewingEnrollment.subscriptionDuration)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Obuna sanasi</p>
                  <p className="text-base font-medium text-gray-800 dark:text-white">
                    {formatDate(viewingEnrollment.enrolledAt)}
                  </p>
                </div>
              </div>

              {viewingEnrollment.expiresAt && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Tugash sanasi</p>
                  <div className="mt-1">
                    <p className="text-base font-medium text-gray-800 dark:text-white">
                      {new Date(viewingEnrollment.expiresAt).toLocaleDateString('uz-UZ', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </p>
                    {(() => {
                      const daysRemaining = getDaysRemaining(viewingEnrollment.expiresAt);
                      if (daysRemaining !== null) {
                        return (
                          <p className={`text-sm font-semibold mt-1 ${getExpiryColor(daysRemaining)}`}>
                            {daysRemaining < 0
                              ? `${Math.abs(daysRemaining)} kun oldin tugagan`
                              : daysRemaining === 0
                              ? 'Bugun tugaydi'
                              : `${daysRemaining} kun qoldi`}
                          </p>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </div>
              )}

              {/* Payment Information */}
              {viewingEnrollment.payment && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">To'lov ma'lumotlari</p>
                  <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">To'lov summasi:</span>
                      <span className="text-lg font-bold text-green-600 dark:text-green-400">
                        {formatPrice(Number(viewingEnrollment.payment.amount))}
                      </span>
                    </div>
                    {viewingEnrollment.payment.originalAmount && Number(viewingEnrollment.payment.originalAmount) > Number(viewingEnrollment.payment.amount) && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Asl narx:</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                          {formatPrice(Number(viewingEnrollment.payment.originalAmount))}
                        </span>
                      </div>
                    )}
                    {viewingEnrollment.payment.discount && Number(viewingEnrollment.payment.discount) > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Chegirma:</span>
                        <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                          -{formatPrice(Number(viewingEnrollment.payment.discount))}
                        </span>
                      </div>
                    )}
                    {viewingEnrollment.payment.promoCode && (
                      <div className="flex justify-between items-center pt-2 border-t border-green-200 dark:border-green-800">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Promo kod:</span>
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300">
                          <span className="text-sm font-mono font-bold">{viewingEnrollment.payment.promoCode.code}</span>
                          <span className="ml-2 text-xs font-semibold">-{viewingEnrollment.payment.promoCode.discount}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end gap-3 px-2 mt-6">
            <Button size="sm" variant="outline" onClick={closeViewModal}>
              Yopish
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default EnrollmentsPage;
