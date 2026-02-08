import { useState, useEffect } from 'react';
import axiosClient from '../../service/axios.service';
import { toast } from 'react-toastify';
import PageMeta from '../../components/common/PageMeta';
import Select from '../../components/form/Select';
import { Modal } from '../../components/ui/modal';
import ConfirmDeleteModal from '../../components/ui/ConfirmDeleteModal';
import Button from '../../components/ui/button/Button';
import { useModal } from '../../hooks/useModal';
import { EyeIcon, DeleteIcon } from '../../icons';

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
  subscriptionDuration?: string;
  user: { id: number; firstName?: string; surname?: string; phone: string };
  course?: { id: number; title: string; price?: number };
  promoCode?: { code: string; discountPercent?: number; discountAmount?: number };
}

const PaymentsPage = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [deletePaymentId, setDeletePaymentId] = useState<number | null>(null);
  
  const { isOpen: isViewOpen, openModal: openViewModal, closeModal: closeViewModal } = useModal();
  const { isOpen: isDeleteOpen, openModal: openDeleteModal, closeModal: closeDeleteModal } = useModal();

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

  const handleViewClick = (payment: Payment) => {
    setSelectedPayment(payment);
    openViewModal();
  };

  const handleDeleteClick = (id: number) => {
    setDeletePaymentId(id);
    openDeleteModal();
  };

  const handleDeleteConfirm = async () => {
    if (!deletePaymentId) return;

    try {
      await axiosClient.delete(`/payment/${deletePaymentId}`);
      toast.success("To'lov o'chirildi!");
      fetchPayments();
      closeDeleteModal();
      setDeletePaymentId(null);
    } catch (error: any) {
      toast.error("To'lovni o'chirishda xato!");
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      SUCCESS: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      FAILED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      CANCELLED: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const statuses: { [key: string]: string } = {
      SUCCESS: 'Muvaffaqiyatli',
      PENDING: 'Kutilmoqda',
      FAILED: 'Muvaffaqiyatsiz',
      CANCELLED: 'Bekor qilingan',
    };
    return statuses[status] || status;
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

  const getDurationText = (duration?: string) => {
    const durations: { [key: string]: string } = {
      ONE_MONTH: '1 oy',
      SIX_MONTHS: '6 oy',
      ONE_YEAR: '1 yil',
    };
    return duration ? durations[duration] || duration : '-';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('uz-UZ').format(amount) + ' so\'m';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}.${month}.${year} ${hours}:${minutes}`;
  };

  return (
    <>
      <PageMeta title="To'lovlar" />
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">To'lovlar</h1>
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

        {!loading && payments.length === 0 && (
          <div className="text-center py-8 text-gray-600 dark:text-gray-400">
            To'lovlar topilmadi
          </div>
        )}

        {!loading && payments.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Foydalanuvchi
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Turi
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Kurs
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Summa
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Usul
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Holat
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Sana
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Amallar
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      #{payment.id}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">
                      <div>
                        <div className="font-medium">
                          {payment.user?.firstName || payment.user?.surname
                            ? `${payment.user?.firstName || ''} ${payment.user?.surname || ''}`.trim()
                            : 'Noma\'lum'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {payment.user?.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        payment.type === 'BALANCE_TOPUP' 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                      }`}>
                        {getTypeText(payment.type)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">
                      <div className="max-w-xs truncate">
                        {payment.course?.title || '-'}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <div>
                        <div className="font-semibold text-green-600 dark:text-green-400">
                          {formatCurrency(payment.amount)}
                        </div>
                        {payment.discount && payment.discount > 0 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            <span className="line-through">
                              {formatCurrency(payment.originalAmount || 0)}
                            </span>
                            <span className="ml-1 text-red-600 dark:text-red-400">
                              -{formatCurrency(payment.discount)}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {getMethodText(payment.method)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                          payment.status
                        )}`}
                      >
                        {getStatusText(payment.status)}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {formatDate(payment.createdAt)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="mini"
                          variant="outline"
                          onClick={() => handleViewClick(payment)}
                          aria-label="Ko'rish"
                        >
                          <EyeIcon className="w-4 h-4 text-blue-500" />
                        </Button>
                        <Button
                          size="mini"
                          variant="outline"
                          onClick={() => handleDeleteClick(payment.id)}
                          aria-label="O'chirish"
                        >
                          <DeleteIcon className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Modal */}
      <Modal
        isOpen={isViewOpen}
        onClose={closeViewModal}
        className="max-w-[700px] m-4"
      >
        <div className="relative w-full p-6 bg-white rounded-3xl dark:bg-gray-900">
          <div className="px-2 pr-14">
            <h4 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-white/90">
              To'lov tafsilotlari
            </h4>
          </div>
          {selectedPayment && (
            <div className="px-2 space-y-4">
              {/* To'lov ID, Turi va Holat */}
              <div className="pb-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">To'lov ID</p>
                    <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                      #{selectedPayment.id}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                      selectedPayment.status
                    )}`}
                  >
                    {getStatusText(selectedPayment.status)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400">To'lov turi:</span>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    selectedPayment.type === 'BALANCE_TOPUP' 
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                  }`}>
                    {getTypeText(selectedPayment.type)}
                  </span>
                </div>
              </div>

              {/* Foydalanuvchi */}
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Foydalanuvchi</p>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {selectedPayment.user?.firstName || selectedPayment.user?.surname
                      ? `${selectedPayment.user?.firstName || ''} ${selectedPayment.user?.surname || ''}`.trim()
                      : 'Noma\'lum'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {selectedPayment.user?.phone}
                  </p>
                </div>
              </div>

              {/* Kurs - faqat COURSE_PURCHASE type uchun */}
              {selectedPayment.type === 'COURSE_PURCHASE' && selectedPayment.course && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Kurs</p>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {selectedPayment.course.title}
                    </p>
                    {selectedPayment.subscriptionDuration && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Obuna: {getDurationText(selectedPayment.subscriptionDuration)}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Summa ma'lumotlari */}
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Summa</p>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2">
                  {selectedPayment.originalAmount && selectedPayment.originalAmount > selectedPayment.amount && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Asl narx:</span>
                      <span className="text-gray-500 line-through">{formatCurrency(selectedPayment.originalAmount)}</span>
                    </div>
                  )}
                  {selectedPayment.discount && selectedPayment.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Chegirma:</span>
                      <span className="text-red-600 dark:text-red-400">-{formatCurrency(selectedPayment.discount)}</span>
                    </div>
                  )}
                  {selectedPayment.promoCode && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Promo kod:</span>
                      <span className="text-gray-900 dark:text-gray-100 font-semibold">
                        {selectedPayment.promoCode.code}
                        {selectedPayment.promoCode.discountPercent && ` (-${selectedPayment.promoCode.discountPercent}%)`}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-base font-semibold text-gray-900 dark:text-white">Jami:</span>
                    <span className="text-lg font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(selectedPayment.amount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* To'lov tafsilotlari */}
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">To'lov tafsilotlari</p>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Turi:</span>
                    <span className="text-gray-900 dark:text-gray-100">{getTypeText(selectedPayment.type)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Usuli:</span>
                    <span className="text-gray-900 dark:text-gray-100">{getMethodText(selectedPayment.method)}</span>
                  </div>
                  {selectedPayment.transactionId && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Tranzaksiya:</span>
                      <span className="text-gray-900 dark:text-gray-100 font-mono text-xs">{selectedPayment.transactionId}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Yaratilgan:</span>
                    <span className="text-gray-900 dark:text-gray-100">{formatDate(selectedPayment.createdAt)}</span>
                  </div>
                  {selectedPayment.paymentDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">To'langan:</span>
                      <span className="text-gray-900 dark:text-gray-100">{formatDate(selectedPayment.paymentDate)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 px-2 mt-6">
                <Button size="sm" variant="outline" onClick={closeViewModal}>
                  Yopish
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Delete Modal */}
      <ConfirmDeleteModal
        isOpen={isDeleteOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        title="To'lovni o'chirish"
        message="Ushbu to'lovni o'chirishni xohlaysizmi? Bu amalni bekor qilib bo'lmaydi."
      />
    </>
  );
};

export default PaymentsPage;
