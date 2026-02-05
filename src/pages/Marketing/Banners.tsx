import { useState, useEffect } from 'react';
import axiosClient from '../../service/axios.service';
import { toast } from 'react-toastify';
import PageMeta from '../../components/common/PageMeta';
import { EditIcon, DeleteIcon } from '../../icons';

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

  useEffect(() => {
    fetchBanners();
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

  const handleDelete = async (id: number) => {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return;

    try {
      await axiosClient.delete(`/banner/${id}`);
      toast.success("Banner o'chirildi!");
      fetchBanners();
    } catch (error: any) {
      toast.error("O'chirishda xato!");
    }
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
          <h1 className="text-2xl font-bold">Bannerlar</h1>
          <button
            onClick={() => toast.info('Banner qo\'shish funksiyasi qo\'shilmoqda...')}
            className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700"
          >
            + Yangi Banner
          </button>
        </div>

        {loading && <div className="text-center py-4">Yuklanmoqda...</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
            >
              <div className="relative">
                <img
                  src={banner.image.startsWith('http') ? banner.image : `${import.meta.env.VITE_STATIC_PATH}${banner.image}`}
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
                    className={`px-3 py-1 text-sm rounded ${
                      banner.isActive
                        ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                        : 'bg-green-500 text-white hover:bg-green-600'
                    }`}
                  >
                    {banner.isActive ? 'Faolsizlantirish' : 'Faollashtirish'}
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toast.info('Tahrirlash funksiyasi qo\'shilmoqda...')}
                      className="p-1.5 text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                      title="Tahrirlash"
                    >
                      <EditIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(banner.id)}
                      className="p-1.5 text-red-600 hover:text-red-900 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="O'chirish"
                    >
                      <DeleteIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default BannersPage;
