import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axiosClient from '../../service/axios.service';
import { DeleteIcon } from '../../icons';
import { Modal } from '../ui/modal';

interface Comment {
  id: number;
  userId: number;
  comment: string;
  rating?: number;
  images?: string;
  createdAt: string;
  user?: {
    firstName?: string;
    surname?: string;
    phone?: string;
  };
}

interface CourseCommentsModalProps {
  courseId: number;
  courseTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function CourseCommentsModal({
  courseId,
  courseTitle,
  isOpen,
  onClose,
}: CourseCommentsModalProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && courseId) {
      fetchComments();
    }
  }, [isOpen, courseId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get(`/comments/course/${courseId}`);
      setComments(response.data || []);
    } catch (error: any) {
      console.error('Izohlarni yuklashda xato:', error);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (commentId: number) => {
    if (!confirm('Izohni o\'chirishni tasdiqlaysizmi?')) return;

    try {
      await axiosClient.delete(`/comments/${commentId}`);
      toast.success('Izoh o\'chirildi');
      fetchComments();
    } catch (error: any) {
      toast.error('Xatolik yuz berdi');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl max-h-[85vh] m-4">
      <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11 max-h-[85vh]">
        <div className="px-2 pr-14">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Kurs Izohlari
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{courseTitle}</p>
        </div>
        <div className="custom-scrollbar max-h-[55vh] overflow-y-auto px-2 pb-3">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-gray-500 dark:text-gray-400">Bu kursda hali izoh yo'q</p>
            </div>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                          {comment.user?.firstName || comment.user?.surname
                            ? `${comment.user.firstName || ''} ${comment.user.surname || ''}`.trim()
                            : 'Foydalanuvchi'}
                        </div>
                        {comment.rating && (
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: comment.rating }).map((_, i) => (
                              <span key={i} className="text-sm">⭐</span>
                            ))}
                          </div>
                        )}
                      </div>
                      {comment.user?.phone && (
                        <div className="text-xs text-gray-500">{comment.user.phone}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {new Date(comment.createdAt).toLocaleDateString('uz-UZ', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-colors"
                        title="O'chirish"
                      >
                        <DeleteIcon className="w-4 h-4 fill-red-500" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {comment.comment}
                  </p>
                  {comment.images && (() => {
                    try {
                      const imageUrls = JSON.parse(comment.images);
                      return (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {imageUrls.map((url: string, idx: number) => (
                            <img
                              key={idx}
                              src={url.startsWith('http') ? url : `${import.meta.env.VITE_STATIC_PATH}${url}`}
                              alt={`Comment image ${idx + 1}`}
                              className="w-32 h-20 object-cover rounded border dark:border-gray-700"
                            />
                          ))}
                        </div>
                      );
                    } catch {
                      return null;
                    }
                  })()}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="mt-4 px-2">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Jami: <span className="font-semibold">{comments.length}</span> ta izoh
          </p>
        </div>
      </div>
    </Modal>
  );
}
