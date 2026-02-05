import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";

import { BoxIcon, CheckCircleIcon, DownloadIcon, PlusIcon } from "../../icons";
import Button from "../../components/ui/button/Button";
import { useModal } from "../../hooks/useModal";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import { Modal } from "../../components/ui/modal";
import { useCallback, useEffect, useState } from "react";
import FileInput from "../../components/form/input/FileInput";
import Select from "../../components/form/Select";
import TestsTable from "../../components/tables/test/testsTable";
import axiosClient from "../../service/axios.service";
import { useFetchWithLoader } from "../../hooks/useFetchWithLoader";
import { LoadSpinner } from "../../components/spinner/load-spinner";
import {
  mapQuestionToDto,
  ParsedResult,
  parseQuestions,
  readDocx,
} from "../../service/parse-docs.service";

import { toast } from "react-toastify";
import ConfirmDeleteModal from "../../components/ui/ConfirmDeleteModal";
export interface Test {
  id?: number;
  name?: string;
  section?: any;
  section_id?: number;
  book?: string;
  book_id?: number;
}

export default function TestsPage() {
  const { isOpen, openModal, closeModal } = useModal();
  const { isOpen: isPreviewOpen, openModal: openPreviewModal, closeModal: closePreviewModal } = useModal();
  const { isOpen: isAddQuestionOpen, openModal: openAddQuestionModal, closeModal: closeAddQuestionModal } = useModal();
  const { isOpen: isDeleteQuestionOpen, openModal: openDeleteQuestionModal, closeModal: closeDeleteQuestionModal } = useModal();
  
  const [deletingQuestionIndex, setDeletingQuestionIndex] = useState<number | null>(null);
  
  const handleAdding = () => {
    // Handle save logic here

    console.log("handleAdding...");

    closeModal();
    setTest(emptyTest);
  };
  let emptyTest: Test = {};
  let [Test, setTest] = useState<Test>(emptyTest);
  const [editingTestId, setEditingTestId] = useState<number | null>(null);

  const [quiz, setQuiz] = useState<ParsedResult | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<number | null>(null);
  const [newQuestion, setNewQuestion] = useState({
    text: '',
    options: [
      { text: '', isCorrect: true },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
    ]
  });

  // Savol matnidan boshidagi raqam + nuqtani olib tashlash
  const cleanQuestionText = (text: string): string => {
    // "2. 70. Savol matni" => "70. Savol matni" yoki "2. Savol matni" => "Savol matni"
    return text.replace(/^\d+\.\s*/, '').trim();
  };

  // Variant matnini tozalash (A), B), 1), 2. kabi belgilarni olib tashlash)
  const cleanOptionText = (text: string): string => {
    // "A) Javob" => "Javob", "1) Javob" => "Javob", "A. Javob" => "Javob"
    return text.replace(/^[A-Da-d0-9]+[.)]\s*/, '').trim();
  };

  // Faqat "-", "- ", "+", "+ ", "–", "– " belgilarini olib tashlash
  const fixPunctuationSpacing = (text: string): string => {
    // "- Text" => "Text", "+ Text" => "Text", "– tahorati" => "tahorati"
    return text
      .replace(/^[-–]\s*/, '')   // boshidagi "- ", "-", "– ", "–" ni olib tashlash
      .replace(/^\+\s*/, '')     // boshidagi "+ ", "+" ni olib tashlash
      .trim();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const text = await readDocx(e.target.files[0]);
      
      console.log('=== RAW TEXT FROM DOCX ===');
      console.log(text);
      console.log('=== TEXT LENGTH ===');
      console.log('Length:', text.length);
      console.log('=== FIRST 500 CHARS ===');
      console.log(text.substring(0, 500));
      
      const parsed = await parseQuestions(text);
      
      console.log('=== PARSED DATA ===');
      console.log('Parsed:', parsed);
      
      // Savol va javob matnlarini tozalash
      const cleanedQuestions = parsed.questions.map(q => ({
        ...q,
        text: fixPunctuationSpacing(cleanQuestionText(q.text)),
        options: q.options.map(opt => ({
          ...opt,
          text: fixPunctuationSpacing(cleanOptionText(opt.text))
        }))
      }));
      
      console.log('=== CLEANED DATA ===');
      console.log('Cleaned Questions:', cleanedQuestions);
      
      // Agar avvalgi testlar bo'lsa, yangilarini qo'shib qo'yamiz
      const existingQuestions = quiz?.questions || [];
      const startNumber = existingQuestions.length;
      
      // Yangi savollarni raqamlashni davom ettirish
      const renumberedQuestions = cleanedQuestions.map((q, index) => ({
        ...q,
        number: startNumber + index + 1
      }));
      
      const allQuestions = [...existingQuestions, ...renumberedQuestions];
      
      setQuiz({ ...parsed, questions: allQuestions });
      
      // Agar title bo'lsa va Test.name bo'sh bo'lsa, uni o'rnatamiz
      if (parsed.title && !Test.name) {
        setTest({
          ...Test,
          name: parsed.title,
        });
      }
      
      console.log(parsed);
      openPreviewModal();
    }
  };

  const handleQuestionEdit = (index: number, field: string, value: string) => {
    if (!quiz) return;
    console.log('handleQuestionEdit called:', { index, field, value });
    const updatedQuestions = quiz.questions.map((q, i) => 
      i === index 
        ? { ...q, [field]: value }
        : q
    );
    console.log('Updated questions:', updatedQuestions);
    setQuiz({ ...quiz, questions: updatedQuestions });
  };

  const handleOptionEdit = (qIndex: number, oIndex: number, value: string) => {
    if (!quiz) return;
    console.log('handleOptionEdit called:', { qIndex, oIndex, value });
    const updatedQuestions = quiz.questions.map((q, i) => 
      i === qIndex 
        ? {
            ...q,
            options: q.options.map((opt, j) => 
              j === oIndex ? { ...opt, text: value } : opt
            )
          }
        : q
    );
    console.log('Updated questions after option edit:', updatedQuestions);
    setQuiz({ ...quiz, questions: updatedQuestions });
  };

  const handleCorrectAnswerChange = (qIndex: number, oIndex: number) => {
    if (!quiz) return;
    console.log('handleCorrectAnswerChange called:', { qIndex, oIndex });
    const updatedQuestions = quiz.questions.map((q, i) => 
      i === qIndex 
        ? {
            ...q,
            options: q.options.map((opt, j) => ({
              ...opt,
              isCorrect: j === oIndex
            }))
          }
        : q
    );
    console.log('Updated question options:', updatedQuestions[qIndex]?.options);
    setQuiz({ ...quiz, questions: updatedQuestions });
  };

  const handleAddQuestion = () => {
    if (!quiz) return;
    
    // Yangi savolni qo'shish
    const questionNumber = quiz.questions.length + 1;
    const questionToAdd = {
      number: questionNumber,
      text: newQuestion.text,
      options: newQuestion.options
    };
    
    const updatedQuestions = [...quiz.questions, questionToAdd];
    setQuiz({ ...quiz, questions: updatedQuestions });
    
    // Yangi qo'shilgan savolni tahrirlash rejimiga o'tkazish
    setEditingQuestion(updatedQuestions.length - 1);
    
    // Formani tozalash
    setNewQuestion({
      text: '',
      options: [
        { text: '', isCorrect: true },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ]
    });
    
    closeAddQuestionModal();
    
    // Agar preview modal ochilmagan bo'lsa, uni ochish
    if (!isPreviewOpen) {
      openPreviewModal();
    }
  };

  const handleAddQuestionAfter = (afterIndex: number) => {
    if (!quiz) return;
    const newQ = {
      number: afterIndex + 2,
      text: '',
      options: [
        { text: '', isCorrect: true },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ]
    };
    
    const updatedQuestions = [...quiz.questions];
    updatedQuestions.splice(afterIndex + 1, 0, newQ);
    
    // Keyingi savollarni qayta raqamlash
    updatedQuestions.forEach((q, idx) => {
      q.number = idx + 1;
    });
    
    setQuiz({ ...quiz, questions: updatedQuestions });
    setEditingQuestion(afterIndex + 1);
  };

  const handleDeleteQuestion = (index: number) => {
    if (!quiz) return;
    setDeletingQuestionIndex(index);
    openDeleteQuestionModal();
  };

  const handleConfirmDeleteQuestion = () => {
    if (!quiz || deletingQuestionIndex === null) return;
    
    const updatedQuestions = [...quiz.questions];
    updatedQuestions.splice(deletingQuestionIndex, 1);
    
    // Qolgan savollarni qayta raqamlash
    updatedQuestions.forEach((q, idx) => {
      q.number = idx + 1;
    });
    
    setQuiz({ ...quiz, questions: updatedQuestions });
    if (editingQuestion === deletingQuestionIndex) {
      setEditingQuestion(null);
    }
    
    closeDeleteQuestionModal();
    setDeletingQuestionIndex(null);
  };

  const handleEditTest = async (testId: number, testItems?: any[]) => {
    try {
      console.log('Loading test items for testId:', testId);
      
      let items = testItems;
      
      // Agar test_items yo'q bo'lsa, backenddan yuklash
      if (!items || items.length === 0) {
        const response = await axiosClient.get(`/test-item/test/${testId}`);
        console.log('Response:', response);
        items = response.data;
      }
      
      console.log('Test items:', items);
      
      // Test ni ham yuklash (book, section, name)
      const testResponse = await axiosClient.get(`/test/${testId}`);
      const testData = testResponse.data;
      setTest({
        id: testId,
        name: testData.name,
        section_id: testData.section_id,
        book_id: testData.section?.book_id,
      });
      
      // Test items ni quiz formatiga o'tkazish
      const questions = (items || []).map((item: any, index: number) => ({
        number: index + 1,
        text: item.question,
        options: [
          { text: item.answer_A, isCorrect: item.answer === 'A' },
          { text: item.answer_B, isCorrect: item.answer === 'B' },
          { text: item.answer_C, isCorrect: item.answer === 'C' },
          { text: item.answer_D || '', isCorrect: item.answer === 'D' },
        ].filter(opt => opt.text) // Bo'sh javoblarni olib tashlash
      }));
      
      console.log('Formatted questions:', questions);
      
      setQuiz({
        title: testData.name || '',
        questions: questions
      });
      setEditingTestId(testId);
      
      // Modal ochish
      console.log('Opening preview modal');
      openPreviewModal();
    } catch (error) {
      console.error('Test yuklashda xatolik:', error);
      toast.error('Test yuklashda xatolik');
    }
  };

  const handleSaveTest = async () => {
    try {
      if (!editingTestId || !quiz?.questions) {
        toast.warn('Ma\'lumotlar to\'liq emas');
        return;
      }

      if (!Test.section_id) {
        toast.warn('Bo\'limni tanlang');
        return;
      }

      console.log('Saving test with questions:', quiz.questions);
      console.log('Question 22 text:', quiz.questions[21]?.text);

      // Test ma'lumotlarini yangilash
      await axiosClient.patch(`/test/${editingTestId}`, {
        name: Test.name,
        section_id: Test.section_id,
      });

      // Test itemlarni update/create/delete qilish (smart update)
      const itemsToSend = quiz.questions.map((q) => {
        const dto = mapQuestionToDto(q, editingTestId);
        console.log('Question DTO:', q.number, dto);
        return dto;
      });

      console.log('Sending items to backend:', itemsToSend);

      await axiosClient.patch(`/test-item/test/${editingTestId}`, {
        items: itemsToSend,
      });

      toast.success('Saqlandi');

      // Ma'lumotlarni yangilash - modal yopilishidan OLDIN
      console.log('Refetching data...');
      const newData = await refetchTest();
      console.log('Data refetched successfully. New data:', newData);
      
      // Faqat refetch tugagandan keyin modal yopish va state tozalash
      closePreviewModal();
      setEditingTestId(null);
      setQuiz(null);
      setTest(emptyTest);
    } catch (error) {
      console.error('Saqlashda xatolik:', error);
      toast.error('Saqlashda xatolik yuz berdi');
    }
  };

  const [all_Book_options, set_all_Book_options] = useState<
    HTMLOptionElement[]
  >([]);

  const fetchTests = useCallback(() => {
    return axiosClient.get("/test/all").then((res) => res.data);
  }, []);

  const {
    data,
    isLoading,
    error,
    refetch: refetchTest,
  } = useFetchWithLoader({
    fetcher: fetchTests,
  });

  useEffect(() => {
    console.log("Data updated:", data);
    setTest(emptyTest);
  }, [data]);

  const fetchBooks = useCallback(() => {
    return axiosClient.get("/book/all").then((res) => res.data);
  }, []);

  const { data: books_data } = useFetchWithLoader({
    fetcher: fetchBooks,
    onSuccess: useCallback((dataBook: any[]) => {
      set_all_Book_options(
        (dataBook as any[]).map((e, index) => {
          return new Option(`${e.name}`, `${e.id}`);
        })
      );
    }, []),
  });

  const fetchSections = useCallback(() => {
    return axiosClient.get("/section/all").then((res) => res.data);
  }, []);
  const [all_Section_options, set_all_Section_options] = useState<
    HTMLOptionElement[]
  >([]);
  const [all_Sections_data, set_all_Sections_data] = useState<any[]>([]);
  const { data: sectionss_data } = useFetchWithLoader({
    fetcher: fetchSections,
    onSuccess: useCallback((datasection: any[]) => {
      set_all_Sections_data(datasection);
      set_all_Section_options(
        (datasection as any[]).map((e, index) => {
          return new Option(`${e.name}`, `${e.id}`);
        })
      );
    }, []),
  });

  // const all_Book_options = [
  //     { value: "Book 1", label: "Book 1" },
  //     { value: "Book 2", label: "Book 2" },
  //     { value: "Book 3", label: "Book 3" },
  // ];

  let createMoreTest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validatsiya
    if (!Test.book_id) {
      toast.warn("Kitobni tanlang");
      return;
    }
    if (!Test.section_id) {
      toast.warn("Bo'limni tanlang");
      return;
    }
    if (!Test.name || Test.name.trim() === "") {
      toast.warn("Sarlavhani kiriting");
      return;
    }
    if (!quiz?.questions || quiz.questions.length === 0) {
      toast.warn("Fayl yuklang");
      return;
    }

    try {
      if (Test.section_id && quiz?.questions) {
        const res = await axiosClient.post("/test-item/more", {
          section_id: Test.section_id,
          items: quiz?.questions.map((q) => mapQuestionToDto(q, 0)),
        });
        
        // Ma'lumotlarni yangilash
        await refetchTest();
        
        toast.success("Saqlandi");
        console.log("Saqlandi");
        setTest(emptyTest);
        setQuiz(null);
      } else {
        toast.warn("Ma'lumotlar to'liq emas");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Saqlashda xatolik aniqlandi ");
    }
    closeModal();
  };
  return (
    <>
      <PageMeta title="Testlar" description="Kurs Platformasi - Testlar" />
      <PageBreadcrumb pageTitle="Testlar" />

      <div className="space-y-6 ">
        {isLoading && (
          <div className="min-h-[450px]  flex-col flex justify-center">
            <LoadSpinner />
          </div>
        )}

        {data && (
          <ComponentCard
            title="Testlar jadvali"
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
                    setTest(emptyTest);
                    setQuiz(null);
                    openModal();
                  }}
                >
                  Qo'shish
                </Button>
              </div>
            }
          >
            <TestsTable
              key={data?.length || 0}
              data={data}
              refetch={refetchTest}
              books={all_Book_options}
              onEdit={handleEditTest}
            />
          </ComponentCard>
        )}
      </div>
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Qo'shish
            </h4>
            {/* <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Create new Test with full details.
            </p> */}
          </div>
          <form className="flex flex-col">
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>Kitob</Label>
                  <Select
                    options={all_Book_options}
                    className="dark:bg-dark-900"
                    defaultValue={Test.book_id ? `${Test.book_id}` : undefined}
                    placeholder="Kitobni tanlang"
                    onChange={(e) => {
                      const bookId = +e;
                      // Kitob tanlanganda bo'limni reset qilish
                      setTest({
                        ...Test,
                        book_id: bookId,
                        section_id: undefined,
                      });
                      // Tanlangan kitobga tegishli bo'limlarni filtrlash
                      const filteredSections = all_Sections_data.filter(
                        (section: any) => section.book_id === bookId
                      );
                      set_all_Section_options(
                        filteredSections.map((e: any) => {
                          return new Option(`${e.name}`, `${e.id}`);
                        })
                      );
                    }}
                  />
                </div>

                <div>
                  <Label>Bo'lim</Label>
                  <Select
                    options={all_Section_options}
                    className="dark:bg-dark-900"
                    defaultValue={
                      Test.section_id ? `${Test.section_id}` : undefined
                    }
                    placeholder="Bo'limni tanlang"
                    onChange={(e) => {
                      setTest({
                        ...Test,
                        section_id: +e,
                      });
                    }}
                  />
                </div>

                <div>
                  <Label>Sarlavha</Label>
                  <Input
                    type="text"
                    value={Test.name || ''}
                    onChange={(e) =>
                      setTest({
                        ...Test,
                        name: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label>Fayl orqali qo'shish</Label>
                  <FileInput
                    onChange={handleFileChange}
                    className="custom-class"
                    accept=".docx" // faqat .docx fayllar ko'rinadi
                  />
                </div>
              </div>

              {quiz && (
                <div className="py-4">
                  <div className="flex flex-row gap-2 items-center mb-2">
                    <CheckCircleIcon className="text-green-600 dark:text-green-400  size-6" />
                    <p className="text-green-600 dark:text-green-400 font-medium">
                      Jami {quiz.questions.length} ta test
                      {quiz.questions.length > 0 && quiz.questions[quiz.questions.length - 1].number > quiz.questions.length && 
                        ` (oxirgi yuklangan: ${quiz.questions[quiz.questions.length - 1].number - quiz.questions.length + 1} ta)`
                      }
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={openPreviewModal}
                      className="mt-2"
                    >
                      Ko'rib chiqish va tahrirlash
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="primary"
                      onClick={openAddQuestionModal}
                      className="mt-2 flex items-center gap-2"
                    >
                      <PlusIcon className="size-5 fill-white" />
                      Savol qo'shish
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Bekor qilish
              </Button>
              <Button size="sm" onClick={createMoreTest}>
                Saqlash
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Preview va Edit Modal */}
      <Modal isOpen={isPreviewOpen} onClose={closePreviewModal} className="max-w-[900px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Testlarni ko'rib chiqish va tahrirlash
            </h4>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              {quiz?.questions.length} ta test yuklandi
            </p>
          </div>

          {/* Kitob, Bo'lim, Sarlavha */}
          {editingTestId && (
            <div className="px-2 mb-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div>
                <Label>Kitob</Label>
                <Select
                  options={all_Book_options}
                  className="dark:bg-dark-900"
                  defaultValue={Test.book_id ? `${Test.book_id}` : undefined}
                  onChange={(e) => {
                    const bookId = +e;
                    setTest({
                      ...Test,
                      book_id: bookId,
                      section_id: undefined,
                    });
                    const filteredSections = all_Sections_data.filter(
                      (section: any) => section.book_id === bookId
                    );
                    set_all_Section_options(
                      filteredSections.map((e: any) => {
                        return new Option(`${e.name}`, `${e.id}`);
                      })
                    );
                  }}
                />
              </div>

              <div>
                <Label>Bo'lim</Label>
                <Select
                  options={all_Section_options}
                  className="dark:bg-dark-900"
                  defaultValue={Test.section_id ? `${Test.section_id}` : undefined}
                  onChange={(e) => {
                    setTest({
                      ...Test,
                      section_id: +e,
                    });
                  }}
                />
              </div>

              <div>
                <Label>Sarlavha</Label>
                <Input
                  type="text"
                  value={Test.name || ''}
                  onChange={(e) =>
                    setTest({
                      ...Test,
                      name: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          )}

          {/* Savol qo'shish tugmasi */}
          <div className="px-2 mb-4">
            <Button
              type="button"
              size="sm"
              variant="primary"
              onClick={openAddQuestionModal}
              className="flex items-center gap-2"
            >
              <PlusIcon className="size-5 fill-white" />
              Savol qo'shish
            </Button>
          </div>
          
          <div className="px-2 overflow-y-auto custom-scrollbar max-h-[500px]">
            {quiz?.questions.slice().reverse().map((q, qIdx) => {
              const originalIndex = quiz.questions.length - 1 - qIdx;
              // Savol matnidan boshidagi raqam va nuqtani olib tashlash
              const cleanText = q.text.replace(/^\d+\.\s*/, '');
              const displayNumber = q.number; // Savolning asl raqamini ko'rsatish
              console.log('Question:', qIdx, 'Original Index:', originalIndex, 'Display Number:', displayNumber, 'Question number:', q.number);
              return (
              <div
                key={q.number}
                className="mb-4 p-4 rounded-xl border border-gray-200 dark:border-white/5 text-gray-800 dark:text-white/90"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    {editingQuestion === originalIndex ? (
                      <input
                        type="text"
                        value={q.text}
                        onChange={(e) => {
                          console.log('Input onChange triggered:', e.target.value);
                          handleQuestionEdit(originalIndex, 'text', e.target.value);
                        }}
                        className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm font-semibold mb-2 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/20 dark:bg-gray-900 dark:border-gray-700 dark:text-white/90 dark:focus:border-brand-800 focus:outline-hidden"
                        placeholder="Savol matni"
                      />
                    ) : (
                      <p className="font-semibold text-lg">
                        {displayNumber}. {cleanText}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-3">
                    <Button
                      type="button"
                      size="sm"
                      variant={editingQuestion === originalIndex ? "primary" : "outline"}
                      onClick={() => setEditingQuestion(editingQuestion === originalIndex ? null : originalIndex)}
                    >
                      {editingQuestion === originalIndex ? 'Tayyor' : 'Tahrirlash'}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteQuestion(originalIndex)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      O'chirish
                    </Button>
                  </div>
                </div>
                <ul className="space-y-2 mt-3">
                  {q.options.map((opt, oIdx) => (
                    <li key={oIdx} className="flex items-center gap-3">
                      {editingQuestion === originalIndex ? (
                        <div className="flex items-center gap-2 w-full">
                          <input
                            type="radio"
                            name={`correct-${originalIndex}`}
                            checked={opt.isCorrect}
                            onChange={() => handleCorrectAnswerChange(originalIndex, oIdx)}
                            className="cursor-pointer w-4 h-4 shrink-0"
                          />
                          <span className="font-bold text-base text-gray-800 dark:text-white min-w-[30px] shrink-0">
                            {String.fromCharCode(65 + oIdx)})
                          </span>
                          <input
                            type="text"
                            value={opt.text || ''}
                            onChange={(e) => {
                              console.log('Option onChange triggered:', e.target.value);
                              handleOptionEdit(originalIndex, oIdx, e.target.value);
                            }}
                            className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/20 dark:bg-gray-900 dark:border-gray-700 dark:text-white/90 dark:focus:border-brand-800 focus:outline-hidden"
                            placeholder={`Variant ${String.fromCharCode(65 + oIdx)}`}
                          />
                        </div>
                      ) : (
                        <div className="flex items-start gap-2 w-full">
                          <span className="font-bold text-base text-gray-800 dark:text-white min-w-[30px] shrink-0">
                            {String.fromCharCode(65 + oIdx)})
                          </span>
                          <span
                            className={`flex-1 ${
                              opt.isCorrect
                                ? "text-green-600 dark:text-green-400 font-semibold"
                                : "text-gray-700 dark:text-white"
                            }`}
                          >
                            {opt.text || ''}
                          </span>
                          {opt.isCorrect && (
                            <CheckCircleIcon className="size-5 fill-green-600 dark:fill-green-400 shrink-0" />
                          )}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              );
            })}
          </div>

          <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
            <Button size="sm" variant="outline" onClick={closePreviewModal}>
              Yopish
            </Button>
            {editingTestId && (
              <Button size="sm" variant="primary" onClick={handleSaveTest}>
                Saqlash
              </Button>
            )}
          </div>
        </div>
      </Modal>

      {/* Savol qo'shish modali */}
      <Modal isOpen={isAddQuestionOpen} onClose={closeAddQuestionModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Yangi savol qo'shish
            </h4>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              Savol va 4 ta javob variantini kiriting
            </p>
          </div>

          <div className="px-2">
            <div className="space-y-4">
              <div>
                <Label>Savol matni</Label>
                <Input
                  type="text"
                  value={newQuestion.text}
                  onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
                  placeholder="Savol matnini kiriting"
                />
              </div>

              {newQuestion.options.map((opt, idx) => (
                <div key={idx}>
                  <Label>Variant {String.fromCharCode(65 + idx)}</Label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="radio"
                      name="correct-new"
                      checked={opt.isCorrect}
                      onChange={() => {
                        const updatedOptions = newQuestion.options.map((o, i) => ({
                          ...o,
                          isCorrect: i === idx
                        }));
                        setNewQuestion({ ...newQuestion, options: updatedOptions });
                      }}
                      className="cursor-pointer w-4 h-4"
                    />
                    <Input
                      type="text"
                      value={opt.text}
                      onChange={(e) => {
                        const updatedOptions = [...newQuestion.options];
                        updatedOptions[idx].text = e.target.value;
                        setNewQuestion({ ...newQuestion, options: updatedOptions });
                      }}
                      placeholder={`Variant ${String.fromCharCode(65 + idx)} matni`}
                      className="flex-1"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
            <Button size="sm" variant="outline" onClick={closeAddQuestionModal}>
              Bekor qilish
            </Button>
            <Button size="sm" variant="primary" onClick={handleAddQuestion}>
              Qo'shish
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Question Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={isDeleteQuestionOpen}
        onClose={closeDeleteQuestionModal}
        onConfirm={handleConfirmDeleteQuestion}
        title="Savolni o'chirish"
        message="Ushbu savolni o'chirmoqchimisiz?"
        itemName={deletingQuestionIndex !== null && quiz?.questions[deletingQuestionIndex] 
          ? `Savol ${quiz.questions[deletingQuestionIndex].number}: ${quiz.questions[deletingQuestionIndex].text.replace(/^\d+\.\s*/, '').substring(0, 50)}...` 
          : undefined}
        isLoading={false}
      />
    </>
  );
}
