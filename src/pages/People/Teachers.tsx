import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import TeachersTable from "../../components/tables/people/teachersTable";
import { BoxIcon, PlusIcon } from "../../icons";
import Button from "../../components/ui/button/Button";
import { useModal } from "../../hooks/useModal";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import { Modal } from "../../components/ui/modal";
import { useState } from "react";
import FileInput from "../../components/form/input/FileInput";
export interface Teacher {
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
}
export default function TeachersPage() {
  const { isOpen, openModal, closeModal } = useModal();
  const handleAdding = () => {
    // Handle save logic here

    console.log("handleAdding...");

    closeModal();
    setTeacher(emptyTeacher);
  };
  let emptyTeacher: Teacher = {
    firstName: "",
    lastName: "",
    phone: "901234567",
    password: "12345678",
  };
  let [teacher, setTeacher] = useState<Teacher>(emptyTeacher);
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log("Selected file:", file.name);
    }
  };

  return (
    <>
      <PageMeta
        title="O'qituvchilar"
        description="Kurs Platformasi - O'qituvchilar"
      />
      <PageBreadcrumb pageTitle="Teachers" />
   
       <div className="space-y-6 ">
       
       
         <ComponentCard
          title="Teachers Table"
          action={
            <>
              <Button
                size="sm"
                variant="primary"
                startIcon={<PlusIcon className="size-5 fill-white" />}
                onClick={()=>{
                  setTeacher(emptyTeacher)
                  openModal()
                }}
              >
                Add teacher
              </Button>
            </>
          }
        >
          <TeachersTable />
        </ComponentCard>
      </div>
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Add teacher
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Create new teacher with full details.
            </p>
          </div>
          <form className="flex flex-col">
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>Firstname</Label>
                  <Input
                    type="text"
                    value={teacher.firstName}
                    onChange={(e) =>
                      setTeacher({
                        ...teacher,
                        firstName: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label>Lastname</Label>
                  <Input
                    type="text"
                    value={teacher.lastName}
                    onChange={(e) =>
                      setTeacher({
                        ...teacher,
                        lastName: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label>Phonenumber</Label>
                  <Input
                    type="text"
                    value={teacher.phone}
                    onChange={(e) =>
                      setTeacher({
                        ...teacher,
                        phone: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label>Password</Label>
                  <Input
                    type="text"
                    value={teacher.password}
                    onChange={(e) =>
                      setTeacher({
                        ...teacher,
                        password: e.target.value,
                      })
                    }
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
                Close
              </Button>
              <Button size="sm" onClick={handleAdding}>
                Saves
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
