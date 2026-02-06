import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import TeachersTable from "../../components/tables/people/teachersTable";
import { BoxIcon, PlusIcon, VideoIcon, UserIcon, ChatIcon } from "../../icons";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import { useModal } from "../../hooks/useModal";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import { Modal } from "../../components/ui/modal";
import { useCallback, useState } from "react";
import FileInput from "../../components/form/input/FileInput";
import axiosClient, { getImageUrl } from "../../service/axios.service";
import { useFetchWithLoader } from "../../hooks/useFetchWithLoader";
import { LoadSpinner } from "../../components/spinner/load-spinner";
import { toast } from "react-toastify";
import ConfirmDeleteModal from "../../components/ui/ConfirmDeleteModal";

export interface Teacher {
  id?: number;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  password: string;
  bio?: string;
  image?: string;
  createdAt?: string;
  totalStudents?: number;
  rating?: number;
  totalRatings?: number;
  _count?: {
    courses: number;
    comments: number;
    ratings: number;
  };
  courses?: {
    id: number;
    title: string;
    categoryId: number;
    _count?: {
      enrollments: number;
    };
  }[];
}

export default function TeachersPage() {
  const { isOpen, openModal, closeModal: closeModalBase } = useModal();
  const { isOpen: isViewOpen, openModal: openViewModal, closeModal: closeViewModal } = useModal();
  const { isOpen: isDeleteOpen, openModal: openDeleteModal, closeModal: closeDeleteModal } = useModal();
  const [viewingTeacher, setViewingTeacher] = useState<Teacher | null>(null);
  const [deletingTeacherId, setDeletingTeacherId] = useState<number | null>(null);
  
  const closeModal = () => {
    closeModalBase();
    setTeacher(emptyTeacher);
  };
  
  let emptyTeacher: Teacher = {
    firstName: "",
    lastName: "",
    phone: "",
    password: "",
  };
  
  let [teacher, setTeacher] = useState<Teacher>(emptyTeacher);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        const response = await axiosClient.post('/upload/image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setTeacher({ ...teacher, image: response.data.url });
        toast.success('Rasm yuklandi');
      } catch (error) {
        console.error('Image upload error:', error);
        toast.error('Rasm yuklanmadi');
      }
    }
  };

  const handleViewTeacher = (teacher: Teacher) => {
    setViewingTeacher(teacher);
    openViewModal();
  };

  const handleEditTeacher = (teacher: Teacher) => {
    setTeacher(teacher);
    openModal();
  };

  const handleDeleteClick = (id: number) => {
    setDeletingTeacherId(id);
    openDeleteModal();
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTeacherId) return;
    try {
      await axiosClient.delete(`/teachers/${deletingTeacherId}`);
      toast.success('O\'qituvchi o\'chirildi');
      await refetch();
      closeDeleteModal();
      setDeletingTeacherId(null);
    } catch (error) {
      console.error('Delete Teacher error:', error);
      toast.error('O\'chirishda xatolik');
    }
  };

  const handleSaveTeacher = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      if (teacher.id) {
        // Edit existing teacher
        await axiosClient.put(`/teachers/${teacher.id}`, { ...teacher });
        toast.success('O\'qituvchi muvaffaqiyatli yangilandi');
      } else {
        // Create new teacher
        await axiosClient.post('/teachers', { ...teacher });
        toast.success('O\'qituvchi muvaffaqiyatli yaratildi');
      }
      await refetch();
      closeModal();
    } catch (error) {
      console.error('Create/Update Teacher error:', error);
      toast.error('Xatolik yuz berdi');
    }
  };

  const fetchTeachers = useCallback(() => {
    return axiosClient.get('/teachers').then(res => res.data);
  }, []);

  const { data, isLoading, error, refetch } = useFetchWithLoader({
    fetcher: fetchTeachers,
  });

  return (
    <>
      <PageMeta
        title="O'qituvchilar"
        description="Kurs Platformasi - O'qituvchilar"
      />
      <PageBreadcrumb pageTitle="O'qituvchilar" />
   
      <div className="space-y-6">
        {isLoading && (
          <div className="min-h-[450px] flex-col flex justify-center">
            <LoadSpinner />
          </div>
        )}
       
        {data && (
          <ComponentCard
            title="O'qituvchilar jadvali"
            action={
              <>
                <Button
                  size="sm"
                  variant="primary"
                  startIcon={<PlusIcon className="size-5 fill-white" />}
                  onClick={() => {
                    setTeacher(emptyTeacher);
                    openModal();
                  }}
                >
                  Qo'shish
                </Button>
              </>
            }
          >
            <TeachersTable 
              data={data} 
              refetch={refetch}
              onView={handleViewTeacher} 
              onEdit={handleEditTeacher} 
              onDelete={handleDeleteClick} 
            />
          </ComponentCard>
        )}
      </div>
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              {teacher.id ? "O'qituvchini tahrirlash" : "O'qituvchi qo'shish"}
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              O'qituvchi ma'lumotlarini to'ldiring
            </p>
          </div>
          <form className="flex flex-col" onSubmit={handleSaveTeacher}>
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>Ism</Label>
                  <Input
                    type="text"
                    value={teacher.firstName}
                    onChange={(e) =>
                      setTeacher({
                        ...teacher,
                        firstName: e.target.value,
                      })
                    }
                    placeholder="Ism"
                    required
                  />
                </div>

                <div>
                  <Label>Familiya</Label>
                  <Input
                    type="text"
                    value={teacher.lastName}
                    onChange={(e) =>
                      setTeacher({
                        ...teacher,
                        lastName: e.target.value,
                      })
                    }
                    placeholder="Familiya"
                    required
                  />
                </div>

                <div>
                  <Label>Telefon raqam</Label>
                  <Input
                    type="text"
                    value={teacher.phone}
                    onChange={(e) =>
                      setTeacher({
                        ...teacher,
                        phone: e.target.value,
                      })
                    }
                    placeholder="901234567"
                    required
                  />
                </div>

                <div>
                  <Label>Email (ixtiyoriy)</Label>
                  <Input
                    type="email"
                    value={teacher.email || ''}
                    onChange={(e) =>
                      setTeacher({
                        ...teacher,
                        email: e.target.value,
                      })
                    }
                    placeholder="example@mail.com"
                  />
                </div>

                <div>
                  <Label>Parol</Label>
                  <Input
                    type="text"
                    value={teacher.password}
                    onChange={(e) =>
                      setTeacher({
                        ...teacher,
                        password: e.target.value,
                      })
                    }
                    placeholder="Parol"
                    required
                  />
                </div>

                <div className="lg:col-span-2">
                  <Label>Biografiya (ixtiyoriy)</Label>
                  <Input
                    type="text"
                    value={teacher.bio || ''}
                    onChange={(e) =>
                      setTeacher({
                        ...teacher,
                        bio: e.target.value,
                      })
                    }
                    placeholder="O'qituvchi haqida qisqacha"
                  />
                </div>

                <div className="lg:col-span-2">
                  <Label>Rasm</Label>
                  <FileInput
                    onChange={handleFileChange}
                    className="custom-class"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button type="button" size="sm" variant="outline" onClick={closeModal}>
                Bekor qilish
              </Button>
              <Button type="submit" size="sm" variant="primary">
                Saqlash
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* View Modal */}
      <Modal isOpen={isViewOpen} onClose={closeViewModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-6 bg-white rounded-3xl dark:bg-gray-900">
          <div className="px-2 pr-14">
            <h4 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-white/90">
              O'qituvchi ma'lumotlari
            </h4>
          </div>
          {viewingTeacher && (
            <div className="px-2 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">ID</p>
                  <p className="text-base font-medium text-gray-800 dark:text-white">#{viewingTeacher.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                  <Badge size="sm" color="success">
                    Faol
                  </Badge>
                </div>
                {viewingTeacher.createdAt && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Ro'yxatdan o'tgan</p>
                    <p className="text-base font-medium text-gray-800 dark:text-white">
                      {new Date(viewingTeacher.createdAt).toLocaleDateString('uz-UZ')}
                    </p>
                  </div>
                )}
                {viewingTeacher.rating !== undefined && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Reyting</p>
                    <p className="text-base font-medium text-gray-800 dark:text-white">
                      {viewingTeacher.rating.toFixed(1)} ⭐ ({viewingTeacher.totalRatings || 0} baho)
                    </p>
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">To'liq ismi</p>
                <p className="text-base font-medium text-gray-800 dark:text-white">
                  {viewingTeacher.firstName} {viewingTeacher.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Telefon</p>
                <p className="text-base font-medium text-gray-800 dark:text-white">{viewingTeacher.phone}</p>
              </div>
              {viewingTeacher.email && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                  <p className="text-base font-medium text-gray-800 dark:text-white">{viewingTeacher.email}</p>
                </div>
              )}
              <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Kurslar</p>
                  <div className="flex items-center gap-1.5">
                    <VideoIcon className="size-4 fill-blue-500" />
                    <p className="text-base font-semibold text-gray-800 dark:text-white">
                      {viewingTeacher._count?.courses || 0} ta
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">O'quvchilar</p>
                  <div className="flex items-center gap-1.5">
                    <UserIcon className="size-4 fill-green-500" />
                    <p className="text-base font-semibold text-gray-800 dark:text-white">
                      {viewingTeacher.totalStudents || 0} ta
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Izohlar</p>
                  <div className="flex items-center gap-1.5">
                    <ChatIcon className="size-4 fill-purple-500" />
                    <p className="text-base font-semibold text-gray-800 dark:text-white">
                      {viewingTeacher._count?.comments || 0} ta
                    </p>
                  </div>
                </div>
              </div>
              {viewingTeacher.bio && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Biografiya</p>
                  <p className="text-base text-gray-800 dark:text-white">{viewingTeacher.bio}</p>
                </div>
              )}
              {viewingTeacher.image && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Rasm</p>
                  <img 
                    src={getImageUrl(viewingTeacher.image) || '/images/user/user-17.jpg'} 
                    alt={viewingTeacher.firstName} 
                    className="w-32 h-32 object-cover rounded-lg" 
                  />
                </div>
              )}
              {viewingTeacher.courses && viewingTeacher.courses.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Kurslar ro'yxati</p>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {viewingTeacher.courses.map((course, index) => (
                      <div 
                        key={course.id} 
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="flex items-center justify-center size-8 rounded-full bg-blue-100 dark:bg-blue-900">
                            <span className="text-sm font-semibold text-blue-600 dark:text-blue-300">#{index + 1}</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800 dark:text-white">{course.title}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">ID: {course.id}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <UserIcon className="size-3.5 fill-green-500" />
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                            {course._count?.enrollments || 0} ta
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end gap-3 px-2 mt-6">
            <Button size="sm" variant="outline" onClick={closeViewModal}>
              Yopish
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={isDeleteOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        title="O'qituvchini o'chirish"
        message="Ushbu o'qituvchini o'chirmoqchimisiz?"
        itemName={deletingTeacherId ? `O'qituvchi #${deletingTeacherId}` : undefined}
      />
    </>
  );
}
