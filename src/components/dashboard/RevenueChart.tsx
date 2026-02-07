import { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import axiosClient from '../../service/axios.service';
import { LoadSpinner } from '../spinner/load-spinner';

export default function RevenueChart() {
  const [chartData, setChartData] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const paymentsRes = await axiosClient.get('/payment').catch(() => ({ data: [] }));
        const payments = Array.isArray(paymentsRes.data) ? paymentsRes.data : [];

        // Oxirgi 6 oy uchun daromad hisoblash
        const now = new Date();
        const monthlyRevenue: number[] = [];
        let total = 0;

        for (let i = 5; i >= 0; i--) {
          const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

          const monthPayments = payments.filter((p: any) => {
            const pDate = new Date(p.createdAt || p.paymentDate);
            return pDate >= monthStart && pDate <= monthEnd && p.status === 'SUCCESS';
          });

          const monthTotal = monthPayments.reduce((sum: number, p: any) => {
            const amount = typeof p.amount === 'bigint' ? Number(p.amount) : (Number(p.amount) || 0);
            // Ensure we don't exceed safe integer limits
            return sum + (Number.isSafeInteger(amount) ? amount : 0);
          }, 0);
          monthlyRevenue.push(monthTotal);
          total += monthTotal;
        }

        setChartData(monthlyRevenue);
        setTotalRevenue(total);
      } catch (error) {
        console.error('Chart ma\'lumotlari yuklanmadi:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getMonthName = (monthsAgo: number) => {
    const monthNames = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];
    const now = new Date();
    const date = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
    return monthNames[date.getMonth()];
  };

  const categories = [5, 4, 3, 2, 1, 0].map(getMonthName);

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: 'area',
      height: 350,
      toolbar: { show: false },
      background: 'transparent',
    },
    dataLabels: { enabled: false },
    stroke: {
      curve: 'smooth',
      width: 3,
    },
    xaxis: {
      categories,
      labels: {
        style: { 
          colors: '#6B7280',
          fontSize: '12px',
          fontFamily: 'inherit',
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      title: { 
        text: 'Daromad (so\'m)',
        style: {
          color: '#6B7280',
          fontSize: '12px',
          fontFamily: 'inherit',
        },
      },
      labels: {
        style: { 
          colors: '#6B7280',
          fontSize: '12px',
          fontFamily: 'inherit',
        },
        formatter: (val) => new Intl.NumberFormat('uz-UZ').format(val),
      },
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.5,
        opacityTo: 0.1,
        stops: [0, 90, 100],
      },
    },
    tooltip: {
      custom: function({ series, seriesIndex, dataPointIndex, w }) {
        const value = series[seriesIndex][dataPointIndex];
        const month = w.globals.labels[dataPointIndex];
        return `<div style="background: #1f2937; color: #ffffff; padding: 8px 12px; border-radius: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
          <div style="font-size: 12px; font-weight: 600; margin-bottom: 4px;">${month}</div>
          <div style="font-size: 14px;">${new Intl.NumberFormat('uz-UZ').format(value)} so'm</div>
        </div>`;
      },
    },
    colors: ['#10B981'],
    grid: {
      borderColor: '#E5E7EB',
      strokeDashArray: 4,
      xaxis: {
        lines: {
          show: false,
        },
      },
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
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-center h-[350px]">
          <LoadSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Oylik daromad statistikasi
        </h3>
        <div className="flex items-baseline gap-2 mt-1">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Oxirgi 6 oylik umumiy:
          </p>
          <p className="text-base font-semibold text-emerald-600 dark:text-emerald-400">
            {Number.isSafeInteger(totalRevenue) ? new Intl.NumberFormat('uz-UZ').format(totalRevenue) : '0'} so'm
          </p>
        </div>
      </div>
      <ReactApexChart options={options} series={series} type="area" height={350} />
    </div>
  );
}
