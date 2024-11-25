import React, { useMemo } from 'react';
import { Task, TaskStatus } from '../types/Task';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';

// 註冊 ChartJS 組件
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface AnalyticsProps {
  tasks: Task[];
}

const Analytics: React.FC<AnalyticsProps> = ({ tasks }) => {
  // 計算任務狀態分布
  const statusDistribution = useMemo(() => {
    const distribution = {
      [TaskStatus.TODO]: 0,
      [TaskStatus.IN_PROGRESS]: 0,
      [TaskStatus.DONE]: 0,
    };
    tasks.forEach(task => {
      distribution[task.status]++;
    });
    return distribution;
  }, [tasks]);

  // 計算優先級分布
  const priorityDistribution = useMemo(() => {
    const distribution = {
      '低': 0,
      '中': 0,
      '高': 0,
    };
    tasks.forEach(task => {
      switch (task.priority) {
        case 1:
          distribution['低']++;
          break;
        case 2:
          distribution['中']++;
          break;
        case 3:
          distribution['高']++;
          break;
      }
    });
    return distribution;
  }, [tasks]);

  // 計算最近7天的任務完成趨勢
  const completionTrend = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date;
    }).reverse();

    const trend = last7Days.map(date => {
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      
      return {
        date: format(date, 'MM/dd', { locale: zhTW }),
        completed: tasks.filter(task => {
          if (task.updated_at && task.status === TaskStatus.DONE) {
            const updateDate = new Date(task.updated_at);
            return updateDate >= dayStart && updateDate <= dayEnd;
          }
          return false;
        }).length
      };
    });

    return trend;
  }, [tasks]);

  // 狀態分布圖表數據
  const statusChartData = {
    labels: ['未開始', '進行中', '已完成'],
    datasets: [
      {
        label: '任務數量',
        data: [
          statusDistribution[TaskStatus.TODO],
          statusDistribution[TaskStatus.IN_PROGRESS],
          statusDistribution[TaskStatus.DONE],
        ],
        backgroundColor: [
          'rgba(255, 206, 86, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(75, 192, 192, 0.5)',
        ],
        borderColor: [
          'rgba(255, 206, 86, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // 優先級分布圖表數據
  const priorityChartData = {
    labels: ['低', '中', '高'],
    datasets: [
      {
        label: '任務數量',
        data: [
          priorityDistribution['低'],
          priorityDistribution['中'],
          priorityDistribution['高'],
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(255, 99, 132, 0.5)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // 完成趨勢圖表數據
  const trendChartData = {
    labels: completionTrend.map(item => item.date),
    datasets: [
      {
        label: '完成任務數',
        data: completionTrend.map(item => item.completed),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        left: 10,
        right: 10,
        top: 10,
        bottom: 10
      }
    },
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        border: {
          display: false
        },
        grid: {
          color: '#e5e7eb',
          drawTicks: false,
          drawBorder: false
        },
        ticks: {
          stepSize: 1,
          padding: 10
        }
      },
      x: {
        border: {
          display: false
        },
        grid: {
          display: false,
          drawBorder: false
        },
        ticks: {
          padding: 5
        }
      }
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        left: 10,
        right: 10,
        top: 10,
        bottom: 30
      }
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20
        }
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* 統計數字總覽 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h4 className="text-sm font-medium text-gray-500">總任務數</h4>
          <p className="text-2xl font-bold text-gray-800">{tasks.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h4 className="text-sm font-medium text-gray-500">已完成任務</h4>
          <p className="text-2xl font-bold text-green-600">{statusDistribution[TaskStatus.DONE]}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h4 className="text-sm font-medium text-gray-500">進行中任務</h4>
          <p className="text-2xl font-bold text-blue-600">{statusDistribution[TaskStatus.IN_PROGRESS]}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h4 className="text-sm font-medium text-gray-500">待處理任務</h4>
          <p className="text-2xl font-bold text-yellow-600">{statusDistribution[TaskStatus.TODO]}</p>
        </div>
      </div>

      {/* 圖表區域 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* 任務狀態分布 */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">任務狀態分布</h3>
          <div className="h-48">
            <Pie data={statusChartData} options={pieOptions} />
          </div>
        </div>

        {/* 任務優先級分布 */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">任務優先級分布</h3>
          <div className="h-48">
            <Pie data={priorityChartData} options={pieOptions} />
          </div>
        </div>

        {/* 任務完成趨勢 */}
        <div className="bg-white p-4 rounded-lg shadow-md md:col-span-2">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">近7天任務完成趨勢</h3>
          <div className="h-48">
            <Bar data={trendChartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
