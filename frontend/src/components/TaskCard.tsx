import React, { useState, useRef, useEffect } from 'react';
import { Task, TaskStatus } from '../types/Task';
import { TrashIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';

interface TaskCardProps {
  task: Task;
  onToggleStatus: (id: number) => void;
  onDelete: (id: number) => void;
  onUpdateTask?: (id: number, updates: Partial<Task>) => void;
}

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  task: Task;
  onDelete: () => void;
  onUpdateTask?: (updates: Partial<Task>) => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onClose, task, onDelete, onUpdateTask }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="fixed bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
      style={{ 
        left: `${x}px`,
        top: `${y}px`,
        minWidth: '200px'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="px-4 py-2 text-sm font-medium text-gray-700 border-b border-gray-200">
        任務設定
      </div>
      <div className="py-1">
        <div className="px-4 py-2">
          <div className="text-sm text-gray-700 mb-2">優先級</div>
          <div className="space-y-2">
            {[3, 2, 1].map((priority) => (
              <div
                key={priority}
                className={`px-3 py-1.5 rounded cursor-pointer hover:bg-gray-100 ${
                  task.priority === priority ? 'bg-blue-50 text-blue-600' : ''
                }`}
                onClick={() => {
                  onUpdateTask?.({ priority });
                  onClose();
                }}
              >
                {priority === 1 && '低優先級'}
                {priority === 2 && '中優先級'}
                {priority === 3 && '高優先級'}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-gray-200">
        <div
          className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
          onClick={() => {
            onDelete();
            onClose();
          }}
        >
          刪除任務
        </div>
      </div>
    </div>
  );
};

const TaskCard: React.FC<TaskCardProps> = ({ task, onToggleStatus, onDelete, onUpdateTask }) => {
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    const { pageX, pageY } = e;
    setContextMenuPosition({ x: pageX, y: pageY });
    setShowContextMenu(true);
  };

  const getStatusStyles = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO:
        return {
          background: 'bg-gray-200',
          text: 'text-gray-700',
          tag: 'bg-gray-300'
        };
      case TaskStatus.IN_PROGRESS:
        return {
          background: 'bg-blue-200',
          text: 'text-blue-700',
          tag: 'bg-blue-300'
        };
      case TaskStatus.DONE:
        return {
          background: 'bg-green-200',
          text: 'text-green-700',
          tag: 'bg-green-300'
        };
      default:
        return {
          background: 'bg-gray-200',
          text: 'text-gray-700',
          tag: 'bg-gray-300'
        };
    }
  };

  const getStatusText = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO:
        return '未開始';
      case TaskStatus.IN_PROGRESS:
        return '進行中';
      case TaskStatus.DONE:
        return '已完成';
      default:
        return '未開始';
    }
  };

  const getTags = () => {
    if (!task.tags) return [];
    if (Array.isArray(task.tags)) return task.tags;
    return task.tags.split(',').map(tag => tag.trim()).filter(Boolean);
  };

  const statusStyles = getStatusStyles(task.status);

  return (
    <>
      <div
        className={`rounded-lg shadow-sm border p-4 cursor-pointer transition-all duration-200 ${statusStyles.background} border-gray-200`}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest('button')) {
            return;
          }
          onToggleStatus(task.id);
        }}
        onContextMenu={handleContextMenu}
      >
        {/* Header: Title, Status and Delete Button */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-medium text-gray-900 line-clamp-2">{task.title}</h3>
              {task.priority && (
                <span className={`
                  flex-shrink-0 text-xs px-2 py-1 rounded-full font-medium
                  ${task.priority === 3 ? 'bg-red-100 text-red-800' : 
                    task.priority === 2 ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-blue-100 text-blue-800'}
                `}>
                  {task.priority === 3 ? '高' : 
                   task.priority === 2 ? '中' : '低'}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-1 rounded-full ${statusStyles.tag} ${statusStyles.text}`}>
              {getStatusText(task.status)}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task.id);
              }}
              className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors duration-200"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-gray-600 text-sm mb-3">{task.description}</p>
        )}

        {/* Footer: Tags and Due Date */}
        <div className="flex items-end justify-between mt-2">
          {/* Tags */}
          <div className="flex-1 mr-4">
            {getTags().length > 0 && (
              <div className="flex flex-wrap gap-1">
                {getTags().map((tag, index) => (
                  <span
                    key={index}
                    className="text-xs px-2 py-0.5 rounded-full bg-white bg-opacity-50"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Due Date */}
          {task.due_date && (
            <div className="flex-shrink-0 -mb-4 -mr-4">
              <span className="inline-block px-3 py-2 bg-purple-100 text-purple-700 text-xs rounded-bl-lg">
                {format(new Date(task.due_date), 'MM/dd', { locale: zhTW })} 到期
              </span>
            </div>
          )}
        </div>
      </div>

      {showContextMenu && (
        <>
          <div className="fixed inset-0 bg-transparent" onClick={() => setShowContextMenu(false)} />
          <ContextMenu
            x={contextMenuPosition.x}
            y={contextMenuPosition.y}
            onClose={() => setShowContextMenu(false)}
            task={task}
            onDelete={() => onDelete(task.id)}
            onUpdateTask={updates => onUpdateTask?.(task.id, updates)}
          />
        </>
      )}
    </>
  );
};

export default TaskCard;
