import { useEffect, useState } from "react";
import axiosClient from "../../service/axios.service";
import { LoadSpinner } from "../spinner/load-spinner";

interface SubjectData {
  id: number;
  name: string;
  createdt: string;
}

export default function SubjectDistributionChart() {
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await axiosClient.get('/subject/all');
        setSubjects(response.data || []);
      } catch (error) {
        console.error('Fanlar yuklanmadi:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  // Har bir fan uchun taxminiy qiymatlar yaratish
  const getSubjectValue = (index: number) => Math.floor(Math.random() * 50 + 10);

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3">
        <div className="animate-pulse">
          <div className="mb-4 h-6 w-48 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="h-4 w-16 rounded bg-gray-200 dark:bg-gray-700"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Ranglar massivi
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-orange-500',
    'bg-red-500',
    'bg-indigo-500',
    'bg-pink-500',
    'bg-teal-500',
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3">
      <h3 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">
        Fanlar bo'yicha taqsimot
      </h3>

      <div className="space-y-4">
        {subjects.slice(0, 8).map((subject, index) => {
          const value = getSubjectValue(index);
          const percentage = Math.random() * 60 + 20;

          return (
            <div
              key={subject.id}
              className="flex items-center justify-between group cursor-pointer"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="flex items-center gap-3">
                <div className={`h-3 w-3 rounded-full ${colors[index % colors.length]} transition-transform group-hover:scale-125`}></div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                  {subject.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-20 rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className={`h-2 rounded-full ${colors[index % colors.length]} transition-all duration-500 group-hover:opacity-80`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className={`text-sm transition-colors ${
                  hoveredIndex === index
                    ? 'text-gray-900 dark:text-white font-semibold'
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {hoveredIndex === index ? value : Math.floor(percentage)}
                </span>
              </div>
            </div>
          );
        })}

        {subjects.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">Hozircha fanlar mavjud emas</p>
          </div>
        )}
      </div>

      <div className="mt-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Jami fanlar:</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {subjects.length}
          </span>
        </div>
      </div>
    </div>
  );
}