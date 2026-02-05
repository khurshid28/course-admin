import { useState, useEffect } from 'react';
import axiosClient from '../../service/axios.service';
import { toast } from 'react-toastify';
import PageMeta from '../../components/common/PageMeta';

interface PromoCode {
  id: number;
  code: string;
  discountPercent?: number;
  discountAmount?: number;
  type: string;
  maxUsageCount?: number;
  currentUsageCount: number;
  expiresAt?: string;
  isActive: boolean;
  createdAt: string;
}

const PromoCodesPage = () => {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  const fetchPromoCodes = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get('/promo-code');
      setPromoCodes(response.data);
    } catch (error: any) {
      toast.error('Promo kodlarni yuklashda xato!');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return;

    try {
      await axiosClient.delete(`/promo-code/${id}`);
      toast.success("Promo kod o'chirildi!");
      fetchPromoCodes();
    } catch (error: any) {
      toast.error("O'chirishda xato!");
    }
  };

  const handleToggleActive = async (promoCode: PromoCode) => {
    try {
      await axiosClient.patch(`/promo-code/${promoCode.id}`, {
        isActive: !promoCode.isActive,
      });
      toast.success('Promo kod holati o\'zgartirildi!');
      fetchPromoCodes();
    } catch (error: any) {
      toast.error('Xatolik yuz berdi!');
    }
  };

  const getDiscountText = (promoCode: PromoCode) => {
    if (promoCode.discountPercent) {
      return `${promoCode.discountPercent}%`;
    }
    if (promoCode.discountAmount) {
      return `${promoCode.discountAmount} so'm`;
    }
    return '-';
  };

  const getTypeText = (type: string) => {
    const types: { [key: string]: string } = {
      SINGLE_USE: 'Bir martalik',
      USER_SINGLE_USE: 'Har user uchun 1 marta',
      UNLIMITED: 'Cheksiz',
    };
    return types[type] || type;
  };

  return (
    <>
      <PageMeta title="Promo Kodlar" />
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Promo Kodlar</h1>
          <button
            onClick={() => toast.info('Promo kod qo\'shish funksiyasi qo\'shilmoqda...')}
            className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700"
          >
            + Yangi Promo Kod
          </button>
        </div>

        {loading && <div className="text-center py-4">Yuklanmoqda...</div>}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Kod
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Chegirma
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Turi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Foydalanish
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
              {promoCodes.map((promoCode) => (
                <tr key={promoCode.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono font-bold text-brand-600">
                      {promoCode.code}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    <span className="font-semibold text-green-600">
                      {getDiscountText(promoCode)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {getTypeText(promoCode.type)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    <span className="font-medium">
                      {promoCode.currentUsageCount}
                      {promoCode.maxUsageCount && ` / ${promoCode.maxUsageCount}`}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {promoCode.expiresAt
                      ? new Date(promoCode.expiresAt).toLocaleDateString('uz-UZ')
                      : 'Cheksiz'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleActive(promoCode)}
                      className={`px-2 py-1 text-xs font-semibold rounded ${
                        promoCode.isActive
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {promoCode.isActive ? 'Faol' : 'Nofaol'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => toast.info('Tahrirlash funksiyasi qo\'shilmoqda...')}
                      className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400"
                    >
                      Tahrirlash
                    </button>
                    <button
                      onClick={() => handleDelete(promoCode.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400"
                    >
                      O'chirish
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default PromoCodesPage;
