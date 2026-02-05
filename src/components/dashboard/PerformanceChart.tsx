import { useEffect, useState } from "react";

export default function PerformanceChart() {
  const [data, setData] = useState<number[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    // Taxminiy ma'lumotlar yaratish
    const generateData = () => {
      const months = [];
      for (let i = 0; i < 12; i++) {
        months.push(Math.floor(Math.random() * 100 + 50));
      }
      setData(months);
    };

    generateData();
  }, []);

  const maxValue = Math.max(...data);
  const months = [
    'Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun',
    'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3">
      <h3 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">
        O'quvchilar faolligi
      </h3>

      <div className="flex items-end justify-between gap-2">
        {data.map((value, index) => (
          <div
            key={index}
            className="relative flex flex-col items-center gap-2 group cursor-pointer"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {/* Hover tooltip */}
            {hoveredIndex === index && (
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-3 py-1 rounded-lg text-sm font-medium shadow-lg z-10">
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                <div className="text-center">
                  <div className="font-bold">{value}</div>
                  <div className="text-xs opacity-75">{months[index]}</div>
                </div>
              </div>
            )}

            <div className="relative flex h-32 w-8 items-end rounded-t bg-gray-100 dark:bg-gray-800 transition-all duration-300 group-hover:scale-110">
              <div
                className="w-full rounded-t bg-linear-to-t from-blue-500 to-blue-600 transition-all duration-500 hover:from-blue-600 hover:to-blue-700"
                style={{ height: `${(value / maxValue) * 100}%` }}
              ></div>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 transition-colors group-hover:text-gray-700 dark:group-hover:text-gray-300">
              {months[index]}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-blue-500"></div>
          <span className="text-gray-600 dark:text-gray-400">Test topshirganlar</span>
        </div>
        <div className="text-right">
          <p className="font-semibold text-gray-900 dark:text-white">
            {data.reduce((a, b) => a + b, 0)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Jami</p>
        </div>
      </div>
    </div>
  );
}