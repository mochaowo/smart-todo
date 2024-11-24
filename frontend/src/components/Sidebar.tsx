import React from 'react';
import { Task, TaskStatus } from '../types/Task';
import { ChartBarIcon, CheckCircleIcon, ClockIcon, PlayIcon, ExclamationCircleIcon, PlusIcon, ViewColumnsIcon, ListBulletIcon } from '@heroicons/react/24/outline';

interface SidebarProps {
  tasks: Task[];
  view: 'list' | 'kanban';
  onViewChange: (view: 'list' | 'kanban') => void;
  onAddTask: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ tasks, view, onViewChange, onAddTask }) => {
  const getTaskStats = () => {
    const total = tasks.length;
    const todo = tasks.filter(task => task.status === TaskStatus.TODO).length;
    const inProgress = tasks.filter(task => task.status === TaskStatus.IN_PROGRESS).length;
    const done = tasks.filter(task => task.status === TaskStatus.DONE).length;
    const highPriority = tasks.filter(task => task.priority === 3).length;
    const mediumPriority = tasks.filter(task => task.priority === 2).length;
    const lowPriority = tasks.filter(task => task.priority === 1).length;

    return { total, todo, inProgress, done, highPriority, mediumPriority, lowPriority };
  };

  const stats = getTaskStats();

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm h-full">
      <button
        onClick={onAddTask}
        className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg mb-6 flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors"
      >
        <PlusIcon className="h-5 w-5" />
        <span>新增任務</span>
      </button>

      <div className="space-y-2">
        <button
          onClick={() => onViewChange('list')}
          className={`w-full px-4 py-2 rounded-lg flex items-center gap-2 ${
            view === 'list'
              ? 'bg-blue-50 text-blue-600'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <ListBulletIcon className="h-5 w-5" />
          <span>列表視圖</span>
        </button>
        <button
          onClick={() => onViewChange('kanban')}
          className={`w-full px-4 py-2 rounded-lg flex items-center gap-2 ${
            view === 'kanban'
              ? 'bg-blue-50 text-blue-600'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <ViewColumnsIcon className="h-5 w-5" />
          <span>看板視圖</span>
        </button>
      </div>

      <div className="space-y-6 mt-6">
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <ChartBarIcon className="w-5 h-5 mr-2" />
            狀態統計
          </h2>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-gray-600">
                <ClockIcon className="w-5 h-5 mr-2 text-gray-500" />
                未開始
              </div>
              <span className="font-medium">{stats.todo}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center text-blue-600">
                <PlayIcon className="w-5 h-5 mr-2 text-blue-500" />
                進行中
              </div>
              <span className="font-medium">{stats.inProgress}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center text-green-600">
                <CheckCircleIcon className="w-5 h-5 mr-2 text-green-500" />
                已完成
              </div>
              <span className="font-medium">{stats.done}</span>
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <ExclamationCircleIcon className="w-5 h-5 mr-2" />
            優先級統計
          </h2>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-red-600">
                <span className="w-2 h-2 rounded-full bg-red-500 mr-2" />
                高優先級
              </div>
              <span className="font-medium">{stats.highPriority}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center text-yellow-600">
                <span className="w-2 h-2 rounded-full bg-yellow-500 mr-2" />
                中優先級
              </div>
              <span className="font-medium">{stats.mediumPriority}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center text-green-600">
                <span className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                低優先級
              </div>
              <span className="font-medium">{stats.lowPriority}</span>
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center justify-between font-semibold">
            <span>總計</span>
            <span>{stats.total}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
