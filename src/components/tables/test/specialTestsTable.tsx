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
  DeleteIcon,
  DownloadIcon,
  PencilIcon,
} from "../../../icons";
import { useEffect, useState } from "react";
import { useModal } from "../../../hooks/useModal";
import Input from "../../form/input/InputField";
import Label from "../../form/Label";
import { Modal } from "../../ui/modal";
import Select from "../../form/Select";
import { toast } from "react-toastify";
import ConfirmDeleteModal from "../../ui/ConfirmDeleteModal";
import axiosClient from "../../../service/axios.service";
import Pagination from "../../ui/pagination/Pagination";

interface SpecialTestItemProps {
  id: number;
  name: string;
  activationTime: string;
  startTime: string;
  endTime: string;
  duration: number;
  groupIds: number[];
  status: string;
  createdAt?: string;
}

export default function SpecialTestsTable({
  data,
  refetch,
}: {
  data: SpecialTestItemProps[];
  refetch: () => Promise<void>;
}) {
  const [tableData, setTableData] = useState(data);
  const [groups, setGroups] = useState<{ id: number; name: string }[]>([]);

  // API dan guruhlarni yuklash
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await axiosClient.get('/group/all');
        setGroups(response.data || []);
      } catch (error) {
        console.error('Guruhlarni yuklashda xatolik:', error);
      }
    };

    fetchGroups();
  }, []);

  const { isOpen, openModal, closeModal } = useModal();
  const { isOpen: isDeleteModalOpen, openModal: openDeleteModal, closeModal: closeDeleteModal } = useModal();
  const [deletingTest, setDeletingTest] = useState<{ id: number; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [name, setName] = useState("");
  const [editId, setEditId] = useState<number | undefined>();
  const [activationTime, setActivationTime] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [duration, setDuration] = useState<number>(60);

  const editSpecialTest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      // Mock update - in real app this would call backend
      console.log('Updating test:', editId, { name, activationTime, startTime, endTime, duration });
      toast.success('Maxsus test yangilandi');
      await refetch();
    } catch (error) {
      console.error('Update Special Test error:', error);
      toast.error('Xatolik yuz berdi');
    } finally {
      closeModal();
    }
  };

  const options = [
    { value: "5", label: "5" },
    { value: "10", label: "10" },
    { value: "20", label: "20" },
  ];
  const [optionValue, setOptionValue] = useState("5");

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setOptionValue(e.target.value);
  };

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setTableData(data);
    setCurrentPage(1);
  }, [data]);

  const maxPage = Math.ceil(tableData.length / +optionValue);

  const startIndex = (currentPage - 1) * +optionValue;
  const endIndex = startIndex + +optionValue;
  const currentItems: SpecialTestItemProps[] = tableData.slice(startIndex, endIndex);

  // Guruh ID laridan guruh nomlarini olish
  const getGroupNames = (groupIds: number[]) => {
    if (!groups.length) return `${groupIds.length} guruh`;
    
    const groupNames = groupIds
      .map(id => groups.find(g => g.id === id)?.name)
      .filter(Boolean)
      .join(", ");
    
    return groupNames || `${groupIds.length} guruh`;
  };

  const goToPreviousPage = () => {
    setCurrentPage((page) => Math.max(page - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage((page) => Math.min(page + 1, maxPage));
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [optionValue]);

  const handleDeleteClick = (testId: number, testName: string) => () => {
    setDeletingTest({ id: testId, name: testName });
    openDeleteModal();
  };

  const handleConfirmDelete = async () => {
    if (!deletingTest) return;

    setIsDeleting(true);
    try {
      // Mock delete - in real app this would call backend
      console.log('Deleting test:', deletingTest.id);
      toast.success("Maxsus test o'chirildi");
      await refetch();
      closeDeleteModal();
      setDeletingTest(null);
    } catch (error) {
      console.error('Delete Special Test error:', error);
      toast.error('Xatolik yuz berdi');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3">
      <div className="max-w-full overflow-x-auto">
        <div className="px-5 py-3 flex flex-row justify-between items-center border-b border-gray-100 dark:border-white/5">
          <div className="flex flex-row items-center gap-2 text-theme-sm font-medium text-gray-500 text-start dark:text-gray-400">
            <Select
              options={options}
              onChange={handleSelectChange}
              className="dark:bg-dark-900"
              defaultValue="5"
            />
            <span>Ko'rsatish</span>
          </div>
          <div>
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
          <TableHeader className="border-b border-gray-100 dark:border-white/5">
            <TableRow>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Test nomi
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Aktivatsiya vaqti
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Boshlanish / Tugash
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Davomiyligi
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Guruhlar
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

          <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
            {currentItems.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="px-5 py-4 sm:px-6 text-start">
                  <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                    {item.name}
                  </span>
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {Moment(item.activationTime).format("MMM DD, yyyy HH:mm")}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {Moment(item.startTime).format("MMM DD, HH:mm")}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-500">
                      {Moment(item.endTime).format("MMM DD, HH:mm")}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {item.duration} min
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {getGroupNames(item.groupIds)}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  <Badge
                    size="sm"
                    color={
                      item.status === "active"
                        ? "success"
                        : item.status === "completed"
                        ? "info"
                        : "warning"
                    }
                  >
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  <div className="flex gap-2 flex-row items-center">
                    <button
                      onClick={() => {
                        setName(item.name);
                        setEditId(item.id);
                        setActivationTime(item.activationTime);
                        setStartTime(item.startTime);
                        setEndTime(item.endTime);
                        setDuration(item.duration);
                        openModal();
                      }}
                      className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 transition-colors group"
                      title="Tahrirlash"
                    >
                      <PencilIcon className="w-5 h-5 fill-blue-600 dark:fill-blue-400 group-hover:scale-110 transition-transform" />
                    </button>

                    <button
                      onClick={handleDeleteClick(item.id, item.name)}
                      className="p-2 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 transition-colors group"
                      title="O'chirish"
                    >
                      <DeleteIcon className="text-xl fill-red-600 dark:fill-red-400 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="px-5 py-3 gap-3 flex flex-col md:flex-row justify-between md:items-center border-t border-gray-100 dark:border-white/5 text-theme-sm font-medium text-gray-500 dark:text-gray-400">
        <Pagination
          currentPage={currentPage}
          totalPages={maxPage}
          onPageChange={setCurrentPage}
        />
        <div>
          {(currentPage - 1) * +optionValue + 1} dan{" "}
          {Math.min(tableData.length, currentPage * +optionValue)} gacha, {tableData.length}
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Maxsus testni o'zgartirish
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Test ma'lumotlarini yangilash
            </p>
          </div>
          <form className="flex flex-col" onSubmit={editSpecialTest}>
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5">
                <div>
                  <Label>Test nomi</Label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Test ko'rinadigan vaqt (Aktivatsiya)</Label>
                  <Input
                    type="datetime-local"
                    value={activationTime}
                    onChange={(e) => setActivationTime(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Boshlanish vaqti</Label>
                    <Input
                      type="datetime-local"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Tugash vaqti</Label>
                    <Input
                      type="datetime-local"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label>Davomiyligi (daqiqa)</Label>
                  <Input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal} type="button">
                Yopish
              </Button>
              <Button size="sm" type="submit">
                Saqlash
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
        title="Maxsus testni o'chirish"
        message="Ushbu maxsus testni o'chirmoqchimisiz?"
        itemName={deletingTest?.name}
        isLoading={isDeleting}
      />
    </div>
  );
}
