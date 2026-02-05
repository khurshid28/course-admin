import { useState, useEffect } from 'react';
import axiosClient from '../../service/axios.service';
import { toast } from 'react-toastify';
import PageMeta from '../../components/common/PageMeta';
import Select from '../../components/form/Select';

interface Payment {
  id: number;
  amount: number;
  originalAmount?: number;
  discount?: number;
  method: string;
  type: string;
  status: string;
  transactionId?: string;
  paymentDate?: string;
  createdAt: string;
  user: { id: number; firstName?: string; surname?: string; phone: string };
  course?: { id: number; title: string };
}

const PaymentsPage = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchPayments();
  }, [filter]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      let url = '/payment';
      if (filter !== 'ALL') {
        url += `?status=${filter}`;
      }
      const response = await axiosClient.get(url);
      setPayments(response.data);
    } catch (error: any) {
      toast.error("To'lovlarni yuklashda xato!");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      SUCCESS: 'bg-green-100 text-green-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      FAILED: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getMethodText = (method: string) => {
    const methods: { [key: string]: string } = {
      CLICK: 'Click',
      PAYME: 'Payme',
      UZUM: 'Uzum',
      BALANCE: 'Balans',
    };
    return methods[method] || method;
  };

  const getTypeText = (type: string) => {
    const types: { [key: string]: string } = {
      COURSE_PURCHASE: 'Kurs sotib olish',
      BALANCE_TOPUP: 'Balans to\'ldirish',
    };
    return types[type] || type;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('uz-UZ').format(amount) + ' so\'m';
  };

  return (
    <>
      <PageMeta title="To'lovlar" />
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">To'lovlar</h1>
          <div className="w-64">
            <Select
              options={[
                { value: 'ALL', label: "Barcha to'lovlar" },
                { value: 'SUCCESS', label: 'Muvaffaqiyatli' },
                { value: 'PENDING', label: 'Kutilmoqda' },
                { value: 'FAILED', label: 'Muvaffaqiyatsiz' },
                { value: 'CANCELLED', label: 'Bekor qilingan' },
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
                  Summa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Usul
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Turi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Holat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Sana
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    #{payment.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    <div>
                      <div className="font-medium">
                        {payment.user?.firstName || payment.user?.surname
                          ? `${payment.user?.firstName || ''} ${payment.user?.surname || ''}`
                          : 'Noma\'lum'}
                      </div>
                      <div className="text-xs text-gray-500">{payment.user?.phone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                    {payment.course?.title || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    <div>
                      <div className="font-semibold text-green-600">
                        {formatCurrency(payment.amount)}
                      </div>
                      {payment.discount && payment.discount > 0 && (
                        <div className="text-xs text-gray-500">
                          <span className="line-through">
                            {formatCurrency(payment.originalAmount || 0)}
                          </span>
                          <span className="ml-1 text-red-600">
                            -{formatCurrency(payment.discount)}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {getMethodText(payment.method)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {getTypeText(payment.type)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                        payment.status
                      )}`}
                    >
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {new Date(payment.createdAt).toLocaleDateString('uz-UZ', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
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

export default PaymentsPage;
