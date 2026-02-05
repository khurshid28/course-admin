import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Link } from 'react-router';
import axiosClient from '../../service/axios.service';
import { useFetchWithLoader } from '../../hooks/useFetchWithLoader';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import PageMeta from '../../components/common/PageMeta';
import ComponentCard from '../../components/common/ComponentCard';
import { SearchIcon, DeleteIcon } from '../../icons';
import { LoadSpinner } from '../../components/spinner/load-spinner';

interface Comment {
  id: number;
  userId: number;
  courseId: number;
  comment: string;
  images?: string;
  createdAt: string;
  user?: {
    firstName?: string;
    lastName?: string;
  };
  course?: {
    title: string;
    teacher?: {
      id: number;
      fullName?: string;
    };
  };
}

export default function CommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [filteredComments, setFilteredComments] = useState<Comment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const fetchComments = useCallback(() => {
    return axiosClient.get('/comments').then(res => res.data);
  }, []);

  const { data, isLoading, refetch } = useFetchWithLoader({
    fetcher: fetchComments,
  });

  useEffect(() => {
    if (data) {
      setComments(data);
      setFilteredComments(data);
    }
  }, [data]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = comments.filter(comment =>
        comment.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comment.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comment.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comment.course?.title?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredComments(filtered);
    } else {
      setFilteredComments(comments);
    }
    setCurrentPage(1);
  }, [searchTerm, comments]);

  const handleDelete = async (id: number) => {
    if (!confirm('O\'chirishni tasdiqlaysizmi?')) return;
    try {
      await axiosClient.delete(`/comments/${id}`);
      toast.success('Izoh o\'chirildi');
      await refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredComments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredComments.length / itemsPerPage);

  return (
    <>
      <PageMeta title="Izohlar | Admin Panel" description="Kurs izohlari" />
      <PageBreadcrumb pageTitle="Izohlar" />

      <div className="space-y-6">
        {isLoading ? (
          <div className="min-h-[450px] flex justify-center items-center">
            <LoadSpinner />
          </div>
        ) : (
          <ComponentCard
            title="Kurs izohlari"
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
                    <th className="text-left p-4">Foydalanuvchi</th>
                    <th className="text-left p-4">Kurs</th>
                    <th className="text-left p-4">O'qituvchi</th>
                    <th className="text-left p-4">Izoh</th>
                    <th className="text-left p-4">Sana</th>
                    <th className="text-right p-4">Harakatlar</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((comment) => (
                    <tr key={comment.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="p-4">{comment.id}</td>
                      <td className="p-4">
                        <Link
                          to={`/students?userId=${comment.userId}`}
                          className="text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                        >
                          {comment.user?.firstName || comment.user?.lastName
                            ? `${comment.user.firstName || ''} ${comment.user.lastName || ''}`.trim()
                            : `User #${comment.userId}`
                          }
                        </Link>
                      </td>
                      <td className="p-4">
                        <Link
                          to={`/courses?courseId=${comment.courseId}`}
                          className="text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                        >
                          {comment.course?.title || `Course #${comment.courseId}`}
                        </Link>
                      </td>
                      <td className="p-4">
                        {comment.course?.teacher ? (
                          <Link
                            to={`/teachers?teacherId=${comment.course.teacher.id}`}
                            className="text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                          >
                            {comment.course.teacher.fullName || `Teacher #${comment.course.teacher.id}`}
                          </Link>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="p-4 max-w-md">
                        <p className="line-clamp-2">{comment.comment}</p>
                        {comment.images && (
                          <span className="text-xs text-gray-500">📎 Rasm biriktirilgan</span>
                        )}
                      </td>
                      <td className="p-4">
                        {new Date(comment.createdAt).toLocaleDateString('uz-UZ')}
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleDelete(comment.id)}
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
