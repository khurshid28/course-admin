import { useEffect, useState } from "react";
import axiosClient from "../../service/axios.service";
import { LoadSpinner } from "../spinner/load-spinner";
import Moment from "moment";

interface Test {
  id: number;
  name: string;
  createdt: string;
  group_id?: number;
  subject_id?: number;
  book_id?: number;
  section_id?: number;
}

export default function RecentTests() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await axiosClient.get('/test/all');
        const allTests = response.data || [];
        // Oxirgi 5 ta testni olish
        setTests(allTests.slice(-5).reverse());
      } catch (error) {
        console.error('Testlar yuklanmadi:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3">
        <div className="animate-pulse">
          <div className="mb-4 h-6 w-48 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
                  <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3">
      <h3 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">
        Oxirgi testlar
      </h3>

      <div className="space-y-4">
        {tests.map((test) => (
          <div key={test.id} className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
              <span className="text-lg">📝</span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">
                {test.name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {Moment(test.createdt).format('DD.MM.YYYY HH:mm')}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Faol</span>
            </div>
          </div>
        ))}

        {tests.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">Hozircha testlar mavjud emas</p>
          </div>
        )}
      </div>

      <div className="mt-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Jami testlar:</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {tests.length}
          </span>
        </div>
      </div>
    </div>
  );
}