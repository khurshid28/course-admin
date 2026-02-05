import { useEffect, useState } from "react";
import axiosClient from "../../service/axios.service";
import { LoadSpinner } from "../spinner/load-spinner";

interface DashboardStats {
  users: number;
  teachers: number;
  courses: number;
  categories: number;
  videos: number;
  sections: number;
  payments: number;
  enrollments: number;
}

export default function DashboardMetrics() {
  const [stats, setStats] = useState<DashboardStats>({
    users: 0,
    teachers: 0,
    courses: 0,
    categories: 0,
    videos: 0,
    sections: 0,
    payments: 0,
    enrollments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [
          usersRes,
          teachersRes,
          coursesRes,
          categoriesRes,
          videosRes,
          sectionsRes,
          paymentsRes,
          enrollmentsRes,
        ] = await Promise.all([
          axiosClient.get('/user').catch(() => ({ data: [] })),
          axiosClient.get('/teacher').catch(() => ({ data: [] })),
          axiosClient.get('/courses').catch(() => ({ data: [] })),
          axiosClient.get('/category').catch(() => ({ data: [] })),
          axiosClient.get('/courses').then(res => ({ data: res.data?.flatMap((c: any) => c.videos || []) || [] })).catch(() => ({ data: [] })),
          axiosClient.get('/sections').catch(() => ({ data: [] })),
          axiosClient.get('/payment').catch(() => ({ data: [] })),
          axiosClient.get('/courses').then(res => ({ data: res.data?.flatMap((c: any) => c.enrollments || []) || [] })).catch(() => ({ data: [] })),
        ]);

        setStats({
          users: Array.isArray(usersRes.data) ? usersRes.data.length : 0,
          teachers: Array.isArray(teachersRes.data) ? teachersRes.data.length : 0,
          courses: Array.isArray(coursesRes.data) ? coursesRes.data.length : 0,
          categories: Array.isArray(categoriesRes.data) ? categoriesRes.data.length : 0,
          videos: Array.isArray(videosRes.data) ? videosRes.data.length : 0,
          sections: Array.isArray(sectionsRes.data) ? sectionsRes.data.length : 0,
          payments: Array.isArray(paymentsRes.data) ? paymentsRes.data.length : 0,
          enrollments: Array.isArray(enrollmentsRes.data) ? enrollmentsRes.data.length : 0,
        });
      } catch (error) {
        console.error('Statistika yuklanmadi:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3">
            <div className="animate-pulse">
              <div className="mb-4 h-8 w-8 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
              <div className="mb-2 h-4 w-16 rounded bg-gray-200 dark:bg-gray-700"></div>
              <div className="h-6 w-12 rounded bg-gray-200 dark:bg-gray-700"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const metrics = [
    {
      title: "Foydalanuvchilar",
      value: stats.users,
      icon: "👨‍🎓",
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
    },
    {
      title: "O'qituvchilar",
      value: stats.teachers,
      icon: "👨‍🏫",
      color: "text-teal-600",
      bgColor: "bg-teal-100 dark:bg-teal-900/20",
    },
    {
      title: "Kurslar",
      value: stats.courses,
      icon: "📚",
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
    },
    {
      title: "Kategoriyalar",
      value: stats.categories,
      icon: "📂",
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
    },
    {
      title: "Videolar",
      value: stats.videos,
      icon: "🎥",
      color: "text-red-600",
      bgColor: "bg-red-100 dark:bg-red-900/20",
    },
    {
      title: "Kurs bo'limlari",
      value: stats.sections,
      icon: "📑",
      color: "text-indigo-600",
      bgColor: "bg-indigo-100 dark:bg-indigo-900/20",
    },
    {
      title: "To'lovlar",
      value: stats.payments,
      icon: "💰",
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
    },
    {
      title: "Obunalar",
      value: stats.enrollments,
      icon: "✅",
      color: "text-pink-600",
      bgColor: "bg-pink-100 dark:bg-pink-900/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {metrics.map((metric, index) => (
        <div
          key={index}
          className="group relative rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-105 dark:border-gray-800 dark:bg-white/3"
        >
          {/* Hover tooltip */}
          <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm shadow-lg z-10 pointer-events-none">
            <div className="text-center">
              <div className="font-bold">{metric.value.toLocaleString()}</div>
              <div className="text-xs opacity-75">{metric.title}</div>
            </div>
            <div className="absolute top-full right-2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors">
                {metric.title}
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white group-hover:scale-110 transition-transform">
                {metric.value.toLocaleString()}
              </p>
            </div>
            <div className={`rounded-lg p-3 transition-all duration-300 group-hover:scale-110 ${metric.bgColor}`}>
              <span className="text-2xl">{metric.icon}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}