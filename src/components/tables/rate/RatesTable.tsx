import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";

import Badge from "../../ui/badge/Badge";
import { useEffect, useState } from "react";
import Button from "../../ui/button/Button";
import { ArrowRightIcon, DownloadIcon } from "../../../icons";
import Select from "../../form/Select";
import Pagination from "../../ui/pagination/Pagination";

import bookImage from "../../../../public/images/product/book.png"

// interface Order {
//   id: number;
//   user: {
//     image: string;
//     name: string;
//     phone: string;
//   };
//   group: string;
//   result_count: number;
//   status: string;
//   rate: number;
// }

// Define the table data using the interface
// const statictableData: Order[] = [
//   {
//     id: 1,
//     user: {
//       image: "/images/user/user-17.jpg",
//       name: "Xurshid Ismoilov",
//       phone: "+998(95)064-28-27",
//     },
//     group: "Group 1",
//     result_count: 12,
//     rate: 93.2,
//     status: "Active",
//   },
//   {
//     id: 2,
//     user: {
//       image: "/images/user/user-18.jpg",
//       name: "Kaiya George",
//       phone: "+998(95)064-28-27",
//     },
//     group: "Group 2",
//     result_count: 8,
//     rate: 84.7,
//     status: "Pending",
//   },
//   {
//     id: 3,
//     user: {
//       image: "/images/user/user-17.jpg",
//       name: "Zain Geidt",
//       phone: "+998(95)064-28-27",
//     },
//     group: "Group 2",
//     result_count: 8,
//     rate: 84.2,
//     status: "Active",
//   },
//   {
//     id: 4,
//     user: {
//       image: "/images/user/user-20.jpg",
//       name: "Abram Schleifer",
//       phone: "+998(95)064-28-27",
//     },
//     result_count: 2,
//     group: "Group 2",
//     rate: 78.0,
//     status: "Active",
//   },
//   {
//     id: 5,
//     user: {
//       image: "/images/user/user-21.jpg",
//       name: "Carla George",
//       phone: "+998(95)064-28-27",
//     },
//     group: "Group 1",
//     result_count: 4,
//     rate: 75.7,
//     status: "Active",
//   },
//   {
//     id: 5,
//     user: {
//       image: "/images/user/user-21.jpg",
//       name: "Carla George",
//       phone: "+998(95)064-28-27",
//     },
//     group: "Group 1",
//     result_count: 4,
//     rate: 75.7,
//     status: "Active",
//   },
//   {
//     id: 5,
//     user: {
//       image: "/images/user/user-21.jpg",
//       name: "Carla George",
//       phone: "+998(95)064-28-27",
//     },
//     group: "Group 1",
//     result_count: 4,
//     rate: 75.7,
//     status: "Active",
//   },
//   {
//     id: 5,
//     user: {
//       image: "/images/user/user-21.jpg",
//       name: "Carla George",
//       phone: "+998(95)064-28-27",
//     },
//     group: "Group 3",
//     result_count: 2,
//     rate: 60,
//     status: "Active",
//   },
//   {
//     id: 5,
//     user: {
//       image: "/images/user/user-21.jpg",
//       name: "Carla George",
//       phone: "+998(95)064-28-27",
//     },
//     group: "Group 3",
//     result_count: 1,
//     rate: 55.0,
//     status: "Active",
//   },
// ];


export interface RateItemProps {

  id: number;
  name: string;
  image: string;
  phone: string;
  password: string;
  createdt: string;
  showPassword?: boolean
  group_id?: number;
  results? : {
      solved? : number;
      type? :string;
      test? :{
        _count?: {
          test_items?: number,
          results?: number,
        },
      }
  }[],
  group? : {
    id: number;
    name: string;
  },
  rate? : number;

}



export default function RatesTable({ data, groups, refetch }: {
  data: RateItemProps[],
  groups: any[]
  refetch: () => Promise<void>
}) {

  const [tableData, setTableData] = useState(data);
  const options = [
    { value: "5", label: "5" },
    { value: "10", label: "10" },
    { value: "20", label: "20" },
  ];


  const group_options = [
    { value: "Hamma guruh", label: "Hamma guruh" },
   ...groups
  ];
  let [optionValue, setoptionValue] = useState("5");
  let [groupoptionValue, setGroupoptionValue] = useState("Hamma guruh");
  
 
  
  const handleSelectGroupChange = (value: string) => {
    setGroupoptionValue(value);
  };

  const handleSelectChange = (value: string) => {
    setoptionValue(value);
  };
  
  // Pationation
  
  const [currentPage, setCurrentPage] = useState(1);
  const maxPage = Math.ceil(tableData.length / +optionValue);
  
  const startIndex = (currentPage - 1) * +optionValue;
  const endIndex = startIndex + +optionValue;
  let currentItems: RateItemProps[] = tableData.slice(startIndex, endIndex);
  
  const goToPreviousPage = () => {
    setCurrentPage((page) => Math.max(page - 1, 1));
  };
  
  const goToNextPage = () => {
    setCurrentPage((page) => Math.min(page + 1, maxPage));
  };
  console.log(">> data length :", tableData.length);
  
  useEffect(() => {
    const startIndex = (currentPage - 1) * +optionValue;
    const endIndex = startIndex + +optionValue;
    currentItems = tableData.slice(startIndex, endIndex);
  }, [currentPage]);
  
  useEffect(() => {
    setCurrentPage(1);
    if (groupoptionValue == "Hamma guruh") {
      setTableData(data)
      
    }else{
      setTableData(data.filter((item)=>item.group?.id== +groupoptionValue));
    }
  }, [optionValue,groupoptionValue]);
  useEffect(() => {
    setCurrentPage(1);
    setTableData(data);
  }, [data]);


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
              options={group_options}
              onChange={handleSelectGroupChange}
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
                Studentlar
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400 "
              >
                Tugatilgan
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Guruh nomi
              </TableCell>

              {/* <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Status
              </TableCell> */}
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Reyting
              </TableCell>
            </TableRow>
          </TableHeader>

          {/* Table Body */}
          <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
            {currentItems.map((order,index) => (
              <TableRow key={index}>
                <TableCell className="px-5 py-4 sm:px-6 text-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 overflow-hidden rounded-full">
                      <img
                        width={40}
                        height={40}
                        src={order?.image ?? bookImage}
                        alt={order?.name}
                      />
                    </div>
                    <div>
                      <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {order?.name}
                      </span>
                      <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                      {order?.phone}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                  {order.results?.length ?? 0}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {order.group?.name}
                </TableCell>

                {/* <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
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
                    {order.status}
                  </Badge>
                </TableCell> */}
                <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {Number((order.rate ?? 0).toFixed(2))} %
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
    </div>
  );
}
