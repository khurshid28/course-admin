import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router';
import axiosClient from '../../service/axios.service';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import PageMeta from '../../components/common/PageMeta';
import ComponentCard from '../../components/common/ComponentCard';
import { LoadSpinner } from '../../components/spinner/load-spinner';

export default function NewsFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image: '',
    isPublished: false,
  });

  useEffect(() => {
    if (isEditMode) {
      fetchNews();
    }
  }, [id]);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get(`/news/${id}`);
      setFormData(response.data);
    } catch (error: any) {
      toast.error('Yangilikni yuklashda xato!');
      navigate('/news');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Sarlavha va matn to\'ldirilishi shart!');
      return;
    }

    setSubmitting(true);
    try {
      if (isEditMode) {
        await axiosClient.put(`/news/${id}`, formData);
        toast.success('Yangilik yangilandi!');
      } else {
        await axiosClient.post('/news', formData);
        toast.success('Yangilik yaratildi!');
      }
      navigate('/news');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi!');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <LoadSpinner />
      </div>
    );
  }

  return (
    <>
      <PageMeta 
        title={isEditMode ? 'Yangilikni tahrirlash' : 'Yangi E\'lon yaratish'} 
        description="Platforma yangiliklari" 
      />
      <PageBreadcrumb pageTitle={isEditMode ? 'Yangilikni tahrirlash' : 'Yangi E\'lon'} />

      <ComponentCard 
        title={isEditMode ? 'Yangilikni tahrirlash' : 'Yangi E\'lon yaratish'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Sarlavha <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
              placeholder="Yangilik sarlavhasi"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Matn <span className="text-red-500">*</span>
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows={10}
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
              placeholder="Yangilik matni..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Rasm URL
            </label>
            <input
              type="text"
              name="image"
              value={formData.image}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
              placeholder="https://example.com/image.jpg"
            />
            {formData.image && (
              <div className="mt-3">
                <img
                  src={formData.image.startsWith('http') ? formData.image : `${import.meta.env.VITE_STATIC_PATH}${formData.image}`}
                  alt="Preview"
                  className="w-64 h-40 object-cover rounded-lg border"
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPublished"
              name="isPublished"
              checked={formData.isPublished}
              onChange={handleChange}
              className="w-4 h-4 rounded border-gray-300"
            />
            <label htmlFor="isPublished" className="text-sm">
              Darhol nashr qilish va barcha foydalanuvchilarga notification yuborish
            </label>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Saqlanmoqda...' : isEditMode ? 'Yangilash' : 'Yaratish'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/news')}
              className="px-6 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Bekor qilish
            </button>
          </div>
        </form>
      </ComponentCard>
    </>
  );
}
