import { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import axiosClient from '../../service/axios.service';
import { LoadSpinner } from '../spinner/load-spinner';

interface ChartData {
  categories: string[];
  courseCounts: number[];
}

export default function CoursesChart() {
  const [chartData, setChartData] = useState<ChartData>({ categories: [], courseCounts: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, categoriesRes] = await Promise.all([
          axiosClient.get('/courses').catch(() => ({ data: [] })),
          axiosClient.get('/category').catch(() => ({ data: [] })),
        ]);

        const courses = Array.isArray(coursesRes.data) ? coursesRes.data : [];
        const categories = Array.isArray(categoriesRes.data) ? categoriesRes.data : [];

        const categoryNames = categories.map((cat: any) => cat.name || cat.nameUz || 'Noma\'lum');
        const courseCounts = categories.map((cat: any) => {
          return courses.filter((course: any) => course.categoryId === cat.id).length;
        });

        setChartData({ categories: categoryNames, courseCounts });
      } catch (error) {
        console.error('Chart ma\'lumotlari yuklanmadi:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: 'bar',
      height: 350,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        borderRadius: 8,
      },
    },
    dataLabels: { enabled: false },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    xaxis: {
      categories: chartData.categories,
      labels: {
        style: { colors: '#9CA3AF' },
      },
    },
    yaxis: {
      title: { text: 'Kurslar soni' },
      labels: {
        style: { colors: '#9CA3AF' },
      },
    },
    fill: { opacity: 1 },
    tooltip: {
      y: {
        formatter: (val) => `${val} ta kurs`,
      },
    },
    colors: ['#3B82F6'],
    grid: {
      borderColor: '#E5E7EB',
    },
  };

  const series = [
    {
      name: 'Kurslar',
      data: chartData.courseCounts,
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
        Kategoriyalar bo'yicha kurslar
      </h3>
      <ReactApexChart options={options} series={series} type="bar" height={350} />
    </div>
  );
}
