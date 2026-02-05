import { useState, useEffect } from 'react';
import axiosClient from '../../service/axios.service';
import { toast } from 'react-toastify';
import PageMeta from '../../components/common/PageMeta';
import Select from '../../components/form/Select';

interface Enrollment {
  id: number;
  subscriptionDuration: string;
  isActive: boolean;
  enrolledAt: string;
  expiresAt?: string;
  user: { id: number; firstName?: string; surname?: string; phone: string };
  course: { id: number; title: string; thumbnail?: string };
}

const EnrollmentsPage = () => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('ALL');

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

  return (
    <>
      <PageMeta title="Obunalar" />
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Obunalar</h1>
          <div className="w-64">
            <Select
              options={[
                { value: 'ALL', label: 'Barcha obunalar' },
                { value: 'ACTIVE', label: 'Faol' },
                { value: 'INACTIVE', label: 'Nofaol' },
              ]}
              defaultValue={filter}
              onChange={(value) => setFilter(value)}
              placeholder="Filter tanlang"
            />
          </div>
        </div>

        {loading && <div className="text-center py-4">Yuklanmoqda...</div>}

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
                  <tr key={enrollment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      #{enrollment.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      <div>
                        <div className="font-medium">
                          {enrollment.user?.firstName || enrollment.user?.surname
                            ? `${enrollment.user?.firstName || ''} ${enrollment.user?.surname || ''}`
                            : 'Noma\'lum'}
                        </div>
                        <div className="text-xs text-gray-500">{enrollment.user?.phone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                      <div className="flex items-center">
                        {enrollment.course?.thumbnail && (
                          <img
                            src={enrollment.course.thumbnail.startsWith('http') ? enrollment.course.thumbnail : `${import.meta.env.VITE_STATIC_PATH}${enrollment.course.thumbnail}`}
                            alt={enrollment.course.title}
                            className="h-10 w-16 rounded object-cover mr-3"
                          />
                        )}
                        <span className="font-medium">{enrollment.course?.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {getDurationText(enrollment.subscriptionDuration)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {enrollment.expiresAt ? (
                        <div>
                          <div className="text-gray-900 dark:text-gray-100">
                            {new Date(enrollment.expiresAt).toLocaleDateString('uz-UZ')}
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
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(enrollment)}
                        className={`px-2 py-1 text-xs font-semibold rounded ${
                          enrollment.isActive
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {enrollment.isActive ? 'Faol' : 'Nofaol'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => toast.info('Batafsil ma\'lumot funksiyasi qo\'shilmoqda...')}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400"
                      >
                        Batafsil
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default EnrollmentsPage;
