import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";

import { BoxIcon, DownloadIcon, PlusIcon, DeleteIcon } from "../../icons";
import Button from "../../components/ui/button/Button";
import { useModal } from "../../hooks/useModal";
import Label from "../../components/form/Label";
import Switch from "../../components/form/switch/Switch";
import Input from "../../components/form/input/InputField";
import { Modal } from "../../components/ui/modal";
import { useCallback, useState } from "react";
import BooksTable from "../../components/tables/test/booksTable";
import FileInput from "../../components/form/input/FileInput";
import Select from "../../components/form/Select";
import MultiSelect from "../../components/form/MultiSelect";
import axiosClient from "../../service/axios.service";
import { useFetchWithLoader } from "../../hooks/useFetchWithLoader";
import { LoadSpinner } from "../../components/spinner/load-spinner";
import { toast } from "react-toastify";
export interface Book {
  id? : number;
  name?: string;
  image?: string;
  // section_id?: number;
  subject_id?: number;
  imageFile?: File;
  subject? :any
  fullBlock?: boolean;
  stepBlock?: boolean;
  sections?: Section[];
}

export interface Section {
  id?: number;
  name: string;
  book_id?: number;
  isNew?: boolean;
}

export default function BooksPage() {
  const { isOpen, openModal, closeModal } = useModal();
  const handleAdding = () => {
    // Handle save logic here

    console.log("handleAdding...");

    closeModal();
    setBook(emptyBook);
  };

  let createBook = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      
      const formData = new FormData();
      formData.append('name', Book.name ?? "");
      formData.append('subject_id', `${Book.subject_id}`);
      if (Book.imageFile) formData.append('image', Book.imageFile); 
  // append flags
  formData.append('fullBlock', Book.fullBlock ? '1' : '0');
  formData.append('stepBlock', Book.stepBlock ? '1' : '0');

      let bookId = editingBookId;

      if (editingBookId) {
        // Edit qilish
        const res = await axiosClient.put(`/book/${editingBookId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        toast.success('Kitob muvaffaqiyatli yangilandi');
      } else {
        // Yangi yaratish
        const res = await axiosClient.post('/book', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        bookId = res.data.id;
        toast.success('Kitob muvaffaqiyatli yaratildi');
      }

      // Bo'limlarni saqlash
      if (bookId && Book.sections && Book.sections.length > 0) {
        for (const section of Book.sections) {
          if (section.isNew && section.name.trim()) {
            await axiosClient.post('/section', {
              name: section.name,
              book_id: String(bookId),
            });
          } else if (section.id && section.name.trim()) {
            await axiosClient.put(`/section/${section.id}`, {
              name: section.name,
              book_id: String(bookId),
            });
          }
        }
      }

      await refetch();

    } catch (error) {
      console.error('Create/Update Book error:', error);
      toast.error('Xatolik yuz berdi');

    } finally {
      closeModal();
      setBook(emptyBook);
      setEditingBookId(null);
    }
  };
  let emptyBook: Book = {
    fullBlock: false,
    stepBlock: false,
    sections: [],
  };
  let [Book, setBook] = useState<Book>(emptyBook);
  const [editingBookId, setEditingBookId] = useState<number | null>(null);

  // Bo'limlarni boshqarish funksiyalari
  const handleAddSection = () => {
    setBook({
      ...Book,
      sections: [...(Book.sections || []), { name: '', isNew: true }]
    });
  };

  const handleSectionChange = (index: number, value: string) => {
    const updatedSections = [...(Book.sections || [])];
    updatedSections[index] = { ...updatedSections[index], name: value };
    setBook({ ...Book, sections: updatedSections });
  };

  const handleDeleteSection = async (index: number) => {
    const section = Book.sections?.[index];
    
    // Agar section database'da bo'lsa, o'chirish API chaqiramiz
    if (section?.id && !section.isNew) {
      try {
        await axiosClient.delete(`/section/${section.id}`);
        toast.success("Bo'lim o'chirildi");
      } catch (error) {
        console.error('Delete section error:', error);
        toast.error("Bo'limni o'chirishda xatolik");
        return;
      }
    }
    
    // Ro'yxatdan o'chirish
    const updatedSections = Book.sections?.filter((_, i) => i !== index) || [];
    setBook({ ...Book, sections: updatedSections });
  };

  const handleEditBook = async (bookId: number) => {
    try {
      // Kitob ma'lumotlarini olish (sections ham qo'shilgan holda)
      const bookRes = await axiosClient.get(`/book/${bookId}`);
      const bookData = bookRes.data;
      
      console.log('📚 Backend dan kelgan bookData:', bookData);
      console.log('🔒 fullBlock:', bookData.fullBlock, 'typeof:', typeof bookData.fullBlock);
      console.log('📝 stepBlock:', bookData.stepBlock, 'typeof:', typeof bookData.stepBlock);
      
      // Backend'dan kelgan sections'ni format qilish
      const sections = (bookData.sections || []).map((s: any) => ({
        id: s.id,
        name: s.name,
        book_id: s.book_id,
        isNew: false
      }));
      
      setBook({
        id: bookData.id,
        name: bookData.name,
        subject_id: bookData.subject_id,
        image: bookData.image,
        fullBlock: bookData.fullBlock ?? false,
        stepBlock: bookData.stepBlock ?? false,
        sections: sections,
      });
      
      console.log('✅ State ga set qilindi:', {
        fullBlock: bookData.fullBlock ?? false,
        stepBlock: bookData.stepBlock ?? false,
      });
      
      setEditingBookId(bookId);
      openModal();
    } catch (error) {
      console.error('Load book error:', error);
      toast.error("Kitobni yuklashda xatolik");
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
     
      setBook({
        ...Book,
        imageFile: file
      })
    }
  };


  const fetchBooks = useCallback(() => {
    return axiosClient.get('/book/all').then(res => res.data);
  }, []);

  const { data, isLoading, error, refetch } = useFetchWithLoader({
    fetcher: fetchBooks,
  });


  const fetchSubjects = useCallback(() => {
    return axiosClient.get('/subject/all').then(res => res.data);
  }, []);

  const { data: dataSubject, isLoading: isLoadingSubject, error: errorSubject, refetch: refecthSubject } = useFetchWithLoader({
    fetcher: fetchSubjects,
    onSuccess: useCallback((dataSubject: any[]) => {
      setall_Subject_options((dataSubject as any[]).map((e, index) => {
        return new Option(`${e.name}`, `${e.id}`)
      }));

    }, [])
  });



  // const [selectedValues, setSelectedValues] = useState<string[]>([]);

  // const multiOptions = [
  //   { value: "Group 1", text: "Group 1", selected: false },
  //   { value: "Group 2", text: "Group 2", selected: false },
  //   { value: "Group 3", text: "Group 3", selected: false },
  // ];

  // const all_Subject_options = [
  //   { value: "Subject 1", label: "Subject 1" },
  //   { value: "Subject 2", label: "Subject 2"},
  //   { value: "Subject 3", label: "Subject 3"},
  // ];

  const [all_Subject_options, setall_Subject_options] = useState<any[]>([]);

  return (
    <>
      <PageMeta title="Kitoblar" description="Kurs Platformasi - Kitoblar" />
      <PageBreadcrumb pageTitle="Kitoblar" />


      {
        isLoading && <div className="min-h-[450px]  flex-col flex justify-center">
          <LoadSpinner />
        </div>
      }
      <div className="space-y-6 ">

        {
          data && <ComponentCard
            title="Kitoblar jadvali"
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
                    setBook(emptyBook);
                    setEditingBookId(null);
                    openModal();
                  }}
                >
                  Qo'shish
                </Button>
              </div>
            }
          >
            <BooksTable data={data} refetch={refetch} subjects={all_Subject_options} onEdit={handleEditBook}/>
          </ComponentCard>
        }
      </div>
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            {editingBookId ? "Kitobni tahrirlash" : "Kitob qo'shish"}
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              {editingBookId ? "Kitob ma'lumotlarini yangilang." : "Yangi kitob qo'shish uchun barcha ma'lumotlarni kiriting."}
            </p>
          </div>
          <form className="flex flex-col">
            <div className="px-2 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                {/* <div>
                  <MultiSelect
                    label="Groups"
                    options={multiOptions}
                    onChange={(values) => setSelectedValues(values)}
                  />
                  <p className="sr-only">
                    Selected Values: {selectedValues.join(", ")}
                  </p>
                </div> */}
                <div>
                  <Label>Fan</Label>
                  <Select
                    options={all_Subject_options}
                    className="dark:bg-dark-900"
                    defaultValue={Book.subject_id ?  `${Book.subject_id}` : undefined}
                    placeholder="Fanni tanlang"
                    onChange={(e) => {
                     
                      
                      setBook({
                        ...Book,
                        subject_id: +e

                      })
                    }}

                  />
                </div>
                <div>
                  <Label>Nomi</Label>
                  <Input
                    type="text"
                    value={Book.name}
                    onChange={(e) =>
                      setBook({
                        ...Book,
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

              {/* Bo'limlar qismi */}
              <div className="mt-6 p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <div className="flex justify-between items-center mb-4">
                  <Label className="text-base font-semibold">Bo'limlar</Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="primary"
                    startIcon={<PlusIcon className="size-4 fill-white" />}
                    onClick={handleAddSection}
                  >
                    Bo'lim qo'shish
                  </Button>
                </div>
                
                <div className="space-y-3 max-h-[200px] overflow-y-auto custom-scrollbar">
                  {Book.sections && Book.sections.length > 0 ? (
                    Book.sections.map((section, index) => (
                      <div key={index} className="flex gap-2 items-center p-2 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-600">
                        <Input
                          type="text"
                          value={section.name}
                          onChange={(e) => handleSectionChange(index, e.target.value)}
                          placeholder={`Bo'lim ${index + 1}`}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteSection(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <DeleteIcon className="size-4" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 px-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Bo'limlar yo'q. Yuqoridagi tugma orqali qo'shing.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Ruhsatlar - placed separately from other properties */}
            <div className="px-2 mt-4">
              <Label>Ruhsatlar</Label>
              <div className="flex flex-col gap-3 mt-2">
                <div className="flex items-center">
                  <Switch
                    label="Testni ishlashga ruhsat berish"
                    checked={!(Book.fullBlock ?? false)}
                    onChange={(v) =>
                      setBook({
                        ...Book,
                        fullBlock: !v,
                      })
                    }
                  />
                </div>
                <div className="flex items-center">
                  <Switch
                    label="Ketma-ket ishlash"
                    checked={Book.stepBlock ?? false}
                    onChange={(v) =>
                      setBook({
                        ...Book,
                        stepBlock: v,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Yopish
              </Button>
              <Button size="sm" onClick={createBook}>
                Saqlash
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
