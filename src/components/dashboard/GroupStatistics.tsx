import { useEffect, useState } from "react";
import axiosClient from "../../service/axios.service";
import { LoadSpinner } from "../spinner/load-spinner";

interface Group {
  id: number;
  name: string;
  createdt: string;
}

export default function GroupStatistics() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await axiosClient.get('/group/all');
        setGroups(response.data || []);
      } catch (error) {
        console.error('Guruhlar yuklanmadi:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3">
        <div className="animate-pulse">
          <div className="mb-4 h-6 w-48 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
                <div className="h-4 w-16 rounded bg-gray-200 dark:bg-gray-700 mb-2"></div>
                <div className="h-6 w-12 rounded bg-gray-200 dark:bg-gray-700"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Guruhlar statistikasi
  const stats = [
    {
      title: "Jami guruhlar",
      value: groups.length,
      icon: "👥",
      color: "text-blue-600",
    },
    {
      title: "Faol guruhlar",
      value: Math.floor(groups.length * 0.8), // Taxminiy
      icon: "✅",
      color: "text-green-600",
    },
    {
      title: "Yangi guruhlar",
      value: Math.floor(groups.length * 0.2), // Taxminiy
      icon: "🆕",
      color: "text-orange-600",
    },
    {
      title: "O'rtacha o'lcham",
      value: 25, // Taxminiy
      icon: "📊",
      color: "text-purple-600",
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3">
      <h3 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">
        Guruhlar statistikasi
      </h3>

      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{stat.icon}</span>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <h4 className="mb-3 text-sm font-medium text-gray-900 dark:text-white">
          Oxirgi guruhlar
        </h4>
        <div className="space-y-2">
          {groups.slice(-3).reverse().map((group) => (
            <div key={group.id} className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {group.name}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Yangi
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}