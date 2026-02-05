import DashboardMetrics from "../../components/dashboard/DashboardMetrics";
import CoursesChart from "../../components/dashboard/CoursesChart";
import RevenueChart from "../../components/dashboard/RevenueChart";
import PageMeta from "../../components/common/PageMeta";

export default function Home() {
  return (
    <>
      <PageMeta
        title="Kurs Platformasi"
        description="Kurs Platformasi - Administrator Paneli"
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {/* Asosiy statistikalar */}
        <div className="col-span-12">
          <DashboardMetrics />
        </div>

        {/* Chart'lar */}
        <div className="col-span-12 lg:col-span-6">
          <CoursesChart />
        </div>
        <div className="col-span-12 lg:col-span-6">
          <RevenueChart />
        </div>
      </div>
    </>
  );
}
