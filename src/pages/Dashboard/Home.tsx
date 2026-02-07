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
      <div className="space-y-6">
        {/* Asosiy statistikalar */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-5">
            Statistika
          </h2>
          <DashboardMetrics />
        </div>

        {/* Chart'lar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <CoursesChart />
          <RevenueChart />
        </div>
      </div>
    </>
  );
}
