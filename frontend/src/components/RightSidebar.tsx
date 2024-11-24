import React from 'react';
import { Task, TaskStatus } from '../types/Task';

interface RightSidebarProps {
  tasks: Task[];
}

const RightSidebar: React.FC<RightSidebarProps> = ({ tasks }) => {
  const getStatusCount = (status: TaskStatus) => {
    return tasks.filter(task => task.status === status).length;
  };

  const getPriorityCount = (priority: number) => {
    return tasks.filter(task => task.priority === priority).length;
  };

  return (
    <div className="h-full bg-white border-l border-gray-200">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">任務統計</h2>
        
        {/* Total Tasks */}
        <div className="mb-6 bg-blue-50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-blue-700 font-medium">總任務數量</span>
            <span className="text-2xl font-bold text-blue-700">{tasks.length}</span>
          </div>
        </div>

        {/* Status Statistics */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">狀態分布</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">未開始</span>
              <span className="text-sm font-medium text-gray-900">{getStatusCount(TaskStatus.TODO)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">進行中</span>
              <span className="text-sm font-medium text-gray-900">{getStatusCount(TaskStatus.IN_PROGRESS)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">已完成</span>
              <span className="text-sm font-medium text-gray-900">{getStatusCount(TaskStatus.DONE)}</span>
            </div>
          </div>
        </div>

        {/* Priority Statistics */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">優先級分布</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">高優先級</span>
              <span className="text-sm font-medium text-gray-900">{getPriorityCount(3)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">中優先級</span>
              <span className="text-sm font-medium text-gray-900">{getPriorityCount(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">低優先級</span>
              <span className="text-sm font-medium text-gray-900">{getPriorityCount(1)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;
