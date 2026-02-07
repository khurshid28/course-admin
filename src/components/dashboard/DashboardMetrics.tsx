import { useEffect, useState } from "react";
import axiosClient from "../../service/axios.service";
import { 
  UserIcon, 
  GroupIcon, 
  BoxCubeIcon, 
  TagIcon, 
  VideoIcon, 
  WalletIcon, 
  CheckCircleIcon 
} from "../../icons";

interface DashboardStats {
  users: number;
  teachers: number;
  courses: number;
  categories: number;
  videos: number;
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
          paymentsRes,
        ] = await Promise.all([
          axiosClient.get('/user').catch(() => ({ data: [] })),
          axiosClient.get('/teachers').catch(() => ({ data: [] })),
          axiosClient.get('/course?limit=1000&includeVideos=true&includeEnrollments=true&includeInactive=true').catch(() => ({ data: { courses: [] } })),
          axiosClient.get('/category').catch(() => ({ data: [] })),
          axiosClient.get('/payment').catch(() => ({ data: [] })),
        ]);

        const coursesData = Array.isArray(coursesRes.data?.courses) ? coursesRes.data.courses : (Array.isArray(coursesRes.data) ? coursesRes.data : []);
        
        console.log('=== DASHBOARD DEBUG ===');
        console.log('Raw courses response:', coursesRes.data);
        console.log('Courses data array:', coursesData);
        console.log('Number of courses:', coursesData.length);
        if (coursesData.length > 0) {
          console.log('First course example:', coursesData[0]);
          console.log('First course has videos?', !!coursesData[0]?.videos);
          console.log('First course has enrollments?', !!coursesData[0]?.enrollments);
        }
        
        // Count all videos from all courses
        const allVideos = coursesData.reduce((acc: any[], course: any) => {
          if (course.videos && Array.isArray(course.videos)) {
            console.log(`Course "${course.title}" has ${course.videos.length} videos`);
            return [...acc, ...course.videos];
          } else {
            console.log(`Course "${course.title}" has NO videos array`);
          }
          return acc;
        }, []);
        
        // Count all enrollments from all courses
        const allEnrollments = coursesData.reduce((acc: any[], course: any) => {
          if (course.enrollments && Array.isArray(course.enrollments)) {
            console.log(`Course "${course.title}" has ${course.enrollments.length} enrollments`);
            return [...acc, ...course.enrollments];
          } else {
            console.log(`Course "${course.title}" has NO enrollments array`);
          }
          return acc;
        }, []);

        setStats({
          users: Array.isArray(usersRes.data) ? usersRes.data.length : 0,
          teachers: Array.isArray(teachersRes.data) ? teachersRes.data.length : 0,
          courses: coursesData.length,
          categories: Array.isArray(categoriesRes.data) ? categoriesRes.data.length : 0,
          videos: allVideos.length,
          payments: Array.isArray(paymentsRes.data) ? paymentsRes.data.length : 0,
          enrollments: allEnrollments.length,
        });
        
        console.log('Dashboard stats:', {
          courses: coursesData.length,
          videos: allVideos.length,
          enrollments: allEnrollments.length,
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
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <div className="animate-pulse">
              <div className="mb-4 h-12 w-12 rounded-xl bg-gray-200 dark:bg-gray-700"></div>
              <div className="mb-3 h-5 w-24 rounded bg-gray-200 dark:bg-gray-700"></div>
              <div className="h-8 w-16 rounded bg-gray-200 dark:bg-gray-700"></div>
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
      icon: UserIcon,
      gradient: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-500/10",
      iconColor: "text-blue-600 dark:text-blue-400",
      borderColor: "border-blue-200 dark:border-blue-900/50",
    },
    {
      title: "O'qituvchilar",
      value: stats.teachers,
      icon: GroupIcon,
      gradient: "from-teal-500 to-teal-600",
      bgColor: "bg-teal-50 dark:bg-teal-500/10",
      iconColor: "text-teal-600 dark:text-teal-400",
      borderColor: "border-teal-200 dark:border-teal-900/50",
    },
    {
      title: "Kurslar / Videolar",
      value: stats.courses,
      secondaryValue: stats.videos,
      icon: BoxCubeIcon,
      gradient: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-500/10",
      iconColor: "text-purple-600 dark:text-purple-400",
      borderColor: "border-purple-200 dark:border-purple-900/50",
    },
    {
      title: "Kategoriyalar",
      value: stats.categories,
      icon: TagIcon,
      gradient: "from-amber-500 to-amber-600",
      bgColor: "bg-amber-50 dark:bg-amber-500/10",
      iconColor: "text-amber-600 dark:text-amber-400",
      borderColor: "border-amber-200 dark:border-amber-900/50",
    },
    {
      title: "To'lovlar",
      value: stats.payments,
      icon: WalletIcon,
      gradient: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-500/10",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      borderColor: "border-emerald-200 dark:border-emerald-900/50",
    },
    {
      title: "Obunalar",
      value: stats.enrollments,
      icon: CheckCircleIcon,
      gradient: "from-pink-500 to-pink-600",
      bgColor: "bg-pink-50 dark:bg-pink-500/10",
      iconColor: "text-pink-600 dark:text-pink-400",
      borderColor: "border-pink-200 dark:border-pink-900/50",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <div
            key={index}
            className={`group relative overflow-hidden rounded-xl border ${metric.borderColor} bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 dark:bg-gray-900`}
          >
            {/* Gradient overlay on hover */}
            <div className={`absolute inset-0 bg-linear-to-br ${metric.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-5`}></div>
            
            {/* Content */}
            <div className="relative">
              <div className="flex items-start justify-between mb-3">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {metric.title}
                </p>
                <div className={`shrink-0 rounded-xl ${metric.bgColor} p-3 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                  <Icon className={`h-7 w-7 ${metric.iconColor}`} />
                </div>
              </div>
              <div>
                {metric.secondaryValue !== undefined ? (
                  <div className="space-y-2">
                    <div className="flex items-stretch gap-3">
                      <div className="flex-1 rounded-lg bg-linear-to-br from-purple-50 to-transparent p-3 dark:from-purple-500/5">
                        <div className="text-[10px] uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-1.5 font-semibold">
                          Kurslar
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                          {metric.value.toLocaleString()}
                        </p>
                      </div>
                      <div className="w-0.5 bg-linear-to-b from-transparent via-purple-300 to-transparent dark:via-purple-700"></div>
                      <div className="flex-1 rounded-lg bg-linear-to-br from-purple-50 to-transparent p-3 dark:from-purple-500/5">
                        <div className="text-[10px] uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-1.5 font-semibold">
                          Videolar
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                          {metric.secondaryValue.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-4xl font-bold text-gray-900 dark:text-white mb-1 tracking-tight">
                    {metric.value.toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}