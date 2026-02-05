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
import { Student } from "../../../pages/People/Students";
import { useModal } from "../../../hooks/useModal";
import Input from "../../form/input/InputField";
import Label from "../../form/Label";
import { Modal } from "../../ui/modal";
import Select from "../../form/Select";
import FileInput from "../../form/input/FileInput";
import { toast } from "react-toastify";
import axiosClient from "../../../service/axios.service";
import Pagination from "../../common/Pagination";

interface Order {
  id: number;
  user: {
    image: string;
    name: string;
    phone: string;
    password: string;
  };
  createdAt: Date;
  team: {
    images: string[];
  };
  status: string;
  showPassword: boolean;
}

// Define the table data using the interface
// const statictableData: Order[] = [
//   {
//     id: 1,
//     user: {
//       image: "/images/user/user-17.jpg",
//       name: "Xurshid Ismoilov",
//       phone: "+998(95)064-28-27",
//       password: "11223344",
//     },
//     showPassword: false,
//     createdAt: new Date("2025-01-04"),
//     team: {
//       images: [
//         "/images/user/user-22.jpg",
//         "/images/user/user-23.jpg",
//         "/images/user/user-24.jpg",
//       ],
//     },
//     status: "Active",
//   },
//   {
//     id: 2,
//     user: {
//       image: "/images/user/user-18.jpg",
//       name: "Kaiya George",
//       phone: "+998(95)064-28-27",
//       password: "66223344",
//     },
//     createdAt: new Date("2025-02-15"),
//     showPassword: false,
//     team: {
//       images: ["/images/user/user-25.jpg", "/images/user/user-26.jpg"],
//     },
//     status: "Pending",
//   },
//   {
//     id: 3,
//     user: {
//       image: "/images/user/user-17.jpg",
//       name: "Zain Geidt",
//       phone: "+998(95)064-28-27",
//       password: "44662244",
//     },
//     showPassword: false,
//     createdAt: new Date("2025-02-16"),
//     team: {
//       images: ["/images/user/user-27.jpg"],
//     },
//     status: "Active",
//   },
//   {
//     id: 4,
//     user: {
//       image: "/images/user/user-20.jpg",
//       name: "Abram Schleifer",
//       phone: "+998(95)064-28-27",
//       password: "44662244",
//     },
//     showPassword: false,
//     createdAt: new Date("2025-03-02"),
//     team: {
//       images: [
//         "/images/user/user-28.jpg",
//         "/images/user/user-29.jpg",
//         "/images/user/user-30.jpg",
//       ],
//     },
//     status: "Cancel",
//   },
//   {
//     id: 5,
//     user: {
//       image: "/images/user/user-21.jpg",
//       name: "Carla George",
//       phone: "+998(95)064-28-27",
//       password: "44662244",
//     },
//     createdAt: new Date("2025-03-02"),
//     team: {
//       images: [
//         "/images/user/user-31.jpg",
//         "/images/user/user-32.jpg",
//         "/images/user/user-33.jpg",
//       ],
//     },
//     status: "Active",
//     showPassword: false,
//   },
//   {
//     id: 5,
//     user: {
//       image: "/images/user/user-21.jpg",
//       name: "Carla George",
//       phone: "+998(95)064-28-27",
//       password: "44662244",
//     },
//     createdAt: new Date("2025-03-02"),
//     team: {
//       images: [
//         "/images/user/user-31.jpg",
//         "/images/user/user-32.jpg",
//         "/images/user/user-33.jpg",
//       ],
//     },
//     status: "Active",
//     showPassword: false,
//   },
//   {
//     id: 5,
//     user: {
//       image: "/images/user/user-21.jpg",
//       name: "Carla George",
//       phone: "+998(95)064-28-27",
//       password: "44662244",
//     },
//     createdAt: new Date("2025-03-02"),
//     team: {
//       images: [
//         "/images/user/user-31.jpg",
//         "/images/user/user-32.jpg",
//         "/images/user/user-33.jpg",
//       ],
//     },
//     status: "Active",
//     showPassword: false,
//   },
//   {
//     id: 5,
//     user: {
//       image: "/images/user/user-21.jpg",
//       name: "Carla George",
//       phone: "+998(95)064-28-27",
//       password: "44662244",
//     },
//     createdAt: new Date("2025-03-02"),
//     team: {
//       images: [
//         "/images/user/user-31.jpg",
//         "/images/user/user-32.jpg",
//         "/images/user/user-33.jpg",
//       ],
//     },
//     status: "Active",
//     showPassword: false,
//   },
//   {
//     id: 5,
//     user: {
//       image: "/images/user/user-21.jpg",
//       name: "Carla George",
//       phone: "+998(95)064-28-27",
//       password: "44662244",
//     },
//     createdAt: new Date("2025-03-02"),
//     team: {
//       images: [
//         "/images/user/user-31.jpg",
//         "/images/user/user-32.jpg",
//         "/images/user/user-33.jpg",
//       ],
//     },
//     status: "Active",
//     showPassword: false,
//   },
//   {
//     id: 5,
//     user: {
//       image: "/images/user/user-21.jpg",
//       name: "Carla George",
//       phone: "+998(95)064-28-27",
//       password: "44662244",
//     },
//     createdAt: new Date("2025-03-02"),
//     team: {
//       images: [
//         "/images/user/user-31.jpg",
//         "/images/user/user-32.jpg",
//         "/images/user/user-33.jpg",
//       ],
//     },
//     status: "Active",
//     showPassword: false,
//   },

//   {
//     id: 5,
//     user: {
//       image: "/images/user/user-21.jpg",
//       name: "Carla George",
//       phone: "+998(95)064-28-27",
//       password: "44662244",
//     },
//     createdAt: new Date("2025-03-02"),
//     team: {
//       images: [
//         "/images/user/user-31.jpg",
//         "/images/user/user-32.jpg",
//         "/images/user/user-33.jpg",
//       ],
//     },
//     status: "Active",
//     showPassword: false,
//   },
//   {
//     id: 5,
//     user: {
//       image: "/images/user/user-21.jpg",
//       name: "Carla George",
//       phone: "+998(95)064-28-27",
//       password: "44662244",
//     },
//     createdAt: new Date("2025-03-02"),
//     team: {
//       images: [
//         "/images/user/user-31.jpg",
//         "/images/user/user-32.jpg",
//         "/images/user/user-33.jpg",
//       ],
//     },
//     status: "Active",
//     showPassword: false,
//   },
//   {
//     id: 1,
//     user: {
//       image: "/images/user/user-17.jpg",
//       name: "Xurshid Ismoilov",
//       phone: "+998(95)064-28-27",
//       password: "11223344",
//     },
//     showPassword: false,
//     createdAt: new Date("2025-01-04"),
//     team: {
//       images: [
//         "/images/user/user-22.jpg",
//         "/images/user/user-23.jpg",
//         "/images/user/user-24.jpg",
//       ],
//     },
//     status: "Active",
//   },
//   {
//     id: 2,
//     user: {
//       image: "/images/user/user-18.jpg",
//       name: "Kaiya George",
//       phone: "+998(95)064-28-27",
//       password: "66223344",
//     },
//     createdAt: new Date("2025-02-15"),
//     showPassword: false,
//     team: {
//       images: ["/images/user/user-25.jpg", "/images/user/user-26.jpg"],
//     },
//     status: "Pending",
//   },
//   {
//     id: 3,
//     user: {
//       image: "/images/user/user-17.jpg",
//       name: "Zain Geidt",
//       phone: "+998(95)064-28-27",
//       password: "44662244",
//     },
//     showPassword: false,
//     createdAt: new Date("2025-02-16"),
//     team: {
//       images: ["/images/user/user-27.jpg"],
//     },
//     status: "Active",
//   },
//   {
//     id: 4,
//     user: {
//       image: "/images/user/user-20.jpg",
//       name: "Abram Schleifer",
//       phone: "+998(95)064-28-27",
//       password: "44662244",
//     },
//     showPassword: false,
//     createdAt: new Date("2025-03-02"),
//     team: {
//       images: [
//         "/images/user/user-28.jpg",
//         "/images/user/user-29.jpg",
//         "/images/user/user-30.jpg",
//       ],
//     },
//     status: "Cancel",
//   },
//   {
//     id: 5,
//     user: {
//       image: "/images/user/user-21.jpg",
//       name: "Carla George",
//       phone: "+998(95)064-28-27",
//       password: "44662244",
//     },
//     createdAt: new Date("2025-03-02"),
//     team: {
//       images: [
//         "/images/user/user-31.jpg",
//         "/images/user/user-32.jpg",
//         "/images/user/user-33.jpg",
//       ],
//     },
//     status: "Active",
//     showPassword: false,
//   },
//   {
//     id: 1,
//     user: {
//       image: "/images/user/user-17.jpg",
//       name: "Xurshid Ismoilov",
//       phone: "+998(95)064-28-27",
//       password: "11223344",
//     },
//     showPassword: false,
//     createdAt: new Date("2025-01-04"),
//     team: {
//       images: [
//         "/images/user/user-22.jpg",
//         "/images/user/user-23.jpg",
//         "/images/user/user-24.jpg",
//       ],
//     },
//     status: "Active",
//   },
//   {
//     id: 2,
//     user: {
//       image: "/images/user/user-18.jpg",
//       name: "Kaiya George",
//       phone: "+998(95)064-28-27",
//       password: "66223344",
//     },
//     createdAt: new Date("2025-02-15"),
//     showPassword: false,
//     team: {
//       images: ["/images/user/user-25.jpg", "/images/user/user-26.jpg"],
//     },
//     status: "Pending",
//   },
//   {
//     id: 3,
//     user: {
//       image: "/images/user/user-17.jpg",
//       name: "Zain Geidt",
//       phone: "+998(95)064-28-27",
//       password: "44662244",
//     },
//     showPassword: false,
//     createdAt: new Date("2025-02-16"),
//     team: {
//       images: ["/images/user/user-27.jpg"],
//     },
//     status: "Active",
//   },
//   {
//     id: 4,
//     user: {
//       image: "/images/user/user-20.jpg",
//       name: "Abram Schleifer",
//       phone: "+998(95)064-28-27",
//       password: "44662244",
//     },
//     showPassword: false,
//     createdAt: new Date("2025-03-02"),
//     team: {
//       images: [
//         "/images/user/user-28.jpg",
//         "/images/user/user-29.jpg",
//         "/images/user/user-30.jpg",
//       ],
//     },
//     status: "Cancel",
//   },
//   {
//     id: 5,
//     user: {
//       image: "/images/user/user-21.jpg",
//       name: "Carla George",
//       phone: "+998(95)064-28-27",
//       password: "44662244",
//     },
//     createdAt: new Date("2025-03-02"),
//     team: {
//       images: [
//         "/images/user/user-31.jpg",
//         "/images/user/user-32.jpg",
//         "/images/user/user-33.jpg",
//       ],
//     },
//     status: "Active",
//     showPassword: false,
//   },
//   {
//     id: 1,
//     user: {
//       image: "/images/user/user-17.jpg",
//       name: "Xurshid Ismoilov",
//       phone: "+998(95)064-28-27",
//       password: "11223344",
//     },
//     showPassword: false,
//     createdAt: new Date("2025-01-04"),
//     team: {
//       images: [
//         "/images/user/user-22.jpg",
//         "/images/user/user-23.jpg",
//         "/images/user/user-24.jpg",
//       ],
//     },
//     status: "Active",
//   },
//   {
//     id: 2,
//     user: {
//       image: "/images/user/user-18.jpg",
//       name: "Kaiya George",
//       phone: "+998(95)064-28-27",
//       password: "66223344",
//     },
//     createdAt: new Date("2025-02-15"),
//     showPassword: false,
//     team: {
//       images: ["/images/user/user-25.jpg", "/images/user/user-26.jpg"],
//     },
//     status: "Pending",
//   },
//   {
//     id: 3,
//     user: {
//       image: "/images/user/user-17.jpg",
//       name: "Zain Geidt",
//       phone: "+998(95)064-28-27",
//       password: "44662244",
//     },
//     showPassword: false,
//     createdAt: new Date("2025-02-16"),
//     team: {
//       images: ["/images/user/user-27.jpg"],
//     },
//     status: "Active",
//   },
//   {
//     id: 4,
//     user: {
//       image: "/images/user/user-20.jpg",
//       name: "Abram Schleifer",
//       phone: "+998(95)064-28-27",
//       password: "44662244",
//     },
//     showPassword: false,
//     createdAt: new Date("2025-03-02"),
//     team: {
//       images: [
//         "/images/user/user-28.jpg",
//         "/images/user/user-29.jpg",
//         "/images/user/user-30.jpg",
//       ],
//     },
//     status: "Cancel",
//   },
//   {
//     id: 5,
//     user: {
//       image: "/images/user/user-21.jpg",
//       name: "Carla George",
//       phone: "+998(95)064-28-27",
//       password: "44662244",
//     },
//     createdAt: new Date("2025-03-02"),
//     team: {
//       images: [
//         "/images/user/user-31.jpg",
//         "/images/user/user-32.jpg",
//         "/images/user/user-33.jpg",
//       ],
//     },
//     status: "Active",
//     showPassword: false,
//   },
// ];

interface StudentItemProps {

  id: number;
  name: string;
  phone: string;
  password: string;
  createdt: string;
  showPassword?: boolean
  group_id?: number;
  group? : {
    id: number;
    name: string;
  }

}

export default function StudentsTable({ data, groups, refetch, onEdit, onDelete }: {
  data: StudentItemProps[],
  groups: any[]
  refetch: () => Promise<void>
  onEdit: (student: Student) => void
  onDelete: (id: number) => void
}) {

  const [tableData, settableData] = useState<StudentItemProps[]>(data);
  const { isOpen, openModal, closeModal } = useModal();
  const { isOpen: isDeleteConfirmOpen, openModal: openDeleteConfirmModal, closeModal: closeDeleteConfirmModal } = useModal();
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  let emptyStudent: Student = {
    name: "",
    phone: "",
    password: "",
  };
  let [Student, setStudent] = useState<Student>(emptyStudent);
  function setShowPassword(id: number) {

    settableData(
      tableData.map((e) => {
        if (e.id == id) {
          if (e.showPassword != undefined) {
            e.showPassword = !e.showPassword;
          } else {
            e.showPassword = false;
          }
        }
        return e;
      })
    );
  }
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log("Selected file:", file.name);
    }
  };

  const options = [
    { value: "5", label: "5" },
    { value: "10", label: "10" },
    { value: "20", label: "20" },
  ];
  let [optionValue, setoptionValue] = useState("5");




  const handleSelectChange = (value: string) => {
    setoptionValue(value);
  };
  // const handleSelectGroupChange = (value: string) => {

  // };

  // Pationation

  const [currentPage, setCurrentPage] = useState(1);
  const maxPage = Math.ceil(tableData.length / +optionValue);

  const startIndex = (currentPage - 1) * +optionValue;
  const endIndex = startIndex + +optionValue;
  let currentItems: StudentItemProps[] = tableData.slice(startIndex, endIndex);

  const goToPreviousPage = () => {
    setCurrentPage((page) => Math.max(page - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage((page) => Math.min(page + 1, maxPage));
  };
  // console.log(">> data length :", data.length);

  useEffect(() => {
    const startIndex = (currentPage - 1) * +optionValue;
    const endIndex = startIndex + +optionValue;
    currentItems = tableData.slice(startIndex, endIndex);
    console.log("table data changed");

  }, [currentPage, tableData]);

  useEffect(() => {
    setCurrentPage(1);
    settableData(data);
  }, [optionValue, data]);



  let editStudent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {

      const res = await axiosClient.put(`/student/${Student.id}`, {
        name: Student.name,
        group_id: Student.group_id,
        phone: Student.phone,
        password: Student.password
      });


      toast.success('Student muvaffaqiyatli saqlandi');

      await refetch();

    } catch (error) {
      console.error('Edit Student error:', error);
      toast.error('Xatolik yuz berdi');

    } finally {
      closeModal();
    }
  };

  let deleteStudent= async(id:number | undefined)=>{
   
    try {
      const res = await axiosClient.delete(`/student/${id}`);
      
      toast.success("Guruh muvaffaqiyatli o'chirildi");
      await refetch();

    } catch (error) {
      console.error('Delete Group error:', error);
      toast.error('Xatolik yuz berdi');

    }
  }

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
          <div>
            {" "}
            <Button
              size="sm"
              variant="outline"
              endIcon={<DownloadIcon className="size-5 fill-white" />}
            >
              Yuklab olish
            </Button>
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
                Studentlar
              </TableCell>

              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Guruh
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
                Parol
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
                    {/* <div className="w-10 h-10 overflow-hidden rounded-full">
                        <img
                          width={40}
                          height={40}
                          src={order.user.image}
                          alt={order.user.name}
                        />
                      </div> */}
                    <div>
                      <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {order.name}
                      </span>
                      <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                        {order.phone}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {order.group?.name}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {Moment(order.createdt).format("MMMM DD, yyyy")}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 flex gap-2  flex-row items-center">
                  {order.showPassword ? order.password : "✷✷✷✷✷"}{" "}
                  <Button
                    size="mini"
                    variant="outline"
                    onClick={() => setShowPassword(order.id)}
                  >
                    <span className="">
                      {order.showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 " />
                      )}
                    </span>
                  </Button>
                  <Button
                    size="mini"
                    variant="outline"
                    onClick={async () => {
                      await navigator.clipboard.writeText(
                        `${order.phone}\n${order.password}`
                      );
                    }}
                  >
                    <CopyIcon></CopyIcon>
                  </Button>
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
                    {"Active"}
                  </Badge>
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 flex gap-2  flex-row items-center">
                  <button
                    onClick={() => {
                      // Navigate to results page for this student
                      window.location.href = `/results?student_id=${order.id}`;
                    }}
                    className="p-2 rounded-lg bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40 transition-colors group"
                    title="Natijalarni ko'rish"
                  >
                    <EyeIcon className="w-5 h-5 fill-green-600 dark:fill-green-400 group-hover:scale-110 transition-transform"></EyeIcon>
                  </button>
                  
                  <button
                    onClick={() => {
                      onEdit({
                        id: order.id,
                        name: order.name,
                        password: order.password,
                        phone: order.phone,
                        group_id: order.group_id
                      });
                    }}
                    className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 transition-colors group"
                    title="Tahrirlash"
                  >
                    <PencilIcon className="w-5 h-5 fill-blue-600 dark:fill-blue-400 group-hover:scale-110 transition-transform"></PencilIcon>
                  </button>

                  <button
                    onClick={() => {
                      setPendingDeleteId(order.id);
                      openDeleteConfirmModal();
                    }}
                    className="p-2 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 transition-colors group"
                    title="O'chirish"
                  >
                    <DeleteIcon className="w-5 h-5 fill-red-600 dark:fill-red-400 group-hover:scale-110 transition-transform"></DeleteIcon>
                  </button>
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
          className="flex-1"
        />
        <div className="text-center md:text-right">
          {(currentPage - 1) * +optionValue + 1} dan {" "}
          {Math.min(tableData.length, currentPage * +optionValue)} gacha, {" "}
          {tableData.length} ta
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
               Studentni o'zgartirish
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Update Student with full details.
            </p>
          </div>
          <form className="flex flex-col">
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>Fullname</Label>
                  <Input
                    type="text"
                    value={Student.name}
                    onChange={(e) =>
                      setStudent({
                        ...Student,
                        name: e.target.value,
                      })
                    }
                  />
                </div>



                <div>
                  <Label>Phonenumber</Label>
                  <Input
                    type="text"
                    value={Student.phone}
                    onChange={(e) =>
                      setStudent({
                        ...Student,
                        phone: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label>Password</Label>
                  <Input
                    type="text"
                    value={Student.password}
                    onChange={(e) =>
                      setStudent({
                        ...Student,
                        password: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label>Group</Label>
                  <Select
                    options={groups}
                    onChange={(e) => {
                      setStudent({
                        ...Student,
                        group_id: +e
                      })
                    }}
                    className="dark:bg-dark-900"
                    defaultValue={ Student.group_id ? `${Student.group_id}` : undefined}

                  />
                </div>

                <div>
                  <Label>Image</Label>
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
              <Button size="sm" onClick={editStudent} >
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
            Talabani o'chirishni tasdiqlaysizmi?
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
            Bu talaba va unga tegishli barcha ma'lumotlar o'chiriladi. Bu amalni qaytarib bo'lmaydi.
          </p>
          <div className="flex items-center gap-3 justify-end">
            <Button variant="outline" onClick={closeDeleteConfirmModal}>
              Bekor qilish
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                if (pendingDeleteId) {
                  onDelete(pendingDeleteId);
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
