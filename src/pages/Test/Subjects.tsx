import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";

import { BoxIcon, PlusIcon } from "../../icons";
import Button from "../../components/ui/button/Button";
import { useModal } from "../../hooks/useModal";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import { Modal } from "../../components/ui/modal";
import { useCallback, useState } from "react";
import SubjectsTable from "../../components/tables/test/subjectsTable";
import FileInput from "../../components/form/input/FileInput";
import { useFetchWithLoader } from "../../hooks/useFetchWithLoader";
import axiosClient from "../../service/axios.service";
import { LoadSpinner } from "../../components/spinner/load-spinner";
import { toast } from "react-toastify";
export interface Subject {
  id? : number;
  name?: string;
  image?: string;
  imageFile?: File
}
export default function SubjectsPage() {
  const { isOpen, openModal, closeModal } = useModal();
  const handleAdding = () => {
    // Handle save logic here

    console.log("handleAdding...");

    closeModal();
    setSubject(emptySubject);
  };
  let emptySubject: Subject = {
    name: "",
    image: "",
  };
  let [Subject, setSubject] = useState<Subject>(emptySubject);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // console.log("Selected file:", file.name);
      setSubject({
        ...Subject,
        imageFile: file,
      })
    }
  };


  const fetchSubjects = useCallback(() => {
    return axiosClient.get('/subject/all').then(res => res.data);
  }, []);

  const { data, isLoading, error, refetch } = useFetchWithLoader({
    fetcher: fetchSubjects,
  });


  let createSubject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append('name', Subject.name ?? "");
      if (Subject.imageFile) formData.append('image', Subject.imageFile); 

      const res = await axiosClient.post('/subject', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });


      toast.success('Subject muvaffaqiyatli yaratildi');
      await refetch();

    } catch (error) {
      console.error('Create Subject error:', error);
      toast.error('Xatolik yuz berdi');

    } finally {
      closeModal();
    }
  };


  return (
    <>
      <PageMeta
        title="Subjects | Test Dashboard"
        description="Test Dashboard"
      />
      <PageBreadcrumb pageTitle="Fanlar" />

      <div className="space-y-6 ">
        {
          isLoading && <div className="min-h-[450px]  flex-col flex justify-center">
            <LoadSpinner />
          </div>
        }

        {
          data && <ComponentCard
            title="Fanlar jadvali"
            action={
              <>
                <Button
                  size="sm"
                  variant="primary"
                  startIcon={<PlusIcon className="size-5 fill-white" />}
                  onClick={() => {
                    setSubject(emptySubject);
                    openModal();
                  }}
                >
                  Qo'shish
                </Button>
              </>
            }
          >
            <SubjectsTable data={data} refetch={refetch} />
          </ComponentCard>
        }
      </div>
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Fanlarni qo'shish
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Yangi fan qo'shish uchun barcha ma'lumotlarni kiriting.
            </p>
          </div>
          <form className="flex flex-col">
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>Nomi</Label>
                  <Input
                    type="text"
                    value={Subject.name}
                    onChange={(e) =>
                      setSubject({
                        ...Subject,
                        name: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label>Rasm</Label>
                  <FileInput
                    onChange={handleFileChange}
                    className="custom-class"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Yopish
              </Button>
              <Button size="sm" onClick={createSubject}>
                Saqlash
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
