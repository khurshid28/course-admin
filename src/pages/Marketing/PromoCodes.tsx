import { useState, useEffect } from 'react';
import axiosClient from '../../service/axios.service';
import { toast } from 'react-toastify';
import PageMeta from '../../components/common/PageMeta';
import { PencilIcon, DeleteIcon, PlusIcon } from '../../icons';
import Button from '../../components/ui/button/Button';
import { Modal } from '../../components/ui/modal';
import ConfirmDeleteModal from '../../components/ui/ConfirmDeleteModal';
import { useModal } from '../../hooks/useModal';
import Label from '../../components/form/Label';
import Input from '../../components/form/input/InputField';
import Select from '../../components/form/Select';

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
  const { isOpen, openModal, closeModal } = useModal();
  const { isOpen: isDeleteOpen, openModal: openDeleteModal, closeModal: closeDeleteModal } = useModal();
  const [editingPromoCode, setEditingPromoCode] = useState<PromoCode | null>(null);
  const [deletingPromoCodeId, setDeletingPromoCodeId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<PromoCode>>({
    code: '',
    type: 'SINGLE_USE',
    discountPercent: 0,
    discountAmount: 0,
    maxUsageCount: undefined,
    isActive: true,
  });

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

  const handleDeleteClick = (id: number) => {
    setDeletingPromoCodeId(id);
    openDeleteModal();
  };

  const handleDeleteConfirm = async () => {
    if (!deletingPromoCodeId) return;
    try {
      await axiosClient.delete(`/promo-code/${deletingPromoCodeId}`);
      toast.success("Promo kod o'chirildi!");
      await fetchPromoCodes();
      closeDeleteModal();
      setDeletingPromoCodeId(null);
    } catch (error: any) {
      toast.error("O'chirishda xato!");
    }
  };

  const handleEdit = (promoCode: PromoCode) => {
    setEditingPromoCode(promoCode);
    setFormData({
      code: promoCode.code,
      type: promoCode.type,
      discountPercent: promoCode.discountPercent || 0,
      discountAmount: promoCode.discountAmount || 0,
      maxUsageCount: promoCode.maxUsageCount,
      expiresAt: promoCode.expiresAt,
      isActive: promoCode.isActive,
    });
    openModal();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingPromoCode) {
        await axiosClient.patch(`/promo-code/${editingPromoCode.id}`, formData);
        toast.success('Promo kod yangilandi!');
      } else {
        await axiosClient.post('/promo-code', formData);
        toast.success('Promo kod qo\'shildi!');
      }
      await fetchPromoCodes();
      closeModal();
      resetForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi!');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      type: 'SINGLE_USE',
      discountPercent: 0,
      discountAmount: 0,
      maxUsageCount: undefined,
      isActive: true,
    });
    setEditingPromoCode(null);
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
          <h1 className="text-2xl font-bold dark:text-white">Promo Kodlar</h1>
          <Button
            size="sm"
            variant="primary"
            startIcon={<PlusIcon className="size-5 fill-white" />}
            onClick={() => {
              resetForm();
              openModal();
            }}
          >
            Qo'shish
          </Button>
        </div>

        {loading && <div className="text-center py-4 dark:text-white">Yuklanmoqda...</div>}

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
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        size="mini"
                        variant="outline"
                        onClick={() => handleEdit(promoCode)}
                      >
                        <PencilIcon className="size-4 fill-black dark:fill-white" />
                      </Button>
                      <Button
                        size="mini"
                        variant="outline"
                        onClick={() => handleDeleteClick(promoCode.id)}
                      >
                        <DeleteIcon className="size-4 fill-black dark:fill-white" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add/Edit Modal */}
        <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[600px] m-4">
          <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
            <div className="px-2 pr-14">
              <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                {editingPromoCode ? 'Promo kod tahrirlash' : 'Yangi Promo Kod'}
              </h4>
              <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
                Promo kod ma'lumotlarini to'ldiring
              </p>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col">
              <div className="px-2 overflow-y-auto custom-scrollbar">
                <div className="space-y-5">
                  <div>
                    <Label>Kod</Label>
                    <Input
                      type="text"
                      value={formData.code || ''}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="PROMO2024"
                      required
                    />
                  </div>
                  <div>
                    <Label>Turi</Label>
                    <Select
                      options={[
                        { value: 'SINGLE_USE', label: 'Bir martalik' },
                        { value: 'USER_SINGLE_USE', label: 'Har user uchun 1 marta' },
                        { value: 'UNLIMITED', label: 'Cheksiz' },
                      ]}
                      defaultValue={formData.type || 'SINGLE_USE'}
                      onChange={(value) => setFormData({ ...formData, type: value })}
                      placeholder="Tur tanlang"
                    />
                  </div>
                  <div>
                    <Label>Chegirma foizi (%)</Label>
                    <Input
                      type="number"
                      value={formData.discountPercent || 0}
                      onChange={(e) => setFormData({ ...formData, discountPercent: parseInt(e.target.value) || 0 })}
                      placeholder="10"
                      min="0"
                      max="100"
                    />
                  </div>
                  <div>
                    <Label>Chegirma miqdori (so'm)</Label>
                    <Input
                      type="number"
                      value={formData.discountAmount || 0}
                      onChange={(e) => setFormData({ ...formData, discountAmount: parseInt(e.target.value) || 0 })}
                      placeholder="50000"
                      min="0"
                    />
                  </div>
                  <div>
                    <Label>Maksimal foydalanish soni (ixtiyoriy)</Label>
                    <Input
                      type="number"
                      value={formData.maxUsageCount || ''}
                      onChange={(e) => setFormData({ ...formData, maxUsageCount: e.target.value ? parseInt(e.target.value) : undefined })}
                      placeholder="100"
                      min="1"
                    />
                  </div>
                  <div>
                    <Label>Amal qilish muddati (ixtiyoriy)</Label>
                    <Input
                      type="date"
                      value={formData.expiresAt ? new Date(formData.expiresAt).toISOString().split('T')[0] : ''}
                      onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="mr-2 w-4 h-4 text-brand-600 bg-gray-100 border-gray-300 rounded focus:ring-brand-500 dark:focus:ring-brand-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <Label className="mb-0!">Faol</Label>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 px-2 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    closeModal();
                    resetForm();
                  }}
                >
                  Bekor qilish
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                >
                  {loading ? 'Saqlanmoqda...' : 'Saqlash'}
                </Button>
              </div>
            </form>
          </div>
        </Modal>

        {/* Delete Confirmation Modal */}
        <ConfirmDeleteModal
          isOpen={isDeleteOpen}
          onClose={closeDeleteModal}
          onConfirm={handleDeleteConfirm}
          title="Promo kodni o'chirish"
          message="Ushbu promo kodni o'chirmoqchimisiz? Bu amalni bekor qilib bo'lmaydi."
        />
      </div>
    </>
  );
};

export default PromoCodesPage;
