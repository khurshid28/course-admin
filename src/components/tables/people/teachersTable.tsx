import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";

import Badge from "../../ui/badge/Badge";
import Button from "../../ui/button/Button";
import {
  DeleteIcon,
  PencilIcon,
  EyeIcon,
  UserIcon,
  VideoIcon,
} from "../../../icons";
import { useState } from "react";
import { Teacher } from "../../../pages/People/Teachers";
import Pagination from "../../common/Pagination";
import { getImageUrl } from "../../../service/axios.service";

interface TeachersTableProps {
  data: Teacher[];
  refetch: () => void;
  onView: (teacher: Teacher) => void;
  onEdit: (teacher: Teacher) => void;
  onDelete: (id: number) => void;
}

export default function TeachersTable({ data, refetch, onView, onEdit, onDelete }: TeachersTableProps) {
  const [tableData, setTableData] = useState<Teacher[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Update local state when data changes
  useState(() => {
    if (data) {
      setTableData(data);
    }
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = tableData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(tableData.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell className="text-left">O'qituvchi</TableCell>
              <TableCell className="text-left">Telefon</TableCell>
              <TableCell className="text-left">Email</TableCell>
              <TableCell className="text-left">Kurslar / Studentlar</TableCell>
              <TableCell className="text-left">Qo'shilgan</TableCell>
              <TableCell className="text-left">Status</TableCell>
              <TableCell className="text-center">Amallar</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.map((teacher) => (
              <TableRow key={teacher.id} className="h-20">
                <TableCell className="text-left py-4">
                  <div className="flex items-center gap-3">
                    <div className="size-10 shrink-0 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      {teacher.image ? (
                        <img
                          src={getImageUrl(teacher.image) || '/images/user/user-17.jpg'}
                          alt={teacher.firstName}
                          className="size-full object-cover"
                          onError={(e) => {
                            console.log('Teacher image load failed:', teacher.image, 'Full URL:', getImageUrl(teacher.image));
                            const target = e.currentTarget;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = '';
                              const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                              svg.setAttribute('class', 'size-6 fill-gray-400 dark:fill-gray-500');
                              svg.setAttribute('viewBox', '0 0 24 24');
                              svg.innerHTML = '<path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>';
                              parent.appendChild(svg);
                            }
                          }}
                        />
                      ) : (
                        <UserIcon className="size-6 fill-gray-400 dark:fill-gray-500" />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <p className="text-sm font-semibold text-gray-800 dark:text-white">
                        {teacher.firstName} {teacher.lastName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        ID: #{teacher.id}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-left py-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {teacher.phone}
                  </span>
                </TableCell>
                <TableCell className="text-left py-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {teacher.email || '-'}
                  </span>
                </TableCell>
                <TableCell className="text-left py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <VideoIcon className="size-4 fill-blue-600 dark:fill-blue-400" />
                      <span className="text-sm font-medium text-gray-800 dark:text-white">
                        {teacher._count?.courses || 0}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <UserIcon className="size-4 fill-green-600 dark:fill-green-400" />
                      <span className="text-sm font-medium text-gray-800 dark:text-white">
                        {teacher.totalStudents || 0}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-left py-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {teacher.createdAt ? new Date(teacher.createdAt).toLocaleDateString('uz-UZ') : '-'}
                  </span>
                </TableCell>
                <TableCell className="text-left py-4">
                  <div className="inline-flex">
                    <Badge size="sm" color="success">
                      Faol
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="text-center py-4">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      size="mini"
                      variant="outline"
                      onClick={() => onView(teacher)}
                    >
                      <EyeIcon className="size-4 fill-black dark:fill-white" />
                    </Button>
                    <Button
                      size="mini"
                      variant="outline"
                      onClick={() => onEdit(teacher)}
                    >
                      <PencilIcon className="size-4 fill-black dark:fill-white" />
                    </Button>
                    <Button
                      size="mini"
                      variant="outline"
                      onClick={() => teacher.id && onDelete(teacher.id)}
                    >
                      <DeleteIcon className="size-4 fill-black dark:fill-white" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </>
  );
}
