import { useState, useEffect } from 'react';
import axiosClient, { getImageUrl } from '../../service/axios.service';
import { toast } from 'react-toastify';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import { PencilIcon, DeleteIcon, ChatIcon, PlusIcon, EyeIcon, VideoIcon } from '../../icons';
import Button from '../../components/ui/button/Button';
import CourseCommentsModal from '../../components/modals/CourseCommentsModal';
import VideoModal from '../../components/modals/VideoModal';
import SectionModal from '../../components/modals/SectionModal';
import { Modal } from '../../components/ui/modal';
import Badge from '../../components/ui/badge/Badge';
import { LoadSpinner } from '../../components/spinner/load-spinner';
import { useModal } from '../../hooks/useModal';
import ConfirmDeleteModal from '../../components/ui/ConfirmDeleteModal';
import Label from '../../components/form/Label';
import Input from '../../components/form/input/InputField';
import Select from '../../components/form/Select';
import type { VideoFormData } from '../../components/modals/VideoModal';
import type { SectionFormData } from '../../components/modals/SectionModal';

interface Teacher {
  id: number;
  name: string;
}

interface Category {
  id: number;
  name: string;
  nameUz: string;
}

interface Course {
  id: number;
  title: string;
  subtitle?: string;
  description?: string;
  thumbnail?: string;
  price: number;
  isFree: boolean;
  rating: number;
  totalStudents: number;
  isActive: boolean;
  createdAt: string;
  teacher: { id: number; name: string };
  category: { id: number; name: string };
  sections?: Section[];
}

interface Section {
  id: number;
  title: string;
  subtitle?: string;
  order: number;
  courseId: number;
  videos?: Video[];
}

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

interface CourseWithSections extends Omit<Course, 'sections'> {
  sections: SectionGroup[];
}

interface SectionGroup {
  sectionId: number | null;
  sectionTitle: string;
  videos: Video[];
  order: number;
}

const CoursesMainPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedCourses, setExpandedCourses] = useState<Set<number>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [selectedCourse, setSelectedCourse] = useState<{ id: number; title: string } | null>(null);
  const [viewingCourse, setViewingCourse] = useState<CourseWithSections | null>(null);
  const [viewingVideo, setViewingVideo] = useState<Video | null>(null);
  const [sectionsReloadKey, setSectionsReloadKey] = useState(0);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCourses, setTotalCourses] = useState(0);
  const [pageSize] = useState(10);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  
  // Modals
  const { isOpen: isCourseModalOpen, openModal: openCourseModal, closeModal: closeCourseModal } = useModal();
  const { isOpen: isSectionModalOpen, openModal: openSectionModal, closeModal: closeSectionModal } = useModal();
  const { isOpen: isVideoModalOpen, openModal: openVideoModal, closeModal: closeVideoModal } = useModal();
  const { isOpen: isViewModalOpen, openModal: openViewModal, closeModal: closeViewModal } = useModal();
  const { isOpen: isVideoViewModalOpen, openModal: openVideoViewModal, closeModal: closeVideoViewModal } = useModal();
  const { isOpen: isVideoPlayerModalOpen, openModal: openVideoPlayerModal, closeModal: closeVideoPlayerModal } = useModal();
  const { isOpen: isDeleteOpen, openModal: openDeleteModal, closeModal: closeDeleteModal } = useModal();
  
  // Selected items for edit
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [deleteType, setDeleteType] = useState<'course' | 'section' | 'video'>('course');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteInfo, setDeleteInfo] = useState<{ name?: string; videoCount?: number }>({});
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [thumbnailUploadProgress, setThumbnailUploadProgress] = useState(0);
  
  // Form data
  const [courseForm, setCourseForm] = useState({
    title: '',
    subtitle: '',
    description: '',
    thumbnail: '',
    price: 0,
    isFree: false,
    teacherId: 0,
    categoryId: 0,
    isActive: true,
  });

  const [sectionForm, setSectionForm] = useState({
    title: '',
    subtitle: '',
    order: 1,
    courseId: 0,
  });

  const [videoForm, setVideoForm] = useState({
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
    sectionId: 0,
    courseId: 0,
  });

  useEffect(() => {
    fetchCourses();
    fetchTeachers();
    fetchCategories();
  }, [currentPage, statusFilter]);

  useEffect(() => {
    if (isCourseModalOpen) {
      console.log('Modal opened, teachers:', teachers);
      console.log('Modal opened, categories:', categories);
      if (teachers.length === 0) {
        console.warn('Teachers array is empty! Fetching again...');
        fetchTeachers();
      }
      if (categories.length === 0) {
        console.warn('Categories array is empty! Fetching again...');
        fetchCategories();
      }
    }
  }, [isCourseModalOpen, teachers, categories]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        includeInactive: 'true',
      });
      
      if (statusFilter !== 'all') {
        params.append('isActive', statusFilter === 'active' ? 'true' : 'false');
      }
      
      const response = await axiosClient.get(`/course?${params.toString()}`);
      setCourses(response.data.courses || response.data);
      setTotalPages(response.data.totalPages || 1);
      setTotalCourses(response.data.total || response.data.length);
    } catch (error: unknown) {
      toast.error('Kurslarni yuklashda xato!');
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await axiosClient.get('/teachers');
      console.log('Teachers loaded:', response.data);
      console.log('Teachers count:', Array.isArray(response.data) ? response.data.length : 0);
      setTeachers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Teachers fetch error:', error);
      toast.error('O\'qituvchilarni yuklashda xato!');
      setTeachers([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axiosClient.get('/category');
      console.log('Categories loaded:', response.data);
      console.log('Categories count:', Array.isArray(response.data) ? response.data.length : 0);
      setCategories(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Categories fetch error:', error);
      toast.error('Kategoriyalarni yuklashda xato!');
      setCategories([]);
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
    setThumbnailUploadProgress(0);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const response = await axiosClient.post('/upload/image', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          setThumbnailUploadProgress(progress);
        },
      });

      setCourseForm(prev => ({ ...prev, thumbnail: response.data.url }));
      toast.success('Rasm yuklandi!');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Rasm yuklashda xatolik!');
    } finally {
      setUploadingThumbnail(false);
      setThumbnailUploadProgress(0);
      // Reset file input
      e.target.value = '';
    }
  };

  // Course handlers
  const handleCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingCourse) {
        await axiosClient.patch(`/course/${editingCourse.id}`, courseForm);
        toast.success('Kurs yangilandi!');
      } else {
        await axiosClient.post('/course', courseForm);
        toast.success('Kurs qo\'shildi!');
      }
      fetchCourses();
      closeCourseModal();
      resetCourseForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi!');
    } finally {
      setLoading(false);
    }
  };

  const handleCourseEdit = (course: Course) => {
    setEditingCourse(course);
    setCourseForm({
      title: course.title,
      subtitle: course.subtitle || '',
      description: course.description || '',
      thumbnail: course.thumbnail || '',
      price: course.price,
      isFree: course.isFree,
      teacherId: course.teacher.id,
      categoryId: course.category.id,
      isActive: course.isActive,
    });
    openCourseModal();
  };

  const resetCourseForm = () => {
    setEditingCourse(null);
    setCourseForm({
      title: '',
      subtitle: '',
      description: '',
      thumbnail: '',
      price: 0,
      isFree: false,
      teacherId: 0,
      categoryId: 0,
      isActive: true,
    });
  };

  // Section handlers
  const handleSectionAdd = (courseId: number) => {
    setSectionForm({ ...sectionForm, courseId });
    openSectionModal();
  };

  const handleSectionEdit = (section: Section) => {
    setEditingSection(section);
    setSectionForm({
      title: section.title,
      subtitle: section.subtitle || '',
      order: section.order,
      courseId: section.courseId,
    });
    openSectionModal();
  };

  const handleSectionSubmit = async (data: SectionFormData) => {
    try {
      if (editingSection) {
        await axiosClient.patch(`/sections/${editingSection.id}`, data);
        toast.success('Bo\'lim yangilandi!');
      } else {
        await axiosClient.post('/sections', data);
        toast.success('Bo\'lim qo\'shildi!');
      }
      fetchCourses();
      setSectionsReloadKey((prev) => prev + 1); // Trigger sections reload
      closeSectionModal();
      resetSectionForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi!');
      throw error;
    }
  };

  const resetSectionForm = () => {
    setEditingSection(null);
    setSectionForm({
      title: '',
      subtitle: '',
      order: 1,
      courseId: 0,
    });
  };

  // Video handlers
  const handleVideoAdd = (courseId: number, sectionId?: number) => {
    setVideoForm({ ...videoForm, courseId, sectionId: sectionId || 0 });
    openVideoModal();
  };

  const handleVideoEdit = (video: Video) => {
    setEditingVideo(video);
    setVideoForm({
      title: video.title,
      subtitle: video.subtitle || '',
      description: video.description || '',
      url: video.url,
      thumbnail: video.thumbnail || '',
      duration: video.duration || 0,
      size: video.size || '',
      order: video.order,
      isFree: video.isFree,
      isActive: video.isActive,
      sectionId: video.sectionId,
      courseId: video.courseId,
    });
    openVideoModal();
  };

  const handleVideoSubmit = async (data: VideoFormData) => {
    if (editingVideo) {
      await axiosClient.patch(`/video/${editingVideo.id}`, data);
      toast.success('Video yangilandi!');
    } else {
      await axiosClient.post('/video', data);
      toast.success('Video qo\'shildi!');
    }
    fetchCourses();
    setSectionsReloadKey((prev) => prev + 1); // Trigger sections reload
    closeVideoModal();
    resetVideoForm();
  };

  const resetVideoForm = () => {
    setEditingVideo(null);
    setVideoForm({
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
      sectionId: 0,
      courseId: 0,
    });
  };

  const handleVideoView = (video: Video) => {
    setViewingVideo(video);
    openVideoViewModal();
  };

  const handleVideoPlay = (video: Video) => {
    setViewingVideo(video);
    openVideoPlayerModal();
  };

  // Delete handlers
  const handleDeleteClick = (type: 'course' | 'section' | 'video', id: number, info?: { name?: string; videoCount?: number }) => {
    setDeleteType(type);
    setDeleteId(id);
    setDeleteInfo(info || {});
    openDeleteModal();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;

    try {
      const endpoints = {
        course: `/course/${deleteId}`,
        section: `/sections/${deleteId}`,
        video: `/video/${deleteId}`,
      };

      await axiosClient.delete(endpoints[deleteType]);
      toast.success(`${deleteType === 'course' ? 'Kurs' : deleteType === 'section' ? 'Bo\'lim' : 'Video'} o'chirildi!`);
      
      fetchCourses();
      setSectionsReloadKey((prev) => prev + 1); // Trigger sections reload
      closeDeleteModal();
    } catch (error) {
      toast.error('O\'chirishda xato!');
    }
  };

  const fetchCourseWithSections = async (courseId: number): Promise<CourseWithSections | null> => {
    try {
      const [courseRes, sectionsRes, videosRes] = await Promise.all([
        axiosClient.get(`/course/${courseId}`),
        axiosClient.get(`/sections/course/${courseId}`),
        axiosClient.get(`/video`),
      ]);

      const course = courseRes.data;
      const sections = sectionsRes.data;
      const allVideos = videosRes.data;

      // Filter videos for this course
      const courseVideos = allVideos.filter((v: Video) => v.courseId === courseId);

      // Group videos by section
      const sectionGroups: SectionGroup[] = sections.map((section: Section) => ({
        sectionId: section.id,
        sectionTitle: section.title,
        order: section.order,
        videos: courseVideos.filter((v: Video) => v.sectionId === section.id).sort((a: Video, b: Video) => a.order - b.order),
      }));

      // Add videos without section
      const videosWithoutSection = courseVideos.filter((v: Video) => !v.sectionId);
      if (videosWithoutSection.length > 0) {
        sectionGroups.push({
          sectionId: null,
          sectionTitle: 'Bo\'limga tegishli emas',
          order: 999,
          videos: videosWithoutSection.sort((a: Video, b: Video) => a.order - b.order),
        });
      }

      return {
        ...course,
        sections: sectionGroups.sort((a, b) => a.order - b.order),
      };
    } catch (error) {
      console.error('Error fetching course details:', error);
      return null;
    }
  };

  const handleViewCourse = async (course: Course) => {
    const detailed = await fetchCourseWithSections(course.id);
    if (detailed) {
      setViewingCourse(detailed);
      openViewModal();
    }
  };

  const handleToggleStatus = async (courseId: number, currentStatus: boolean) => {
    try {
      await axiosClient.patch(`/course/${courseId}`, { isActive: !currentStatus });
      toast.success(`Kurs ${!currentStatus ? 'faollashtirildi' : 'nofaol qilindi'}!`);
      fetchCourses();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi!');
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('uz-UZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const toggleCourse = async (courseId: number) => {
    const newSet = new Set(expandedCourses);
    if (newSet.has(courseId)) {
      newSet.delete(courseId);
    } else {
      newSet.add(courseId);
    }
    setExpandedCourses(newSet);
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

  return (
    <>
      <PageMeta title="Kurslar" description="Kurslar boshqaruvi" />
      <PageBreadcrumb pageTitle="Kurslar" />
      
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Barcha Kurslar</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Jami: {totalCourses} ta kurs
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as 'all' | 'active' | 'inactive');
                setCurrentPage(1);
              }}
              className="min-w-[150px]"
            >
              <option value="all">Barchasi</option>
              <option value="active">Faol</option>
              <option value="inactive">Nofaol</option>
            </Select>
            <Button
              size="sm"
              variant="primary"
              startIcon={<PlusIcon className="size-5 fill-white" />}
              onClick={() => {
                resetCourseForm();
                openCourseModal();
              }}
            >
              Kurs Qo'shish
            </Button>
          </div>
        </div>

        {loading && (
          <div className="min-h-[300px] flex justify-center items-center">
            <LoadSpinner />
          </div>
        )}

        <div className="space-y-4">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden"
            >
              {/* Course Header */}
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 flex items-center justify-between">
                <div 
                  className="flex items-center gap-3 flex-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors py-2 px-2 rounded"
                  onClick={() => toggleCourse(course.id)}
                >
                  <span className="text-lg">
                    {expandedCourses.has(course.id) ? '▼' : '▶'}
                  </span>
                  {course.thumbnail && (
                    <img
                      src={getImageUrl(course.thumbnail) || ''}
                      alt={course.title}
                      className="h-16 w-24 rounded object-cover"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.style.display = 'none';
                      }}
                    />
                  )}
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      📚 {course.title}
                    </h2>
                    {course.subtitle && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {course.subtitle}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        👨‍🏫 {course.teacher?.name}
                      </span>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        📂 {course.category?.name}
                      </span>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        ⭐ {course.rating}
                      </span>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        👥 {course.totalStudents} talaba
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleStatus(course.id, course.isActive);
                      }}
                      className="cursor-pointer"
                      title={course.isActive ? 'Nofaol qilish' : 'Faollashtirish'}
                    >
                      <Badge size="sm" color={course.isActive ? 'success' : 'error'}>
                        {course.isActive ? 'Faol' : 'Nofaol'}
                      </Badge>
                    </button>
                    {course.isFree ? (
                      <Badge size="sm" color="info">Bepul</Badge>
                    ) : (
                      <span className="px-3 py-1 text-sm font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900 rounded-full">
                        {course.price.toLocaleString()} so'm
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    size="mini"
                    variant="outline"
                    onClick={() => handleViewCourse(course)}
                  >
                    <EyeIcon className="size-4 fill-black dark:fill-white" />
                  </Button>
                  <Button
                    size="mini"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCourse({ id: course.id, title: course.title });
                    }}
                  >
                    <ChatIcon className="size-4 fill-black dark:fill-white" />
                  </Button>
                  <Button
                    size="mini"
                    variant="outline"
                    onClick={() => handleCourseEdit(course)}
                  >
                    <PencilIcon className="size-4 fill-black dark:fill-white" />
                  </Button>
                  <Button
                    size="mini"
                    variant="outline"
                    onClick={() => handleDeleteClick('course', course.id, { name: course.title })}
                  >
                    <DeleteIcon className="size-4 fill-black dark:fill-white" />
                  </Button>
                  <Button
                    size="mini"
                    variant="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSectionAdd(course.id);
                    }}
                    startIcon={<PlusIcon className="size-4 fill-white" />}
                  >
                    Bo'lim qo'shish
                  </Button>
                </div>
              </div>

              {/* Sections - Loaded on demand when expanded */}
              {expandedCourses.has(course.id) && (
                <CourseSectionsView 
                  key={`${course.id}-${sectionsReloadKey}`}
                  courseId={course.id}
                  expandedSections={expandedSections}
                  toggleSection={toggleSection}
                  formatDuration={formatDuration}
                  formatSize={formatSize}
                  handleDeleteClick={handleDeleteClick}
                  handleSectionEdit={handleSectionEdit}
                  handleVideoAdd={handleVideoAdd}
                  handleVideoEdit={handleVideoEdit}
                  handleVideoView={handleVideoView}
                  handleVideoPlay={handleVideoPlay}
                />
              )}
            </div>
          ))}

          {!loading && courses.length === 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">Hozircha kurslar yo'q</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Oldingi
            </Button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              // Show only 5 pages around current page
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 2 && page <= currentPage + 2)
              ) {
                return (
                  <Button
                    key={page}
                    size="sm"
                    variant={currentPage === page ? 'primary' : 'outline'}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                );
              } else if (page === currentPage - 3 || page === currentPage + 3) {
                return <span key={page} className="px-2 text-gray-500">...</span>;
              }
              return null;
            })}
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Keyingi
            </Button>
          </div>
        )}
      </div>

      {/* View Course Modal */}
      <Modal isOpen={isViewModalOpen} onClose={closeViewModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-6 bg-white rounded-3xl dark:bg-gray-900">
          <div className="px-2 pr-14">
            <h4 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Kurs ma'lumotlari
            </h4>
          </div>
          {viewingCourse && (
            <div className="px-2 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">ID</p>
                  <p className="text-base font-medium text-gray-800 dark:text-white">#{viewingCourse.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Holati</p>
                  <Badge size="sm" color={viewingCourse.isActive ? 'success' : 'error'}>
                    {viewingCourse.isActive ? 'Faol' : 'Nofaol'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Reyting</p>
                  <p className="text-base font-medium text-gray-800 dark:text-white">
                    ⭐ {viewingCourse.rating}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Talabalar</p>
                  <p className="text-base font-medium text-gray-800 dark:text-white">
                    👥 {viewingCourse.totalStudents} ta
                  </p>
                </div>
                {viewingCourse.createdAt && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Qo'shilgan</p>
                    <p className="text-base font-medium text-gray-800 dark:text-white">
                      {formatDate(viewingCourse.createdAt)}
                    </p>
                  </div>
                )}
              </div>
              {viewingCourse.thumbnail && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Banner</p>
                  <img
                    src={getImageUrl(viewingCourse.thumbnail) || ''}
                    alt={viewingCourse.title}
                    className="w-full max-w-md h-48 object-cover rounded-lg"
                  />
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Nomi</p>
                <p className="text-base font-medium text-gray-800 dark:text-white">
                  {viewingCourse.title}
                </p>
              </div>
              {viewingCourse.subtitle && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Qisqa matn</p>
                  <p className="text-base font-medium text-gray-800 dark:text-white">
                    {viewingCourse.subtitle}
                  </p>
                </div>
              )}
              {viewingCourse.description && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Tavsif</p>
                  <p className="text-base text-gray-800 dark:text-white whitespace-pre-wrap">
                    {viewingCourse.description}
                  </p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Narx</p>
                  <p className="text-base font-medium text-gray-800 dark:text-white">
                    {viewingCourse.isFree ? (
                      <span className="text-green-600">Bepul</span>
                    ) : (
                      `${viewingCourse.price.toLocaleString()} so'm`
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">O'qituvchi</p>
                  <p className="text-base font-medium text-gray-800 dark:text-white">
                    {viewingCourse.teacher?.name}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Kategoriya</p>
                  <p className="text-base font-medium text-gray-800 dark:text-white">
                    {viewingCourse.category?.name}
                  </p>
                </div>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
            <Button size="sm" variant="outline" onClick={closeViewModal}>
              Yopish
            </Button>
          </div>
        </div>
      </Modal>

      {/* Course Modal */}
      <Modal isOpen={isCourseModalOpen} onClose={closeCourseModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              {editingCourse ? 'Kursni Tahrirlash' : 'Yangi Kurs'}
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Kurs ma&apos;lumotlarini kiriting
            </p>
          </div>
          <form onSubmit={handleCourseSubmit} className="flex flex-col">
            <div className="custom-scrollbar max-h-[60vh] overflow-y-auto px-2 pb-3 space-y-4">
              <div>
                <Label>Kurs nomi</Label>
                <Input
                  type="text"
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                />
              </div>
              <div>
                <Label>Qisqa matn</Label>
                <Input
                  type="text"
                  value={courseForm.subtitle}
                  onChange={(e) => setCourseForm({ ...courseForm, subtitle: e.target.value })}
                />
              </div>
              <div>
                <Label>Tavsif</Label>
                <textarea
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800 dark:text-white"
                  rows={4}
                />
              </div>
              <div>
                <Label>Banner (Rasm yoki URL)</Label>
                <div className="space-y-2">
                  <Input
                    type="text"
                    value={courseForm.thumbnail}
                    onChange={(e) => setCourseForm({ ...courseForm, thumbnail: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">yoki</span>
                    <label className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailUpload}
                        className="hidden"
                        disabled={uploadingThumbnail}
                      />
                      <div className="cursor-pointer px-3 py-1.5 text-xs border border-brand-300 dark:border-brand-700 rounded-md text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors text-center">
                        {uploadingThumbnail ? 'Yuklanmoqda...' : courseForm.thumbnail ? 'Rasmni almashtirish' : 'Rasm yuklash'}
                      </div>
                    </label>
                  </div>
                  {uploadingThumbnail && (
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-brand-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${thumbnailUploadProgress}%` }}
                      />
                    </div>
                  )}
                  {courseForm.thumbnail && (
                    <div className="relative">
                      <img
                        src={getImageUrl(courseForm.thumbnail) || ''}
                        alt="Banner preview"
                        className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  JPG, PNG, GIF formatlar qo'llab-quvvatlanadi (Max: 5MB)
                </p>
              </div>
              <div>
                <Label>O&apos;qituvchi</Label>
                <Select
                  value={courseForm.teacherId.toString()}
                  onChange={(e) => setCourseForm({ ...courseForm, teacherId: parseInt(e.target.value) })}
                  style={{ colorScheme: 'light dark' }}
                >
                  <option value="0" style={{ backgroundColor: 'var(--tw-bg-opacity)', color: 'inherit' }}>
                    {teachers.length === 0 ? "O'qituvchilar yo'q" : "Tanlang..."}
                  </option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id} style={{ backgroundColor: 'var(--tw-bg-opacity)', color: 'inherit' }}>
                      {teacher.name}
                    </option>
                  ))}
                </Select>
                {teachers.length === 0 && (
                  <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                    ⚠️ Avval o'qituvchi qo'shing
                  </p>
                )}
              </div>
              <div>
                <Label>Kategoriya</Label>
                <Select
                  value={courseForm.categoryId.toString()}
                  onChange={(e) => setCourseForm({ ...courseForm, categoryId: parseInt(e.target.value) })}
                  style={{ colorScheme: 'light dark' }}
                >
                  <option value="0" style={{ backgroundColor: 'var(--tw-bg-opacity)', color: 'inherit' }}>Tanlang...</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id} style={{ backgroundColor: 'var(--tw-bg-opacity)', color: 'inherit' }}>
                      {category.nameUz}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Narx (so&apos;m)</Label>
                <Input
                  type="number"
                  value={courseForm.price}
                  onChange={(e) => setCourseForm({ ...courseForm, price: parseFloat(e.target.value) })}
                  disabled={courseForm.isFree}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={courseForm.isFree}
                  onChange={(e) => setCourseForm({ ...courseForm, isFree: e.target.checked, price: e.target.checked ? 0 : courseForm.price })}
                  className="w-4 h-4"
                />
                <Label>Bepul kurs</Label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={courseForm.isActive}
                  onChange={(e) => setCourseForm({ ...courseForm, isActive: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label>Faol</Label>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button type="button" size="sm" variant="outline" onClick={closeCourseModal}>
                Bekor qilish
              </Button>
              <Button type="submit" size="sm" variant="primary">
                {loading ? 'Saqlanmoqda...' : 'Saqlash'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Section Modal */}
      <SectionModal
        isOpen={isSectionModalOpen}
        onClose={closeSectionModal}
        onSubmit={handleSectionSubmit}
        editingSection={editingSection}
        initialCourseId={sectionForm.courseId}
      />

      {/* Video Modal */}
      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={closeVideoModal}
        onSubmit={handleVideoSubmit}
        editingVideo={editingVideo}
        initialCourseId={videoForm.courseId}
        initialSectionId={videoForm.sectionId}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={isDeleteOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        title={`${deleteType === 'course' ? 'Kursni' : deleteType === 'section' ? 'Bo\'limni' : 'Videoni'} o\'chirish`}
        message={
          deleteType === 'section' && deleteInfo.videoCount !== undefined
            ? `Ushbu bo'limni o'chirmoqchimisiz? ${deleteInfo.videoCount > 0 ? `\n\n⚠️ Ogohlantirish: Bu bo'limdagi ${deleteInfo.videoCount} ta video ham o'chiriladi!` : ''}`
            : `Ushbu ${deleteType === 'course' ? 'kursni' : deleteType === 'section' ? 'bo\'limni' : 'videoni'} o\'chirmoqchimisiz?`
        }
        itemName={deleteInfo.name || (deleteId ? `#${deleteId}` : undefined)}
      />

      {/* Comments Modal */}
      {selectedCourse && (
        <CourseCommentsModal
          courseId={selectedCourse.id}
          courseTitle={selectedCourse.title}
          isOpen={!!selectedCourse}
          onClose={() => setSelectedCourse(null)}
        />
      )}

      {/* Video Player Modal - Kichik */}
      <Modal isOpen={isVideoPlayerModalOpen} onClose={closeVideoPlayerModal} className="max-w-[600px] m-4">
        <div className="relative w-full p-4 bg-white rounded-3xl dark:bg-gray-900">
          <div className="px-2 pr-14">
            <h4 className="mb-3 text-lg font-semibold text-gray-800 dark:text-white/90">
              Video Player
            </h4>
          </div>
          {viewingVideo && viewingVideo.url && (
            <div className="px-2">
              <video
                controls
                autoPlay
                className="w-full max-h-[400px] rounded-lg border border-gray-200 dark:border-gray-700"
                style={{ objectFit: 'contain' }}
                poster={viewingVideo.thumbnail ? getImageUrl(viewingVideo.thumbnail) || '' : undefined}
              >
                <source src={getImageUrl(viewingVideo.url) || ''} type="video/mp4" />
                <source src={getImageUrl(viewingVideo.url) || ''} type="video/webm" />
                <source src={getImageUrl(viewingVideo.url) || ''} type="video/ogg" />
                Sizning brauzeringiz video playbackni qo'llab-quvvatlamaydi.
              </video>
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-800 dark:text-white">{viewingVideo.title}</p>
                {viewingVideo.subtitle && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{viewingVideo.subtitle}</p>
                )}
              </div>
            </div>
          )}
          <div className="flex items-center gap-3 px-2 mt-4 lg:justify-end">
            <Button size="sm" variant="outline" onClick={closeVideoPlayerModal}>
              Yopish
            </Button>
          </div>
        </div>
      </Modal>

      {/* Video View Modal - To'liq ma'lumotlar */}
      <Modal isOpen={isVideoViewModalOpen} onClose={closeVideoViewModal} className="max-w-[900px] m-4">
        <div className="relative w-full p-6 bg-white rounded-3xl dark:bg-gray-900">
          <div className="px-2 pr-14">
            <h4 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Video ma'lumotlari
            </h4>
          </div>
          {viewingVideo && (
            <div className="px-2 space-y-4">
              {viewingVideo.thumbnail && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Banner</p>
                  <img
                    src={getImageUrl(viewingVideo.thumbnail) || ''}
                    alt={viewingVideo.title}
                    className="w-full max-w-md h-48 object-cover rounded-lg"
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">ID</p>
                  <p className="text-base font-medium text-gray-800 dark:text-white">#{viewingVideo.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Tartib</p>
                  <p className="text-base font-medium text-gray-800 dark:text-white">#{viewingVideo.order}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Holati</p>
                  <div>
                    <Badge size="sm" color={viewingVideo.isActive ? 'success' : 'error'}>
                      {viewingVideo.isActive ? 'Faol' : 'Nofaol'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Turi</p>
                  <div>
                    {viewingVideo.isFree ? (
                      <Badge size="sm" color="info">Bepul</Badge>
                    ) : (
                      <Badge size="sm" color="warning">Pullik</Badge>
                    )}
                  </div>
                </div>
                {viewingVideo.duration && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Davomiyligi</p>
                    <p className="text-base font-medium text-gray-800 dark:text-white">
                      {formatDuration(viewingVideo.duration)}
                    </p>
                  </div>
                )}
                {viewingVideo.size && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Hajmi</p>
                    <p className="text-base font-medium text-gray-800 dark:text-white">
                      {formatSize(viewingVideo.size)}
                    </p>
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Nomi</p>
                <p className="text-base font-medium text-gray-800 dark:text-white">
                  {viewingVideo.title}
                </p>
              </div>
              {viewingVideo.subtitle && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Qisqa matn</p>
                  <p className="text-base font-medium text-gray-800 dark:text-white">
                    {viewingVideo.subtitle}
                  </p>
                </div>
              )}
              {viewingVideo.description && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Tavsif</p>
                  <p className="text-base text-gray-800 dark:text-white whitespace-pre-wrap">
                    {viewingVideo.description}
                  </p>
                </div>
              )}
              {viewingVideo.url && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Video URL</p>
                  <a
                    href={getImageUrl(viewingVideo.url) || ''}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-brand-600 dark:text-brand-400 hover:underline break-all"
                  >
                    {getImageUrl(viewingVideo.url) || viewingVideo.url}
                  </a>
                </div>
              )}
            </div>
          )}
          <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
            <Button size="sm" variant="outline" onClick={closeVideoViewModal}>
              Yopish
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

// Component to load sections on demand
const CourseSectionsView = ({ 
  courseId, 
  expandedSections, 
  toggleSection, 
  formatDuration, 
  formatSize,
  handleDeleteClick,
  handleSectionEdit,
  handleVideoAdd,
  handleVideoEdit,
  handleVideoView,
  handleVideoPlay
}: { 
  courseId: number;
  expandedSections: Set<string>;
  toggleSection: (courseId: number, sectionId: number | null) => void;
  formatDuration: (seconds?: number) => string;
  formatSize: (bytes?: string) => string;
  handleDeleteClick: (type: 'video' | 'section', id: number, info?: { name?: string; videoCount?: number }) => void;
  handleSectionEdit: (section: Section) => void;
  handleVideoAdd: (courseId: number, sectionId?: number) => void;
  handleVideoEdit: (video: Video) => void;
  handleVideoView: (video: Video) => void;
  handleVideoPlay: (video: Video) => void;
}) => {
  const [sections, setSections] = useState<SectionGroup[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const loadSections = async () => {
    setLoading(true);
    try {
      const [sectionsRes, videosRes] = await Promise.all([
        axiosClient.get(`/sections/course/${courseId}`),
        axiosClient.get(`/video`),
      ]);

      const sectionsList = sectionsRes.data;
      const allVideos = videosRes.data;
      const courseVideos = allVideos.filter((v: Video) => v.courseId === courseId);

      const sectionGroups: SectionGroup[] = sectionsList.map((section: Section) => ({
        sectionId: section.id,
        sectionTitle: section.title,
        order: section.order,
        videos: courseVideos.filter((v: Video) => v.sectionId === section.id).sort((a: Video, b: Video) => a.order - b.order),
      }));

      const videosWithoutSection = courseVideos.filter((v: Video) => !v.sectionId);
      if (videosWithoutSection.length > 0) {
        sectionGroups.push({
          sectionId: null,
          sectionTitle: 'Bo\'limga tegishli emas',
          order: 999,
          videos: videosWithoutSection.sort((a: Video, b: Video) => a.order - b.order),
        });
      }

      setSections(sectionGroups.sort((a, b) => a.order - b.order));
    } catch (error) {
      console.error('Error loading sections:', error);
      toast.error('Bo\'limlarni yuklashda xato!');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <LoadSpinner />
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {sections.map((sectionGroup) => {
        const sectionKey = `${courseId}-${sectionGroup.sectionId}`;
        return (
          <div key={sectionKey} className="bg-white dark:bg-gray-800">
            {/* Section Header */}
            <div
              className="px-8 py-3 bg-gray-50 dark:bg-gray-750 flex items-center justify-between cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              onClick={() => toggleSection(courseId, sectionGroup.sectionId)}
            >
              <div className="flex items-center gap-3">
                <span className="text-sm">
                  {expandedSections.has(sectionKey) ? '▼' : '▶'}
                </span>
                <span className="px-2 py-0.5 bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 text-xs font-semibold rounded-full">
                  #{sectionGroup.order}
                </span>
                <h3 className="font-medium text-gray-700 dark:text-gray-300">
                  📑 {sectionGroup.sectionTitle}
                </h3>
                <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded-full">
                  {sectionGroup.videos.length} ta video
                </span>
              </div>
              <div className="flex items-center gap-2">
                {sectionGroup.sectionId !== null && (
                  <>
                    <Button
                      size="mini"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSectionEdit({
                          id: sectionGroup.sectionId!,
                          title: sectionGroup.sectionTitle,
                          subtitle: '',
                          order: sectionGroup.order,
                          courseId: courseId,
                        });
                      }}
                    >
                      <PencilIcon className="size-4 fill-black dark:fill-white" />
                    </Button>
                    <Button
                      size="mini"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick('section', sectionGroup.sectionId!, {
                          name: sectionGroup.sectionTitle,
                          videoCount: sectionGroup.videos.length,
                        });
                      }}
                    >
                      <DeleteIcon className="size-4 fill-black dark:fill-white" />
                    </Button>
                  </>
                )}
                <Button
                  size="mini"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleVideoAdd(courseId, sectionGroup.sectionId || undefined);
                  }}
                >
                  <PlusIcon className="size-4 fill-black dark:fill-white" />
                </Button>
              </div>
            </div>

            {/* Videos Table */}
            {expandedSections.has(sectionKey) && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Video
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Davomiyligi
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Hajmi
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Tartib
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Holat
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Amallar
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {sectionGroup.videos.map((video) => (
                      <tr key={video.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                          <div className="flex items-center gap-3">
                            {video.thumbnail ? (
                              <div className="relative group cursor-pointer" onClick={() => handleVideoPlay(video)}>
                                <img
                                  src={getImageUrl(video.thumbnail) || ''}
                                  alt={video.title}
                                  className="h-14 w-24 rounded object-cover shrink-0 border border-gray-200 dark:border-gray-600"
                                  onError={(e) => {
                                    const target = e.currentTarget;
                                    target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="96" height="56" viewBox="0 0 96 56"%3E%3Crect width="96" height="56" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" fill="%239ca3af"%3E📹%3C/text%3E%3C/svg%3E';
                                    target.onerror = null;
                                  }}
                                />
                                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors rounded flex items-center justify-center">
                                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z"/>
                                  </svg>
                                </div>
                              </div>
                            ) : (
                              <div 
                                className="h-14 w-24 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0 border border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                onClick={() => handleVideoPlay(video)}
                              >
                                <VideoIcon className="size-8 fill-gray-400" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{video.title}</div>
                              {video.subtitle && (
                                <div className="text-xs text-gray-500 truncate">{video.subtitle}</div>
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
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1 max-w-[120px]">
                            <Badge size="sm" color={video.isActive ? 'success' : 'error'}>
                              {video.isActive ? 'Faol' : 'Nofaol'}
                            </Badge>
                            {video.isFree && (
                              <Badge size="sm" color="info">Bepul</Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <Button
                              size="mini"
                              variant="outline"
                              onClick={() => handleVideoView(video)}
                              title="Ko'rish"
                            >
                              <EyeIcon className="size-4 fill-black dark:fill-white" />
                            </Button>
                            <Button
                              size="mini"
                              variant="outline"
                              onClick={() => handleVideoEdit(video)}
                            >
                              <PencilIcon className="size-4 fill-black dark:fill-white" />
                            </Button>
                            <Button
                              size="mini"
                              variant="outline"
                              onClick={() => handleDeleteClick('video', video.id, { name: video.title })}
                            >
                              <DeleteIcon className="size-4 fill-black dark:fill-white" />
                            </Button>
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
      {sections.length === 0 && (
        <div className="p-6 text-center text-gray-500 dark:text-gray-400">
          Bu kursda hali bo'limlar yo'q
        </div>
      )}
    </div>
  );
};

export default CoursesMainPage;
