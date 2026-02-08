import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axiosClient from '../../service/axios.service';
import { CloseIcon, DeleteIcon } from '../../icons';

interface Comment {
  id: number;
  userId: number;
  comment: string;
  images?: string;
  createdAt: string;
  rating?: number;
  user?: {
    firstName?: string;
    lastName?: string;
    surname?: string;
    phone?: string;
  };
}

interface VideoCommentsModalProps {
  videoId: number;
  videoTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function VideoCommentsModal({
  videoId,
  videoTitle,
  isOpen,
  onClose,
}: VideoCommentsModalProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && videoId) {
      fetchComments();
    }
  }, [isOpen, videoId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get(`/video-comments?videoId=${videoId}`);
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
      await axiosClient.delete(`/video-comments/${commentId}`);
      toast.success('Izoh o\'chirildi');
      fetchComments();
    } catch (error: any) {
      toast.error('Xatolik yuz berdi');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold">Video Izohlari</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{videoTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
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
            <div className="space-y-4">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {comment.user?.firstName || comment.user?.surname
                          ? `${comment.user.firstName || ''} ${comment.user.surname || ''}`.trim()
                          : 'Foydalanuvchi'}
                      </div>
                      {comment.rating && (
                        <div className="flex items-center gap-1 text-yellow-500">
                          {'⭐'.repeat(comment.rating)}
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
                        className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-colors"
                        title="O'chirish"
                      >
                        <DeleteIcon className="w-4 h-4 fill-red-500" />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {comment.comment}
                  </p>
                  {comment.images && (
                    <div className="mt-3">
                      <img
                        src={comment.images.startsWith('http') ? comment.images : `${import.meta.env.VITE_STATIC_PATH}${comment.images}`}
                        alt="Comment attachment"
                        className="max-w-sm rounded-lg border dark:border-gray-700"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Jami: <span className="font-semibold">{comments.length}</span> ta izoh
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              Yopish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
