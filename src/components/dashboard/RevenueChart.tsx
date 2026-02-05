import { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import axiosClient from '../../service/axios.service';
import { LoadSpinner } from '../spinner/load-spinner';

export default function RevenueChart() {
  const [chartData, setChartData] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const paymentsRes = await axiosClient.get('/payment').catch(() => ({ data: [] }));
        const payments = Array.isArray(paymentsRes.data) ? paymentsRes.data : [];

        // Oxirgi 6 oy uchun daromad hisoblash
        const now = new Date();
        const monthlyRevenue: number[] = [];

        for (let i = 5; i >= 0; i--) {
          const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

          const monthPayments = payments.filter((p: any) => {
            const pDate = new Date(p.createdAt || p.paymentDate);
            return pDate >= monthStart && pDate <= monthEnd && p.status === 'SUCCESS';
          });

          const totalRevenue = monthPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
          monthlyRevenue.push(totalRevenue);
        }

        setChartData(monthlyRevenue);
      } catch (error) {
        console.error('Chart ma\'lumotlari yuklanmadi:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getMonthName = (monthsAgo: number) => {
    const now = new Date();
    const date = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
    return date.toLocaleDateString('uz-UZ', { month: 'short' });
  };

  const categories = [5, 4, 3, 2, 1, 0].map(getMonthName);

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: 'area',
      height: 350,
      toolbar: { show: false },
    },
    dataLabels: { enabled: false },
    stroke: {
      curve: 'smooth',
      width: 3,
    },
    xaxis: {
      categories,
      labels: {
        style: { colors: '#9CA3AF' },
      },
    },
    yaxis: {
      title: { text: 'Daromad (so\'m)' },
      labels: {
        style: { colors: '#9CA3AF' },
        formatter: (val) => new Intl.NumberFormat('uz-UZ').format(val),
      },
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.2,
      },
    },
    tooltip: {
      y: {
        formatter: (val) => new Intl.NumberFormat('uz-UZ').format(val) + ' so\'m',
      },
    },
    colors: ['#10B981'],
    grid: {
      borderColor: '#E5E7EB',
    },
  };

  const series = [
    {
      name: 'Daromad',
      data: chartData,
    },
  ];

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3">
        <div className="flex items-center justify-center h-[350px]">
          <LoadSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3">
      <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        Oylik daromad statistikasi
      </h3>
      <ReactApexChart options={options} series={series} type="area" height={350} />
    </div>
  );
}
