import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";

import { BoxIcon, CheckCircleIcon, DownloadIcon, PlusIcon, PencilIcon, DeleteIcon } from "../../icons";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import { useModal } from "../../hooks/useModal";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import { Modal } from "../../components/ui/modal";
import { useCallback, useState } from "react";
import FileInput from "../../components/form/input/FileInput";
import Select from "../../components/form/Select";
import axiosClient from "../../service/axios.service";
import { useFetchWithLoader } from "../../hooks/useFetchWithLoader";
import { LoadSpinner } from "../../components/spinner/load-spinner";
import {
  mapQuestionToDto,
  ParsedResult,
  parseQuestions,
  readDocx,
  Option as QuestionOption,
  Question as ParsedQuestion,
} from "../../service/parse-docs.service";

import { toast } from "react-toastify";
import ConfirmDeleteModal from "../../components/ui/ConfirmDeleteModal";

export interface Test {
  id?: number;
  title?: string;
  courseId?: number;
  description?: string;
  duration?: number;
  passingScore?: number;
  isActive?: boolean;
  questions?: unknown[];
  _count?: { questions: number };
  course?: { title: string };
}

export default function TestsPage() {
  const { isOpen, openModal, closeModal: closeModalBase } = useModal();
  const { isOpen: isPreviewOpen, openModal: openPreviewModal, closeModal: closePreviewModal } = useModal();
  const { isOpen: isAddQuestionOpen, openModal: openAddQuestionModal, closeModal: closeAddQuestionModal } = useModal();
  const { isOpen: isDeleteQuestionOpen, openModal: openDeleteQuestionModal, closeModal: closeDeleteQuestionModal } = useModal();
  const { isOpen: isDeleteConfirmOpen, openModal: openDeleteConfirmModal, closeModal: closeDeleteConfirmModal } = useModal();
  
  const [deletingQuestionIndex, setDeletingQuestionIndex] = useState<number | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  
  const closeModal = () => {
    closeModalBase();
    setUploadedFileName(null);
    setTestForm(emptyTest);
    setQuiz(null);
    setEditingTestId(null);
  };
  
  const closePreviewModalAndReset = () => {
    closePreviewModal();
    setEditingTestId(null);
    setQuiz(null);
    setTestForm(emptyTest);
    setEditingQuestion(null);
  };
  
  const handleAdding = () => {
    console.log("handleAdding...");
    closeModal();
    setTestForm(emptyTest);
  };
  let emptyTest: Test = {};
  const [testForm, setTestForm] = useState<Test>(emptyTest);
  const [editingTestId, setEditingTestId] = useState<number | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

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
    return text.replace(/^\d+\.\s*/, '').trim();
  };

  // Variant matnini tozalash
  const cleanOptionText = (text: string): string => {
    return text.replace(/^[A-Da-d0-9]+[.)]\s*/, '').trim();
  };

  // Faqat "-", "- ", "+", "+ ", "–", "– " belgilarini olib tashlash
  const fixPunctuationSpacing = (text: string): string => {
    return text
      .replace(/^[-–]\s*/, '')
      .replace(/^\+\s*/, '')
      .trim();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFileName(file.name);
      
      const text = await readDocx(file);
      const parsed = await parseQuestions(text);
      
      // Savol va javob matnlarini tozalash
      const cleanedQuestions = parsed.questions.map(q => ({
        ...q,
        text: fixPunctuationSpacing(cleanQuestionText(q.text)),
        options: q.options.map(opt => ({
          ...opt,
          text: fixPunctuationSpacing(cleanOptionText(opt.text))
        }))
      }));
      
      const existingQuestions = quiz?.questions || [];
      const startNumber = existingQuestions.length;
      
      const renumberedQuestions = cleanedQuestions.map((q, index) => ({
        ...q,
        number: startNumber + index + 1
      }));
      
      const allQuestions = [...existingQuestions, ...renumberedQuestions];
      
      setQuiz({ ...parsed, questions: allQuestions });
      
      if (parsed.title && !testForm.title) {
        setTestForm({
          ...testForm,
          title: parsed.title,
        });
      }
      
      openPreviewModal();
    }
  };

  const handleQuestionEdit = (index: number, field: string, value: string) => {
    if (!quiz) return;
    const updatedQuestions = quiz.questions.map((q, i) => 
      i === index 
        ? { ...q, [field]: value }
        : q
    );
    // Force new object creation for React re-render
    setQuiz({ title: quiz.title, questions: [...updatedQuestions] });
    console.log(`Question ${index + 1} edited, field: ${field}`);
  };

  const handleOptionEdit = (qIndex: number, oIndex: number, value: string) => {
    if (!quiz) return;
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
    setQuiz({ title: quiz.title, questions: [...updatedQuestions] });
    console.log(`Question ${qIndex + 1}, option ${oIndex} edited`);
  };

  const handleCorrectAnswerChange = (qIndex: number, oIndex: number) => {
    if (!quiz) return;
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
    setQuiz({ title: quiz.title, questions: [...updatedQuestions] });
    console.log(`Question ${qIndex + 1} - Set correct answer to option ${oIndex}`);
    console.log('Updated question options:', updatedQuestions[qIndex].options);
  };

  const handleAddQuestion = () => {
    if (!quiz) return;
    
    // Validate question text
    if (!newQuestion.text || newQuestion.text.trim() === '') {
      toast.warn('Savol matnini kiriting');
      return;
    }
    
    // Validate all options have text
    const emptyOption = newQuestion.options.find(opt => !opt.text || opt.text.trim() === '');
    if (emptyOption) {
      toast.warn('Barcha javob variantlarini to\'ldiring');
      return;
    }
    
    // Ensure at least one option is marked as correct
    const hasCorrectAnswer = newQuestion.options.some(opt => opt.isCorrect);
    if (!hasCorrectAnswer) {
      toast.warn('To\'g\'ri javobni belgilang');
      return;
    }
    
    const questionNumber = quiz.questions.length + 1;
    const questionToAdd = {
      number: questionNumber,
      text: newQuestion.text,
      options: newQuestion.options
    };
    
    const updatedQuestions = [...quiz.questions, questionToAdd];
    setQuiz({ title: quiz.title, questions: [...updatedQuestions] });
    
    console.log('After add, questions count:', updatedQuestions.length);
    console.log('New question number:', questionNumber);
    
    setEditingQuestion(updatedQuestions.length - 1);
    
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
    
    if (!isPreviewOpen) {
      openPreviewModal();
    }
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
    
    // Renumber all questions after deletion
    const renumberedQuestions = updatedQuestions.map((q, idx) => ({
      ...q,
      number: idx + 1,
      // Ensure options array is properly copied with isCorrect preserved
      options: q.options.map((opt: QuestionOption) => ({
        text: opt.text,
        isCorrect: opt.isCorrect === true
      }))
    }));
    
    setQuiz({ title: quiz.title, questions: [...renumberedQuestions] });
    
    if (editingQuestion === deletingQuestionIndex) {
      setEditingQuestion(null);
    }
    
    console.log('After delete, questions count:', renumberedQuestions.length);
    console.log('Renumbered questions:', renumberedQuestions.map((q, i) => ({ 
      num: i + 1, 
      correctCount: q.options.filter((o: QuestionOption) => o.isCorrect).length 
    })));
    
    closeDeleteQuestionModal();
    setDeletingQuestionIndex(null);
  };

  const handleEditTest = async (test: Test) => {
    try {
      // Fetch full test details with questions
      const response = await axiosClient.get(`/tests/${test.id}`);
      const fullTest = response.data;
      
      setTestForm({
        id: fullTest.id,
        title: fullTest.title,
        courseId: fullTest.courseId,
        description: fullTest.description,
        duration: fullTest.duration,
        passingScore: fullTest.passingScore,
        isActive: fullTest.isActive,
      });
      
      // Convert questions to quiz format
      const questions = (fullTest.questions || []).map((item: {question: string; options: string; correctAnswer: number}, index: number) => {
        const parsedOptions = JSON.parse(item.options);
        const correctAnswerIndex = Number(item.correctAnswer);
        
        const questionWithOptions = {
          number: index + 1,
          text: item.question,
          options: parsedOptions.map((opt: string, idx: number) => ({
            text: opt,
            isCorrect: idx === correctAnswerIndex
          }))
        };
        
        // Verify each question has exactly one correct answer
        const correctCount = questionWithOptions.options.filter((o: QuestionOption) => o.isCorrect).length;
        if (correctCount !== 1) {
          console.warn(`Question ${index + 1} has ${correctCount} correct answers!`, questionWithOptions);
        }
        
        return questionWithOptions;
      });
      
      console.log('Loaded questions:', questions.length);
      console.log('Correct answers check:', questions.map((q: ParsedQuestion, i: number) => ({
        qNum: i + 1,
        correctCount: q.options.filter((o: QuestionOption) => o.isCorrect).length
      })));
      
      // Force complete state reset
      setQuiz(null);
      setTimeout(() => {
        setQuiz({
          title: fullTest.title || '',
          questions: questions
        });
      }, 0);
      
      setEditingTestId(fullTest.id);
      
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

      const updateData = {
        title: testForm.title,
        description: testForm.description,
        duration: testForm.duration,
        passingScore: testForm.passingScore,
        isActive: testForm.isActive,
        questions: quiz.questions.map((q, idx) => {
          const correctIndex = q.options.findIndex((opt: QuestionOption) => opt.isCorrect);
          const result = {
            question: q.text,
            options: q.options.map((opt: QuestionOption) => opt.text),
            correctAnswer: correctIndex >= 0 ? correctIndex : 0,
            order: idx,
          };
          console.log(`Question ${idx + 1} - Correct Answer Index:`, correctIndex, result);
          return result;
        }),
      };
      
      console.log('Updating test with data:', updateData);

      await axiosClient.put(`/tests/${editingTestId}`, updateData);

      toast.success('Saqlandi');
      await refetchTest();
      
      closePreviewModalAndReset();
    } catch (error) {
      console.error('Saqlashda xatolik:', error);
      toast.error('Saqlashda xatolik yuz berdi');
    }
  };

  const handleDeleteTest = async () => {
    if (!pendingDeleteId) return;
    try {
      await axiosClient.delete(`/tests/${pendingDeleteId}`);
      toast.success('Test o\'chirildi');
      await refetchTest();
      closeDeleteConfirmModal();
      setPendingDeleteId(null);
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? (error as {response?: {data?: {message?: string}}}).response?.data?.message 
        : 'Xatolik yuz berdi';
      toast.error(errorMessage || 'Xatolik yuz berdi');
    }
  };

  const [all_Course_options, set_all_Course_options] = useState<
    HTMLOptionElement[]
  >([]);

  const fetchTests = useCallback(() => {
    return axiosClient.get("/tests").then((res) => res.data);
  }, []);

  const {
    data,
    isLoading,
    error,
    refetch: refetchTest,
  } = useFetchWithLoader({
    fetcher: fetchTests,
  });

  const fetchCourses = useCallback(() => {
    return axiosClient.get("/course?limit=1000&includeInactive=true").then((res) => {
      // Backend returns { courses: [...], totalPages, total }
      return res.data.courses || res.data;
    });
  }, []);
  
  const { data: courses_data } = useFetchWithLoader({
    fetcher: fetchCourses,
    onSuccess: useCallback((dataCourse: Array<{id: number; title: string}>) => {
      set_all_Course_options(
        dataCourse.map((e) => {
          return new Option(`${e.title}`, `${e.id}`);
        })
      );
    }, []),
  });

  const createMoreTest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!testForm.courseId) {
      toast.warn("Kursni tanlang");
      return;
    }
    if (!testForm.title || testForm.title.trim() === "") {
      toast.warn("Sarlavhani kiriting");
      return;
    }
    if (!quiz?.questions || quiz.questions.length === 0) {
      toast.warn("Fayl yuklang");
      return;
    }

    try {
      const testData = {
        courseId: testForm.courseId,
        title: testForm.title,
        description: testForm.description || "",
        duration: testForm.duration || 30,
        passingScore: testForm.passingScore || 70,
        questions: quiz.questions.map((q, idx) => {
          const correctIndex = q.options.findIndex((opt: QuestionOption) => opt.isCorrect);
          const result = {
            question: q.text,
            options: q.options.map((opt: QuestionOption) => opt.text),
            correctAnswer: correctIndex >= 0 ? correctIndex : 0,
            order: idx,
          };
          console.log(`Question ${idx + 1} - Correct Answer Index:`, correctIndex, result);
          return result;
        }),
      };
      
      console.log('Creating test with data:', testData);
      
      const res = await axiosClient.post("/tests", testData);
      
      await refetchTest();
      
      toast.success("Saqlandi");
      setTestForm(emptyTest);
      setQuiz(null);
      closeModal();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Saqlashda xatolik aniqlandi ");
    }
  };

  return (
    <>
      <PageMeta title="Testlar" description="Kurs Platformasi - Testlar" />
      <PageBreadcrumb pageTitle="Testlar" />

      <div className="space-y-6">
        {isLoading && (
          <div className="min-h-[450px] flex-col flex justify-center">
            <LoadSpinner />
          </div>
        )}

        {data && (
          <ComponentCard
            title="Testlar"
            action={
              <div className="flex flex-row gap-4">
                <Button
                  size="sm"
                  variant="primary"
                  startIcon={<PlusIcon className="size-5 fill-white" />}
                  onClick={() => {
                    setTestForm(emptyTest);
                    setQuiz(null);
                    openModal();
                  }}
                >
                  Qo'shish
                </Button>
              </div>
            }
          >
            {/* Grid Layout for Tests */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {data.map((test: Test) => (
                <div
                  key={test.id}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
                >
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                        {test.title}
                      </h3>
                      <div className="flex gap-2 flex-wrap">
                        <Badge size="sm" color="info">
                          {test.course?.title || 'Kurs mavjud emas'}
                        </Badge>
                        <Badge size="sm" color={test.isActive ? "success" : "error"}>
                          {test.isActive ? 'Faol' : 'Faol emas'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => handleEditTest(test)}
                      className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors group"
                      title="Tahrirlash"
                    >
                      <PencilIcon className="size-5 fill-gray-600 dark:fill-gray-400 group-hover:fill-blue-600 dark:group-hover:fill-blue-400 transition-colors" />
                    </button>
                    <button
                      onClick={() => {
                        if (test.id) {
                          setPendingDeleteId(test.id);
                          openDeleteConfirmModal();
                        }
                      }}
                      className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors group"
                      title="O'chirish"
                    >
                      <DeleteIcon className="size-5 fill-gray-600 dark:fill-gray-400 group-hover:fill-red-600 dark:group-hover:fill-red-400 transition-colors" />
                    </button>
                  </div>

                  {/* Info */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <svg className="size-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      <span>Vaqt: {test.duration} daqiqa</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <svg className="size-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                      </svg>
                      <span>Savollar: {test._count?.questions || 0} ta</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <CheckCircleIcon className="size-5" />
                      <span>O'tish: {test.passingScore}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ComponentCard>
        )}
      </div>

      {/* Qo'shish Modal */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Qo'shish
            </h4>
          </div>
          <form className="flex flex-col" onSubmit={createMoreTest}>
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>Kurs</Label>
                  <Select
                    options={all_Course_options}
                    className="dark:bg-dark-900"
                    defaultValue={testForm.courseId ? `${testForm.courseId}` : undefined}
                    placeholder="Kursni tanlang"
                    onChange={(e) => {
                      setTestForm({
                        ...testForm,
                        courseId: +e,
                      });
                    }}
                  />
                </div>

                <div>
                  <Label>Sarlavha</Label>
                  <Input
                    type="text"
                    value={testForm.title || ''}
                    onChange={(e) =>
                      setTestForm({
                        ...testForm,
                        title: e.target.value,
                      })
                    }
                    placeholder="Test sarlavhasi"
                  />
                </div>

                <div>
                  <Label>Davomiyligi (daqiqa)</Label>
                  <Input
                    type="number"
                    value={testForm.duration || 30}
                    onChange={(e) =>
                      setTestForm({
                        ...testForm,
                        duration: +e.target.value,
                      })
                    }
                    placeholder="30"
                  />
                </div>

                <div>
                  <Label>O'tish foizi (%)</Label>
                  <Input
                    type="number"
                    value={testForm.passingScore || 70}
                    onChange={(e) =>
                      setTestForm({
                        ...testForm,
                        passingScore: +e.target.value,
                      })
                    }
                    placeholder="70"
                    min="0"
                    max="100"
                  />
                </div>

                <div className="lg:col-span-2">
                  <Label>Tavsif (ixtiyoriy)</Label>
                  <Input
                    type="text"
                    value={testForm.description || ''}
                    onChange={(e) =>
                      setTestForm({
                        ...testForm,
                        description: e.target.value,
                      })
                    }
                    placeholder="Test haqida qisqacha"
                  />
                </div>

                <div className="lg:col-span-2">
                  <div className="flex justify-between items-center mb-2">
                    <Label>Fayl orqali qo'shish (Word .docx)</Label>
                    <div className="flex gap-3">
                      <a 
                        href="/8. Manqul, huquqlar, fuzuliy.docx" 
                        download="namuna-test.docx"
                        className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300 underline flex items-center gap-1"
                      >
                        <DownloadIcon className="size-4 fill-current" />
                        Namuna yuklab olish
                      </a>
                      <a 
                        href="/example-test-format.txt" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 underline flex items-center gap-1"
                      >
                        📄 Format ko'rish
                      </a>
                    </div>
                  </div>
                  <FileInput
                    onChange={handleFileChange}
                    className="custom-class"
                    accept=".docx"
                  />
                  {uploadedFileName && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                      <CheckCircleIcon className="size-4" />
                      <span>Yuklandi: {uploadedFileName}</span>
                    </div>
                  )}
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Savollar raqamli (1. 2. 3...), javoblar harfli (a) b) c) d)), to'g'ri javob oldiga + yoki * qo'ying
                  </p>
                </div>
              </div>

              {quiz && (
                <div className="py-4">
                  <div className="flex flex-row gap-2 items-center mb-2">
                    <CheckCircleIcon className="text-green-600 dark:text-green-400 size-6" />
                    <p className="text-green-600 dark:text-green-400 font-medium">
                      Jami {quiz.questions.length} ta test
                    </p>
                  </div>
                  <div className="flex gap-2">
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

      {/* Preview va Edit Modal */}
      <Modal isOpen={isPreviewOpen} onClose={closePreviewModalAndReset} className="max-w-[900px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              {editingTestId ? 'Testni tahrirlash' : 'Testlarni ko\'rib chiqish'}
            </h4>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              {quiz?.questions.length} ta test
            </p>
          </div>

          {editingTestId && (
            <div className="px-2 mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div>
                <Label>Sarlavha</Label>
                <Input
                  type="text"
                  value={testForm.title || ''}
                  onChange={(e) => setTestForm({ ...testForm, title: e.target.value })}
                  placeholder="Test sarlavhasi"
                />
              </div>

              <div>
                <Label>Kurs</Label>
                <Select
                  options={all_Course_options}
                  className="dark:bg-dark-900"
                  defaultValue={testForm.courseId ? `${testForm.courseId}` : undefined}
                  onChange={(e) => setTestForm({ ...testForm, courseId: +e })}
                />
              </div>

              <div>
                <Label>Davomiyligi (daqiqa)</Label>
                <Input
                  type="number"
                  value={testForm.duration || 30}
                  onChange={(e) => setTestForm({ ...testForm, duration: +e.target.value })}
                  placeholder="30"
                />
              </div>

              <div>
                <Label>O'tish foizi (%)</Label>
                <Input
                  type="number"
                  value={testForm.passingScore || 70}
                  onChange={(e) => setTestForm({ ...testForm, passingScore: +e.target.value })}
                  placeholder="70"
                  min="0"
                  max="100"
                />
              </div>

              <div className="lg:col-span-2">
                <Label>Tavsif (ixtiyoriy)</Label>
                <Input
                  type="text"
                  value={testForm.description || ''}
                  onChange={(e) => setTestForm({ ...testForm, description: e.target.value })}
                  placeholder="Test haqida qisqacha"
                />
              </div>
            </div>
          )}

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
            {quiz?.questions.map((q, originalIndex) => {
              const cleanText = q.text.replace(/^\d+\.\s*/, '');
              const displayNumber = originalIndex + 1;
              
              // Debug: har bir savol uchun to'g'ri javobni topish
              const correctOption = q.options?.find((opt: QuestionOption) => opt.isCorrect === true);
              if (!correctOption) {
                console.warn(`Question ${displayNumber} has no correct answer!`, q);
              }
              
              return (
                <div
                  key={`question-${displayNumber}-${cleanText.substring(0, 15).replace(/\s/g, '_')}`}
                  className="mb-4 p-4 rounded-xl border border-gray-200 dark:border-white/5 text-gray-800 dark:text-white/90"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      {editingQuestion === originalIndex ? (
                        <input
                          type="text"
                          value={q.text}
                          onChange={(e) => {
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
                    {q.options.map((opt, oIdx) => {
                      const isCorrect = opt.isCorrect === true;
                      console.log(`Q${displayNumber} Option ${oIdx}:`, opt.text.substring(0, 20), 'isCorrect:', isCorrect);
                      return (
                        <li key={`opt-${originalIndex}-${oIdx}`} className="flex items-center gap-3">
                          {editingQuestion === originalIndex ? (
                            <div className="flex items-center gap-2 w-full">
                              <input
                                type="radio"
                                name={`correct-${originalIndex}`}
                                checked={isCorrect}
                                onChange={() => handleCorrectAnswerChange(originalIndex, oIdx)}
                                className="cursor-pointer w-5 h-5 shrink-0 accent-green-600 dark:accent-green-500"
                              />
                              <span className="font-bold text-base text-gray-800 dark:text-white min-w-[30px] shrink-0">
                                {String.fromCharCode(65 + oIdx)})
                              </span>
                              <input
                                type="text"
                                value={opt.text || ''}
                                onChange={(e) => {
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
                                  isCorrect
                                    ? "text-green-600 dark:text-green-400 font-semibold"
                                    : "text-gray-700 dark:text-white"
                                }`}
                              >
                                {opt.text || ''}
                              </span>
                              {isCorrect && (
                                <CheckCircleIcon className="size-5 fill-green-600 dark:fill-green-400 shrink-0" />
                              )}
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
            <Button size="sm" variant="outline" onClick={closePreviewModalAndReset}>
              {editingTestId ? 'Bekor qilish' : 'Yopish'}
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
                      className="cursor-pointer w-5 h-5 accent-green-600 dark:accent-green-500"
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

      {/* Delete Test Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={isDeleteConfirmOpen}
        onClose={closeDeleteConfirmModal}
        onConfirm={handleDeleteTest}
        title="Testni o'chirish"
        message="Ushbu testni o'chirmoqchimisiz? Barcha savol va javoblar ham o'chiriladi."
        isLoading={false}
      />
    </>
  );
}
