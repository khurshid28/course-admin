import { useState, useEffect } from 'react';
import axiosClient from '../../service/axios.service';
import { toast } from 'react-toastify';
import PageMeta from '../../components/common/PageMeta';

interface CourseSection {
  id: number;
  title: string;
  description?: string;
  order: number;
  isFree: boolean;
  isActive: boolean;
  createdAt: string;
  course: { id: number; title: string };
  videos: any[];
}

const CourseSectionsPage = () => {
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get('/sections');
      setSections(response.data);
    } catch (error: any) {
      toast.error("Bo'limlarni yuklashda xato!");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return;

    try {
      await axiosClient.delete(`/sections/${id}`);
      toast.success("Bo'lim o'chirildi!");
      fetchSections();
    } catch (error: any) {
      toast.error("O'chirishda xato!");
    }
  };

  return (
    <>
      <PageMeta title="Kurs Bo'limlari" />
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Kurs Bo'limlari</h1>
          <button
            onClick={() => toast.info("Bo'lim qo'shish funksiyasi qo'shilmoqda...")}
            className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700"
          >
            + Yangi Bo'lim
          </button>
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
                  Nomi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Kurs
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Videolar soni
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Tartib
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
              {sections.map((section) => (
                <tr key={section.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {section.id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                    <div>
                      <div className="font-medium">{section.title}</div>
                      {section.description && (
                        <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {section.description}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {section.course?.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                      {section.videos?.length || 0} ta video
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    #{section.order}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          section.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {section.isActive ? 'Faol' : 'Nofaol'}
                      </span>
                      {section.isFree && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          Bepul
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => toast.info('Tahrirlash funksiyasi qo\'shilmoqda...')}
                      className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400"
                    >
                      Tahrirlash
                    </button>
                    <button
                      onClick={() => handleDelete(section.id)}
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

export default CourseSectionsPage;
