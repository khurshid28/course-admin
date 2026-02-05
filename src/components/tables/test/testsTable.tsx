import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";

import Moment from "moment";

import Badge from "../../ui/badge/Badge";
import Button from "../../ui/button/Button";
import {
  ArrowRightIcon,
  CloseIcon,
  CloseLineIcon,
  CopyIcon,
  DeleteIcon,
  DownloadIcon,
  PencilIcon,
  EyeCloseIcon,
  EyeIcon,
  PlusIcon,
} from "../../../icons";
import { useEffect, useState } from "react";
import { useModal } from "../../../hooks/useModal";
import Input from "../../form/input/InputField";
import Label from "../../form/Label";
import { Modal } from "../../ui/modal";
import Select from "../../form/Select";
import { Test } from "../../../pages/Test/Tests";
import DropzoneComponent from "../../form/form-elements/DropZone";
import FileInputExample from "../../form/form-elements/FileInputExample";
import FileInput from "../../form/input/FileInput";
import MultiSelect from "../../form/MultiSelect";

import bookImage from "../../../../public/images/product/book.png";
import {
  ParsedResult,
  parseQuestions,
  readDocx,
  downloadAsDocx,
} from "../../../service/parse-docs.service";
import Pagination from "../../ui/pagination/Pagination";
import axiosClient from "../../../service/axios.service";
import ConfirmDeleteModal from "../../ui/ConfirmDeleteModal";

interface TestProps {
  id: number;
  name: string;
  createdt: Date;

  section: any;
  section_id?: number;
  _count?: any;
  test_items?: any[];
}

export default function TestsTable({
  data,
  books,
  refetch,
  onEdit,
  onDownload,
}: {
  data: TestProps[];
  books: any[];
  refetch: () => Promise<void>;
  onEdit?: (testId: number, testItems?: any[]) => void;
  onDownload?: (testId: number, testName: string) => void;
}) {
  const [tableData, settableData] = useState(data);

  // Props dan kelgan data o'zgarganda tableData ni yangilash
  useEffect(() => {
    console.log('TestsTable: data prop changed, updating tableData');
    settableData(data);
  }, [data]);

  const { isOpen, openModal, closeModal } = useModal();
  const handleAdding = () => {
    // Handle save logic here

    console.log("handleAdding...");

    closeModal();
    setTest(emptyTest);
  };
  let emptyTest: Test = {};
  let [Test, setTest] = useState<Test>(emptyTest);

  const options = [
    { value: "5", label: "5" },
    { value: "10", label: "10" },
    { value: "20", label: "20" },
  ];
  let [optionValue, setoptionValue] = useState("5");

  const handleSelectChange = (value: string) => {
    setoptionValue(value);
  };

  // Pationation

  const [currentPage, setCurrentPage] = useState(1);
  const maxPage = Math.ceil(tableData.length / +optionValue);

  const startIndex = (currentPage - 1) * +optionValue;
  const endIndex = startIndex + +optionValue;
  let currentItems: TestProps[] = tableData.slice(startIndex, endIndex);

  const goToPreviousPage = () => {
    setCurrentPage((page) => Math.max(page - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage((page) => Math.min(page + 1, maxPage));
  };
  console.log(">> currentItems length :", currentItems.length);

  useEffect(() => {
    const startIndex = (currentPage - 1) * +optionValue;
    const endIndex = startIndex + +optionValue;
    currentItems = tableData.slice(startIndex, endIndex);
  }, [currentPage, tableData]);

  // const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //     const file = event.target.files?.[0];
  //     if (file) {
  //         console.log("Selected file:", file.name);
  //     }
  // };

  const Book_options = [
    { value: "Hamma kitoblar", label: "Hamma kitoblar" },
    ...books,
  ];

  // const all_Book_options = [
  //     { value: "Book 1", label: "Book 1" },
  //     { value: "Book 2", label: "Book 2" },
  //     { value: "Book 3", label: "Book 3" },
  // ];

  let [BookoptionValue, setBookoptionValue] = useState("Hamma kitoblar");

  const handleSelectBookChange = (value: string) => {
    setBookoptionValue(value);
  };

  useEffect(() => {
    setCurrentPage(1);

    if (BookoptionValue == "Hamma kitoblar") {
      settableData(data);
    } else {
      settableData(
        data.filter((item) => item.section.book_id === +BookoptionValue)
      );
    }
  }, [optionValue, BookoptionValue]);

  const all_sections_options = [
    { value: "Section 1", label: "Section 1" },
    { value: "Section 2", label: "Section 2" },
    { value: "Section 3", label: "Section 3" },
  ];

  const [quiz, setQuiz] = useState<ParsedResult | null>(null);
  const { isOpen: isDeleteModalOpen, openModal: openDeleteModal, closeModal: closeDeleteModal } = useModal();
  const [deletingTest, setDeletingTest] = useState<{ id: number; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (testId: number, testName: string) => {
    setDeletingTest({ id: testId, name: testName });
    openDeleteModal();
  };

  const handleConfirmDelete = async () => {
    if (!deletingTest) return;
    
    setIsDeleting(true);
    try {
      await axiosClient.delete(`/test/${deletingTest.id}`);
      await refetch();
      closeDeleteModal();
      setDeletingTest(null);
    } catch (error) {
      console.error('Delete error:', error);
      alert('O\'chirishda xatolik yuz berdi');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownloadTest = async (test: TestProps) => {
    try {
      console.log('Downloading test:', test.id, test.name);
      
      if (!test.test_items || test.test_items.length === 0) {
        alert('Test bo\'sh');
        return;
      }
      
      // Test items ni Question formatiga o'tkazish
      const questions = test.test_items.map((item: any, index: number) => ({
        number: index + 1,
        text: item.question,
        options: [
          { text: item.answer_A, isCorrect: item.answer === 'A' },
          { text: item.answer_B, isCorrect: item.answer === 'B' },
          { text: item.answer_C, isCorrect: item.answer === 'C' },
          { text: item.answer_D || '', isCorrect: item.answer === 'D' },
        ].filter(opt => opt.text)
      }));
      
      console.log('Questions formatted:', questions.length);
      // DOCX formatida yuklab olish
      await downloadAsDocx(questions, test.name, `${test.name}.docx`);
      console.log('Download initiated');
    } catch (error) {
      console.error('Download error:', error);
      alert('Yuklab olishda xatolik yuz berdi');
    }
  };

  
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3">
      <div className="max-w-full overflow-x-auto">
        <div className="px-5 py-3  flex flex-row justify-between items-center border-b border-gray-100 dark:border-white/5">
          <div className="flex flex-row items-center gap-2 text-theme-sm font-medium text-gray-500 text-start  dark:text-gray-400">
            <Select
              options={options}
              onChange={handleSelectChange}
              className="dark:bg-dark-900"
              defaultValue="5"
            />
            <span>Ko'rsatish</span>
          </div>
          <div className="flex flex-row items-center gap-2 text-theme-sm font-medium text-gray-500 text-start  dark:text-gray-400">
            <Select
              options={Book_options}
              onChange={handleSelectBookChange}
              className="dark:bg-dark-900"
            />
          </div>
        </div>
        <Table>
          {/* Table Header */}
          <TableHeader className="border-b border-gray-100 dark:border-white/5">
            <TableRow>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Bo'lim
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Sana
              </TableCell>

              <TableCell
                isHeader
                className="px-5 py-3 text-center  font-medium text-gray-500 text-theme-xs dark:text-gray-400"
              >
                Savollar
              </TableCell>

              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Status
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>

          {/* Table Body */}
          <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
            {currentItems.map((order, index) => (
              <TableRow key={index}>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 flex flex-row gap-2">
                  <div className="w-10 h-10 overflow-hidden rounded-sm ">
                    <img
                      width={40}
                      height={40}
                      src={
                        order.section &&
                        order.section.book &&
                        order.section.book.image
                          ? import.meta.env.VITE_STATIC_PATH +
                            order.section.book.image
                          : bookImage
                      }
                      alt={order.name}
                    />
                  </div>
                  <div>
                    <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {order.section &&
                        order.section.book &&
                        order.section.book.name}
                    </span>
                    <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                      {order.section && order.section.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {Moment(order.createdt).format("MMMM DD, yyyy")}
                </TableCell>
                <div>
                  <span className="block text-center font-medium text-gray-800 text-theme-sm dark:text-white/90">
                    {order._count && order._count.test_items}
                  </span>
                </div>

                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  <Badge
                    size="sm"
                    color={
                      "success"
                      // order.status === "Active"
                      //     ? "success"
                      //     : order.status === "Pending"
                      //         ? "warning"
                      //         : "error"
                    }
                  >
                    {/* {order.status} */}
                    Active
                  </Badge>
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  <div className="flex gap-2 flex-row items-center">
                    <button
                      onClick={() => {
                        if (onEdit) {
                          onEdit(order.id, order.test_items);
                        } else {
                          setTest({
                            ...order,
                          });
                          openModal();
                        }
                      }}
                      className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 transition-colors group"
                      title="Tahrirlash"
                    >
                      <PencilIcon className="w-5 h-5 fill-blue-600 dark:fill-blue-400 group-hover:scale-110 transition-transform"></PencilIcon>
                    </button>

                    <button
                      onClick={() => {
                        handleDeleteClick(order.id, order.name);
                      }}
                      className="p-2 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 transition-colors group"
                      title="O'chirish"
                    >
                      <DeleteIcon className="text-xl fill-red-600 dark:fill-red-400 group-hover:scale-110 transition-transform"></DeleteIcon>
                    </button>

                    <button
                      onClick={async () => {
                        if (onDownload) {
                          onDownload(order.id, order.name);
                        } else {
                          await handleDownloadTest(order);
                        }
                      }}
                      className="p-2 rounded-lg bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40 transition-colors group"
                      title="Yuklab olish"
                    >
                      <DownloadIcon className="text-xl fill-green-600 dark:fill-green-400 group-hover:scale-110 transition-transform"></DownloadIcon>
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="px-5 py-3 gap-3 flex flex-col md:flex-row justify-between md:items-center border-t border-gray-100 dark:border-white/5 text-theme-sm font-medium text-gray-500  dark:text-gray-400">
        <Pagination
          currentPage={currentPage}
          totalPages={maxPage}
          onPageChange={setCurrentPage}
        />
        <div>
          {(currentPage - 1) * +optionValue + 1} dan{" "}
          {Math.min(tableData.length, currentPage * +optionValue)} gacha,{" "}
          {tableData.length}
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Test
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Update Test with full details.
            </p>
          </div>
          <form className="flex flex-col">
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>Book</Label>
                  <Select
                    options={books}
                    className="dark:bg-dark-900"
                    defaultValue={`${Test.section}`}
                    onChange={(e) => {
                      setTest({
                        ...Test,
                        book_id: +e,
                      });
                    }}
                  />
                </div>

                <div>
                  <Label>Section</Label>
                  <Select
                    options={all_sections_options}
                    className="dark:bg-dark-900"
                    defaultValue={`${Test.section}`}
                    onChange={() => {}}
                  />
                </div>

                <div>
                  <Label>Name</Label>
                  <Input
                    type="text"
                    value={Test.name}
                    onChange={(e) =>
                      setTest({
                        ...Test,
                        name: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label>File</Label>
                  <FileInput
                    // onChange={handleFileChange}
                    className="custom-class"
                  />
                </div>
              </div>
            </div>

          
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Close
              </Button>
              <Button size="sm" onClick={handleAdding}>
                Saves
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Testni o'chirish"
        message="Ushbu testni va unga tegishli barcha savollarni o'chirmoqchimisiz?"
        itemName={deletingTest?.name}
        isLoading={isDeleting}
      />
    </div>
  );
}
