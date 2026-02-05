import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import axiosClient from '../../service/axios.service';
import { useFetchWithLoader } from '../../hooks/useFetchWithLoader';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import PageMeta from '../../components/common/PageMeta';
import ComponentCard from '../../components/common/ComponentCard';
import { SearchIcon, DeleteIcon, EditIcon } from '../../icons';
import { LoadSpinner } from '../../components/spinner/load-spinner';
import { Link } from 'react-router';

interface News {
  id: number;
  title: string;
  content: string;
  image?: string;
  isPublished: boolean;
  createdAt: string;
  author?: {
    login: string;
  };
}

export default function NewsPage() {
  const [news, setNews] = useState<News[]>([]);
  const [filteredNews, setFilteredNews] = useState<News[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchNews = useCallback(() => {
    return axiosClient.get('/news').then(res => res.data);
  }, []);

  const { data, isLoading, refetch } = useFetchWithLoader({
    fetcher: fetchNews,
  });

  useEffect(() => {
    if (data) {
      setNews(data);
      setFilteredNews(data);
    }
  }, [data]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = news.filter(item =>
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.content?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredNews(filtered);
    } else {
      setFilteredNews(news);
    }
    setCurrentPage(1);
  }, [searchTerm, news]);

  const handleDelete = async (id: number) => {
    if (!confirm('O\'chirishni tasdiqlaysizmi?')) return;
    try {
      await axiosClient.delete(`/news/${id}`);
      toast.success('Yangilik o\'chirildi');
      await refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
    }
  };

  const handlePublish = async (id: number, isPublished: boolean) => {
    try {
      await axiosClient.patch(`/news/${id}`, { isPublished: !isPublished });
      toast.success(isPublished ? 'E\'lon yashirildi' : 'E\'lon nashr qilindi va barcha foydalanuvchilarga yuborildi');
      await refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredNews.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);

  return (
    <>
      <PageMeta title="Yangiliklar | Admin Panel" description="Platforma yangiliklari" />
      <PageBreadcrumb pageTitle="Yangiliklar" />

      <div className="space-y-6">
        {isLoading ? (
          <div className="min-h-[450px] flex justify-center items-center">
            <LoadSpinner />
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Platforma yangiliklari</h1>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Qidirish..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                  />
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                </div>
                <Link
                  to="/news/create"
                  className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
                >
                  + Yangi E'lon
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="relative">
                    {item.image ? (
                      <img
                        src={item.image.startsWith('http') ? item.image : `${import.meta.env.VITE_STATIC_PATH}${item.image}`}
                        alt={item.title}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=No+Image';
                        }}
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
                        <span className="text-white text-6xl">📢</span>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-2">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded ${
                          item.isPublished
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-500 text-white'
                        }`}
                      >
                        {item.isPublished ? 'Nashr qilingan' : 'Qoralama'}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2 line-clamp-2">{item.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
                      {item.content}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <span>👤 {item.author?.login || 'Admin'}</span>
                      <span>
                        {new Date(item.createdAt).toLocaleDateString('uz-UZ', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <button
                        onClick={() => handlePublish(item.id, item.isPublished)}
                        className={`px-3 py-1 text-sm rounded transition-colors ${
                          item.isPublished
                            ? 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200'
                            : 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200'
                        }`}
                      >
                        {item.isPublished ? 'Yashirish' : 'Nashr qilish'}
                      </button>
                      <div className="flex gap-2">
                        <Link
                          to={`/news/edit/${item.id}`}
                          className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900 rounded transition-colors"
                        >
                          <EditIcon className="size-5 fill-blue-500" />
                        </Link>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-colors"
                        >
                          <DeleteIcon className="size-5 fill-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {currentItems.length === 0 && !isLoading && (
              <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                <div className="text-6xl mb-4">📢</div>
                <p className="text-xl">{searchTerm ? 'Hech narsa topilmadi' : 'Hozircha yangilik yo\'q'}</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border rounded disabled:opacity-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Oldingi
                </button>
                <span className="px-4 py-2">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border rounded disabled:opacity-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Keyingi
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
