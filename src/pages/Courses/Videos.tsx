import { useState, useEffect } from 'react';
import axiosClient, { getImageUrl } from '../../service/axios.service';
import { toast } from 'react-toastify';
import PageMeta from '../../components/common/PageMeta';
import { EditIcon, DeleteIcon, ChatIcon } from '../../icons';
import CourseCommentsModal from '../../components/modals/CourseCommentsModal';

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
  course: { id: number; title: string };
  section?: { id: number; title: string };
}

interface CourseGroup {
  courseId: number;
  courseTitle: string;
  sections: SectionGroup[];
}

interface SectionGroup {
  sectionId: number | null;
  sectionTitle: string;
  videos: Video[];
}

const VideosPage = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedCourses, setExpandedCourses] = useState<Set<number>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [selectedVideo, setSelectedVideo] = useState<{ id: number; title: string } | null>(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get('/video');
      setVideos(response.data);
    } catch (error: any) {
      toast.error('Videolarni yuklashda xato!');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return;

    try {
      await axiosClient.delete(`/video/${id}`);
      toast.success("Video o'chirildi!");
      fetchVideos();
    } catch (error: any) {
      toast.error("O'chirishda xato!");
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '-';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours > 0 ? hours + ':' : ''}${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatSize = (bytes?: string) => {
    if (!bytes) return '-';
    const size = parseInt(bytes);
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
    if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const groupVideosByCourseAndSection = (): CourseGroup[] => {
    const courseMap = new Map<number, CourseGroup>();

    videos.forEach((video) => {
      const courseId = video.course.id;
      const courseTitle = video.course.title;

      if (!courseMap.has(courseId)) {
        courseMap.set(courseId, {
          courseId,
          courseTitle,
          sections: [],
        });
      }

      const courseGroup = courseMap.get(courseId)!;
      const sectionId = video.section?.id || null;
      const sectionTitle = video.section?.title || 'Bo\'limga tegishli emas';

      let sectionGroup = courseGroup.sections.find(
        (s) => s.sectionId === sectionId
      );

      if (!sectionGroup) {
        sectionGroup = {
          sectionId,
          sectionTitle,
          videos: [],
        };
        courseGroup.sections.push(sectionGroup);
      }

      sectionGroup.videos.push(video);
    });

    // Sort videos within sections by order
    courseMap.forEach((course) => {
      course.sections.forEach((section) => {
        section.videos.sort((a, b) => a.order - b.order);
      });
      // Sort sections by first video order
      course.sections.sort((a, b) => {
        const aOrder = a.videos[0]?.order || 0;
        const bOrder = b.videos[0]?.order || 0;
        return aOrder - bOrder;
      });
    });

    return Array.from(courseMap.values());
  };

  const toggleCourse = (courseId: number) => {
    setExpandedCourses((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(courseId)) {
        newSet.delete(courseId);
      } else {
        newSet.add(courseId);
      }
      return newSet;
    });
  };

  const toggleSection = (courseId: number, sectionId: number | null) => {
    const key = `${courseId}-${sectionId}`;
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const groupedVideos = groupVideosByCourseAndSection();

  return (
    <>
      <PageMeta title="Videolar" />
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Kurs Videolari</h1>
          <button
            onClick={() => toast.info('Video yuklash funksiyasi qo\'shilmoqda...')}
            className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700"
          >
            + Video Yuklash
          </button>
        </div>

        {loading && <div className="text-center py-4">Yuklanmoqda...</div>}

        <div className="space-y-4">
          {groupedVideos.map((courseGroup) => (
            <div
              key={courseGroup.courseId}
              className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden"
            >
              {/* Course Header */}
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 flex items-center justify-between">
                <div 
                  className="flex items-center gap-3 flex-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors py-2 px-2 rounded"
                  onClick={() => toggleCourse(courseGroup.courseId)}
                >
                  <span className="text-lg">
                    {expandedCourses.has(courseGroup.courseId) ? '▼' : '▶'}
                  </span>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    📚 {courseGroup.courseTitle}
                  </h2>
                  <span className="px-2 py-1 bg-brand-100 dark:bg-brand-900 text-brand-800 dark:text-brand-200 text-xs font-medium rounded-full">
                    {courseGroup.sections.reduce(
                      (sum, section) => sum + section.videos.length,
                      0
                    )}{' '}
                    video
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedVideo({ id: courseGroup.courseId, title: courseGroup.courseTitle });
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-brand-600 hover:text-brand-700 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg transition-colors"
                  title="Izohlar"
                >
                  <ChatIcon className="w-5 h-5 fill-current" />
                  <span className="text-sm font-medium">Izohlar</span>
                </button>
              </div>

              {/* Sections */}
              {expandedCourses.has(courseGroup.courseId) && (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {courseGroup.sections.map((sectionGroup) => {
                    const sectionKey = `${courseGroup.courseId}-${sectionGroup.sectionId}`;
                    return (
                      <div key={sectionKey} className="bg-white dark:bg-gray-800">
                        {/* Section Header */}
                        <div
                          className="px-8 py-3 bg-gray-50 dark:bg-gray-750 flex items-center justify-between cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          onClick={() =>
                            toggleSection(courseGroup.courseId, sectionGroup.sectionId)
                          }
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-sm">
                              {expandedSections.has(sectionKey) ? '▼' : '▶'}
                            </span>
                            <h3 className="font-medium text-gray-700 dark:text-gray-300">
                              📑 {sectionGroup.sectionTitle}
                            </h3>
                            <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded-full">
                              {sectionGroup.videos.length}
                            </span>
                          </div>
                        </div>

                        {/* Videos Table */}
                        {expandedSections.has(sectionKey) && (
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                              <thead className="bg-gray-100 dark:bg-gray-700">
                                <tr>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Video
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Davomiyligi
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Hajmi
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
                                {sectionGroup.videos.map((video) => (
                                  <tr key={video.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                                      <div className="flex items-center">
                                        {video.thumbnail && (
                                          <img
                                            src={getImageUrl(video.thumbnail) || video.thumbnail}
                                            alt={video.title}
                                            className="h-12 w-20 rounded object-cover mr-3"
                                          />
                                        )}
                                        <div className="max-w-md">
                                          <div className="font-medium">{video.title}</div>
                                          {video.subtitle && (
                                            <div className="text-xs text-gray-500">{video.subtitle}</div>
                                          )}
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                      {formatDuration(video.duration)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                      {formatSize(video.size)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                      #{video.order}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="flex flex-col gap-1">
                                        <span
                                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            video.isActive
                                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                          }`}
                                        >
                                          {video.isActive ? 'Faol' : 'Nofaol'}
                                        </span>
                                        {video.isFree && (
                                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                            Bepul
                                          </span>
                                        )}
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                      <div className="flex items-center gap-2">
                                        <button
                                          onClick={() => setSelectedVideo({ id: video.id, title: video.title })}
                                          className="p-2 text-blue-600 hover:text-blue-900 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                          title="Izohlar"
                                        >
                                          <ChatIcon className="w-5 h-5" />
                                        </button>
                                        <button
                                          onClick={() => toast.info('Tahrirlash funksiyasi qo\'shilmoqda...')}
                                          className="p-2 text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                                          title="Tahrirlash"
                                        >
                                          <EditIcon className="w-5 h-5" />
                                        </button>
                                        <button
                                          onClick={() => handleDelete(video.id)}
                                          className="p-2 text-red-600 hover:text-red-900 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                          title="O'chirish"
                                        >
                                          <DeleteIcon className="w-5 h-5" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}

          {!loading && groupedVideos.length === 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">Hozircha videolar yo'q</p>
            </div>
          )}
        </div>
      </div>

      {/* Comments Modal */}
      {selectedVideo && (
        <CourseCommentsModal
          courseId={selectedVideo.id}
          courseTitle={selectedVideo.title}
          isOpen={!!selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </>
  );
};

export default VideosPage;
