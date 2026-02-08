import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import ResultsTable from "../../components/tables/test/resultsTable";
import { useCallback, useState, useEffect } from "react";
import axiosClient from "../../service/axios.service";
import { useFetchWithLoader } from "../../hooks/useFetchWithLoader";
import { LoadSpinner } from "../../components/spinner/load-spinner";
import Select from "../../components/form/Select";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { FileIcon as FilterIcon } from "../../icons";

export default function ResultsPage() {
  // Get student_id from URL params if exists
  const params = new URLSearchParams(window.location.search);
  const studentIdParam = params.get('student_id');
  
  const fetchResults = useCallback(() => {
    return axiosClient.get('/result/all').then(res => res.data);
  }, []);

  const { data, isLoading, error, refetch } = useFetchWithLoader({
    fetcher: fetchResults,
  });


  const fetchGroups = useCallback(() => {
    return axiosClient.get('/group/all').then(res => res.data);
}, []);

const { data: books_data } = useFetchWithLoader({
    fetcher: fetchGroups,
    onSuccess: useCallback((dataSubject: any[]) => {
        set_all_group_options((dataSubject as any[]).map((e, index) => {
            return new Option(`${e.name}`, `${e.id}`)
        }));
    }, []),
});

const fetchStudents = useCallback(() => {
    return axiosClient.get('/student/all').then(res => res.data);
}, []);

useFetchWithLoader({
    fetcher: fetchStudents,
    onSuccess: useCallback((dataStudents: any[]) => {
        set_all_student_options((dataStudents as any[]).map((e: any) => {
            return new Option(`${e.name}`, `${e.id}`)
        }));
    }, []),
});

const fetchBooks = useCallback(() => {
    return axiosClient.get('/book/all').then(res => res.data);
}, []);

useFetchWithLoader({
    fetcher: fetchBooks,
    onSuccess: useCallback((dataBooks: any[]) => {
        set_all_book_options((dataBooks as any[]).map((e: any) => {
            return new Option(`${e.name}`, `${e.id}`)
        }));
    }, []),
});

const fetchSubjects = useCallback(() => {
    return axiosClient.get('/subject/all').then(res => res.data);
}, []);

useFetchWithLoader({
    fetcher: fetchSubjects,
    onSuccess: useCallback((dataSubjects: any[]) => {
        set_all_subject_options((dataSubjects as any[]).map((e: any) => {
            return new Option(`${e.name}`, `${e.id}`)
        }));
    }, []),
});

const fetchTests = useCallback(() => {
    return axiosClient.get('/test/all').then(res => res.data);
}, []);

useFetchWithLoader({
    fetcher: fetchTests,
    onSuccess: useCallback((dataTests: any[]) => {
        set_all_test_options((dataTests as any[]).map((e: any) => {
            return new Option(`${e.name}`, `${e.id}`)
        }));
    }, []),
});

const [all_group_options, set_all_group_options] = useState<HTMLOptionElement[]>([]);
const [all_student_options, set_all_student_options] = useState<HTMLOptionElement[]>([]);
const [all_book_options, set_all_book_options] = useState<HTMLOptionElement[]>([]);
const [all_test_options, set_all_test_options] = useState<HTMLOptionElement[]>([]);
const [all_subject_options, set_all_subject_options] = useState<HTMLOptionElement[]>([]);

// Filter states
const [selectedGroup, setSelectedGroup] = useState<string>("");
const [selectedStudent, setSelectedStudent] = useState<string>(studentIdParam || "");
const [selectedSubject, setSelectedSubject] = useState<string>("");
const [selectedBook, setSelectedBook] = useState<string>("");
const [selectedType, setSelectedType] = useState<string>("");
const [startDate, setStartDate] = useState<string>("");
const [endDate, setEndDate] = useState<string>("");
const [showFilters, setShowFilters] = useState(false);
const [filteredData, setFilteredData] = useState<any[]>([]);

// Filtered options based on selections
const filteredStudents = selectedGroup && all_student_options.length > 0
  ? all_student_options.filter((opt: any) => {
      // Find all results for this student to check their group
      const studentResults = (data || []).filter((d: any) => d.student_id?.toString() === opt.value);
      if (studentResults.length === 0) return false;
      return studentResults[0]?.student?.group_id?.toString() === selectedGroup;
    })
  : all_student_options;

// For books: if subject is selected, filter by subject_id directly from book data
// Otherwise show all books
const filteredBooks = all_book_options;

// Apply filters
useEffect(() => {
  if (!data) return;
  
  let filtered = [...data];
  
  if (selectedGroup) {
    filtered = filtered.filter((r: any) => r.student?.group_id?.toString() === selectedGroup);
  }
  
  if (selectedStudent) {
    filtered = filtered.filter((r: any) => r.student_id?.toString() === selectedStudent);
  }
  
  if (selectedSubject) {
    filtered = filtered.filter((r: any) => r.test?.book?.subject_id?.toString() === selectedSubject);
  }
  
  if (selectedBook) {
    filtered = filtered.filter((r: any) => r.test?.book_id?.toString() === selectedBook);
  }
  
  if (selectedType) {
    filtered = filtered.filter((r: any) => {
      const testType = r.test?.type?.toLowerCase() || '';
      return testType === selectedType.toLowerCase();
    });
  }
  
  if (startDate) {
    filtered = filtered.filter((r: any) => new Date(r.createdAt) >= new Date(startDate));
  }
  
  if (endDate) {
    filtered = filtered.filter((r: any) => new Date(r.createdAt) <= new Date(endDate));
  }
  
  setFilteredData(filtered);
}, [data, selectedGroup, selectedStudent, selectedSubject, selectedBook, selectedType, startDate, endDate]);

const handleResetFilters = () => {
  setSelectedGroup("");
  setSelectedStudent(studentIdParam || "");
  setSelectedSubject("");
  setSelectedBook("");
  setSelectedType("");
  setStartDate("");
  setEndDate("");
};

  return (
    <>
      <PageMeta
        title="Test Natijalari"
        description="Kurs Platformasi - Test Natijalari"
      />
      <PageBreadcrumb pageTitle="Natijalar" />
      <div className="space-y-6">

        {
          isLoading && <div className="min-h-[450px]  flex-col flex justify-center">
            <LoadSpinner />
          </div>
        }
        {
          data && (
            <>
              <ComponentCard 
                title="Filterlar" 
                action={
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    {showFilters ? 'Yashirish' : 'Ko\'rsatish'}
                  </Button>
                }
              >
                {showFilters && (
                  <div className="p-4 space-y-4">
                    {/* Row 1: Guruh va Student */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Guruh</Label>
                        <Select
                          options={[new Option('Barcha guruhlar', ''), ...all_group_options]}
                          defaultValue={selectedGroup}
                          onChange={(e) => {
                            setSelectedGroup(e.target.value);
                            if (e.target.value && selectedStudent) {
                              // Check if selected student is in new group
                              const student = (data || []).find((d: any) => d.student_id?.toString() === selectedStudent);
                              if (student?.student?.group_id?.toString() !== e.target.value) {
                                setSelectedStudent('');
                              }
                            }
                          }}
                          className="dark:bg-dark-900"
                        />
                      </div>
                      
                      <div>
                        <Label>Student</Label>
                        <Select
                          options={[new Option('Barcha studentlar', ''), ...filteredStudents]}
                          defaultValue={selectedStudent}
                          onChange={(e) => setSelectedStudent(e.target.value)}
                          className="dark:bg-dark-900"
                        />
                      </div>
                    </div>
                    
                    {/* Row 2: Fan va Kitob */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Fan</Label>
                        <Select
                          options={[new Option('Barcha fanlar', ''), ...all_subject_options]}
                          defaultValue={selectedSubject}
                          onChange={(e) => setSelectedSubject(e.target.value)}
                          className="dark:bg-dark-900"
                        />
                      </div>
                      
                      <div>
                        <Label>Kitob</Label>
                        <Select
                          options={[new Option('Barcha kitoblar', ''), ...filteredBooks]}
                          defaultValue={selectedBook}
                          onChange={(e) => setSelectedBook(e.target.value)}
                          className="dark:bg-dark-900"
                        />
                      </div>
                    </div>
                    
                    {/* Row 3: Turi */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Turi</Label>
                        <Select
                          options={[
                            new Option('Barcha turlar', ''),
                            new Option('Oddiy test', 'oddiy'),
                            new Option('Maxsus test', 'maxsus'),
                            new Option('Random test', 'random')
                          ]}
                          defaultValue={selectedType}
                          onChange={(e) => setSelectedType(e.target.value)}
                          className="dark:bg-dark-900"
                        />
                      </div>
                    </div>
                    
                    {/* Row 4: Sanalar */}
                    <div>
                      <Label>Sana oralig'i</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          type="date"
                          placeholder="Dan"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                        />
                        <Input
                          type="date"
                          placeholder="Gacha"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    {/* Row 5: Tozalash tugmasi */}
                    <div className="flex justify-end pt-2">
                      <Button
                        size="mini"
                        variant="outline"
                        onClick={handleResetFilters}
                      >
                        Tozalash
                      </Button>
                    </div>
                  </div>
                )}
              </ComponentCard>
              
              <ComponentCard title="Natijalar jadvali">
                <ResultsTable data={filteredData} refetch={refetch} groups={all_group_options} studentIdFilter={studentIdParam}/>
              </ComponentCard>
            </>
          )
        }
       
      </div>
    </>
  );
}
