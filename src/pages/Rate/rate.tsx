import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import RatesTable, { RateItemProps } from "../../components/tables/rate/RatesTable";
import axiosClient from "../../service/axios.service";
import { useCallback, useState } from "react";
import { useFetchWithLoader } from "../../hooks/useFetchWithLoader";
import { LoadSpinner } from "../../components/spinner/load-spinner";

export default function RatePage() {



  let [group_options, set_group_options] = useState<HTMLOptionElement[]>([]);
  const fetchStudents = useCallback(() => {
    return axiosClient.get('/student/rate').then(res => res.data);
  }, []);


  const { data, isLoading, error, refetch } = useFetchWithLoader({
    fetcher: fetchStudents,
  });

  const fetchGroups = useCallback(() => {
    return axiosClient.get('/group/all').then(res => res.data);
  }, []);

  const { data: groups, isLoading: isLoadingGroups, error: errorIsGroups, refetch: refetchGroups } = useFetchWithLoader({
    fetcher: fetchGroups,
    onSuccess: useCallback((data: any[]) => {
      set_group_options((data as any[]).map((e, index) => {
        return new Option(`${e.name}`, `${e.id}`)
      }));

    }, [])
  }



  );

  let sortedData = (list: RateItemProps[]): RateItemProps[] => {
    return list.map((e) => {
      if (e.results && e.results?.length > 0) {
        let totalScore = 0;
        let totalTests = 0;
        
        for (let index = 0; index < e.results?.length; index++) {
          const result = e.results[index];
          
          if (result.type === "RANDOM") {
            // Random testlar
            const totalItems = ((result as any).answers as any[])?.length ?? 0;
            const solved = result.solved ?? 0;
            if (totalItems > 0) {
              totalScore += (solved / totalItems);
              totalTests++;
            }
          } else if (result.type === "SPECIAL") {
            // Maxsus testlar
            const totalItems = ((result as any).answers as any[])?.length ?? 0;
            const solved = result.solved ?? 0;
            if (totalItems > 0) {
              totalScore += (solved / totalItems);
              totalTests++;
            }
          } else {
            // Oddiy testlar
            const count = result.test?._count?.test_items ?? 1;
            const solved = result.solved ?? 0;
            totalScore += (solved / count);
            totalTests++;
          }
        }

        e.rate = totalTests > 0 ? (totalScore * 100) / totalTests : 0;
      } else {
        e.rate = 0;
      }
      return e;
    }).sort((a, b) => {
      return (b?.rate ?? 0) - (a?.rate ?? 0);
    });
  }

  return (
    <>
      <PageMeta
        title="Test Dashboard"
        description="Test Dashboard"
      />
      <PageBreadcrumb pageTitle="Reyting" />
      <div className="space-y-6">

        {
          isLoading && <div className="min-h-[450px]  flex-col flex justify-center">
            <LoadSpinner />
          </div>
        }
        {
          data && <ComponentCard title="Reyting jadvali">
            <RatesTable data={sortedData(data)} refetch={refetch} groups={group_options} />
          </ComponentCard>
        }
      </div>
    </>
  );
}
