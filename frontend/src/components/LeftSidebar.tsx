import React, { useState } from 'react';
import { 
  ViewColumnsIcon,
  ChartBarIcon,
  CalendarIcon,
  HomeIcon
} from '@heroicons/react/24/outline';

interface LeftSidebarProps {
  onViewChange: (view: string) => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ onViewChange }) => {
  const [activeView, setActiveView] = useState('tasks');

  const menuItems = [
    { id: 'tasks', name: '所有任務', icon: HomeIcon },
    { id: 'kanban', name: '看板視圖', icon: ViewColumnsIcon },
    { id: 'calendar', name: '日曆視圖', icon: CalendarIcon },
    { id: 'analytics', name: '統計圖表', icon: ChartBarIcon },
  ];

  const handleViewChange = (viewId: string) => {
    setActiveView(viewId);
    onViewChange(viewId);
  };

  return (
    <div className="h-full bg-white border-r border-gray-200">
      <div className="p-4">
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleViewChange(item.id)}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150 ${
                activeView === item.id
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
              {item.name}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default LeftSidebar;
