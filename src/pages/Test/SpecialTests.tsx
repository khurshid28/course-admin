



import * as FileSaver from "file-saver";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";

import { PlusIcon } from "../../icons";
import Button from "../../components/ui/button/Button";
import { useModal } from "../../hooks/useModal";
import Label from "../../components/form/Label";
import Switch from "../../components/form/switch/Switch";
import Input from "../../components/form/input/InputField";
import DateTimePicker from "../../components/form/date-time-picker";
import { Modal } from "../../components/ui/modal";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axiosClient from "../../service/axios.service";
import specialTestService, { SpecialTest as APISpecialTest, GeneratedTest, TestItem } from "../../service/special-test.service";
import Badge from "../../components/ui/badge/Badge";
import Moment from "moment";
import { EditIcon, DeleteIcon, TimeIcon, UserCircleIcon } from "../../icons";
import { FiEye, FiDownload } from "react-icons/fi";
import { Document, Packer, Paragraph, HeadingLevel } from "docx";

interface Group {
  id: number;
  name: string;
  createdt: string;
}

interface Subject {
  id: number;
  name: string;
  image: string | null;
  createdt: string;
}

interface Book {
  id: number;
  name: string;
  image: string | null;
  subject_id: number;
  createdt: string;
}

interface Section {
  id: number;
  name: string;
  image: string | null;
  book_id: number;
  createdt: string;
}

interface Test {
  id: number;
  name: string;
  section_id: number;
  createdt: string;
}

// Mock data - faqat Groups va SpecialTests uchun (backend tayyor emas)
const mockGroups = [
  { id: 1, name: "1-guruh", createdt: new Date().toISOString() },
  { id: 2, name: "2-guruh", createdt: new Date().toISOString() },
  { id: 3, name: "3-guruh", createdt: new Date().toISOString() },
  { id: 4, name: "Kechki guruh", createdt: new Date().toISOString() },
];

export default function SpecialTestsPage() {
  // Barcha testlarni ko‘rish modalida random tanlangan testlar va random kalitlar uchun state
  const [previewTestItems, setPreviewTestItems] = useState<TestItem[]>([]);
  const [previewAnswerKeys, setPreviewAnswerKeys] = useState<{[key: number]: string}>({});
  // Modal ochiq/berkitilganligini boshqarish uchun state
  const [isAllItemsModalOpen, setIsAllItemsModalOpen] = useState(false);
  // Barcha test-itemlarni saqlash uchun state
  const [allTestItems, setAllTestItems] = useState<TestItem[]>([]);
  const [data, setData] = useState<APISpecialTest[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [groups, setGroups] = useState<Group[]>(mockGroups);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [tests, setTests] = useState<Test[]>([]);

  const { isOpen, openModal, closeModal } = useModal();
  const { isOpen: isConfirmOpen, openModal: openConfirmModal, closeModal: closeConfirmModal } = useModal();
  const { isOpen: isViewOpen, openModal: openViewModal, closeModal: closeViewModal } = useModal();
  const { isOpen: isDeleteConfirmOpen, openModal: openDeleteConfirmModal, closeModal: closeDeleteConfirmModal } = useModal();

  const [editingTest, setEditingTest] = useState<APISpecialTest | null>(null);
  const [pendingTest, setPendingTest] = useState<APISpecialTest | null>(null);
  const [viewingTest, setViewingTest] = useState<APISpecialTest | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [activationStartDate, setActivationStartDate] = useState("");
  const [activationStartTime, setActivationStartTime] = useState("");
  const [activationEndDate, setActivationEndDate] = useState("");
  const [activationEndTime, setActivationEndTime] = useState("");
  const [dateTimeError, setDateTimeError] = useState(""); // Date/time validation error
  const [timePerQuestion, setTimePerQuestion] = useState<number>(0);
  const [totalTime, setTotalTime] = useState<number>(60); // 60 minutes
  const [forceNextQuestion, setForceNextQuestion] = useState<boolean>(false);
  const [selectedGroups, setSelectedGroups] = useState<number[]>([]);
  
  // Test config - Fan majburiy, Kitob va Bo'limlar ixtiyoriy
  const [selectedSubject, setSelectedSubject] = useState<number>(0);
  const [selectedBookIds, setSelectedBookIds] = useState<number[]>([]); // Ko'p tanlanadi
  const [selectedSectionIds, setSelectedSectionIds] = useState<number[]>([]);
  const [questionCount, setQuestionCount] = useState<number>(10);

  // Savollarni qayta tuzish tanlovi
  const [regenerateQuestions, setRegenerateQuestions] = useState<boolean>(true);

  // Modal filtered items
  const [modalFilteredItems, setModalFilteredItems] = useState<TestItem[]>([]);

  // Editable answer keys for confirmation modal
  const [editableAnswerKeys, setEditableAnswerKeys] = useState<{[key: number]: string}>({});

  // Edit mode for preview modal
  const [isPreviewEditMode, setIsPreviewEditMode] = useState(false);
  const [editableQuestions, setEditableQuestions] = useState<{[key: number]: TestItem}>({});

  // Filter modal items when selections change
  useEffect(() => {
    console.log('🔍 Filtering modal items:', {
      selectedSubject,
      selectedBookIds,
      selectedSectionIds,
      allTestItemsCount: allTestItems.length,
      testsCount: tests.length,
      sectionsCount: sections.length,
      booksCount: books.length
    });

    if (selectedSubject === 0) {
      console.log('🚫 No subject selected, clearing filtered items');
      setModalFilteredItems([]);
      return;
    }

    const filtered = allTestItems.filter(item => {
      if (!item.test_id) return false;
      const test = tests.find(t => t.id === item.test_id);
      if (!test) return false;
      const section = sections.find(s => s.id === test.section_id);
      if (!section) return false;

      if (selectedSectionIds.length > 0) {
        return selectedSectionIds.includes(section.id);
      }
      if (selectedBookIds.length > 0) {
        return selectedBookIds.includes(section.book_id);
      }
      return books.find(b => b.id === section.book_id && b.subject_id === selectedSubject);
    });

    console.log('✅ Filtered items:', filtered.length);

    // If no items found, try fallback
    let finalFiltered = filtered;
    if (filtered.length === 0) {
      console.log('⚠️ No items found with modal filtering, trying fallback...');
      finalFiltered = allTestItems.filter(item => {
        if (!item.test_id) return false;
        const test = tests.find(t => t.id === item.test_id);
        if (!test) return false;
        const section = sections.find(s => s.id === test.section_id);
        if (!section || !section.book_id) return false;

        const book = books.find(b => b.id === section.book_id);
        return book && book.subject_id === selectedSubject;
      });
      console.log('✅ Fallback filtered items:', finalFiltered.length);
    }

    setModalFilteredItems(finalFiltered);
  }, [selectedSubject, selectedBookIds, selectedSectionIds, allTestItems, tests, sections, books]);

  // API dan guruhlarni yuklash
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setIsLoading(true);
        const response = await axiosClient.get('/group/all');
        setGroups(response.data || []);
      } catch (error) {
        console.error('Guruhlarni yuklashda xatolik:', error);
        toast.error('Guruhlarni yuklashda xatolik');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroups();
  }, []);

  // API dan fanlar, kitoblar va bo'limlarni yuklash
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subjectsRes, booksRes, sectionsRes, testsRes] = await Promise.all([
          axiosClient.get('/subject/all'),
          axiosClient.get('/book/all'),
          axiosClient.get('/section/all'),
          axiosClient.get('/test/all'),
        ]);

        console.log('📚 Subjects:', subjectsRes.data);
        console.log('📖 Books:', booksRes.data);
        console.log('📑 Sections:', sectionsRes.data);
        console.log('📝 Tests:', testsRes.data);

        setSubjects(subjectsRes.data || []);
        setBooks(booksRes.data || []);
        setSections(sectionsRes.data || []);
        setTests(testsRes.data || []);
      } catch (error) {
        console.error('Ma\'lumotlarni yuklashda xatolik:', error);
        toast.error('Ma\'lumotlarni yuklashda xatolik');
      }
    };

    fetchData();
  }, []);

  // Test itemlarni yuklash (barcha testlar uchun)
  useEffect(() => {
    const fetchTestItems = async () => {
      try {
        console.log('🔄 Test itemlarni yuklash boshlandi...');
        const response = await axiosClient.get('/test-item/all');
        console.log('❓ Test Items response:', response);
        console.log('❓ Test Items data:', response.data);
        console.log('❓ Test Items length:', response.data?.length || 0);
        setAllTestItems(response.data || []);
        console.log('✅ Test items set to state');
      } catch (error) {
        console.error('❌ Test itemlarni yuklashda xatolik:', error);
        // Fallback to empty array
        setAllTestItems([]);
      }
    };

    fetchTestItems();
  }, []);

  // Special testlarni API dan yuklash
  useEffect(() => {
    const fetchSpecialTests = async () => {
      try {
        setIsLoading(true);
        const specialTests = await specialTestService.getAll();

        // Convert questions to generatedTest format for tests that have questions
        const processedTests = specialTests.map(test => {
          let processedTest = test;

          // Ensure status exists, default to "pending" if missing
          if (!processedTest.status) {
            processedTest = { ...processedTest, status: "pending" };
          }

          // Extract group_ids from specialTestGroups if not already present
          if (!processedTest.group_ids && processedTest.specialTestGroups) {
            processedTest = {
              ...processedTest,
              group_ids: processedTest.specialTestGroups.map(stg => stg.groupId)
            };
          }

          if (processedTest.questions && processedTest.questions.length > 0 && !processedTest.generatedTest) {
            // Convert questions array to generatedTest format
            const generatedTest: GeneratedTest = {
              id: `generated-${processedTest.id}`,
              specialTestId: processedTest.id!,
              items: processedTest.questions,
              createdAt: new Date().toISOString(),
              answerKey: processedTest.questions.reduce((acc, question) => {
                acc[question.number] = question.answer;
                return acc;
              }, {} as { [key: number]: string })
            };
            processedTest = { ...processedTest, generatedTest };
          }
          return processedTest;
        });

        setData(processedTests);
      } catch (error) {
        console.error('Special testlarni yuklashda xatolik:', error);
        toast.error('Special testlarni yuklashda xatolik');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSpecialTests();
  }, []);

  const handleOpenModal = () => {
    setEditingTest(null);
    setName("");
    // Ruhsat etilgan vaqt - bugungi sana bilan default
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    setActivationStartDate(todayStr);
    setActivationStartTime("00:00"); // Default 00:00
    setActivationEndDate(todayStr);
    setActivationEndTime("23:59"); // Default 23:59
    setDateTimeError(""); // Clear error
    setTimePerQuestion(0);
    setTotalTime(60); // 60 minutes
    setForceNextQuestion(false);
    setSelectedGroups([]);
    setSelectedSubject(subjects.length > 0 ? subjects[0].id : 0);
    setSelectedBookIds([]);
    setSelectedSectionIds([]);
    setQuestionCount(10);
    setRegenerateQuestions(true); // Yangi test uchun har doim qayta tuzish
    openModal();
  };

  const handleEditTest = (test: APISpecialTest) => {
    setEditingTest(test);
    setName(test.name);
    setDateTimeError(""); // Clear error
    // Split datetime into separate date and time for inputs
    // Backend UTC da saqlaydi, admin uchun UTC+5 ga o'tkazamiz
    if (test.activation_start) {
      console.log('📥 Backend UTC:', test.activation_start);
      
      // Moment bilan UTC dan UTC+5 ga to'g'ri konversiya
      const uzbekTime = Moment.utc(test.activation_start).add(5, 'hours');
      
      const dateStr = uzbekTime.format('YYYY-MM-DD');
      const timeStr = uzbekTime.format('HH:mm');
      
      console.log('📤 Display (UTC+5):', dateStr, timeStr);
      
      setActivationStartDate(dateStr);
      setActivationStartTime(timeStr);
    } else {
      setActivationStartDate("");
      setActivationStartTime("00:00"); // Default 00:00
    }
    if (test.activation_end) {
      console.log('📥 Backend UTC:', test.activation_end);
      
      // Moment bilan UTC dan UTC+5 ga to'g'ri konversiya
      const uzbekTime = Moment.utc(test.activation_end).add(5, 'hours');
      
      const dateStr = uzbekTime.format('YYYY-MM-DD');
      const timeStr = uzbekTime.format('HH:mm');
      
      console.log('📤 Display (UTC+5):', dateStr, timeStr);
      
      setActivationEndDate(dateStr);
      setActivationEndTime(timeStr);
    } else {
      setActivationEndDate("");
      setActivationEndTime("23:59"); // Default 23:59
    }
    setTimePerQuestion(test.time_per_question || 0);
    setTotalTime(test.time_per_question ? 0 : Math.floor((test.total_time || 0) / 60)); // Convert seconds to minutes
    setForceNextQuestion(test.force_next_question || false);
    setSelectedGroups(test.group_ids || []);
    setSelectedSubject(test.subject_id);
    setSelectedBookIds(test.book_ids || []);
    setSelectedSectionIds(test.section_ids || []);
    setQuestionCount(test.question_count);
    setRegenerateQuestions(false); // Edit uchun default qayta tuzmaslik
    openModal();
  };

  const createOrUpdateTest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('🔵 Form submit bosildi');

    // Validation
    if (!name.trim()) {
      toast.error('Test nomi majburiy');
      return;
    }

    if (selectedGroups.length === 0) {
      toast.error('Kamida bitta guruh tanlash majburiy');
      return;
    }

    if (selectedSubject === 0) {
      toast.error('Fan tanlash majburiy');
      return;
    }

    // Validate date/time range
    if (activationStartDate.trim() && activationEndDate.trim()) {
      const startDateTime = `${activationStartDate}T${activationStartTime.trim() || '00:00'}`;
      const endDateTime = `${activationEndDate}T${activationEndTime.trim() || '23:59'}`;
      
      if (endDateTime <= startDateTime) {
        setDateTimeError("Vaqt oralig'i noto'g'ri. Tugash sanasi va vaqti boshlanishdan keyin bo'lishi kerak.");
        return;
      }
    }
    
    // Clear any previous error
    setDateTimeError("");

    // Vaqt maydonlari endi ixtiyoriy - validation olib tashlandi
    // if (timePerQuestion === 0 && totalTime === 0) {
    //   toast.error('Har bir savol uchun vaqt yoki to\'liq test uchun vaqtni kiriting');
    //   return;
    // }

    // Ruhsat etilgan vaqt to'liq ixtiyoriy - hech qanday validation yo'q

    try {
      // Combine date and time into datetime strings - completely optional
      // Admin UTC+5 (O'zbekiston vaqti) da kiritadi
      // Default times: start=00:00, end=23:59
      const activationStartTimeCombined = activationStartDate.trim()
        ? (() => {
            const time = activationStartTime.trim() || '00:00';
            const [year, month, day] = activationStartDate.split('-').map(Number);
            const [hours, minutes] = time.split(':').map(Number);
            
            console.log('🔵 Input (UTC+5):', `${year}-${month}-${day} ${hours}:${minutes}`);
            
            // UTC+5 vaqtni UTC ga o'tkazish: 5 soat ayirish
            // Agar hours < 5 bo'lsa, oldingi kunga o'tadi
            let utcHours = hours - 5;
            let utcDay = day;
            let utcMonth = month;
            let utcYear = year;
            
            if (utcHours < 0) {
              utcHours += 24;
              utcDay -= 1;
              
              if (utcDay < 1) {
                utcMonth -= 1;
                if (utcMonth < 1) {
                  utcMonth = 12;
                  utcYear -= 1;
                }
                // Get last day of previous month
                const lastDay = new Date(utcYear, utcMonth, 0).getDate();
                utcDay = lastDay;
              }
            }
            
            const utcDate = new Date(Date.UTC(utcYear, utcMonth - 1, utcDay, utcHours, minutes, 0));
            const utcString = utcDate.toISOString();
            
            console.log('🔵 UTC String:', utcString);
            return utcString;
          })()
        : undefined;
      const activationEndTimeCombined = activationEndDate.trim()
        ? (() => {
            const time = activationEndTime.trim() || '23:59';
            const [year, month, day] = activationEndDate.split('-').map(Number);
            const [hours, minutes] = time.split(':').map(Number);
            
            console.log('🟢 Input (UTC+5):', `${year}-${month}-${day} ${hours}:${minutes}`);
            
            // UTC+5 vaqtni UTC ga o'tkazish: 5 soat ayirish
            let utcHours = hours - 5;
            let utcDay = day;
            let utcMonth = month;
            let utcYear = year;
            
            if (utcHours < 0) {
              utcHours += 24;
              utcDay -= 1;
              
              if (utcDay < 1) {
                utcMonth -= 1;
                if (utcMonth < 1) {
                  utcMonth = 12;
                  utcYear -= 1;
                }
                const lastDay = new Date(utcYear, utcMonth, 0).getDate();
                utcDay = lastDay;
              }
            }
            
            const utcDate = new Date(Date.UTC(utcYear, utcMonth - 1, utcDay, utcHours, minutes, 59));
            const utcString = utcDate.toISOString();
            
            console.log('🟢 UTC String:', utcString);
            return utcString;
          })()
        : undefined;
      
      console.log('📦 Activation Start Combined:', activationStartTimeCombined);
      console.log('📦 Activation End Combined:', activationEndTimeCombined);
      
      const testData: Omit<APISpecialTest, 'id'> = {
        name,
        subject_id: selectedSubject,
        book_ids: selectedBookIds.length > 0 ? selectedBookIds : undefined,
        section_ids: selectedSectionIds.length > 0 ? selectedSectionIds : undefined,
        group_ids: selectedGroups,
        activation_start: activationStartTimeCombined,
        activation_end: activationEndTimeCombined,
        question_count: questionCount,
        questions: [], // Will be populated after generation or kept empty for editing
        status: editingTest?.status || "pending",
        ...(timePerQuestion > 0 && { time_per_question: timePerQuestion }),
        ...(totalTime > 0 && timePerQuestion === 0 && { total_time: totalTime * 60 }), // Convert minutes to seconds
        ...(timePerQuestion > 0 && { force_next_question: forceNextQuestion }),
      };

      console.log('🟢 Test data:', testData);

      let testWithGenerated = testData as APISpecialTest;
      let generatedTest: GeneratedTest | undefined;

      if (editingTest?.id) {
        if (regenerateQuestions) {
          // Editing existing test - regenerate questions
          try {
            console.log('🎯 Regenerating questions for existing test...');
            const tempTest = { ...testData, id: editingTest.id } as APISpecialTest;
            generatedTest = generateRandomTest(tempTest);
            console.log('✅ Questions regenerated with', generatedTest.items.length, 'questions');

            // Include regenerated questions in the test data for backend
            const questionsForBackend = generatedTest.items.map(item => ({
              id: item.id,
              number: item.number,
              question: item.question,
              answer_A: item.answer_A,
              answer_B: item.answer_B,
              ...(item.answer_C && { answer_C: item.answer_C }),
              ...(item.answer_D && { answer_D: item.answer_D }),
              answer: item.answer
            }));

            testWithGenerated = { ...testData, questions: questionsForBackend };
          } catch (regenerationError) {
            console.warn('⚠️ Question regeneration failed, keeping existing questions:', regenerationError);
            // Keep existing questions and don't send questions to backend
            testWithGenerated = { ...testData, questions: undefined };
            // Keep the existing generatedTest
            generatedTest = editingTest.generatedTest;
            toast.info('Savollar qayta tuzilmadi, mavjud savollar saqlanildi');
          }
        } else {
          // Don't regenerate questions - keep existing ones
          console.log('📋 Keeping existing questions, no regeneration');
          testWithGenerated = { ...testData, questions: undefined };
          generatedTest = editingTest.generatedTest;
        }
      } else {
        // Creating new test - always generate questions
        console.log('🎯 Generating test on frontend...');
        const tempTest = { ...testData, id: Date.now() } as APISpecialTest;
        generatedTest = generateRandomTest(tempTest);
        console.log('✅ Test generated with', generatedTest.items.length, 'questions');

        // Include generated questions in the test data for backend
        const questionsForBackend = generatedTest.items.map(item => ({
          id: item.id,
          number: item.number,
          question: item.question,
          answer_A: item.answer_A,
          answer_B: item.answer_B,
          ...(item.answer_C && { answer_C: item.answer_C }),
          ...(item.answer_D && { answer_D: item.answer_D }),
          answer: item.answer
        }));

        testWithGenerated = { ...testData, questions: questionsForBackend };
      }

      const finalTest = generatedTest ? { ...testWithGenerated, generatedTest } : testWithGenerated;
      setPendingTest(finalTest as APISpecialTest);
      
      closeModal();
      openConfirmModal();
      console.log('🟡 Tasdiqlash modali ochildi');
    } catch (error) {
      console.error('Test yaratishda xatolik:', error);
      toast.error('Xatolik yuz berdi');
    }
  };

  const generateRandomTest = (specialTest: APISpecialTest): GeneratedTest => {
    console.log('🎯 Generating test for:', specialTest);
    console.log('📊 Available data:', {
      allTestItemsCount: allTestItems.length,
      testsCount: tests.length,
      sectionsCount: sections.length,
      booksCount: books.length
    });

    // Filter available items based on test config
    const availableItems = allTestItems.filter(item => {
      console.log('🔍 Checking item:', item.id, 'test_id:', item.test_id);

      if (!item.test_id) {
        console.log('❌ No test_id for item', item.id);
        return false;
      }

      const test = tests.find(t => t.id === item.test_id);
      if (!test) {
        console.log('❌ Test not found for item', item.id, 'test_id:', item.test_id);
        return false;
      }

      const section = sections.find(s => s.id === test.section_id);
      if (!section) {
        console.log('❌ Section not found for test', test.id, 'section_id:', test.section_id);
        return false;
      }

      console.log('✅ Item', item.id, 'belongs to section', section.id, 'book', section.book_id);

      // Check subject - if section has a book, check if that book's subject matches
      if (section.book_id) {
        const book = books.find(b => b.id === section.book_id);
        if (book) {
          if (book.subject_id !== specialTest.subject_id) {
            console.log('❌ Subject mismatch for item', item.id, 'book subject:', book.subject_id, 'test subject:', specialTest.subject_id);
            return false;
          }
        } else {
          console.log('⚠️ Book not found for section', section.id, 'book_id:', section.book_id);
          // If book not found, skip this item
          return false;
        }
      } else {
        console.log('⚠️ Section', section.id, 'has no book_id');
        // If section has no book, we can't determine subject, so skip
        return false;
      }

      // If specific books are selected, check it
      if (specialTest.book_ids && specialTest.book_ids.length > 0) {
        if (!specialTest.book_ids.includes(section.book_id)) {
          console.log('❌ Book filter mismatch for item', item.id, 'section book:', section.book_id, 'test book_ids:', specialTest.book_ids);
          return false;
        }
      }

      // If specific sections are selected, check if test section is included
      if (specialTest.section_ids && specialTest.section_ids.length > 0) {
        if (!specialTest.section_ids.includes(test.section_id)) {
          console.log('❌ Section filter mismatch for item', item.id, 'test section:', test.section_id, 'test section_ids:', specialTest.section_ids);
          return false;
        }
      }

      console.log('✅ Item', item.id, 'passed all filters');
      return true;
    });

    console.log('📋 Available items found:', availableItems.length);

    // If no items found with strict filtering, try fallback: any items from the subject
    let finalItems = availableItems;
    if (availableItems.length === 0) {
      console.log('⚠️ No items found with strict filtering, trying fallback...');
      finalItems = allTestItems.filter(item => {
        if (!item.test_id) return false;
        const test = tests.find(t => t.id === item.test_id);
        if (!test) return false;
        const section = sections.find(s => s.id === test.section_id);
        if (!section || !section.book_id) return false;

        const book = books.find(b => b.id === section.book_id);
        return book && book.subject_id === specialTest.subject_id;
      });
      console.log('📋 Fallback items found:', finalItems.length);
    }

    // Random tanlash
    const shuffled = [...finalItems].sort(() => Math.random() - 0.5);
    const selectedItems = shuffled.slice(0, Math.min(specialTest.question_count, shuffled.length));

    console.log('✅ Selected items:', selectedItems.length);

    // Javoblar kalitini tuzish va javob variantlarini random almashtirish
    const answerKey: { [key: number]: string } = {};
    const processedItems = selectedItems.map((item, index) => {
      // Javob variantlarini array ga aylantirish
      const options = [
        { key: 'A', text: item.answer_A || "" },
        { key: 'B', text: item.answer_B || "" },
        { key: 'C', text: item.answer_C || "" },
        { key: 'D', text: item.answer_D || "" }
      ].filter(opt => opt.text.trim() !== ""); // Bo'sh variantlarni olib tashlash

      // Variantlarni random tartibda aralashtirish
      const shuffledOptions = [...options].sort(() => Math.random() - 0.5);

      // To'g'ri javobni topish
      const originalCorrectKey = item.answer || "A";
      const correctOption = options.find(opt => opt.key === originalCorrectKey);
      
      // Yangi to'g'ri javob pozitsiyasini aniqlash
      const newCorrectIndex = shuffledOptions.findIndex(opt => opt.text === correctOption?.text);
      const newCorrectKey = ['A', 'B', 'C', 'D'][newCorrectIndex];

      // Answer key ni saqlash
      answerKey[index + 1] = newCorrectKey;

      return {
        ...item,
        number: index + 1,
        question: item.question || "",
        answer_A: shuffledOptions[0]?.text || "",
        answer_B: shuffledOptions[1]?.text || "",
        answer_C: shuffledOptions[2]?.text || "",
        answer_D: shuffledOptions[3]?.text || "",
        answer: newCorrectKey
      };
    });

    return {
      id: `gen_${Date.now()}`,
      specialTestId: specialTest.id!,
      items: processedItems,
      createdAt: new Date().toISOString(),
      answerKey,
    };
  };

  const confirmAndSaveTest = async () => {
    if (!pendingTest) return;

    console.log('💾 Testni backendga saqlash boshlandi...');

    try {
      setIsLoading(true);
      
      // Update the generated test with modified answer keys from preview modal
      let updatedPendingTest = { ...pendingTest };
      if (pendingTest.generatedTest) {
        // Use previewAnswerKeys if available (user edited in preview modal), otherwise use original
        const finalAnswerKeys = Object.keys(previewAnswerKeys).length > 0 
          ? previewAnswerKeys 
          : pendingTest.generatedTest.answerKey;
        updatedPendingTest = {
          ...pendingTest,
          generatedTest: {
            ...pendingTest.generatedTest,
            answerKey: finalAnswerKeys
          }
        };
      }
      
      let savedTest: APISpecialTest;

      if (editingTest?.id) {
        // Update existing test
        const updateData = { ...updatedPendingTest };
        delete updateData.generatedTest; // Don't send generatedTest in update
        savedTest = await specialTestService.update(editingTest.id, updateData);
        // Keep the existing generatedTest or use the new one
        savedTest = { ...savedTest, generatedTest: updatedPendingTest.generatedTest };

        // Process the updated test data the same way as fetchSpecialTests
        let processedTest = { ...editingTest, ...savedTest }; // Preserve original data and merge with API response
        // Ensure status allows editing (keep as active/pending)
        if (processedTest.status === "completed") {
          processedTest = { ...processedTest, status: "active" }; // Allow further editing
        }
        if (!processedTest.status || !["active", "pending"].includes(processedTest.status)) {
          processedTest = { ...processedTest, status: "pending" };
        }
        // Extract group_ids from specialTestGroups if not already present
        if (!processedTest.group_ids && processedTest.specialTestGroups) {
          processedTest = {
            ...processedTest,
            group_ids: processedTest.specialTestGroups.map(stg => stg.groupId)
          };
        }

        setData(data.map(test => test.id === editingTest.id ? processedTest : test));
        toast.success('Test yangilandi');
      } else {
        // Create new test
        const createData = { ...updatedPendingTest };
        delete createData.generatedTest; // Don't send generatedTest in create
        savedTest = await specialTestService.create(createData);
        // Add the generated test back
        savedTest = { ...savedTest, generatedTest: updatedPendingTest.generatedTest };
        setData([...data, savedTest]);
        toast.success('Test muvaffaqiyatli yaratildi va saqlandi');
      }

      setPendingTest(null);
      setEditableAnswerKeys({});
      closeConfirmModal();
    } catch (error) {
      console.error('Test saqlashda xatolik:', error);
      toast.error('Test saqlashda xatolik yuz berdi');
    } finally {
      setIsLoading(false);
    }
  };

      {/* Test ko'rish modali */}
  const handleViewTest = async (test: APISpecialTest) => {
    try {
      if (!test.generatedTest) {
        // Try to fetch generated test from API
        const generatedTest = await specialTestService.getGeneratedTest(test.id!);
        const updatedTest = { ...test, generatedTest };
        setData(data.map(t => t.id === test.id ? updatedTest : t));
        setViewingTest(updatedTest);
      } else {
        setViewingTest(test);
      }
      openViewModal();
    } catch (error) {
      console.error('Generated testni yuklashda xatolik:', error);
      toast.error('Test hali tuzilmagan');
    }
  };

  // PDF export qilish
  const exportToPDF = (test: APISpecialTest) => {
    if (!test.generatedTest) {
      toast.error('Test hali tuzilmagan');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${test.name}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { text-align: center; }
          .question { margin: 20px 0; page-break-inside: avoid; }
          .question-number { font-weight: bold; }
          .options { margin-left: 20px; }
          .answer-key { margin-top: 40px; page-break-before: always; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <h1>${test.name}</h1>
        <p><strong>Davomiyligi:</strong> ${formatDuration(test)}</p>
        <p><strong>Savollar soni:</strong> ${test.generatedTest.items.length} ta</p>
        <hr>
        
        ${test.generatedTest.items.map((item, index) => `
          <div class="question">
            <p class="question-number">${index + 1}. ${item.question}</p>
            <div class="options">
              <p>A) ${item.answer_A}</p>
              <p>B) ${item.answer_B}</p>
              <p>C) ${item.answer_C}</p>
              <p>D) ${item.answer_D}</p>
            </div>
          </div>
        `).join('')}
        
        <div class="answer-key">
          <h2>Javoblar kaliti</h2>
          <p>${Object.entries(test.generatedTest.answerKey).map(([num, ans]) => 
            `${num}-${ans.toUpperCase()}`
          ).join(', ')}</p>
        </div>
        
        <div class="no-print" style="text-align: center; margin-top: 20px;">
          <button onclick="window.print()" style="padding: 10px 20px; font-size: 16px;">
            Chop etish
          </button>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // DOCX export qilish uchun handler
  const handleDownloadDOCX = async (test: APISpecialTest) => {
    try {
      let testToExport = test;
      if (!test.generatedTest) {
        // Try to fetch generated test from API
        const generatedTest = await specialTestService.getGeneratedTest(test.id!);
        testToExport = { ...test, generatedTest };
        // Update the test in state
        setData(data.map(t => t.id === test.id ? testToExport : t));
      }
      exportToDOCX(testToExport);
    } catch (error) {
      console.error('Generated testni yuklashda xatolik:', error);
      toast.error('Test hali tuzilmagan');
    }
  };

  // DOCX export qilish
  const exportToDOCX = (test: APISpecialTest) => {
    if (!test.generatedTest) {
      toast.error('Test hali tuzilmagan');
      return;
    }

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              text: test.name,
              heading: HeadingLevel.HEADING_1,
              alignment: "center"
            }),
            new Paragraph({ text: `Davomiyligi: ${formatDuration(test)}` }),
            new Paragraph({ text: `Savollar soni: ${test.generatedTest.items.length} ta` }),
            new Paragraph({ text: "" }),
            ...test.generatedTest.items.map((item, idx) => [
              new Paragraph({
                text: `${idx + 1}. ${item.question}`,
                spacing: { after: 100 }
              }),
              new Paragraph({ text: `A) ${item.answer_A}` }),
              new Paragraph({ text: `B) ${item.answer_B}` }),
              new Paragraph({ text: `C) ${item.answer_C}` }),
              new Paragraph({ text: `D) ${item.answer_D}` }),
              new Paragraph({ text: "" })
            ]).flat(),
            new Paragraph({ text: "Javoblar kaliti", heading: HeadingLevel.HEADING_2 }),
            new Paragraph({
              text: Object.entries(test.generatedTest.answerKey)
                .map(([num, ans]) => `${num}-${ans.toUpperCase()}`)
                .join(", ")
            })
          ]
        }
      ]
    });

    Packer.toBlob(doc).then(blob => {
      FileSaver.saveAs(blob, `${test.name}.docx`);
    });
  };

  const deleteSpecialTest = async (id: number) => {
    try {
      await specialTestService.delete(id);
      setData(data.filter(test => test.id !== id));
      toast.success("Maxsus test o'chirildi");
    } catch (error) {
      console.error('Test o\'chirishda xatolik:', error);
      toast.error("Test o'chirishda xatolik yuz berdi");
    }
  };

  const getTestStatus = (test: APISpecialTest) => {
    const now = new Date();
    
    if (test.activation_end) {
      const endTime = new Date(test.activation_end);
      if (now > endTime) {
        return { status: "expired", label: "O'tib ketdi", color: "info" as const };
      }
    }
    
    if (test.activation_start) {
      const startTime = new Date(test.activation_start);
      if (now >= startTime) {
        return { status: "active", label: "Faol", color: "success" as const };
      }
    }
    
    return { status: "pending", label: "Kutilmoqda", color: "warning" as const };
  };

  const formatDuration = (test: APISpecialTest) => {
    if (test.total_time && test.total_time > 0) {
      if (test.total_time >= 60) {
        const minutes = Math.floor(test.total_time / 60);
        const seconds = test.total_time % 60;
        return seconds > 0 ? `${minutes} daqiqa ${seconds} soniya` : `${minutes} daqiqa`;
      } else {
        return `${test.total_time} soniya`;
      }
    } else if (test.time_per_question && test.time_per_question > 0) {
      return `${test.time_per_question} soniya/savol`;
    }
    return 'Noma\'lum';
  };

  const getGroupNames = (groupIds: number[]) => {
    if (!groupIds || groupIds.length === 0) return "0 guruh";
    if (!groups.length) return `${groupIds.length} guruh`;
    
    const groupNames = groupIds
      .map(id => groups.find(g => g.id === id)?.name)
      .filter(Boolean)
      .join(", ");
    
    return groupNames || `${groupIds.length} guruh`;
  };

  // Test config ma'lumotlarini olish
  const getTestConfigDisplay = (test: APISpecialTest) => {
    const subject = subjects.find(s => s.id === test.subject_id);
    let display = subject ? `Fan: ${subject.name}` : 'Fan';
    
    if (test.book_ids && test.book_ids.length > 0) {
      const bookNames = test.book_ids
        .map(id => books.find(b => b.id === id)?.name)
        .filter(name => name)
        .join(', ');
      if (bookNames) display += ` → Kitob: ${bookNames}`;
    }
    
    if (test.section_ids && test.section_ids.length > 0) {
      const sectionNames = test.section_ids
        .map(id => sections.find(s => s.id === id)?.name)
        .filter(name => name)
        .join(', ');
      if (sectionNames) display += ` → Bo'lim: ${sectionNames}`;
    }
    
    return display;
  };

  const generatePreviewForPendingTest = () => {
    if (!pendingTest) return;

    // If test is already generated, show the generated questions
    if (pendingTest.generatedTest) {
      setPreviewTestItems(pendingTest.generatedTest.items);
      setPreviewAnswerKeys(pendingTest.generatedTest.answerKey);
      // Initialize editable questions with current items
      const editable: {[key: number]: TestItem} = {};
      pendingTest.generatedTest.items.forEach(item => {
        editable[item.number] = { ...item };
      });
      setEditableQuestions(editable);
      return;
    }

    // Filter based on pendingTest configuration
    let filtered = allTestItems.filter(item => {
      if (!item.test_id) return false;
      const test = tests.find(t => t.id === item.test_id);
      if (!test) return false;
      const section = sections.find(s => s.id === test.section_id);
      if (!section) return false;

      // Check subject
      if (section.book_id) {
        const book = books.find(b => b.id === section.book_id);
        if (book && book.subject_id !== pendingTest.subject_id) return false;
      }

      // Check books if specified
      if (pendingTest.book_ids && pendingTest.book_ids.length > 0 && !pendingTest.book_ids.includes(section.book_id)) return false;

      // Check section if specified
      if (pendingTest.section_ids && pendingTest.section_ids.length > 0) {
        if (!pendingTest.section_ids.includes(test.section_id)) return false;
      }

      return true;
    });

    console.log('👀 Preview filtered items:', filtered.length);

    // Show up to 10 questions as preview
    const previewCount = Math.min(10, filtered.length);
    filtered = filtered.slice().sort(() => Math.random() - 0.5).slice(0, previewCount);

    const keys: {[key: number]: string} = {};
    const editable: {[key: number]: TestItem} = {};
    filtered.forEach((item, index) => {
      const variants = ["A", "B", "C", "D"];
      keys[item.id] = variants[Math.floor(Math.random() * 4)];
      editable[index + 1] = { ...item, number: index + 1 };
    });

    setPreviewTestItems(filtered);
    setPreviewAnswerKeys(keys);
    setEditableQuestions(editable);
  };

  return (
    <>
      <PageMeta
        title="Maxsus Testlar"
        description="Kurs Platformasi - Maxsus Testlar"
      />
      <PageBreadcrumb pageTitle="Maxsus Testlar" />

      <div className="space-y-6">
        {isLoading && (
          <div className="min-h-[450px] flex-col flex justify-center">
            <div className="text-center">Loading...</div>
          </div>
        )}

        {data && (
          <ComponentCard
            title="Maxsus testlar"
            action={
              <>
                <Button
                  size="sm"
                  variant="primary"
                  startIcon={<PlusIcon className="size-5 fill-white" />}
                  onClick={handleOpenModal}
                >
                  Qo'shish
                </Button>
              </>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {data.map((test) => (
                <div
                  key={test.id}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
                >
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                        {test.name}
                      </h3>
                      <div className="mt-2">
                        <Badge
                          size="sm"
                          color={getTestStatus(test).color}
                        >
                          {getTestStatus(test).label}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {/* Edit - har doim ko'rinadi */}
                      <Button
                        size="mini"
                        variant="outline"
                        onClick={() => handleEditTest(test)}
                      >
                        <EditIcon className="w-4 h-4 fill-black dark:fill-white" />
                      </Button>
                      {/* Ko'rish - test tuzilgan bo'lsa yoki API dan yuklab olish */}
                      <Button
                        size="mini"
                        variant="outline"
                        onClick={() => handleViewTest(test)}
                        aria-label="Ko'rish"
                      >
                        <FiEye className="w-5 h-5 text-black dark:text-white" />
                      </Button>
                      {/* DOCX Download - har doim ko'rsatish */}
                      <Button
                        size="mini"
                        variant="outline"
                        onClick={() => handleDownloadDOCX(test)}
                        aria-label="DOCX yuklab olish"
                      >
                        <FiDownload className="w-5 h-5 text-black dark:text-white" />
                      </Button>
                      {/* O'chirish */}
                      <Button
                        size="mini"
                        variant="outline"
                        onClick={() => {
                          setPendingDeleteId(test.id!);
                          openDeleteConfirmModal();
                        }}
                      >
                        <DeleteIcon className="w-4 h-4 fill-black dark:fill-white" />
                      </Button>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="space-y-3">
                    {/* Ruhsat etilgan vaqt */}
                    <div className="flex items-start gap-2">
                      <TimeIcon className="w-5 h-5 text-gray-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Ruhsat etilgan vaqt</p>
                        <p className="text-sm text-gray-800 dark:text-white">
                          {test.activation_start && Moment(test.activation_start).isValid()
                            ? Moment.utc(test.activation_start).add(5, 'hours').format("DD MMM, HH:mm")
                            : "Noma'lum"} -{" "}
                          {test.activation_end && Moment(test.activation_end).isValid()
                            ? Moment.utc(test.activation_end).add(5, 'hours').format("DD MMM, HH:mm")
                            : "Noma'lum"}
                        </p>
                      </div>
                    </div>

                    {/* Davomiyligi */}
                    <div className="flex items-start gap-2">
                      <TimeIcon className="w-5 h-5 text-blue-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Test davomiyligi</p>
                        <p className="text-sm font-medium text-gray-800 dark:text-white">
                          {formatDuration(test)}
                        </p>
                      </div>
                    </div>

                    {/* Guruhlar */}
                    <div className="flex items-start gap-2">
                      <UserCircleIcon className="w-5 h-5 text-green-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Guruhlar</p>
                        <p className="text-sm text-gray-800 dark:text-white">
                          {getGroupNames(test.group_ids)}
                        </p>
                      </div>
                    </div>

                    {/* Test konfiguratsiyasi */}
                    <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                      <p className="text-xs text-gray-500 mb-1">Test turi:</p>
                      <p className="text-sm text-gray-800 dark:text-white font-medium">
                        {getTestConfigDisplay(test)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {test.question_count} ta savol
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ComponentCard>
        )}
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[800px] m-4">
        <div className="relative w-full p-4 bg-white rounded-3xl dark:bg-gray-900 lg:p-11 max-h-[90vh] flex flex-col">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              {editingTest ? "Maxsus testni tahrirlash" : "Maxsus test qo'shish"}
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              {editingTest
                ? regenerateQuestions
                  ? "Vaqt, guruhlar va bo'limlarni tanlang. Qayta tuzilsin testlar."
                  : "Vaqt, guruhlar va bo'limlarni tanlang. Mavjud savollar saqlanadi."
                : "Vaqt, guruhlar va bo'limlarni tanlang"
              }
            </p>
          </div>
          <form className="flex flex-col flex-1 overflow-hidden" onSubmit={createOrUpdateTest}>
            <div className="px-2 overflow-y-auto custom-scrollbar flex-1">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5">
                <div>
                  <Label>Test nomi <span className="text-red-500">*</span></Label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Maxsus test nomi"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <DateTimePicker
                      dateId="activationStartDate"
                      timeId="activationStartTime"
                      dateLabel=""
                      timeLabel="Qaysi vaqtdan ko'rish mumkin"
                      datePlaceholder="Sana tanlang"
                      timePlaceholder="00:00"
                      dateValue={activationStartDate}
                      timeValue={activationStartTime}
                      onDateChange={setActivationStartDate}
                      onTimeChange={setActivationStartTime}
                      dateDefaultDate={activationStartDate ? new Date(activationStartDate) : undefined}
                    />
                  </div>
                  <div>
                    <DateTimePicker
                      dateId="activationEndDate"
                      timeId="activationEndTime"
                      dateLabel=""
                      timeLabel="Qaysi vaqtgacha ko'rish mumkin"
                      datePlaceholder="Sana tanlang"
                      timePlaceholder="23:59"
                      dateValue={activationEndDate}
                      timeValue={activationEndTime}
                      onDateChange={setActivationEndDate}
                      onTimeChange={setActivationEndTime}
                      dateDefaultDate={activationEndDate ? new Date(activationEndDate) : undefined}
                    />
                  </div>
                </div>

                {/* Date/Time validation error */}
                {dateTimeError && (
                  <div className="text-red-500 text-sm mt-2">
                    {dateTimeError}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Har bir savol uchun vaqt (sekund)</Label>
                    <Input
                      type="number"
                      value={timePerQuestion}
                      onChange={(e) => {
                        let val = e.target.value;
                        // Remove leading zeros
                        if (val.startsWith('0') && val.length > 1) {
                          val = val.replace(/^0+/, '');
                        }
                        const v = Number(val || 0);
                        setTimePerQuestion(v);
                        if (v > 0) {
                          setTotalTime(0);
                        } else {
                          setForceNextQuestion(false);
                        }
                      }}
                      placeholder="60"
                      min="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">Har bir savol uchun berilgan vaqt</p>
                    {timePerQuestion > 0 && (
                      <div className="mt-3">
                        <Switch
                          label="Keyingi savolga o'tish majburiy"
                          checked={forceNextQuestion}
                          onChange={(v) => setForceNextQuestion(v)}
                        />
                      </div>
                    )}
                  </div>
                  <div>
                    <Label>To'liq test uchun vaqt (minut)</Label>
                    <Input
                      type="number"
                      value={totalTime}
                      onChange={(e) => {
                        let val = e.target.value;
                        // Remove leading zeros
                        if (val.startsWith('0') && val.length > 1) {
                          val = val.replace(/^0+/, '');
                        }
                        const v = Number(val || 0);
                        setTotalTime(v);
                        if (v > 0) {
                          setTimePerQuestion(0);
                        } else {
                          setForceNextQuestion(false);
                        }
                      }}
                      placeholder="60"
                      min="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">Butun test uchun umumiy vaqt</p>
                  </div>
                </div>

                <div>
                  <Label>Guruhlar <span className="text-red-500">*</span></Label>
                  <div className="mt-2 max-h-48 overflow-y-auto border border-gray-300 dark:border-gray-700 rounded-lg p-3 space-y-2">
                    {groups.length === 0 ? (
                      <p className="text-sm text-gray-500">Guruhlar yuklanmoqda...</p>
                    ) : (
                      groups.map((group) => (
                        <label
                          key={group.id}
                          className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedGroups.includes(group.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedGroups([...selectedGroups, group.id]);
                              } else {
                                setSelectedGroups(selectedGroups.filter((id) => id !== group.id));
                              }
                            }}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-800 dark:text-white">{group.name}</span>
                        </label>
                      ))
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedGroups.length} ta guruh tanlandi
                  </p>
                </div>

                {/* Fan tanlash - MAJBURIY */}
                <div>
                  <Label>Fan <span className="text-red-500">*</span></Label>
                  <select
                    className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2.5 text-sm dark:bg-gray-900 dark:text-white/90"
                    value={selectedSubject}
                    onChange={(e) => {
                      setSelectedSubject(Number(e.target.value));
                      setSelectedBookIds([]); // Fan o'zgarganda kitob va bo'limlarni reset qilish
                      setSelectedSectionIds([]);
                    }}
                    required
                  >
                    <option value="">Fan tanlang</option>
                    {subjects.map(subj => (
                      <option key={subj.id} value={subj.id}>{subj.name}</option>
                    ))}
                  </select>
                </div>

                {/* Kitob tanlash - IXTIYORIY (faqat fan tanlangan bo'lsa) */}
                {selectedSubject > 0 && (
                  <div>
                    <Label>Kitoblar (ixtiyoriy)</Label>
                    <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-3 max-h-48 overflow-y-auto mt-2">
                      {books
                        .filter(book => book.subject_id === selectedSubject)
                        .map(book => (
                          <label
                            key={book.id}
                            className="flex items-center gap-2 py-2 px-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedBookIds.includes(book.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedBookIds([...selectedBookIds, book.id]);
                                } else {
                                  setSelectedBookIds(selectedBookIds.filter(id => id !== book.id));
                                  // Kitob o'chirilganda, shu kitobdagi bo'limlarni ham o'chirish
                                  const sectionsToRemove = sections
                                    .filter(s => s.book_id === book.id)
                                    .map(s => s.id);
                                  setSelectedSectionIds(selectedSectionIds.filter(id => !sectionsToRemove.includes(id)));
                                }
                              }}
                              className="w-4 h-4 text-blue-600 rounded"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{book.name}</span>
                          </label>
                        ))}
                      {books.filter(book => book.subject_id === selectedSubject).length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-2">Kitoblar mavjud emas</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Bo'limlar tanlash - IXTIYORIY (faqat fan yoki kitob tanlangan bo'lsa) */}
                {selectedSubject > 0 && (
                  <div>
                    <Label>Bo'limlar (ixtiyoriy)</Label>
                    <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-3 max-h-48 overflow-y-auto mt-2">
                      {sections
                        .filter(section => {
                          // Agar kitob tanlangan bo'lsa, faqat shu kitobdagi bo'limlar
                          if (selectedBookIds.length > 0) {
                            return selectedBookIds.includes(section.book_id);
                          }
                          // Aks holda, fan bo'yicha filter qilish
                          const book = books.find(b => b.id === section.book_id);
                          return book && book.subject_id === selectedSubject;
                        })
                        .map(section => (
                          <label
                            key={section.id}
                            className="flex items-center gap-2 py-2 px-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedSectionIds.includes(section.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedSectionIds([...selectedSectionIds, section.id]);
                                } else {
                                  setSelectedSectionIds(selectedSectionIds.filter((id) => id !== section.id));
                                }
                              }}
                              className="w-4 h-4 text-blue-600 rounded"
                            />
                            <span className="text-sm text-gray-800 dark:text-white">{section.name}</span>
                          </label>
                        ))}
                    </div>
                    {selectedSectionIds.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        {selectedSectionIds.length} ta bo'lim tanlandi
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <Label>Savollar soni</Label>
                  <Input
                    type="number"
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    placeholder="10"
                    min="1"
                  />
                </div>

                {/* Savollarni qayta tuzish tanlovi - faqat edit paytida */}
                {editingTest && (
                  <div className="flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                    <input
                      type="checkbox"
                      id="regenerateQuestions"
                      checked={regenerateQuestions}
                      onChange={(e) => setRegenerateQuestions(e.target.checked)}
                      className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 dark:focus:ring-orange-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <Label htmlFor="regenerateQuestions" className="text-sm font-medium text-orange-800 dark:text-orange-200 cursor-pointer">
                      Qayta tuzilsin testlar
                    </Label>
                    <p className="text-xs text-orange-600 dark:text-orange-300">
                      Belgilansa yangi savollar tuziladi, belgilanmasa mavjud savollar saqlanadi
                    </p>
                  </div>
                )}

                {/* Mavjud savollar soni */}
                {selectedSubject > 0 && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        Mavjud savollar: {modalFilteredItems.length} ta
                      </p>
                    </div>
                    {modalFilteredItems.length < questionCount && (
                      <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                        Tanlangan savollar soni ({questionCount}) mavjud savollardan ko'proq. Faqat {modalFilteredItems.length} ta savol ishlatiladi.
                      </p>
                    )}
                  </div>
                )}

                {/* ESKI FORM - Comment qilingan */}
              </div>
            </div>

            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={(e) => {
                  e.preventDefault();
                  closeModal();
                }} 
                type="button"
              >
                Bekor qilish
              </Button>
              <Button 
                size="sm" 
                type="submit"
                onClick={() => {
                  console.log('🟠 Test tuzish tugmasi bosildi');
                }}
              >
                {editingTest ? "Yangilash" : "Test tuzish"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Tasdiqlash modali */}
      <Modal isOpen={isConfirmOpen} onClose={closeConfirmModal} className="max-w-[500px] m-4">
        <div className="relative w-full p-6 bg-white rounded-3xl dark:bg-gray-900">
          <h4 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white/90">
            Test saqlansinmi?
          </h4>
          {pendingTest && (
            <div className="space-y-3 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Test nomi:</p>
                <p className="font-semibold text-gray-800 dark:text-white">{pendingTest.name}</p>
              </div>

              <div className="border-t dark:border-gray-700 pt-3">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Konfiguratsiya:</p>
                <div className="ml-3 space-y-1">
                  <p className="text-sm text-gray-800 dark:text-white">
                    <span className="font-medium">Fan:</span> {subjects.find(s => s.id === pendingTest.subject_id)?.name || 'N/A'}
                  </p>
                  {pendingTest.book_ids && pendingTest.book_ids.length > 0 && (
                    <p className="text-sm text-gray-800 dark:text-white">
                      <span className="font-medium">Kitoblar:</span> {pendingTest.book_ids.map(id => books.find(b => b.id === id)?.name).filter(n => n).join(', ') || 'N/A'}
                    </p>
                  )}
                  {pendingTest.section_id && (
                    <p className="text-sm text-gray-800 dark:text-white">
                      <span className="font-medium">Bo'lim:</span> {sections.find(s => s.id === pendingTest.section_id)?.name || 'N/A'}
                    </p>
                  )}
                </div>
              </div>

              <div className="border-t dark:border-gray-700 pt-3">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Savollar:</p>
                <p className="font-semibold text-lg text-primary">
                  {pendingTest.generatedTest ? pendingTest.generatedTest.items.length : pendingTest.question_count} ta
                  {pendingTest.generatedTest && (
                    <span className="text-sm text-green-600 ml-2">(tuzilgan)</span>
                  )}
                </p>
                {editingTest && (
                  <p className="text-xs text-orange-600 mt-1">
                    {regenerateQuestions ? "Qayta tuzilsin testlar" : "Mavjud savollar saqlanadi"}
                  </p>
                )}
              </div>

              <div className="border-t dark:border-gray-700 pt-3">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Guruhlar:</p>
                <p className="text-sm text-gray-800 dark:text-white font-medium">
                  {getGroupNames(pendingTest.group_ids)}
                </p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3 justify-end">
            <Button variant="outline" onClick={() => { setEditableAnswerKeys({}); closeConfirmModal(); }}>
              Bekor qilish
            </Button>
            <Button variant="outline" onClick={() => { generatePreviewForPendingTest(); setIsAllItemsModalOpen(true); }}>
              Savollarni ko'rish
            </Button>
            <Button onClick={confirmAndSaveTest}>
              Ha, saqlansin
            </Button>
          </div>
      {/* Barcha test-itemlar modal */}
      <Modal isOpen={isAllItemsModalOpen} onClose={() => { setIsAllItemsModalOpen(false); setIsPreviewEditMode(false); }} className="max-w-5xl m-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6 pr-12">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white">Test savollari</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (isPreviewEditMode) {
                  // Reset editable questions when canceling edit
                  const reset: {[key: number]: TestItem} = {};
                  previewTestItems.forEach(item => {
                    reset[item.number] = { ...item };
                  });
                  setEditableQuestions(reset);
                }
                setIsPreviewEditMode(!isPreviewEditMode);
              }}
            >
              {isPreviewEditMode ? 'Bekor qilish' : 'Tahrirlash'}
            </Button>
          </div>
          <div className="max-h-[65vh] overflow-y-auto space-y-6">

            {/* Filterlangan va random tanlangan test-itemlar (preview) */}
            {previewTestItems.length > 0 && (
              <>
                {previewTestItems.map((item: TestItem, idx: number) => {
                  const cleanQuestion = item.question?.replace(/^\s*\d+\.?\s*/, "") || "";
                  const answerKey = previewAnswerKeys[item.number] || "A";
                  return (
                    <div key={item.id} className={`rounded-lg p-4 border shadow-sm transition-all duration-200 ${
                      isPreviewEditMode 
                        ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800 shadow-blue-100 dark:shadow-blue-900/20' 
                        : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                    }`}>
                      <div className="flex items-start gap-3 mb-2">
                        <span className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                          isPreviewEditMode 
                            ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' 
                            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        }`}>{idx + 1}</span>
                        <div className="flex-1">
                          {isPreviewEditMode ? (
                            <textarea
                              value={editableQuestions[item.number]?.question || cleanQuestion}
                              onChange={(e) => {
                                setEditableQuestions(prev => ({
                                  ...prev,
                                  [item.number]: {
                                    ...prev[item.number],
                                    question: e.target.value
                                  }
                                }));
                              }}
                              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-2"
                              rows={3}
                              placeholder="Savolni kiriting..."
                            />
                          ) : (
                            <p className="font-medium text-gray-800 dark:text-white mb-2">{cleanQuestion}</p>
                          )}
                          {isPreviewEditMode ? (
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">A)</span>
                                <input
                                  type="text"
                                  value={editableQuestions[item.number]?.answer_A || item.answer_A}
                                  onChange={(e) => {
                                    setEditableQuestions(prev => ({
                                      ...prev,
                                      [item.number]: {
                                        ...prev[item.number],
                                        answer_A: e.target.value
                                      }
                                    }));
                                  }}
                                  className="flex-1 p-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">B)</span>
                                <input
                                  type="text"
                                  value={editableQuestions[item.number]?.answer_B || item.answer_B}
                                  onChange={(e) => {
                                    setEditableQuestions(prev => ({
                                      ...prev,
                                      [item.number]: {
                                        ...prev[item.number],
                                        answer_B: e.target.value
                                      }
                                    }));
                                  }}
                                  className="flex-1 p-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">C)</span>
                                <input
                                  type="text"
                                  value={editableQuestions[item.number]?.answer_C || item.answer_C}
                                  onChange={(e) => {
                                    setEditableQuestions(prev => ({
                                      ...prev,
                                      [item.number]: {
                                        ...prev[item.number],
                                        answer_C: e.target.value
                                      }
                                    }));
                                  }}
                                  className="flex-1 p-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">D)</span>
                                <input
                                  type="text"
                                  value={editableQuestions[item.number]?.answer_D || item.answer_D}
                                  onChange={(e) => {
                                    setEditableQuestions(prev => ({
                                      ...prev,
                                      [item.number]: {
                                        ...prev[item.number],
                                        answer_D: e.target.value
                                      }
                                    }));
                                  }}
                                  className="flex-1 p-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs"
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className={`p-2 rounded-lg transition-colors ${
                                (isPreviewEditMode ? (editableQuestions[item.number]?.answer || item.answer) : (previewAnswerKeys[item.number] || "A")) === 'A'
                                  ? 'bg-green-200 dark:bg-green-800/50 border-2 border-green-600 shadow-md' 
                                  : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                              }`}>
                                <span className="font-semibold">A)</span> {item.answer_A}
                              </div>
                              <div className={`p-2 rounded-lg transition-colors ${
                                (isPreviewEditMode ? (editableQuestions[item.number]?.answer || item.answer) : (previewAnswerKeys[item.number] || "A")) === 'B'
                                  ? 'bg-green-200 dark:bg-green-800/50 border-2 border-green-600 shadow-md' 
                                  : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                              }`}>
                                <span className="font-semibold">B)</span> {item.answer_B}
                              </div>
                              <div className={`p-2 rounded-lg transition-colors ${
                                (isPreviewEditMode ? (editableQuestions[item.number]?.answer || item.answer) : (previewAnswerKeys[item.number] || "A")) === 'C'
                                  ? 'bg-green-200 dark:bg-green-800/50 border-2 border-green-600 shadow-md' 
                                  : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                              }`}>
                                <span className="font-semibold">C)</span> {item.answer_C}
                              </div>
                              <div className={`p-2 rounded-lg transition-colors ${
                                (isPreviewEditMode ? (editableQuestions[item.number]?.answer || item.answer) : (previewAnswerKeys[item.number] || "A")) === 'D'
                                  ? 'bg-green-200 dark:bg-green-800/50 border-2 border-green-600 shadow-md' 
                                  : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                              }`}>
                                <span className="font-semibold">D)</span> {item.answer_D}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 text-sm text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-gray-600 dark:text-gray-400">{idx + 1}. Kalit:</span>
                          <select
                            value={isPreviewEditMode ? (editableQuestions[item.number]?.answer || item.answer) : (previewAnswerKeys[item.number] || "A")}
                            onChange={(e) => {
                              if (isPreviewEditMode) {
                                setEditableQuestions(prev => ({
                                  ...prev,
                                  [item.number]: {
                                    ...prev[item.number],
                                    answer: e.target.value
                                  }
                                }));
                              } else {
                                setPreviewAnswerKeys(prev => ({
                                  ...prev,
                                  [item.number]: e.target.value
                                }));
                              }
                            }}
                            className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                            <option value="D">D</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
          <div className="flex justify-end gap-3 mt-4">
            {isPreviewEditMode ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsPreviewEditMode(false);
                    // Reset editable questions to original
                    const reset: {[key: number]: TestItem} = {};
                    previewTestItems.forEach(item => {
                      reset[item.number] = { ...item };
                    });
                    setEditableQuestions(reset);
                  }}
                >
                  Orqaga
                </Button>
                <Button
                  onClick={() => {
                    // Save changes to pendingTest
                    if (pendingTest && pendingTest.generatedTest) {
                      const updatedItems = pendingTest.generatedTest.items.map(item => {
                        const editable = editableQuestions[item.number];
                        return editable ? { ...item, ...editable } : item;
                      });

                      const updatedAnswerKey = { ...pendingTest.generatedTest.answerKey };
                      Object.keys(editableQuestions).forEach(key => {
                        const numKey = parseInt(key);
                        if (editableQuestions[numKey]?.answer) {
                          updatedAnswerKey[numKey] = editableQuestions[numKey].answer;
                        }
                      });

                      setPendingTest({
                        ...pendingTest,
                        generatedTest: {
                          ...pendingTest.generatedTest,
                          items: updatedItems,
                          answerKey: updatedAnswerKey
                        }
                      });

                      // Update preview
                      setPreviewTestItems(updatedItems);
                      setPreviewAnswerKeys(updatedAnswerKey);
                    }
                    setIsPreviewEditMode(false);
                  }}
                >
                  Saqlash
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                onClick={() => setIsAllItemsModalOpen(false)}
              >
                Orqaga
              </Button>
            )}
          </div>
        </div>
      </Modal>
        </div>
      </Modal>

      {/* Ko'rish Modal */}
      <Modal
        isOpen={isViewOpen}
        onClose={closeViewModal}
        className="max-w-[900px] m-4"
      >
        <div className="relative w-full p-4 bg-white rounded-3xl dark:bg-gray-900 lg:p-11 max-h-[90vh] flex flex-col">
          <div className="px-2 pr-14 mb-6">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Test savollarini ko'rish
            </h4>
            {viewingTest && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {viewingTest.name} - {viewingTest.generatedTest?.items.length} ta savol
              </p>
            )}
          </div>

          {viewingTest && viewingTest.generatedTest && (
            <div className="flex-1 overflow-y-auto px-2">
              {/* Test haqida ma'lumot */}
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Yaratilgan:</p>
                    <p className="font-medium text-gray-800 dark:text-white">
                      {Moment(viewingTest.generatedTest.createdAt).format('DD.MM.YYYY HH:mm')}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Savollar soni:</p>
                    <p className="font-medium text-gray-800 dark:text-white">
                      {viewingTest.generatedTest.items.length} ta
                    </p>
                  </div>
                </div>
              </div>

              {/* Savollar ro'yxati */}
              <div className="space-y-4 mb-6">
                {viewingTest.generatedTest.items.map((item: TestItem, index: number) => {
                  const answerKey = viewingTest.generatedTest!.answerKey[item.number];
                  // Remove any leading number and dot from the question text
                  const cleanQuestion = item.question?.replace(/^\s*\d+\.?\s*/, "") || "";
                  return (
                    <div key={item.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border dark:border-gray-700 shadow-sm">
                      <div className="flex items-start gap-3">
                        <span className="shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full flex items-center justify-center font-semibold text-base border-2 border-blue-200 dark:border-blue-700">
                          {item.number}
                        </span>
                        <div className="flex-1 space-y-3">
                          <p className="font-medium text-gray-800 dark:text-white">{cleanQuestion}</p>
                          <div className="grid grid-cols-2 gap-2">
                            <div className={`p-3 rounded-lg transition-colors ${
                              answerKey === 'A' 
                                ? 'bg-green-200 dark:bg-green-800/50 border-2 border-green-600 shadow-md' 
                                : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                            }`}>
                              <span className="font-semibold mr-2">A)</span>
                              <span className={answerKey === 'A' ? 'font-medium text-green-700 dark:text-green-300' : ''}>
                                {item.answer_A}
                              </span>
                            </div>
                            <div className={`p-3 rounded-lg transition-colors ${
                              answerKey === 'B' 
                                ? 'bg-green-200 dark:bg-green-800/50 border-2 border-green-600 shadow-md' 
                                : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                            }`}>
                              <span className="font-semibold mr-2">B)</span>
                              <span className={answerKey === 'B' ? 'font-medium text-green-700 dark:text-green-300' : ''}>
                                {item.answer_B}
                              </span>
                            </div>
                            <div className={`p-3 rounded-lg transition-colors ${
                              answerKey === 'C' 
                                ? 'bg-green-200 dark:bg-green-800/50 border-2 border-green-600 shadow-md' 
                                : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                            }`}>
                              <span className="font-semibold mr-2">C)</span>
                              <span className={answerKey === 'C' ? 'font-medium text-green-700 dark:text-green-300' : ''}>
                                {item.answer_C}
                              </span>
                            </div>
                            <div className={`p-3 rounded-lg transition-colors ${
                              answerKey === 'D' 
                                ? 'bg-green-200 dark:bg-green-800/50 border-2 border-green-600 shadow-md' 
                                : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                            }`}>
                              <span className="font-semibold mr-2">D)</span>
                              <span className={answerKey === 'D' ? 'font-medium text-green-700 dark:text-green-300' : ''}>
                                {item.answer_D}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Modal footer */}
          <div className="flex gap-3 justify-end pt-4 border-t dark:border-gray-700 px-2">
            {viewingTest && (
              <Button
                variant="outline"
                onClick={() => exportToPDF(viewingTest)}
              >
                📄 PDF yuklab olish
              </Button>
            )}
            <Button onClick={closeViewModal}>
              Yopish
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteConfirmOpen} onClose={closeDeleteConfirmModal} className="max-w-[400px] m-4">
        <div className="relative w-full p-6 bg-white rounded-3xl dark:bg-gray-900">
          <h4 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white/90">
            Test o'chirilsinmi?
          </h4>
          <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
            Bu test butunlay o'chiriladi va qayta tiklanib bo'lmaydi.
          </p>
          <div className="flex items-center gap-3 justify-end">
            <Button variant="outline" onClick={closeDeleteConfirmModal}>
              Bekor qilish
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => {
                if (pendingDeleteId) {
                  deleteSpecialTest(pendingDeleteId);
                  setPendingDeleteId(null);
                  closeDeleteConfirmModal();
                }
              }}
            >
              Ha, o'chirilsin
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
