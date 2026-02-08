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
import { Section } from "../../../pages/Test/Sections";
import DropzoneComponent from "../../form/form-elements/DropZone";
import FileInputExample from "../../form/form-elements/FileInputExample";
import FileInput from "../../form/input/FileInput";
import MultiSelect from "../../form/MultiSelect";
import axiosClient from "../../../service/axios.service";
import { toast } from "react-toastify";
import Pagination from "../../ui/pagination/Pagination";

interface Order {
    id: number;
    name: string;
    image: string;
    createdAt: Date;
    status: string;
    Book_id?: string;
}

// Define the table data using the interface


interface SectionItemProps {
    id?: number;
    name?: string;
    createdt: string;
    book? : any;
    book_id?: number;
  }


const statictableData: Order[] = [
    {
        id: 1,

        name: "Section 1",
        image: "/images/product/product-01.jpg",
        createdAt: new Date("2025-03-02"),

        status: "Active",
        Book_id: "Book 1"
    },
    {
        id: 2,

        name: "Section 2",
        image: "/images/product/product-02.jpg",
        createdAt: new Date("2025-03-02"),

        status: "Active",
        Book_id: "Book 2"
    },
    {
        id: 3,

        name: "Section 3",
        image: "/images/product/product-03.jpg",
        createdAt: new Date("2025-04-10"),

        status: "Active",
        Book_id: "Book 1"
    },
    {
        id: 1,

        name: "Section 1",
        image: "/images/product/product-01.jpg",
        createdAt: new Date("2025-03-02"),

        status: "Cancel",
        Book_id: "Book 3"
    },
    {
        id: 2,

        name: "Section 2",
        image: "/images/product/product-02.jpg",
        createdAt: new Date("2025-03-02"),

        status: "Active",
        Book_id: "Book 1"
    },
    {
        id: 3,

        name: "Section 3",
        image: "/images/product/product-03.jpg",
        createdAt: new Date("2025-04-10"),

        status: "Active",
        Book_id: "Book 1"
    },
    {
        id: 1,

        name: "Section 1",
        image: "/images/product/product-01.jpg",
        createdAt: new Date("2025-03-02"),

        status: "Active",
        Book_id: "Book 2"
    },
    {
        id: 2,

        name: "Section 2",
        image: "/images/product/product-02.jpg",
        createdAt: new Date("2025-03-02"),

        status: "Active",
        Book_id: "Book 2"
    },
    {
        id: 3,

        name: "Section 3",
        image: "/images/product/product-03.jpg",
        createdAt: new Date("2025-04-10"),

        status: "Active",
        Book_id: "Book 2"
    },
    {
        id: 1,

        name: "Section 1",
        image: "/images/product/product-01.jpg",
        createdAt: new Date("2025-03-02"),

        status: "Active",
        Book_id: "Book 2"
    },
    {
        id: 2,

        name: "Section 2",
        image: "/images/product/product-02.jpg",
        createdAt: new Date("2025-03-02"),

        status: "Active",
        Book_id: "Book 1"
    },
    {
        id: 3,

        name: "Section 3",
        image: "/images/product/product-03.jpg",
        createdAt: new Date("2025-04-10"),

        status: "Active",
        Book_id: "Book 2"
    },
    {
        id: 1,

        name: "Section 1",
        image: "/images/product/product-01.jpg",
        createdAt: new Date("2025-03-02"),

        status: "Active",
        Book_id: "Book 2"
    },
    {
        id: 2,

        name: "Section 2",
        image: "/images/product/product-02.jpg",
        createdAt: new Date("2025-03-02"),

        status: "Active",
        Book_id: "Book 2"
    },
    {
        id: 3,

        name: "Section 3",
        image: "/images/product/product-03.jpg",
        createdAt: new Date("2025-04-10"),

        status: "Active",
        Book_id: "Book 1"
    },
    {
        id: 1,

        name: "Section 1",
        image: "/images/product/product-01.jpg",
        createdAt: new Date("2025-03-02"),

        status: "Active",
        Book_id: "Book 2"
    },
    {
        id: 2,

        name: "Section 2",
        image: "/images/product/product-02.jpg",
        createdAt: new Date("2025-03-02"),

        status: "Active",
        Book_id: "Book 2"
    },
    {
        id: 3,

        name: "Section 3",
        image: "/images/product/product-03.jpg",
        createdAt: new Date("2025-04-10"),

        status: "Cancel",
        Book_id: "Book 1"
    },
];

export default function SectionsTable(
    { data, books, refetch }: {
        data: SectionItemProps[],
        books: any[]
        refetch: () => Promise<void>
      }
) {
    const [tableData, settableData] = useState<SectionItemProps[]>(data);

    const { isOpen, openModal, closeModal } = useModal();
    const { isOpen: isDeleteConfirmOpen, openModal: openDeleteConfirmModal, closeModal: closeDeleteConfirmModal } = useModal();
    const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
    const handleAdding = () => {
        // Handle save logic here

        console.log("handleAdding...");

        closeModal();
        setSection(emptySection);
    };
    let emptySection: Section = {
        name: "",
        image: "",
    

    };
    let [Section, setSection] = useState<Section>(emptySection);

    const options = [
        { value: "5", label: "5" },
        { value: "10", label: "10" },
        { value: "20", label: "20" },
    ];
    let [optionValue, setoptionValue] = useState("5");

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setoptionValue(e.target.value);
    };

    // Pationation

    const [currentPage, setCurrentPage] = useState(1);
    const maxPage = Math.ceil(tableData.length / +optionValue);

    const startIndex = (currentPage - 1) * +optionValue;
    const endIndex = startIndex + +optionValue;
    let currentItems: SectionItemProps[] = tableData.slice(startIndex, endIndex);

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



    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            console.log("Selected file:", file.name);
        }
    };




    const Book_options = [
        { value: "Hamma kitoblar", label: "Hamma kitoblar" },
       ...books
    ];



    let [BookoptionValue, setBookoptionValue] = useState("Hamma kitoblar");



    const handleSelectBookChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setBookoptionValue(e.target.value);
    };

    let deleteSection= async(id:number | undefined)=>{
        try {
          const res = await axiosClient.delete(`/section/${id}`);
          
          toast.success("Section muvaffaqiyatli o'chirildi");
          await refetch();
    
        } catch (error) {
          console.error('Delete Section error:', error);
          toast.error('Xatolik yuz berdi');
        }
      }
  


      let editSection = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
    
        try {
          
       
    
    
          const res = await axiosClient.put(`/section/${Section.id}`, {
            "name" : Section.name ?? "" ,
            "book_id" : `${Section.book_id}`
          },);
    
    
          toast.success('Section muvaffaqiyatli yaratildi');
          await refetch();
    
        } catch (error) {
          console.error('Create Section error:', error);
          toast.error('Xatolik yuz berdi');
    
        } finally {
          closeModal();
        }
      };

    useEffect(() => {
        setCurrentPage(1);
        if (BookoptionValue == "Hamma kitoblar") {
            settableData(data);
        } else {
            settableData(data.filter((item) => item.book_id === +BookoptionValue));
        }
    }, [optionValue, BookoptionValue]);

  useEffect(() => {
    
  setCurrentPage(1);
  settableData(data)
   
  }, [data])
  

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
                                Bo'limlar
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
                                Kitob
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
                                <TableCell className="px-5 py-4 sm:px-6 text-start">
                                    <div className="flex items-center gap-3">
                                        {/* <div className="w-10 h-10 overflow-hidden rounded-sm ">
                                            <img
                                                width={40}
                                                height={40}
                                                src={order.image}
                                                alt={order.name}
                                            />
                                        </div> */}
                                        <div>
                                            <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                                {order.name}
                                            </span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                    {Moment(order.createdt).format("MMMM DD, yyyy")}
                                </TableCell>

                                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                    {order.book && order.book.name}
                                </TableCell>

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
                                                setSection({
                                                    name: order.name,
                                                    book_id : order.book_id,
                                                    id : order.id,
                                                });
                                                openModal();
                                            }}
                                            className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 transition-colors group"
                                            title="Tahrirlash"
                                        >
                                            <PencilIcon className="w-5 h-5 fill-blue-600 dark:fill-blue-400 group-hover:scale-110 transition-transform"></PencilIcon>
                                        </button>

                                        <button
                                            onClick={() => {
                                              setPendingDeleteId(order.id!);
                                              openDeleteConfirmModal();
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
                {(currentPage - 1) * +optionValue + 1} dan  {" "}
          {Math.min(tableData.length, currentPage * +optionValue)}  gacha, {" "}
          {tableData.length}  
                </div>
            </div>

            <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
                <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
                    <div className="px-2 pr-14">
                        <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                            Edit Section
                        </h4>
                        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
                            Update Section with full details.
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
                                    <Label>Name</Label>
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
                            <Button size="sm" onClick={editSection}>
                                Saqlash
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal isOpen={isDeleteConfirmOpen} onClose={closeDeleteConfirmModal} className="max-w-[400px] m-4">
                <div className="relative w-full p-6 bg-white rounded-3xl dark:bg-gray-900">
                    <h4 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white/90">
                        Bo'limni o'chirishni tasdiqlaysizmi?
                    </h4>
                    <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                        Bu bo'lim va unga tegishli barcha ma'lumotlar o'chiriladi. Bu amalni qaytarib bo'lmaydi.
                    </p>
                    <div className="flex items-center gap-3 justify-end">
                        <Button variant="outline" onClick={closeDeleteConfirmModal}>
                            Bekor qilish
                        </Button>
                        <Button
                            variant="primary"
                            onClick={() => {
                                if (pendingDeleteId) {
                                    deleteSection(pendingDeleteId);
                                    setPendingDeleteId(null);
                                }
                                closeDeleteConfirmModal();
                            }}
                        >
                            Ha, o'chirish
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
