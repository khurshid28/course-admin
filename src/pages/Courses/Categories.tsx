import { useState, useEffect } from 'react';
import axiosClient, { getImageUrl } from '../../service/axios.service';
import { toast } from 'react-toastify';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import { PencilIcon, DeleteIcon, PlusIcon } from '../../icons';
import Button from '../../components/ui/button/Button';
import { Modal } from '../../components/ui/modal';
import { useModal } from '../../hooks/useModal';
import ConfirmDeleteModal from '../../components/ui/ConfirmDeleteModal';
import Label from '../../components/form/Label';
import Input from '../../components/form/input/InputField';
import Badge from '../../components/ui/badge/Badge';
import { LoadSpinner } from '../../components/spinner/load-spinner';

interface Category {
  id: number;
  name: string;
  nameUz: string;
  icon?: string;
  image?: string;
  isActive: boolean;
  createdAt: string;
}

const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const { isOpen, openModal, closeModal } = useModal();
  const { isOpen: isDeleteOpen, openModal: openDeleteModal, closeModal: closeDeleteModal } = useModal();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    nameUz: '',
    icon: '',
    image: '',
    isActive: true,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get('/category');
      setCategories(response.data);
    } catch (error: any) {
      toast.error('Kategoriyalarni yuklashda xato!');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingCategory) {
        await axiosClient.patch(`/category/${editingCategory.id}`, formData);
        toast.success('Kategoriya yangilandi!');
      } else {
        await axiosClient.post('/category', formData);
        toast.success('Kategoriya qo\'shildi!');
      }
      fetchCategories();
      closeModal();
      resetForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi!');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingCategoryId(id);
    openDeleteModal();
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCategoryId) return;
    try {
      await axiosClient.delete(`/category/${deletingCategoryId}`);
      toast.success('Kategoriya o\'chirildi!');
      fetchCategories();
      closeDeleteModal();
      setDeletingCategoryId(null);
    } catch (error: unknown) {
      toast.error('O\'chirishda xato!');
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      nameUz: category.nameUz,
      icon: category.icon || '',
      image: category.image || '',
      isActive: category.isActive,
    });
    openModal();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      nameUz: '',
      icon: '',
      image: '',
      isActive: true,
    });
    setEditingCategory(null);
  };

  return (
    <>
      <PageMeta title="Kategoriyalar" description="Kurslar kategoriyalarini boshqarish" />
      <PageBreadcrumb pageTitle="Kategoriyalar" />
      
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Kategoriyalar</h1>
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

        {loading && (
          <div className="min-h-[300px] flex justify-center items-center">
            <LoadSpinner />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              {category.image && (
                <div className="relative">
                  <img
                    src={getImageUrl(category.image) || category.image}
                    alt={category.name}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = 'none';
                    }}
                  />
                  <div className="absolute top-2 right-2">
                    <Badge size="sm" color={category.isActive ? 'success' : 'error'}>
                      {category.isActive ? 'Faol' : 'Nofaol'}
                    </Badge>
                  </div>
                </div>
              )}
              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  {category.icon && (
                    <img
                      src={category.icon}
                      alt="icon"
                      className="w-10 h-10 object-contain"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.style.display = 'none';
                      }}
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {category.nameUz}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {category.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ID: #{category.id}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      size="mini"
                      variant="outline"
                      onClick={() => handleEdit(category)}
                    >
                      <PencilIcon className="size-4 fill-black dark:fill-white" />
                    </Button>
                    <Button
                      size="mini"
                      variant="outline"
                      onClick={() => handleDelete(category.id)}
                    >
                      <DeleteIcon className="size-4 fill-black dark:fill-white" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!loading && categories.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">Hozircha kategoriyalar yo&apos;q</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal isOpen={isOpen} onClose={() => { closeModal(); resetForm(); }} className="max-w-[600px] m-4">
          <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
            <div className="px-2 pr-14">
              <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                {editingCategory ? 'Kategoriyani Tahrirlash' : 'Yangi Kategoriya'}
              </h4>
              <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
                Kategoriya ma'lumotlarini kiriting
              </p>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col">
              <div className="custom-scrollbar max-h-[450px] overflow-y-auto px-2 pb-3 space-y-4">
                <div>
                  <Label>Nom (EN)</Label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Nom (UZ)</Label>
                  <Input
                    type="text"
                    value={formData.nameUz}
                    onChange={(e) => setFormData({ ...formData, nameUz: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Icon URL</Label>
                  <Input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Rasm URL</Label>
                  <Input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <Label>Faol</Label>
                </div>
              </div>
              <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                <Button
                  type="button"
                  size="sm"
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
                  size="sm"
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
        title="Kategoriyani o&apos;chirish"
        message="Ushbu kategoriyani o&apos;chirmoqchimisiz?"
        itemName={deletingCategoryId ? `Kategoriya #${deletingCategoryId}` : undefined}
      />
    </>
  );
};

export default CategoriesPage;
