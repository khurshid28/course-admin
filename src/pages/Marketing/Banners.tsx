import { useState, useEffect } from 'react';
import axiosClient, { getImageUrl } from '../../service/axios.service';
import { toast } from 'react-toastify';
import PageMeta from '../../components/common/PageMeta';
import { PencilIcon, DeleteIcon, PlusIcon, EyeIcon } from '../../icons';
import Button from '../../components/ui/button/Button';
import { Modal } from '../../components/ui/modal';
import ConfirmDeleteModal from '../../components/ui/ConfirmDeleteModal';
import { useModal } from '../../hooks/useModal';
import Label from '../../components/form/Label';
import Input from '../../components/form/input/InputField';
import Select from '../../components/form/Select';
import FileInput from '../../components/form/input/FileInput';

interface Banner {
  id: number;
  title: string;
  description?: string;
  image: string;
  courseId?: number;
  link?: string;
  isActive: boolean;
  order: number;
  course?: { id: number; title: string };
}

const BannersPage = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(false);
  const { isOpen, openModal, closeModal } = useModal();
  const { isOpen: isDeleteOpen, openModal: openDeleteModal, closeModal: closeDeleteModal } = useModal();
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [deletingBannerId, setDeletingBannerId] = useState<number | null>(null);
  const [courses, setCourses] = useState<{id: number; title: string}[]>([]);
  const [formData, setFormData] = useState<Partial<Banner>>({
    title: '',
    description: '',
    image: '',
    link: '',
    order: 1,
    isActive: true,
  });

  useEffect(() => {
    fetchBanners();
    fetchCourses();
  }, []);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get('/banner');
      setBanners(response.data);
    } catch (error: any) {
      toast.error('Bannerlarni yuklashda xato!');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await axiosClient.get('/courses');
      setCourses(response.data);
    } catch (error: any) {
      console.error('Kurslarni yuklashda xato:', error);
    }
  };

  const handleDeleteClick = (id: number) => {
    setDeletingBannerId(id);
    openDeleteModal();
  };

  const handleDeleteConfirm = async () => {
    if (!deletingBannerId) return;
    try {
      await axiosClient.delete(`/banner/${deletingBannerId}`);
      toast.success("Banner o'chirildi!");
      await fetchBanners();
      closeDeleteModal();
      setDeletingBannerId(null);
    } catch (error: any) {
      toast.error("O'chirishda xato!");
    }
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      description: banner.description || '',
      image: banner.image,
      courseId: banner.courseId,
      link: banner.link || '',
      order: banner.order,
      isActive: banner.isActive,
    });
    openModal();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);
        const response = await axiosClient.post('/upload/image', formDataUpload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setFormData({ ...formData, image: response.data.url });
        toast.success('Rasm yuklandi');
      } catch (error) {
        console.error('Image upload error:', error);
        toast.error('Rasm yuklanmadi');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingBanner) {
        await axiosClient.patch(`/banner/${editingBanner.id}`, formData);
        toast.success('Banner yangilandi!');
      } else {
        await axiosClient.post('/banner', formData);
        toast.success('Banner qo\'shildi!');
      }
      await fetchBanners();
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
      title: '',
      description: '',
      image: '',
      link: '',
      order: 1,
      isActive: true,
    });
    setEditingBanner(null);
  };

  const handleToggleActive = async (banner: Banner) => {
    try {
      await axiosClient.patch(`/banner/${banner.id}`, {
        isActive: !banner.isActive,
      });
      toast.success('Banner holati o\'zgartirildi!');
      fetchBanners();
    } catch (error: any) {
      toast.error('Xatolik yuz berdi!');
    }
  };

  return (
    <>
      <PageMeta title="Bannerlar" />
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold dark:text-white">Bannerlar</h1>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
            >
              <div className="relative">
                <img
                  src={getImageUrl(banner.image) || banner.image}
                  alt={banner.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 right-2 flex gap-2">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded ${
                      banner.isActive
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-500 text-white'
                    }`}
                  >
                    {banner.isActive ? 'Faol' : 'Nofaol'}
                  </span>
                  <span className="px-2 py-1 text-xs font-semibold rounded bg-blue-500 text-white">
                    #{banner.order}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">{banner.title}</h3>
                {banner.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {banner.description}
                  </p>
                )}
                {banner.course && (
                  <p className="text-sm text-gray-500 mb-3">
                    Kurs: {banner.course.title}
                  </p>
                )}
                <div className="flex justify-between items-center mt-4">
                  <button
                    onClick={() => handleToggleActive(banner)}
                    className={`px-3 py-1 text-sm rounded transition-colors ${
                      banner.isActive
                        ? 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                        : 'bg-green-500 text-white hover:bg-green-600'
                    }`}
                  >
                    {banner.isActive ? 'Faolsizlantirish' : 'Faollashtirish'}
                  </button>
                  <div className="flex items-center gap-2">
                    <Button
                      size="mini"
                      variant="outline"
                      onClick={() => handleEdit(banner)}
                    >
                      <PencilIcon className="size-4 fill-black dark:fill-white" />
                    </Button>
                    <Button
                      size="mini"
                      variant="outline"
                      onClick={() => handleDeleteClick(banner.id)}
                    >
                      <DeleteIcon className="size-4 fill-black dark:fill-white" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add/Edit Modal */}
        <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[600px] m-4">
          <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
            <div className="px-2 pr-14">
              <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                {editingBanner ? 'Banner tahrirlash' : 'Yangi Banner'}
              </h4>
              <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
                Banner ma'lumotlarini to'ldiring
              </p>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col">
              <div className="px-2 overflow-y-auto custom-scrollbar">
                <div className="space-y-5">
                  <div>
                    <Label>Sarlavha</Label>
                    <Input
                      type="text"
                      value={formData.title || ''}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Banner sarlavhasi"
                      required
                    />
                  </div>
                  <div>
                    <Label>Tavsif (ixtiyoriy)</Label>
                    <Input
                      type="text"
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Qisqacha tavsif"
                    />
                  </div>
                  <div>
                    <Label>Link (ixtiyoriy)</Label>
                    <Input
                      type="text"
                      value={formData.link || ''}
                      onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                      placeholder="https://example.com"
                    />
                  </div>
                  <div>
                    <Label>Kurs (ixtiyoriy)</Label>
                    <Select
                      options={[
                        { value: '', label: 'Kurs tanlanmagan' },
                        ...courses.map(c => ({ value: c.id.toString(), label: c.title }))
                      ]}
                      defaultValue={formData.courseId?.toString() || ''}
                      onChange={(value) => {
                        const courseId = value ? parseInt(value) : undefined;
                        const link = courseId ? `/courses/${courseId}` : '';
                        setFormData({ ...formData, courseId, link });
                      }}
                      placeholder="Kurs tanlang"
                    />
                  </div>
                  <div>
                    <Label>Tartib raqami</Label>
                    <Input
                      type="number"
                      value={formData.order || 1}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                      placeholder="1"
                      required
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
                  <div>
                    <Label>Rasm</Label>
                    <FileInput onChange={handleFileChange} />
                    {formData.image && (
                      <div className="mt-2">
                        <img 
                          src={getImageUrl(formData.image) || formData.image} 
                          alt="Preview" 
                          className="w-32 h-32 object-cover rounded-lg" 
                        />
                      </div>
                    )}
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
          title="Bannerni o'chirish"
          message="Ushbu bannerni o'chirmoqchimisiz? Bu amalni bekor qilib bo'lmaydi."
        />
      </div>
    </>
  );
};

export default BannersPage;
