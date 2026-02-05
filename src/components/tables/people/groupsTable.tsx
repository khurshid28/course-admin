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
  CheckCircleIcon,
  CloseCircleIcon,
  TimeIcon,
} from "../../../icons";
import { useEffect, useState } from "react";
import { useModal } from "../../../hooks/useModal";
import Input from "../../form/input/InputField";
import Label from "../../form/Label";
import Switch from "../../form/switch/Switch";
import { Modal } from "../../ui/modal";
import Select from "../../form/Select";
import { Group } from "../../../pages/People/Groups";
import DropzoneComponent from "../../form/form-elements/DropZone";
import FileInputExample from "../../form/form-elements/FileInputExample";
import FileInput from "../../form/input/FileInput";
import { useFetchWithLoader } from "../../../hooks/useFetchWithLoader";
import axiosClient from "../../../service/axios.service";
import { toast } from "react-toastify";
import Pagination from "../../common/Pagination";

// interface Order {
//   id: number;
//   name: string;
//   image: string;
//   createdAt: Date;
//   status: string;
// }

// Define the table data using the interface

interface GroupItemProps {
  id: number;
  name: string;
  createdt: string;
  hasTime?: boolean;
  timeMinutes?: number;
  fullTime?: number;
  forceNextQuestion?: boolean;
}
export default function GroupsTable({
  data,
  refetch,
}: {
  data: GroupItemProps[];
  refetch: () => Promise<void>;
}) {
  const [tableData, settableData] = useState(data);

  const { isOpen, openModal, closeModal } = useModal();
  const { isOpen: isDeleteConfirmOpen, openModal: openDeleteConfirmModal, closeModal: closeDeleteConfirmModal } = useModal();
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  let [name, setName] = useState("");
  let [id, setId] = useState<number | undefined>();
  let [file, setFile] = useState<File | undefined>();
  let [hasTime, setHasTime] = useState<boolean>(false);
  let [timeMinutes, setTimeMinutes] = useState<number>(0);
  let [fullTime, setFullTime] = useState<number>(0);
  let [forceNextQuestion, setForceNextQuestion] = useState<boolean>(false);

  let editGroup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const payload = {
        name,
        hasTime,
        timeMinutes: hasTime ? timeMinutes : 0,
        fullTime: hasTime ? fullTime : 0,
        forceNextQuestion: hasTime && timeMinutes > 0 ? forceNextQuestion : false,
      };
      const res = await axiosClient.put(`/group/${id}`, payload);

      toast.success("Guruh muvaffaqiyatli yaratildi");
      await refetch();
    } catch (error) {
      console.error("Create Group error:", error);
      toast.error("Xatolik yuz berdi");
    } finally {
      closeModal();
    }
  };
  let emptyGroup: Group = {
    name: "",
    image: "",
  };
  let [group, setGroup] = useState<Group>(emptyGroup);

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
  useEffect(() => {
    console.log("changed page ");
    settableData(data);
    setCurrentPage(1);

    return () => {};
  }, [data]);
  const maxPage = Math.ceil(tableData.length / +optionValue);

  const startIndex = (currentPage - 1) * +optionValue;
  const endIndex = startIndex + +optionValue;
  let currentItems: GroupItemProps[] = tableData.slice(startIndex, endIndex);

  const goToPreviousPage = () => {
    setCurrentPage((page) => Math.max(page - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage((page) => Math.min(page + 1, maxPage));
  };

  useEffect(() => {
    const startIndex = (currentPage - 1) * +optionValue;
    const endIndex = startIndex + +optionValue;
    currentItems = tableData.slice(startIndex, endIndex);
  }, [currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [optionValue]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log("Selected file:", file.name);
      setFile(file);
    }
  };

  let deleteGroup = async (id: number) => {
    try {
      const res = await axiosClient.delete(`/group/${id}`);

      toast.success("Guruh muvaffaqiyatli o'chirildi");
      await refetch();
    } catch (error) {
      console.error("Delete Group error:", error);
      toast.error("Xatolik yuz berdi");
    }
  };
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3">
      <div className="max-w-full overflow-x-auto">
        <div className="px-5 py-3  flex flex-row justify-between items-center border-b border-gray-100 dark:border-white/5">
          <div className="flex flex-row items-center gap-2 text-theme-sm font-medium text-gray-500 text-start  dark:text-gray-400">
            {/* <span>Show</span> */}

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
                Status
              </TableCell>

              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Timer
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
                    <div>
                      <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {order.name}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {Moment(Date.parse(`${order.createdt}`)).format(
                    "MMMM DD, yyyy"
                  )}
                </TableCell>

                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  <Badge size="sm" color={"success"}>
                    {"Active"}
                  </Badge>
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    {order.hasTime && (
                      <>
                        <TimeIcon className="w-4 h-4 text-gray-500" />
                        <span className="text-theme-sm text-gray-500">
                          {order.timeMinutes && order.timeMinutes > 0
                            ? `${order.timeMinutes}s / Har bir savol uchun`
                            : order.fullTime && order.fullTime > 0
                            ? `${order.fullTime}s / To'liq test uchun`
                            : ""}
                        </span>
                      </>
                    )}
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  <div className="flex gap-2 flex-row items-center">
                    <button
                      onClick={() => {
                        setGroup({
                          name: order.name,
                          image: "",
                          hasTime: order.hasTime ?? false,
                          timeMinutes: order.timeMinutes ?? 0,
                          fullTime: order.fullTime ?? 0,
                          forceNextQuestion: order.forceNextQuestion ?? false,
                        });
                        setName(order.name);
                        setId(order.id);
                        setHasTime(order.hasTime ?? false);
                        setTimeMinutes(order.timeMinutes ?? 0);
                        setFullTime(order.fullTime ?? 0);
                        setForceNextQuestion(order.forceNextQuestion ?? false);
                        openModal();
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
          className="flex-1"
        />
        <div className="text-center md:text-right">
          {(currentPage - 1) * +optionValue + 1} dan{" "}
          {Math.min(tableData.length, currentPage * +optionValue)} gacha,{" "}
          {tableData.length} ta
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Guruhni o'zgartirish
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Update Group with full details.
            </p>
          </div>
          <form className="flex flex-col">
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>Name</Label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
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

            <div className="px-2 mt-4">
              <Label>Timer</Label>
              <div className="flex flex-col gap-3 mt-2">
                <div className="flex items-center">
                  <Switch
                    label="Timerni aktivlashtirish"
                    checked={hasTime}
                    onChange={(v) => {
                      setHasTime(v);
                      if (!v) {
                        setTimeMinutes(0);
                        setFullTime(0);
                      }
                    }}
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col">
                    <Label>Har bir savol uchun vaqt (sekund)</Label>
                    <div className="w-1/2">
                      <Input
                        type="number"
                        value={timeMinutes}
                        className="w-full"
                        disabled={!hasTime}
                        onChange={(e) => {
                          const v = Number(e.target.value || 0);
                          setTimeMinutes(v);
                          if (v > 0) {
                            setFullTime(0);
                          } else {
                            setForceNextQuestion(false);
                          }
                        }}
                      />
                    </div>
                    {timeMinutes > 0 && (
                      <div className="mt-2">
                        <Switch
                          label="Keyingi savolga o'tish majburiy"
                          checked={forceNextQuestion}
                          onChange={(v) => setForceNextQuestion(v)}
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <Label>To'liq test uchun vaqt (minut)</Label>
                    <div className="w-1/2">
                      <Input
                        type="number"
                        value={fullTime}
                        className="w-full"
                        disabled={!hasTime}
                        onChange={(e) => {
                          const v = Number(e.target.value || 0);
                          setFullTime(v);
                          if (v > 0) setTimeMinutes(0);
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Yopish
              </Button>
              <Button size="sm" onClick={editGroup}>
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
            Guruhni o'chirishni tasdiqlaysizmi?
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
            Bu guruh va unga tegishli barcha ma'lumotlar o'chiriladi. Bu amalni qaytarib bo'lmaydi.
          </p>
          <div className="flex items-center gap-3 justify-end">
            <Button variant="outline" onClick={closeDeleteConfirmModal}>
              Bekor qilish
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                if (pendingDeleteId) {
                  deleteGroup(pendingDeleteId);
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
