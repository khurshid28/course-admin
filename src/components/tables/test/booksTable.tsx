import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";

import bookImage from "../../../../public/images/product/book.png";
import Moment from "moment";

import Badge from "../../ui/badge/Badge";
import {
  CheckCircleIcon,
  CloseCircleIcon,
  DeleteIcon,
  PencilIcon,
} from "../../../icons";
import { useEffect, useState } from "react";
import { useModal } from "../../../hooks/useModal";
import Select from "../../form/Select";
import axiosClient from "../../../service/axios.service";
import Pagination from "../../ui/pagination/Pagination";
import { toast } from "react-toastify";
import ConfirmDeleteModal from "../../ui/ConfirmDeleteModal";

// interface Order {
//   id: number;
//   name: string;
//   image: string;
//   createdAt: Date;
//   status: string;
//   subject_id? : string;
// }

interface BookItemProps {
  id?: number;
  name?: string;
  image?: string;
  imagFile?: string;
  createdt: string;
  subject?: any;
  subject_id?: number;
  fullBlock?: boolean;
  stepBlock?: boolean;
  sections?: Array<{id: number; name: string}>;
}
// Define the table data using the interface
// const statictableData: Order[] = [
//   {
//     id: 1,

//     name: "Book 1",
//     image: "/images/product/product-01.jpg",
//     createdAt: new Date("2025-03-02"),

//     status: "Active",
//     subject_id : "Subject 1"
//   },
//   {
//     id: 2,

//     name: "Book 2",
//     image: "/images/product/product-02.jpg",
//     createdAt: new Date("2025-03-02"),

//     status: "Active",
//      subject_id : "Subject 2"
//   },
//   {
//     id: 3,

//     name: "Book 3",
//     image: "/images/product/product-03.jpg",
//     createdAt: new Date("2025-04-10"),

//     status: "Active",
//      subject_id : "Subject 1"
//   },
//   {
//     id: 1,

//     name: "Book 1",
//     image: "/images/product/product-01.jpg",
//     createdAt: new Date("2025-03-02"),

//     status: "Cancel",
//      subject_id : "Subject 3"
//   },
//   {
//     id: 2,

//     name: "Book 2",
//     image: "/images/product/product-02.jpg",
//     createdAt: new Date("2025-03-02"),

//     status: "Active",
//      subject_id : "Subject 1"
//   },
//   {
//     id: 3,

//     name: "Book 3",
//     image: "/images/product/product-03.jpg",
//     createdAt: new Date("2025-04-10"),

//     status: "Active",
//      subject_id : "Subject 1"
//   },
//   {
//     id: 1,

//     name: "Book 1",
//     image: "/images/product/product-01.jpg",
//     createdAt: new Date("2025-03-02"),

//     status: "Active",
//      subject_id : "Subject 2"
//   },
//   {
//     id: 2,

//     name: "Book 2",
//     image: "/images/product/product-02.jpg",
//     createdAt: new Date("2025-03-02"),

//     status: "Active",
//      subject_id : "Subject 2"
//   },
//   {
//     id: 3,

//     name: "Book 3",
//     image: "/images/product/product-03.jpg",
//     createdAt: new Date("2025-04-10"),

//     status: "Active",
//     subject_id : "Subject 2"    },
//   {
//     id: 1,

//     name: "Book 1",
//     image: "/images/product/product-01.jpg",
//     createdAt: new Date("2025-03-02"),

//     status: "Active",
//      subject_id : "Subject 2"
//   },
//   {
//     id: 2,

//     name: "Book 2",
//     image: "/images/product/product-02.jpg",
//     createdAt: new Date("2025-03-02"),

//     status: "Active",
//      subject_id : "Subject 1"
//   },
//   {
//     id: 3,

//     name: "Book 3",
//     image: "/images/product/product-03.jpg",
//     createdAt: new Date("2025-04-10"),

//     status: "Active",
//      subject_id : "Subject 2"
//   },
//   {
//     id: 1,

//     name: "Book 1",
//     image: "/images/product/product-01.jpg",
//     createdAt: new Date("2025-03-02"),

//     status: "Active",
//      subject_id : "Subject 2"
//   },
//   {
//     id: 2,

//     name: "Book 2",
//     image: "/images/product/product-02.jpg",
//     createdAt: new Date("2025-03-02"),

//     status: "Active",
//      subject_id : "Subject 2"
//   },
//   {
//     id: 3,

//     name: "Book 3",
//     image: "/images/product/product-03.jpg",
//     createdAt: new Date("2025-04-10"),

//     status: "Active",
//      subject_id : "Subject 1"
//   },
//   {
//     id: 1,

//     name: "Book 1",
//     image: "/images/product/product-01.jpg",
//     createdAt: new Date("2025-03-02"),

//     status: "Active",
//      subject_id : "Subject 2"
//   },
//   {
//     id: 2,

//     name: "Book 2",
//     image: "/images/product/product-02.jpg",
//     createdAt: new Date("2025-03-02"),

//     status: "Active",
//      subject_id : "Subject 2"
//   },
//   {
//     id: 3,

//     name: "Book 3",
//     image: "/images/product/product-03.jpg",
//     createdAt: new Date("2025-04-10"),

//     status: "Cancel",
//      subject_id : "Subject 1"
//   },
// ];

export default function BooksTable({
  data,
  subjects,
  refetch,
  onEdit,
}: {
  data: BookItemProps[];
  subjects: any[];
  refetch: () => Promise<void>;
  onEdit?: (bookId: number) => void;
}) {
  const [tableData, settableData] = useState(data);

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
  let currentItems: BookItemProps[] = tableData.slice(startIndex, endIndex);

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

  const Subject_options = [
    new Option("Hamma Fanlar", "Hamma Fanlar"),
    ...subjects,
  ];

  // const all_Subject_options = [
  //   { value: "Subject 1", label: "Subject 1" },
  //   { value: "Subject 2", label: "Subject 2"},
  //   { value: "Subject 3", label: "Subject 3"},
  // ];

  let [subjectoptionValue, setSubjectoptionValue] = useState("Hamma Fanlar");

  const handleSelectSubjectChange = (value: string) => {
    setSubjectoptionValue(value);
  };
  const handleSelectAllSubjectChange = (value: string) => {};

  useEffect(() => {
    setCurrentPage(1);

    if (subjectoptionValue == "Hamma Fanlar") {
      settableData(data);
    } else {
      settableData(
        data.filter((item) => item.subject_id == +subjectoptionValue)
      );
    }
  }, [optionValue, subjectoptionValue]);

  useEffect(() => {
    settableData(data);
    setCurrentPage(1);
  }, [data]);

  const { isOpen: isDeleteModalOpen, openModal: openDeleteModal, closeModal: closeDeleteModal } = useModal();
  const [deletingBook, setDeletingBook] = useState<{ id: number; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (bookId: number, bookName: string) => {
    setDeletingBook({ id: bookId, name: bookName });
    openDeleteModal();
  };

  const handleConfirmDelete = async () => {
    if (!deletingBook) return;
    
    setIsDeleting(true);
    try {
      await axiosClient.delete(`/book/${deletingBook.id}`);
      toast.success("Kitob muvaffaqiyatli o'chirildi");
      await refetch();
      closeDeleteModal();
      setDeletingBook(null);
    } catch (error) {
      console.error("Delete Book error:", error);
      toast.error("Xatolik yuz berdi");
    } finally {
      setIsDeleting(false);
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
              options={Subject_options}
              onChange={handleSelectSubjectChange}
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
                Kitoblar
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Sana
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Fan
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
                Ruhsatlar
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
                <TableCell className="px-5 py-4 sm:px-6 text-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 overflow-hidden rounded-sm ">
                      <img
                        width={40}
                        height={40}
                        src={
                          order.image
                            ? import.meta.env.VITE_STATIC_PATH + order.image
                            : bookImage
                        }
                        alt={order.name}
                      />
                    </div>
                    <div>
                      <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {order.name}
                      </span>
                      <span className="block text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {order.sections ? order.sections.length : 0} ta bo'lim
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {Moment(order.createdt).format("MMMM DD, yyyy")}
                </TableCell>

                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {order.subject && order.subject.name}
                </TableCell>

                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  <Badge
                    size="sm"
                    color={
                      "success"
                      // order.status === "Active"
                      //   ? "success"
                      //   : order.status === "Pending"
                      //   ? "warning"
                      //   : "error"
                    }
                  >
                    Active
                    {/* {order.status} */}
                  </Badge>
                </TableCell>

                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                 

                  {
                    !order.fullBlock ?  <CheckCircleIcon className="inline-block w-5 h-5 mr-1 text-green-500 dark:text-green-400" /> : <CloseCircleIcon className="inline-block w-5 h-5 ml-1  text-red-500 dark:text-red-400" />
                  }

                  {
                    order.stepBlock ?  <CheckCircleIcon className="inline-block w-5 h-5 mr-1 text-green-500 dark:text-green-400" /> : <CloseCircleIcon className="inline-block w-5 h-5 ml-1  text-red-500 dark:text-red-400" />
                  }
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  <div className="flex gap-2 flex-row items-center">
                    <button
                      onClick={() => {
                        if (onEdit && order.id) {
                          onEdit(order.id);
                        }
                      }}
                      className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 transition-colors group"
                      title="Tahrirlash"
                    >
                      <PencilIcon className="w-5 h-5 fill-blue-600 dark:fill-blue-400 group-hover:scale-110 transition-transform"></PencilIcon>
                    </button>

                    <button
                      onClick={() => {
                        handleDeleteClick(order.id!, order.name || 'Nomsiz kitob');
                      }}
                      className="p-2 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 transition-colors group"
                      title="O'chirish"
                    >
                      <DeleteIcon className="text-xl fill-red-600 dark:fill-red-400 group-hover:scale-110 transition-transform"></DeleteIcon>
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

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Kitobni o'chirish"
        message="Ushbu kitobni o'chirmoqchimisiz?"
        itemName={deletingBook?.name}
        isLoading={isDeleting}
      />
    </div>
  );
}
