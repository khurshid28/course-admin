import { useState, useEffect } from 'react';
import { Modal } from '../ui/modal';
import Label from '../form/Label';
import Input from '../form/input/InputField';
import Button from '../ui/button/Button';
import axiosClient, { getImageUrl } from '../../service/axios.service';
import { toast } from 'react-toastify';

interface Video {
  id: number;
  title: string;
  subtitle?: string;
  description?: string;
  url: string;
  thumbnail?: string;
  duration?: number;
  size?: string;
  order: number;
  isFree: boolean;
  isActive: boolean;
  sectionId: number;
  courseId: number;
}

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: VideoFormData) => Promise<void>;
  editingVideo?: Video | null;
  initialCourseId?: number;
  initialSectionId?: number;
}

export interface VideoFormData {
  title: string;
  subtitle: string;
  description: string;
  url: string;
  thumbnail: string;
  duration: number;
  size: string;
  order: number;
  isFree: boolean;
  isActive: boolean;
  sectionId: number;
  courseId: number;
}

export default function VideoModal({
  isOpen,
  onClose,
  onSubmit,
  editingVideo,
  initialCourseId = 0,
  initialSectionId = 0,
}: VideoModalProps) {
  const [formData, setFormData] = useState<VideoFormData>({
    title: '',
    subtitle: '',
    description: '',
    url: '',
    thumbnail: '',
    duration: 0,
    size: '',
    order: 1,
    isFree: false,
    isActive: true,
    sectionId: initialSectionId,
    courseId: initialCourseId,
  });

  const [loading, setLoading] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ video: 0, thumbnail: 0 });

  useEffect(() => {
    if (editingVideo) {
      setFormData({
        title: editingVideo.title,
        subtitle: editingVideo.subtitle || '',
        description: editingVideo.description || '',
        url: editingVideo.url,
        thumbnail: editingVideo.thumbnail || '',
        duration: editingVideo.duration || 0,
        size: editingVideo.size || '',
        order: editingVideo.order,
        isFree: editingVideo.isFree,
        isActive: editingVideo.isActive,
        sectionId: editingVideo.sectionId,
        courseId: editingVideo.courseId,
      });
    } else {
      setFormData({
        title: '',
        subtitle: '',
        description: '',
        url: '',
        thumbnail: '',
        duration: 0,
        size: '',
        order: 1,
        isFree: false,
        isActive: true,
        sectionId: initialSectionId,
        courseId: initialCourseId,
      });
    }
  }, [editingVideo, initialCourseId, initialSectionId, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      // Modal will be closed by parent component on success
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Xatolik yuz berdi!');
      // Don't close modal on error
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof VideoFormData, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 500MB)
    if (file.size > 500 * 1024 * 1024) {
      toast.error('Video hajmi 500MB dan oshmasin!');
      return;
    }

    setUploadingVideo(true);
    setUploadProgress(prev => ({ ...prev, video: 0 }));

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('isFree', formData.isFree ? 'true' : 'false');

      const response = await axiosClient.post('/upload/video', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          setUploadProgress(prev => ({ ...prev, video: progress }));
        },
      });

      // Update form with video data
      setFormData(prev => ({
        ...prev,
        url: response.data.url, // Backend returns full path like /uploads/videos/filename.mp4
        duration: response.data.duration || 0,
        size: response.data.size?.toString() || '',
      }));

      toast.success('Video yuklandi!');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Video yuklashda xatolik!');
    } finally {
      setUploadingVideo(false);
      setUploadProgress(prev => ({ ...prev, video: 0 }));
      // Reset file input
      e.target.value = '';
    }
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Rasm hajmi 5MB dan oshmasin!');
      return;
    }

    setUploadingThumbnail(true);
    setUploadProgress(prev => ({ ...prev, thumbnail: 0 }));

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const response = await axiosClient.post('/upload/image', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          setUploadProgress(prev => ({ ...prev, thumbnail: progress }));
        },
      });

      setFormData(prev => ({ ...prev, thumbnail: response.data.url }));
      toast.success('Banner yuklandi!');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Banner yuklashda xatolik!');
    } finally {
      setUploadingThumbnail(false);
      setUploadProgress(prev => ({ ...prev, thumbnail: 0 }));
      // Reset file input
      e.target.value = '';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[700px] max-h-[85vh] m-4">
      <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11 max-h-[85vh]">
        <div className="px-2 pr-14">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            {editingVideo ? 'Videoni Tahrirlash' : 'Yangi Video'}
          </h4>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="custom-scrollbar max-h-[55vh] overflow-y-auto px-2 pb-3 space-y-4">
            <div>
              <Label>Video nomi *</Label>
              <Input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Video nomini kiriting"
              />
            </div>
            <div>
              <Label>Qisqa matn</Label>
              <Input
                type="text"
                value={formData.subtitle}
                onChange={(e) => handleInputChange('subtitle', e.target.value)}
                placeholder="Qisqa mazmunini kiriting"
              />
            </div>
            <div>
              <Label>Tavsif</Label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800 dark:text-white resize-none"
                rows={3}
                placeholder="Video haqida batafsil ma'lumot"
              />
            </div>
            <div>
              <Label>Video URL *</Label>
              <Input
                type="text"
                value={formData.url}
                onChange={(e) => handleInputChange('url', e.target.value)}
                placeholder="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4"
                disabled={uploadingVideo}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Misol: https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4
              </p>
              {/* Video Upload */}
              <div className="mt-2">
                <Label>Yoki video yuklang</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    disabled={uploadingVideo}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 dark:file:bg-gray-700 dark:file:text-gray-300"
                  />
                </div>
                {uploadingVideo && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                      <span>Yuklanmoqda...</span>
                      <span>{uploadProgress.video}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                      <div
                        className="bg-brand-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress.video}%` }}
                      />
                    </div>
                  </div>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  MP4, AVI, MOV formatlar qo'llab-quvvatlanadi (Max: 500MB)
                </p>
              </div>
            </div>
            <div>
              <Label>Banner URL</Label>
              <Input
                type="text"
                value={formData.thumbnail}
                onChange={(e) => handleInputChange('thumbnail', e.target.value)}
                placeholder="Kirish (masalan: https://example.com/banner.jpg)"
                disabled={uploadingThumbnail}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Video uchun banner/thumbnail rasm URL manzili
              </p>
              {/* Banner Upload */}
              <div className="mt-2">
                <Label>Yoki banner yuklang</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailUpload}
                    disabled={uploadingThumbnail}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 dark:file:bg-gray-700 dark:file:text-gray-300"
                  />
                </div>
                {uploadingThumbnail && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                      <span>Yuklanmoqda...</span>
                      <span>{uploadProgress.thumbnail}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                      <div
                        className="bg-brand-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress.thumbnail}%` }}
                      />
                    </div>
                  </div>
                )}
                {formData.thumbnail && (
                  <div className="mt-2 relative">
                    <img
                      src={getImageUrl(formData.thumbnail) || ''}
                      alt="Banner preview"
                      className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  JPG, PNG, GIF formatlar qo'llab-quvvatlanadi (Max: 5MB)
                </p>
              </div>
            </div>
            <div>
              <Label>Tartib raqami</Label>
              <Input
                type="number"
                value={formData.order}
                onChange={(e) => handleInputChange('order', parseInt(e.target.value) || 1)}
                min="1"
                placeholder="1"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Kichik raqam birinchi ko'rinadi (1, 2, 3...)
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isFree"
                  checked={formData.isFree}
                  onChange={(e) => handleInputChange('isFree', e.target.checked)}
                  className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
                />
                <Label htmlFor="isFree" className="mb-0 cursor-pointer">
                  Bepul video
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
                />
                <Label htmlFor="isActive" className="mb-0 cursor-pointer">
                  Faol
                </Label>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
            <Button type="button" size="sm" variant="outline" onClick={onClose} disabled={loading}>
              Bekor qilish
            </Button>
            <Button type="submit" size="sm" variant="primary" disabled={loading}>
              {loading ? 'Saqlanmoqda...' : 'Saqlash'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
