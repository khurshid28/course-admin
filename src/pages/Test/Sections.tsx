import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";

import { BoxIcon, DownloadIcon, PlusIcon } from "../../icons";
import Button from "../../components/ui/button/Button";
import { useModal } from "../../hooks/useModal";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import { Modal } from "../../components/ui/modal";
import { useCallback, useState } from "react";
import FileInput from "../../components/form/input/FileInput";
import Select from "../../components/form/Select";
import MultiSelect from "../../components/form/MultiSelect";
import SectionsTable from "../../components/tables/test/sectionsTable";
import axiosClient from "../../service/axios.service";
import { useFetchWithLoader } from "../../hooks/useFetchWithLoader";
import { LoadSpinner } from "../../components/spinner/load-spinner";
import { toast } from "react-toastify";
export interface Section {
    id?: number;
    name?: string;
    image?: string;
    book_id?: number
}

export default function SectionsPage() {
    const { isOpen, openModal, closeModal } = useModal();
   
    let emptySection: Section = {
       
    };
    let [Section, setSection] = useState<Section>(emptySection);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            console.log("Selected file:", file.name);
        }
    };






    const [all_Book_options, set_all_Book_options] = useState<HTMLOptionElement[]>([]);



    const fetchSections = useCallback(() => {
        return axiosClient.get('/section/all').then(res => res.data);
    }, []);

    const { data, isLoading, error, refetch } = useFetchWithLoader({
        fetcher: fetchSections,
    });


    const fetchBooks = useCallback(() => {
        return axiosClient.get('/book/all').then(res => res.data);
    }, []);

    const { data: books_data } = useFetchWithLoader({
        fetcher: fetchBooks,
        onSuccess: useCallback((dataSubject: any[]) => {
            set_all_Book_options((dataSubject as any[]).map((e, index) => {
                return new Option(`${e.name}`, `${e.id}`)
            }));

        }, []),
    });


    let createSection = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
    
        try {
          
          const formData = new FormData();
          formData.append('name', Section.name ?? "");
          formData.append('book_id', `${Section.book_id}`);
          
    
          const res = await axiosClient.post('/section', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
    
          toast.success('Section muvaffaqiyatli yaratildi');
          await refetch();
    
        } catch (error) {
          console.error('Create Section error:', error);
          toast.error('Xatolik yuz berdi');
    
        } finally {
          closeModal();
        }
      };

    return (
        <>
            <PageMeta title="Test Bo'limlari" description="Kurs Platformasi - Test Bo'limlari" />
            <PageBreadcrumb pageTitle="Bo'limlar" />

            <div className="space-y-6 ">
                {
                    isLoading && <div className="min-h-[450px]  flex-col flex justify-center">
                        <LoadSpinner />
                    </div>
                }

                {
                    data && <ComponentCard
                        title="Bo'limlar jadvali"
                        action={
                            <div className="flex flex-row gap-4">
                                <div>

                                    <Button
                                        size="sm"
                                        variant="outline"
                                        endIcon={<DownloadIcon className="size-5 fill-white" />}
                                    >
                                        Yuklab olish
                                    </Button>
                                </div>
                                <Button
                                    size="sm"
                                    variant="primary"
                                    startIcon={<PlusIcon className="size-5 fill-white" />}
                                    onClick={() => {
                                        setSection(emptySection);
                                        openModal();
                                    }}
                                >
                                   Qo'shish
                                </Button>
                            </div>
                        }
                    >
                        <SectionsTable data={data} refetch={refetch} books={all_Book_options} />
                    </ComponentCard>
                }
            </div>
            <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
                <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
                    <div className="px-2 pr-14">
                        <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                            Qo'shish
                        </h4>
                        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
                            Yangi bo'lim qo'shish uchun barcha ma'lumotlarni kiriting.
                        </p>
                    </div>
                    <form className="flex flex-col">
                        <div className="px-2 overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">

                                <div>
                                    <Label>Kitob</Label>
                                    <Select
                                        options={all_Book_options}
                                        className="dark:bg-dark-900"
                                        placeholder="Kitobni tanlang"
                                        defaultValue={Section.book_id ?  `${Section.book_id}` : undefined}
                                        onChange={(e) => {
                                            setSection({
                                                ...Section,
                                                book_id : +e
                                            })
                                         }}

                                    />
                                </div>
                                <div>
                                    <Label>Nomi</Label>
                                    <Input
                                        type="text"
                                        value={Section.name}
                                        onChange={(e) =>
                                            setSection({
                                                ...Section,
                                                name: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                {/* <div>
                                    <Label>Image</Label>
                                    <FileInput
                                        onChange={handleFileChange}
                                        className="custom-class"
                                    />
                                </div> */}
                            </div>
                        </div>
                        <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                            <Button size="sm" variant="outline" onClick={closeModal}>
                                Yopish
                            </Button>
                            <Button size="sm" onClick={createSection}>
                                Saqlash
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>
        </>
    );
}
