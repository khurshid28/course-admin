import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";

import { BoxIcon, PlusIcon } from "../../icons";
import Button from "../../components/ui/button/Button";
import { useModal } from "../../hooks/useModal";
import Label from "../../components/form/Label";
import Switch from "../../components/form/switch/Switch";
import Input from "../../components/form/input/InputField";
import { Modal } from "../../components/ui/modal";
import { useCallback, useState } from "react";
import GroupsTable from "../../components/tables/people/groupsTable";
import FileInput from "../../components/form/input/FileInput";
import axiosClient from "../../service/axios.service";
import { useFetchWithLoader } from "../../hooks/useFetchWithLoader";
import { LoadSpinner } from "../../components/spinner/load-spinner";
import { toast } from "react-toastify";
export interface Group {
  name?: string;
  image?: string;
  hasTime?: boolean;
  timeMinutes?: number;
  fullTime?: number;
  forceNextQuestion?: boolean;
}
export default function GroupsPage() {


  const fetchGroups = useCallback(() => {
    return axiosClient.get('/group/all').then(res => res.data);
  }, []);

  const { data, isLoading, error, refetch } = useFetchWithLoader({
    fetcher: fetchGroups,
  });

  const { isOpen, openModal, closeModal } = useModal();

  let [name,setName] =useState("");
  let [file,setFile] =useState<File | undefined>();
  let [hasTime, setHasTime] = useState<boolean>(false);
  let [timeMinutes, setTimeMinutes] = useState<number>(0);
  let [fullTime, setFullTime] = useState<number>(0);
  let [forceNextQuestion, setForceNextQuestion] = useState<boolean>(false);


  let sendGroup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const payload = {
        name,
        hasTime,
        timeMinutes: hasTime ? timeMinutes : 0,
        fullTime: hasTime ? fullTime : 0,
        forceNextQuestion: hasTime && timeMinutes > 0 ? forceNextQuestion : false,
      };
      const res = await axiosClient.post('/group', payload);

      toast.success('Guruh muvaffaqiyatli yaratildi');
      await refetch();

    } catch (error) {
      console.error('Create Group error:', error);
      toast.error('Xatolik yuz berdi');

    }finally { 
      closeModal();
    }
  };






  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log("Selected file:", file.name);
      setFile(file)
    }
  };
  return (
    <>
      <PageMeta
        title="Groups | Test Dashboard"
        description="Test Dashboard"
      />
      <PageBreadcrumb pageTitle="Guruhlar" />

      <div className="space-y-6 ">
        {
          isLoading && <div className="min-h-[450px]  flex-col flex justify-center">
            <LoadSpinner />
          </div>
        }

        {
          data && <ComponentCard
            title="Guruhlar jadvali"
            action={
              <>
                <Button
                  size="sm"
                  variant="primary"
                  startIcon={<PlusIcon className="size-5 fill-white" />}
                  onClick={() => {
                    setName("");
                    setFile(undefined);
                    setHasTime(false);
                    setTimeMinutes(0);
                    setFullTime(0);
                    setForceNextQuestion(false);
                    openModal()
                  }}
                >
                  Qo'shish
                </Button>
              </>
            }
          >
            <GroupsTable data={data}  refetch={refetch}/>
          </ComponentCard>
        }
      </div>
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Guruh qo'shish
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Yangi guruh qo'shish uchun barcha ma'lumotlarni kiriting.
            </p>
          </div>
          <form className="flex flex-col" onSubmit={sendGroup}>
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>Nomi</Label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) =>
                      setName(e.target.value,)
                    }
                  />
                </div>

                <div>
                  <Label>Rasm</Label>
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
              <Button size="sm" type="submit">
                Saqlash
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
