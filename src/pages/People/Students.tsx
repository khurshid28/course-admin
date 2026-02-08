import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { BoxIcon, PlusIcon, VideoIcon } from "../../icons";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import { useModal } from "../../hooks/useModal";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import { Modal } from "../../components/ui/modal";
import { useCallback, useState } from "react";
import StudentsTable from "../../components/tables/people/studentsTable";
import Select from "../../components/form/Select";
import FileInput from "../../components/form/input/FileInput";
import axiosClient, { getImageUrl } from "../../service/axios.service";
import { useFetchWithLoader } from "../../hooks/useFetchWithLoader";
import { LoadSpinner } from "../../components/spinner/load-spinner";
import { Options } from "flatpickr/dist/types/options";
import { toast } from "react-toastify";
import ConfirmDeleteModal from "../../components/ui/ConfirmDeleteModal";
import { UserIcon } from "../../icons";

export interface Student {
  id?: number;
  firstName?: string;
  surname?: string;
  phone: string;
  email?: string;
  avatar?: string;
  balance?: number;
  purchased?: boolean;
  createdAt?: string;
  _count?: {
    enrollments: number;
  };
  enrollments?: {
    course: {
      id: number;
      title: string;
      categoryId: number;
    };
  }[];
}
export default function StudentsPage() {
  const { isOpen, openModal, closeModal } = useModal();
  const { isOpen: isViewOpen, openModal: openViewModal, closeModal: closeViewModal } = useModal();
  const { isOpen: isDeleteOpen, openModal: openDeleteModal, closeModal: closeDeleteModal } = useModal();
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [deletingStudentId, setDeletingStudentId] = useState<number | null>(null);
  // const handleAdding = () => {
  //   // Handle save logic here

  //   console.log("handleAdding...");

  //   closeModal();
  //   setStudent(emptyStudent);
  // };
  let emptyStudent: Student = {
    firstName: "",
    surname: "",
    phone: "",
    email: "",
  };


  let [student, setStudent] = useState<Student>(emptyStudent);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        const response = await axiosClient.post('/upload/image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setStudent({ ...student, avatar: response.data.url });
        toast.success('Rasm yuklandi');
      } catch (error) {
        console.error('Image upload error:', error);
        toast.error('Rasm yuklanmadi');
      }
    }
  };

  const handleViewStudent = (student: Student) => {
    setViewingStudent(student);
    openViewModal();
  };

  const handleEditStudent = (student: Student) => {
    setStudent(student);
    openModal();
  };

  const handleDeleteClick = (id: number) => {
    setDeletingStudentId(id);
    openDeleteModal();
  };

  const handleDeleteConfirm = async () => {
    if (!deletingStudentId) return;
    try {
      await axiosClient.delete(`/user/${deletingStudentId}`);
      toast.success('Student o\'chirildi');
      await refetch();
      closeDeleteModal();
      setDeletingStudentId(null);
    } catch (error) {
      console.error('Delete Student error:', error);
      toast.error('O\'chirishda xatolik');
    }
  };

  
  let createStudent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      if (student.id) {
        // Edit existing student
        await axiosClient.put(`/user/${student.id}`, { ...student });
        toast.success('Student muvaffaqiyatli yangilandi');
      } else {
        // Create new student
        await axiosClient.post('/user', { ...student });
        toast.success('Student muvaffaqiyatli yaratildi');
      }
      await refetch();

    } catch (error) {
      console.error('Create/Update Student error:', error);
      toast.error('Xatolik yuz berdi');

    }finally { 
      closeModal();
      setStudent(emptyStudent);
    }
  };


  const fetchStudents = useCallback(() => {
    return axiosClient.get('/user').then(res => res.data);
  }, []);


  const { data, isLoading, error, refetch } = useFetchWithLoader({
    fetcher: fetchStudents,
  });

  return (
    <>
      <PageMeta
        title="Students | Test Dashboard"
        description="Test Dashboard"
      />
      <PageBreadcrumb pageTitle="Studentlar" />

      <div className="space-y-6 ">

        {
          isLoading && <div className="min-h-[450px]  flex-col flex justify-center">
            <LoadSpinner />
          </div>
        }
        {data && <ComponentCard
          title="Studentlar jadvali"
          action={
            <>
              <Button
                size="sm"
                variant="primary"
                startIcon={<PlusIcon className="size-5 fill-white" />}
                onClick={() => {
                  setStudent(emptyStudent)
                  openModal()
                }}
              >
                Qo'shish
              </Button>
            </>
          }
        >
          <StudentsTable 
            data={data} 
            refetch={refetch}
            onView={handleViewStudent} 
            onEdit={handleEditStudent} 
            onDelete={handleDeleteClick} 
          />
        </ComponentCard>}
      </div>
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              {student.id ? "Studentni tahrirlash" : "Student qo'shish"}
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Yangi student qo'shish uchun barcha ma'lumotlarni kiriting.
            </p>
          </div>
          <form className="flex flex-col" onSubmit={createStudent}>
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>Ism</Label>
                  <Input
                    type="text"
                    value={student.firstName || ''}
                    onChange={(e) =>
                      setStudent({
                        ...student,
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
                    value={student.surname || ''}
                    onChange={(e) =>
                      setStudent({
                        ...student,
                        surname: e.target.value,
                      })
                    }
                    placeholder="Familiya"
                    required
                  />
                </div>

                <div>
                  <Label>Telefon raqami</Label>
                  <Input
                    type="text"
                    value={student.phone}
                    onChange={(e) =>
                      setStudent({
                        ...student,
                        phone: e.target.value,
                      })
                    }
                    placeholder="901234567"
                    required
                  />
                </div>

                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={student.email || ''}
                    onChange={(e) =>
                      setStudent({
                        ...student,
                        email: e.target.value,
                      })
                    }
                    placeholder="email@example.com"
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
              Student ma'lumotlari
            </h4>
          </div>
          {viewingStudent && (
            <div className="px-2 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">ID</p>
                  <p className="text-base font-medium text-gray-800 dark:text-white">#{viewingStudent.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Holati</p>
                  <Badge size="sm" color={viewingStudent.purchased ? "success" : "warning"}>
                    {viewingStudent.purchased ? 'Sotib olgan' : 'Sotib olmagan'}
                  </Badge>
                </div>
                {viewingStudent.createdAt && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Ro'yxatdan o'tgan</p>
                    <p className="text-base font-medium text-gray-800 dark:text-white">
                      {new Date(viewingStudent.createdAt).toLocaleDateString('uz-UZ')}
                    </p>
                  </div>
                )}
              </div>
              {viewingStudent.avatar && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Rasm</p>
                  <img 
                    src={getImageUrl(viewingStudent.avatar) || '/images/user/user-17.jpg'} 
                    alt={viewingStudent.firstName} 
                    className="w-24 h-24 object-cover rounded-lg" 
                  />
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">To'liq ismi</p>
                <p className="text-base font-medium text-gray-800 dark:text-white">
                  {viewingStudent.firstName} {viewingStudent.surname}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Telefon</p>
                <p className="text-base font-medium text-gray-800 dark:text-white">{viewingStudent.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                <p className="text-base font-medium text-gray-800 dark:text-white">{viewingStudent.email || '-'}</p>
              </div>
              {viewingStudent.balance !== undefined && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Balans</p>
                  <p className="text-base font-medium text-gray-800 dark:text-white">{viewingStudent.balance} so'm</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Kurslar soni</p>
                <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <VideoIcon className="size-5 fill-blue-500" />
                  <span className="text-lg font-semibold text-gray-800 dark:text-white">
                    {viewingStudent._count?.enrollments || 0} ta kurs
                  </span>
                </div>
              </div>

              {viewingStudent.enrollments && viewingStudent.enrollments.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Kurslar ro'yxati</p>
                  <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                    {viewingStudent.enrollments.map((enrollment, index) => (
                      <div 
                        key={enrollment.course.id} 
                        className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                          <span className="text-sm font-semibold text-white">#{index + 1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                            {enrollment.course.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            ID: {enrollment.course.id}
                          </p>
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
        title="Studentni o'chirish"
        message="Ushbu studentni o'chirmoqchimisiz?"
        itemName={deletingStudentId ? `Student #${deletingStudentId}` : undefined}
      />
    </>
  );
}
