import { useState, useEffect } from 'react';
import axiosClient, { getImageUrl } from '../../service/axios.service';
import { toast } from 'react-toastify';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import { PencilIcon, DeleteIcon, ChatIcon, PlusIcon, EyeIcon, VideoIcon } from '../../icons';
import Button from '../../components/ui/button/Button';
import CourseCommentsModal from '../../components/modals/CourseCommentsModal';
import { Modal } from '../../components/ui/modal';
import Badge from '../../components/ui/badge/Badge';
import { LoadSpinner } from '../../components/spinner/load-spinner';
import { useModal } from '../../hooks/useModal';
import ConfirmDeleteModal from '../../components/ui/ConfirmDeleteModal';
import Label from '../../components/form/Label';
import Input from '../../components/form/input/InputField';
import Select from '../../components/form/Select';

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
  
  // Modals
  const { isOpen: isCourseModalOpen, openModal: openCourseModal, closeModal: closeCourseModal } = useModal();
  const { isOpen: isSectionModalOpen, openModal: openSectionModal, closeModal: closeSectionModal } = useModal();
  const { isOpen: isVideoModalOpen, openModal: openVideoModal, closeModal: closeVideoModal } = useModal();
  const { isOpen: isViewModalOpen, openModal: openViewModal, closeModal: closeViewModal } = useModal();
  const { isOpen: isDeleteOpen, openModal: openDeleteModal, closeModal: closeDeleteModal } = useModal();
  
  // Selected items for edit
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [deleteType, setDeleteType] = useState<'course' | 'section' | 'video'>('course');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  
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
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get('/course');
      setCourses(response.data);
    } catch (error: unknown) {
      toast.error('Kurslarni yuklashda xato!');
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await axiosClient.get('/teacher');
      setTeachers(response.data);
    } catch (error) {
      console.error('Teachers fetch error:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axiosClient.get('/category');
      setCategories(response.data);
    } catch (error) {
      console.error('Categories fetch error:', error);
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

  const handleSectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSection) {
        await axiosClient.patch(`/sections/${editingSection.id}`, sectionForm);
        toast.success('Bo\'lim yangilandi!');
      } else {
        await axiosClient.post('/sections', sectionForm);
        toast.success('Bo\'lim qo\'shildi!');
      }
      fetchCourses();
      closeSectionModal();
      resetSectionForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi!');
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

  const handleVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingVideo) {
        await axiosClient.patch(`/video/${editingVideo.id}`, videoForm);
        toast.success('Video yangilandi!');
      } else {
        await axiosClient.post('/video', videoForm);
        toast.success('Video qo\'shildi!');
      }
      fetchCourses();
      closeVideoModal();
      resetVideoForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi!');
    }
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

  // Delete handlers
  const handleDeleteClick = (type: 'course' | 'section' | 'video', id: number) => {
    setDeleteType(type);
    setDeleteId(id);
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
      setIsViewModalOpen(true);
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
          <h1 className="text-2xl font-bold">Barcha Kurslar</h1>
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
                  <div className="flex items-center gap-2">
                    <span className="inline-block">
                      <Badge size="sm" color={course.isActive ? 'success' : 'error'}>
                        {course.isActive ? 'Faol' : 'Nofaol'}
                      </Badge>
                    </span>
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
                    onClick={() => handleDeleteClick('course', course.id)}
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
                    Bo&apos;lim qo&apos;shish
                  </Button>
                </div>
              </div>

              {/* Sections - Loaded on demand when expanded */}
              {expandedCourses.has(course.id) && (
                <CourseSectionsView 
                  courseId={course.id}
                  expandedSections={expandedSections}
                  toggleSection={toggleSection}
                  formatDuration={formatDuration}
                  formatSize={formatSize}
                  handleDeleteClick={handleDeleteClick}
                  handleSectionEdit={handleSectionEdit}
                  handleVideoAdd={handleVideoAdd}
                  handleVideoEdit={handleVideoEdit}
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
      </div>

      {/* View Course Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} className="max-w-[700px] m-4">
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
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Rasm</p>
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
            <Button size="sm" variant="outline" onClick={() => setIsViewModalOpen(false)}>
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
            <div className="custom-scrollbar max-h-[450px] overflow-y-auto px-2 pb-3 space-y-4">
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
                <Label>Thumbnail URL</Label>
                <Input
                  type="text"
                  value={courseForm.thumbnail}
                  onChange={(e) => setCourseForm({ ...courseForm, thumbnail: e.target.value })}
                />
              </div>
              <div>
                <Label>O&apos;qituvchi</Label>
                <Select
                  value={courseForm.teacherId.toString()}
                  onChange={(e) => setCourseForm({ ...courseForm, teacherId: parseInt(e.target.value) })}
                >
                  <option value="0">Tanlang...</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Kategoriya</Label>
                <Select
                  value={courseForm.categoryId.toString()}
                  onChange={(e) => setCourseForm({ ...courseForm, categoryId: parseInt(e.target.value) })}
                >
                  <option value="0">Tanlang...</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
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
      <Modal isOpen={isSectionModalOpen} onClose={closeSectionModal} className="max-w-[600px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              {editingSection ? 'Bo&apos;limni Tahrirlash' : 'Yangi Bo&apos;lim'}
            </h4>
          </div>
          <form onSubmit={handleSectionSubmit} className="flex flex-col">
            <div className="custom-scrollbar max-h-[450px] overflow-y-auto px-2 pb-3 space-y-4">
              <div>
                <Label>Bo&apos;lim nomi</Label>
                <Input
                  type="text"
                  value={sectionForm.title}
                  onChange={(e) => setSectionForm({ ...sectionForm, title: e.target.value })}
                />
              </div>
              <div>
                <Label>Qisqa matn</Label>
                <Input
                  type="text"
                  value={sectionForm.subtitle}
                  onChange={(e) => setSectionForm({ ...sectionForm, subtitle: e.target.value })}
                />
              </div>
              <div>
                <Label>Tartib raqami</Label>
                <Input
                  type="number"
                  value={sectionForm.order}
                  onChange={(e) => setSectionForm({ ...sectionForm, order: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button type="button" size="sm" variant="outline" onClick={closeSectionModal}>
                Bekor qilish
              </Button>
              <Button type="submit" size="sm" variant="primary">
                Saqlash
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Video Modal */}
      <Modal isOpen={isVideoModalOpen} onClose={closeVideoModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              {editingVideo ? 'Videoni Tahrirlash' : 'Yangi Video'}
            </h4>
          </div>
          <form onSubmit={handleVideoSubmit} className="flex flex-col">
            <div className="custom-scrollbar max-h-[450px] overflow-y-auto px-2 pb-3 space-y-4">
              <div>
                <Label>Video nomi</Label>
                <Input
                  type="text"
                  value={videoForm.title}
                  onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                />
              </div>
              <div>
                <Label>Qisqa matn</Label>
                <Input
                  type="text"
                  value={videoForm.subtitle}
                  onChange={(e) => setVideoForm({ ...videoForm, subtitle: e.target.value })}
                />
              </div>
              <div>
                <Label>Tavsif</Label>
                <textarea
                  value={videoForm.description}
                  onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800 dark:text-white"
                  rows={3}
                />
              </div>
              <div>
                <Label>Video URL</Label>
                <Input
                  type="text"
                  value={videoForm.url}
                  onChange={(e) => setVideoForm({ ...videoForm, url: e.target.value })}
                />
              </div>
              <div>
                <Label>Thumbnail URL</Label>
                <Input
                  type="text"
                  value={videoForm.thumbnail}
                  onChange={(e) => setVideoForm({ ...videoForm, thumbnail: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Davomiyligi (soniya)</Label>
                  <Input
                    type="number"
                    value={videoForm.duration}
                    onChange={(e) => setVideoForm({ ...videoForm, duration: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Hajmi</Label>
                  <Input
                    type="text"
                    value={videoForm.size}
                    onChange={(e) => setVideoForm({ ...videoForm, size: e.target.value })}
                    placeholder="10MB"
                  />
                </div>
              </div>
              <div>
                <Label>Tartib raqami</Label>
                <Input
                  type="number"
                  value={videoForm.order}
                  onChange={(e) => setVideoForm({ ...videoForm, order: parseInt(e.target.value) })}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={videoForm.isFree}
                  onChange={(e) => setVideoForm({ ...videoForm, isFree: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label>Bepul video</Label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={videoForm.isActive}
                  onChange={(e) => setVideoForm({ ...videoForm, isActive: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label>Faol</Label>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button type="button" size="sm" variant="outline" onClick={closeVideoModal}>
                Bekor qilish
              </Button>
              <Button type="submit" size="sm" variant="primary">
                Saqlash
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={isDeleteOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        title={`${deleteType === 'course' ? 'Kursni' : deleteType === 'section' ? 'Bo&apos;limni' : 'Videoni'} o&apos;chirish`}
        message={`Ushbu ${deleteType === 'course' ? 'kursni' : deleteType === 'section' ? 'bo&apos;limni' : 'videoni'} o&apos;chirmoqchimisiz?`}
        itemName={deleteId ? `#${deleteId}` : undefined}
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
  handleVideoEdit
}: { 
  courseId: number;
  expandedSections: Set<string>;
  toggleSection: (courseId: number, sectionId: number | null) => void;
  formatDuration: (seconds?: number) => string;
  formatSize: (bytes?: string) => string;
  handleDeleteClick: (type: 'video' | 'section', id: number) => void;
  handleSectionEdit: (section: Section) => void;
  handleVideoAdd: (courseId: number, sectionId?: number) => void;
  handleVideoEdit: (video: Video) => void;
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
                        handleDeleteClick('section', sectionGroup.sectionId!);
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
                          <div className="flex items-center">
                            {video.thumbnail && (
                              <img
                                src={getImageUrl(video.thumbnail) || ''}
                                alt={video.title}
                                className="h-12 w-20 rounded object-cover mr-3"
                                onError={(e) => {
                                  const target = e.currentTarget;
                                  target.style.display = 'none';
                                }}
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
                              onClick={() => handleVideoEdit(video)}
                            >
                              <PencilIcon className="size-4 fill-black dark:fill-white" />
                            </Button>
                            <Button
                              size="mini"
                              variant="outline"
                              onClick={() => handleDeleteClick('video', video.id)}
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
