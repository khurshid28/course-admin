import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import axiosClient from '../../service/axios.service';
import { useFetchWithLoader } from '../../hooks/useFetchWithLoader';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import PageMeta from '../../components/common/PageMeta';
import ComponentCard from '../../components/common/ComponentCard';
import Select from '../../components/form/Select';
import { SearchIcon, DeleteIcon } from '../../icons';
import { LoadSpinner } from '../../components/spinner/load-spinner';

interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  user?: {
    firstName?: string;
    lastName?: string;
  };
}

interface News {
  id: number;
  title: string;
  content: string;
  image?: string;
  isPublished: boolean;
  createdAt: string;
  author?: {
    id: number;
    login: string;
    fullName?: string;
  };
}

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<'news' | 'notifications'>('news');
  
  // News state
  const [news, setNews] = useState<News[]>([]);
  const [filteredNews, setFilteredNews] = useState<News[]>([]);
  
  // Notifications state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const fetchNews = useCallback(() => {
    return axiosClient.get('/news').then(res => {
      // Faqat published yangiliklar
      return res.data.filter((item: News) => item.isPublished);
    });
  }, []);

  const { data: notificationData, isLoading: notificationsLoading, refetch: refetchNotifications } = useFetchWithLoader({
    fetcher: fetchNotifications,
  });

  const { data: newsData, isLoading: newsLoading, refetch: refetchNews } = useFetchWithLoader({
    fetcher: fetchNews,
  });

  useEffect(() => {
    if (notificationData) {
      setNotifications(notificationData);
      setFilteredNotifications(notificationData);
    }
  }, [notificationData]);

  useEffect(() => {
    if (newsData) {
      setNews(newsData);
      setFilteredNews(newsData);
    }
  }, [newsData]);

  useEffect(() => {
    if (activeTab === 'news') {
      let filtered = news;
      if (searchTerm) {
        filtered = filtered.filter(item =>
          item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.content?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      setFilteredNews(filtered);
    } else {
      let filtered = notifications;
      if (searchTerm) {
        filtered = filtered.filter(notif =>
          notif.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          notif.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          notif.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          notif.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      if (filterRead !== 'all') {
        filtered = filtered.filter(notif =>
          filterRead === 'read' ? notif.isRead : !notif.isRead
        );
      }
      setFilteredNotifications(filtered);
    }
    setCurrentPage(1);
  }, [searchTerm, filterRead, notifications, news, activeTab]);

  const handleDeleteNotification = async (id: number) => {
    if (!confirm('O\'chirishni tasdiqlaysizmi?')) return;
    try {
      await axiosClient.delete(`/notifications/${id}`);
      toast.success('Bildirishnoma o\'chirildi');
      await refetchNotifications();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
    }
  };

  const handleDeleteNews = async (id: number) => {
    if (!confirm('O\'chirishni tasdiqlaysizmi?')) return;
    try {
      await axiosClient.delete(`/news/${id}`);
      toast.success('Yangilik o\'chirildi');
      await refetchNews();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await axiosClient.patch(`/notifications/${id}/read`);
      toast.success('O\'qilgan deb belgilandi');
      await refetchNotifications();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = activeTab === 'news' 
    ? filteredNews.slice(indexOfFirstItem, indexOfLastItem)
    : filteredNotifications.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(
    (activeTab === 'news' ? filteredNews.length : filteredNotifications.length) / itemsPerPage
  );

  const isLoading = activeTab === 'news' ? newsLoading : notificationsLoading;

  return (
    <>
      <PageMeta title="Bildirishnomalar | Admin Panel" description="Bildirishnomalar" />
      <PageBreadcrumb pageTitle="Bildirishnomalar" />

      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex gap-4 border-b dark:border-gray-700">
          <button
            onClick={() => {
              setActiveTab('news');
              setSearchTerm('');
              setCurrentPage(1);
            }}
            className={`px-6 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'news'
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-brand-600'
            }`}
          >
            📢 Yangiliklar
          </button>
          <button
            onClick={() => {
              setActiveTab('notifications');
              setSearchTerm('');
              setFilterRead('all');
              setCurrentPage(1);
            }}
            className={`px-6 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'notifications'
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-brand-600'
            }`}
          >
            🔔 Bildirishnomalar
          </button>
        </div>

        {isLoading ? (
          <div className="min-h-[450px] flex justify-center items-center">
            <LoadSpinner />
          </div>
        ) : activeTab === 'news' ? (
          <ComponentCard
            title="Yangiliklar"
            action={
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
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="text-left p-4">ID</th>
                    <th className="text-left p-4">Sarlavha</th>
                    <th className="text-left p-4">Mazmun</th>
                    <th className="text-left p-4">Muallif</th>
                    <th className="text-left p-4">Sana</th>
                    <th className="text-right p-4">Harakatlar</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((item: any) => (
                    <tr 
                      key={item.id} 
                      className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <td className="p-4">{item.id}</td>
                      <td className="p-4 font-medium max-w-xs truncate">{item.title}</td>
                      <td className="p-4 max-w-md truncate text-gray-600 dark:text-gray-400">
                        {item.content}
                      </td>
                      <td className="p-4">{item.author?.fullName || item.author?.login || '-'}</td>
                      <td className="p-4">
                        {new Date(item.createdAt).toLocaleDateString('uz-UZ')}
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleDeleteNews(item.id)}
                            className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                            title="O'chirish"
                          >
                            <DeleteIcon className="size-5 fill-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {currentItems.length === 0 && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <div className="text-6xl mb-4">📢</div>
                  <p>Yangiliklar topilmadi</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border rounded disabled:opacity-50 dark:border-gray-700"
                >
                  Oldingi
                </button>
                <span className="px-4 py-2">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border rounded disabled:opacity-50 dark:border-gray-700"
                >
                  Keyingi
                </button>
              </div>
            )}
          </ComponentCard>
        ) : (
          <ComponentCard
            title="Bildirishnomalar"
            action={
              <div className="flex gap-2">
                <div className="w-48">
                  <Select
                    options={[
                      { value: 'all', label: 'Hammasi' },
                      { value: 'read', label: "O'qilganlar" },
                      { value: 'unread', label: "O'qilmaganlar" },
                    ]}
                    defaultValue={filterRead}
                    onChange={(value) => setFilterRead(value as any)}
                    placeholder="Filter tanlang"
                  />
                </div>
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
              </div>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="text-left p-4">ID</th>
                    <th className="text-left p-4">Foydalanuvchi</th>
                    <th className="text-left p-4">Sarlavha</th>
                    <th className="text-left p-4">Xabar</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Sana</th>
                    <th className="text-right p-4">Harakatlar</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((notification: any) => (
                    <tr 
                      key={notification.id} 
                      className={`border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 ${
                        !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                      }`}
                    >
                      <td className="p-4">{notification.id}</td>
                      <td className="p-4">
                        {notification.user?.firstName || notification.user?.lastName
                          ? `${notification.user.firstName || ''} ${notification.user.lastName || ''}`.trim()
                          : `User #${notification.userId}`
                        }
                      </td>
                      <td className="p-4 font-medium">{notification.title}</td>
                      <td className="p-4 max-w-md truncate">{notification.message}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          notification.isRead
                            ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        }`}>
                          {notification.isRead ? 'O\'qilgan' : 'Yangi'}
                        </span>
                      </td>
                      <td className="p-4">
                        {new Date(notification.createdAt).toLocaleDateString('uz-UZ')}
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          {!notification.isRead && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900 rounded text-xs"
                              title="O'qilgan"
                            >
                              ✓
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteNotification(notification.id)}
                            className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                          >
                            <DeleteIcon className="size-5 fill-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {currentItems.length === 0 && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <div className="text-6xl mb-4">🔔</div>
                  <p>Bildirishnomalar topilmadi</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border rounded disabled:opacity-50 dark:border-gray-700"
                >
                  Oldingi
                </button>
                <span className="px-4 py-2">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border rounded disabled:opacity-50 dark:border-gray-700"
                >
                  Keyingi
                </button>
              </div>
            )}
          </ComponentCard>
        )}
      </div>
    </>
  );
}
