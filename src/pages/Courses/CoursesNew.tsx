import { useState, useEffect } from 'react';
import axiosClient, { getImageUrl } from '../../service/axios.service';
import { toast } from 'react-toastify';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import ComponentCard from '../../components/common/ComponentCard';
import { PencilIcon, DeleteIcon, PlusIcon, EyeIcon, ChatIcon, VideoIcon } from '../../icons';
import Button from '../../components/ui/button/Button';
import { Modal } from '../../components/ui/modal';
import Badge from '../../components/ui/badge/Badge';
import Label from '../../components/form/Label';
import Input from '../../components/form/input/InputField';
import Select from '../../components/form/Select';
import FileInput from '../../components/form/input/FileInput';
import { useModal } from '../../hooks/useModal';
import ConfirmDeleteModal from '../../components/ui/ConfirmDeleteModal';
import CourseCommentsModal from '../../components/modals/CourseCommentsModal';
import { LoadSpinner } from '../../components/spinner/load-spinner';

interface Category {
  id: number;
  name: string;
  nameUz: string;
  icon?: string;
  image?: string;
  isActive: boolean;
  createdAt: string;
}

interface Teacher {
  id: number;
  name: string;
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
  teacher: Teacher;
  category: { id: number; name: string };
  sections?: Section[];
  _count?: {
    sections: number;
    videos: number;
    comments: number;
  };
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

export default function CoursesNewPage() {
  const [activeTab, setActiveTab] = useState<'categories' | 'courses'>('courses');
  
  // State for Categories
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  
  // State for Courses
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseLoading, setCourseLoading] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [expandedCourses, setExpandedCourses] = useState<Set<number>>(new Set());
  
  // Modals
  const { isOpen: isCategoryModalOpen, openModal: openCategoryModal, closeModal: closeCategoryModal } = useModal();
  const { isOpen: isCourseModalOpen, openModal: openCourseModal, closeModal: closeCourseModal } = useModal();
  const { isOpen: isSectionModalOpen, openModal: openSectionModal, closeModal: closeSectionModal } = useModal();
  const { isOpen: isVideoModalOpen, openModal: openVideoModal, closeModal: closeVideoModal } = useModal();
  const { isOpen: isViewModalOpen, openModal: openViewModal, closeModal: closeViewModal } = useModal();
  const { isOpen: isDeleteOpen, openModal: openDeleteModal, closeModal: closeDeleteModal } = useModal();
  
  // Selected items
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [viewingCourse, setViewingCourse] = useState<Course | null>(null);
  const [commentsModalData, setCommentsModalData] = useState<{ id: number; title: string } | null>(null);
  const [deleteType, setDeleteType] = useState<'category' | 'course' | 'section' | 'video'>('course');
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Form data
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    nameUz: '',
    icon: '',
    image: '',
    isActive: true,
  });

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
    if (activeTab === 'categories') {
      fetchCategories();
    } else {
      fetchCourses();
      fetchTeachers();
    }
  }, [activeTab]);

  // Fetch functions
  const fetchCategories = async () => {
    setCategoryLoading(true);
    try {
      const response = await axiosClient.get('/category');
      setCategories(response.data);
    } catch (error) {
      toast.error('Kategoriyalarni yuklashda xato!');
    } finally {
      setCategoryLoading(false);
    }
  };

  const fetchCourses = async () => {
    setCourseLoading(true);
    try {
      const response = await axiosClient.get('/course');
      setCourses(response.data);
    } catch (error) {
      toast.error('Kurslarni yuklashda xato!');
    } finally {
      setCourseLoading(false);
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

  const fetchCourseDetails = async (courseId: number) => {
    try {
      const response = await axiosClient.get(`/course/${courseId}`);
      return response.data;
    } catch (error) {
      toast.error('Kurs ma\'lumotlarini yuklashda xato!');
      return null;
    }
  };

  // Category handlers
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCategoryLoading(true);
    try {
      if (selectedCategory) {
        await axiosClient.patch(`/category/${selectedCategory.id}`, categoryForm);
        toast.success('Kategoriya yangilandi!');
      } else {
        await axiosClient.post('/category', categoryForm);
        toast.success('Kategoriya qo\'shildi!');
      }
      fetchCategories();
      closeCategoryModal();
      resetCategoryForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi!');
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleCategoryEdit = (category: Category) => {
    setSelectedCategory(category);
    setCategoryForm({
      name: category.name,
      nameUz: category.nameUz,
      icon: category.icon || '',
      image: category.image || '',
      isActive: category.isActive,
    });
    openCategoryModal();
  };

  const resetCategoryForm = () => {
    setSelectedCategory(null);
    setCategoryForm({
      name: '',
      nameUz: '',
      icon: '',
      image: '',
      isActive: true,
    });
  };

  // Course handlers
  const handleCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCourseLoading(true);
    try {
      if (selectedCourse) {
        await axiosClient.patch(`/course/${selectedCourse.id}`, courseForm);
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
      setCourseLoading(false);
    }
  };

  const handleCourseEdit = (course: Course) => {
    setSelectedCourse(course);
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

  const handleCourseView = async (course: Course) => {
    const detailedCourse = await fetchCourseDetails(course.id);
    if (detailedCourse) {
      setViewingCourse(detailedCourse);
      openViewModal();
    }
  };

  const resetCourseForm = () => {
    setSelectedCourse(null);
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
    setSelectedSection(section);
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
      if (selectedSection) {
        await axiosClient.patch(`/sections/${selectedSection.id}`, sectionForm);
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
    setSelectedSection(null);
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
    setSelectedVideo(video);
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
      if (selectedVideo) {
        await axiosClient.patch(`/video/${selectedVideo.id}`, videoForm);
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
    setSelectedVideo(null);
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
  const handleDeleteClick = (type: 'category' | 'course' | 'section' | 'video', id: number) => {
    setDeleteType(type);
    setDeleteId(id);
    openDeleteModal();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;

    try {
      const endpoints = {
        category: `/category/${deleteId}`,
        course: `/course/${deleteId}`,
        section: `/sections/${deleteId}`,
        video: `/video/${deleteId}`,
      };

      await axiosClient.delete(endpoints[deleteType]);
      toast.success(`${deleteType === 'category' ? 'Kategoriya' : deleteType === 'course' ? 'Kurs' : deleteType === 'section' ? 'Bo\'lim' : 'Video'} o'chirildi!`);
      
      if (deleteType === 'category') {
        fetchCategories();
      } else {
        fetchCourses();
      }
      
      closeDeleteModal();
    } catch (error) {
      toast.error('O\'chirishda xato!');
    }
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('uz-UZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <>
      <PageMeta title="Kurslar" />
      <PageBreadcrumb pageTitle="Kurslar" />

      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('courses')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'courses'
                ? 'text-brand-600 border-b-2 border-brand-600'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            Barcha Kurslar
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'categories'
                ? 'text-brand-600 border-b-2 border-brand-600'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            Kategoriyalar
          </button>
        </div>

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <ComponentCard
            title="Kategoriyalar"
            action={
              <Button
                size="sm"
                variant="primary"
                startIcon={<PlusIcon className="size-5 fill-white" />}
                onClick={() => {
                  resetCategoryForm();
                  openCategoryModal();
                }}
              >
                Qo'shish
              </Button>
            }
          >
            {categoryLoading ? (
              <div className="min-h-[300px] flex justify-center items-center">
                <LoadSpinner />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {category.image && (
                      <div className="h-40 overflow-hidden">
                        <img
                          src={getImageUrl(category.image)}
                          alt={category.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.currentTarget;
                            target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
                        {category.nameUz}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                        {category.name}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge size="sm" color={category.isActive ? 'success' : 'danger'}>
                          {category.isActive ? 'Faol' : 'Nofaol'}
                        </Badge>
                        <div className="flex gap-2">
                          <Button
                            size="mini"
                            variant="outline"
                            onClick={() => handleCategoryEdit(category)}
                          >
                            <PencilIcon className="size-4 fill-black dark:fill-white" />
                          </Button>
                          <Button
                            size="mini"
                            variant="outline"
                            onClick={() => handleDeleteClick('category', category.id)}
                          >
                            <DeleteIcon className="size-4 fill-black dark:fill-white" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ComponentCard>
        )}

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <ComponentCard
            title="Barcha Kurslar"
            action={
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
            }
          >
            {courseLoading ? (
              <div className="min-h-[300px] flex justify-center items-center">
                <LoadSpinner />
              </div>
            ) : (
              <div className="space-y-4">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                  >
                    {/* Course Header */}
                    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-750 flex items-center justify-between">
                      <div
                        className="flex items-center gap-4 flex-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors py-2 px-3 rounded"
                        onClick={() => toggleCourse(course.id)}
                      >
                        <span className="text-lg">
                          {expandedCourses.has(course.id) ? '▼' : '▶'}
                        </span>
                        {course.thumbnail && (
                          <img
                            src={getImageUrl(course.thumbnail)}
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
                            {course.title}
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
                              📚 {course.category?.name}
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
                          <Badge size="sm" color={course.isActive ? 'success' : 'danger'}>
                            {course.isActive ? 'Faol' : 'Nofaol'}
                          </Badge>
                          {course.isFree ? (
                            <Badge size="sm" color="info">Bepul</Badge>
                          ) : (
                            <span className="text-sm font-semibold text-green-600">
                              {course.price.toLocaleString()} so'm
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          size="mini"
                          variant="outline"
                          onClick={() => handleCourseView(course)}
                        >
                          <EyeIcon className="size-4 fill-black dark:fill-white" />
                        </Button>
                        <Button
                          size="mini"
                          variant="outline"
                          onClick={() => setCommentsModalData({ id: course.id, title: course.title })}
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
                          onClick={() => handleSectionAdd(course.id)}
                        >
                          <PlusIcon className="size-4 fill-black dark:fill-white" />
                        </Button>
                        <Button
                          size="mini"
                          variant="outline"
                          onClick={() => handleDeleteClick('course', course.id)}
                        >
                          <DeleteIcon className="size-4 fill-black dark:fill-white" />
                        </Button>
                      </div>
                    </div>

                    {/* Sections & Videos */}
                    {expandedCourses.has(course.id) && (
                      <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300">
                            Bo'limlar va Videolar
                          </h3>
                          <Button
                            size="sm"
                            variant="outline"
                            startIcon={<VideoIcon className="size-4" />}
                            onClick={() => handleVideoAdd(course.id)}
                          >
                            Video Qo'shish
                          </Button>
                        </div>
                        {/* Placeholder for sections and videos */}
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Bo'limlar va videolar tuzilmasi bu yerda ko'rsatiladi
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ComponentCard>
        )}
      </div>

      {/* Category Modal */}
      <Modal isOpen={isCategoryModalOpen} onClose={closeCategoryModal} className="max-w-[600px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              {selectedCategory ? 'Kategoriyani Tahrirlash' : 'Yangi Kategoriya'}
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Kategoriya ma'lumotlarini kiriting
            </p>
          </div>
          <form onSubmit={handleCategorySubmit} className="flex flex-col">
            <div className="custom-scrollbar max-h-[450px] overflow-y-auto px-2 pb-3 space-y-4">
              <div>
                <Label>Nom (EN)</Label>
                <Input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Nom (UZ)</Label>
                <Input
                  type="text"
                  value={categoryForm.nameUz}
                  onChange={(e) => setCategoryForm({ ...categoryForm, nameUz: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Icon URL</Label>
                <Input
                  type="text"
                  value={categoryForm.icon}
                  onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                />
              </div>
              <div>
                <Label>Rasm URL</Label>
                <Input
                  type="text"
                  value={categoryForm.image}
                  onChange={(e) => setCategoryForm({ ...categoryForm, image: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={categoryForm.isActive}
                  onChange={(e) => setCategoryForm({ ...categoryForm, isActive: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label>Faol</Label>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button type="button" size="sm" variant="outline" onClick={closeCategoryModal}>
                Bekor qilish
              </Button>
              <Button type="submit" size="sm" variant="primary" disabled={categoryLoading}>
                {categoryLoading ? 'Saqlanmoqda...' : 'Saqlash'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Course Modal */}
      <Modal isOpen={isCourseModalOpen} onClose={closeCourseModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              {selectedCourse ? 'Kursni Tahrirlash' : 'Yangi Kurs'}
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Kurs ma'lumotlarini kiriting
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
                  required
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
                <Label>O'qituvchi</Label>
                <Select
                  value={courseForm.teacherId.toString()}
                  onChange={(e) => setCourseForm({ ...courseForm, teacherId: parseInt(e.target.value) })}
                  required
                >
                  <option value="">Tanlang...</option>
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
                  required
                >
                  <option value="">Tanlang...</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.nameUz}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Narx (so'm)</Label>
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
              <Button type="submit" size="sm" variant="primary" disabled={courseLoading}>
                {courseLoading ? 'Saqlanmoqda...' : 'Saqlash'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>

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
                  <Badge size="sm" color={viewingCourse.isActive ? 'success' : 'danger'}>
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
                  <p className="text-sm text-gray-500 dark:text-gray-400">Talabalar soni</p>
                  <p className="text-base font-medium text-gray-800 dark:text-white">
                    {viewingCourse.totalStudents} ta
                  </p>
                </div>
                {viewingCourse.createdAt && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Qo'shilgan sana</p>
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
                    src={getImageUrl(viewingCourse.thumbnail)}
                    alt={viewingCourse.title}
                    className="w-full max-w-md h-48 object-cover rounded-lg"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = 'none';
                    }}
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
                  <p className="text-base font-medium text-gray-800 dark:text-white whitespace-pre-wrap">
                    {viewingCourse.description}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Narx</p>
                <p className="text-base font-medium text-gray-800 dark:text-white">
                  {viewingCourse.isFree ? (
                    <span className="text-green-600 font-semibold">Bepul</span>
                  ) : (
                    `${viewingCourse.price.toLocaleString()} so'm`
                  )}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">O'qituvchi</p>
                  <p className="text-base font-medium text-gray-800 dark:text-white">
                    {viewingCourse.teacher?.name}
                  </p>
                </div>
                <div>
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

      {/* Section Modal - Placeholder */}
      <Modal isOpen={isSectionModalOpen} onClose={closeSectionModal} className="max-w-[600px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              {selectedSection ? 'Bo\'limni Tahrirlash' : 'Yangi Bo\'lim'}
            </h4>
          </div>
          <form onSubmit={handleSectionSubmit} className="flex flex-col">
            <div className="custom-scrollbar max-h-[450px] overflow-y-auto px-2 pb-3 space-y-4">
              <div>
                <Label>Bo'lim nomi</Label>
                <Input
                  type="text"
                  value={sectionForm.title}
                  onChange={(e) => setSectionForm({ ...sectionForm, title: e.target.value })}
                  required
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
                  required
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

      {/* Video Modal - Placeholder */}
      <Modal isOpen={isVideoModalOpen} onClose={closeVideoModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              {selectedVideo ? 'Videoni Tahrirlash' : 'Yangi Video'}
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
                  required
                />
              </div>
              <div>
                <Label>Video URL</Label>
                <Input
                  type="text"
                  value={videoForm.url}
                  onChange={(e) => setVideoForm({ ...videoForm, url: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Tartib raqami</Label>
                <Input
                  type="number"
                  value={videoForm.order}
                  onChange={(e) => setVideoForm({ ...videoForm, order: parseInt(e.target.value) })}
                  required
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
        title={`${deleteType === 'category' ? 'Kategoriyani' : deleteType === 'course' ? 'Kursni' : deleteType === 'section' ? 'Bo\'limni' : 'Videoni'} o'chirish`}
        message={`Ushbu ${deleteType === 'category' ? 'kategoriyani' : deleteType === 'course' ? 'kursni' : deleteType === 'section' ? 'bo\'limni' : 'videoni'} o'chirmoqchimisiz?`}
        itemName={deleteId ? `#${deleteId}` : undefined}
      />

      {/* Comments Modal */}
      {commentsModalData && (
        <CourseCommentsModal
          courseId={commentsModalData.id}
          courseTitle={commentsModalData.title}
          isOpen={!!commentsModalData}
          onClose={() => setCommentsModalData(null)}
        />
      )}
    </>
  );
}
