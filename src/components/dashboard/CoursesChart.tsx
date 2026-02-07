import { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import axiosClient from '../../service/axios.service';
import { LoadSpinner } from '../spinner/load-spinner';

interface ChartData {
  categories: string[];
  testResults: number[];
  certificates: number[];
}

export default function CoursesChart() {
  const [chartData, setChartData] = useState<ChartData>({ categories: [], testResults: [], certificates: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch test results and certificates
        const [testResultsRes, certificatesRes] = await Promise.all([
          axiosClient.get('/tests/results/all').catch(() => ({ data: [] })),
          axiosClient.get('/tests/certificates/all').catch(() => ({ data: [] })),
        ]);

        const testResults = Array.isArray(testResultsRes.data) ? testResultsRes.data : [];
        const certificates = Array.isArray(certificatesRes.data) ? certificatesRes.data : [];

        // Get last 6 months data
        const monthNames = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];
        const now = new Date();
        const monthlyTestResults: number[] = [];
        const monthlyCertificates: number[] = [];
        const categories: string[] = [];

        for (let i = 5; i >= 0; i--) {
          const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
          
          categories.push(monthNames[monthStart.getMonth()]);

          // Count test results for this month
          const monthTestResults = testResults.filter((tr: { completedAt?: string }) => {
            if (!tr.completedAt) return false;
            const date = new Date(tr.completedAt);
            return date >= monthStart && date <= monthEnd;
          });

          // Count certificates for this month
          const monthCertificates = certificates.filter((cert: { issuedAt?: string }) => {
            if (!cert.issuedAt) return false;
            const date = new Date(cert.issuedAt);
            return date >= monthStart && date <= monthEnd;
          });

          monthlyTestResults.push(monthTestResults.length);
          monthlyCertificates.push(monthCertificates.length);
        }

        console.log('Monthly test results:', monthlyTestResults);
        console.log('Monthly certificates:', monthlyCertificates);

        setChartData({ 
          categories, 
          testResults: monthlyTestResults,
          certificates: monthlyCertificates
        });
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
      background: 'transparent',
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '60%',
        borderRadius: 8,
        borderRadiusApplication: 'end',
      },
    },
    dataLabels: { 
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    xaxis: {
      categories: chartData.categories,
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
        text: 'Soni',
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
      },
    },
    fill: { 
      opacity: 1,
    },
    tooltip: {
      custom: function({ series, seriesIndex, dataPointIndex, w }) {
        const value = series[seriesIndex][dataPointIndex];
        const category = w.globals.labels[dataPointIndex];
        const seriesName = w.globals.seriesNames[seriesIndex];
        const color = seriesIndex === 0 ? '#3B82F6' : '#10B981';
        return `<div style="background: #1f2937; color: #ffffff; padding: 8px 12px; border-radius: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); border-left: 3px solid ${color};">
          <div style="font-size: 11px; color: #9ca3af; margin-bottom: 4px;">${category}</div>
          <div style="font-size: 13px; font-weight: 600; margin-bottom: 2px;">${seriesName}</div>
          <div style="font-size: 15px; font-weight: 700; color: ${color};">${value} ta</div>
        </div>`;
      },
    },
    colors: ['#3B82F6', '#10B981'],
    grid: {
      borderColor: '#E5E7EB',
      strokeDashArray: 4,
      xaxis: {
        lines: {
          show: false,
        },
      },
    },
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'right',
      labels: {
        colors: '#6B7280',
      },
    },
  };

  const series = [
    {
      name: 'Testlar',
      data: chartData.testResults,
    },
    {
      name: 'Sertifikatlar',
      data: chartData.certificates,
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
          Testlar va Sertifikatlar (Oylik)
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Oxirgi 6 oyda yechilgan testlar va berilgan sertifikatlar
        </p>
      </div>
      <ReactApexChart options={options} series={series} type="bar" height={350} />
    </div>
  );
}
