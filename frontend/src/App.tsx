import React, { useEffect, useState, useMemo } from 'react';
import { Task, TaskStatus, TaskCreate } from './types/Task';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import LeftSidebar from './components/LeftSidebar';
import RightSidebar from './components/RightSidebar';
import { getTasks, createTask, updateTask, deleteTask } from './api/tasks';
import toast, { Toaster } from 'react-hot-toast';
import { ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';
import KanbanBoard from './components/KanbanBoard';
import Analytics from './components/Analytics';
import { DocumentTextIcon } from '@heroicons/react/24/outline';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [currentView, setCurrentView] = useState('tasks');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (error) {
      toast.error('加載任務失敗');
    }
  };

  const handleCreateTask = async (taskData: TaskCreate) => {
    try {
      const newTask = await createTask(taskData);
      setTasks([...tasks, newTask]);
      toast.success('任務創建成功');
    } catch (error) {
      toast.error('創建任務失敗');
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      const task = tasks.find(t => t.id === id);
      if (!task) return;

      let newStatus: TaskStatus;
      switch (task.status) {
        case TaskStatus.TODO:
          newStatus = TaskStatus.IN_PROGRESS;
          break;
        case TaskStatus.IN_PROGRESS:
          newStatus = TaskStatus.DONE;
          break;
        case TaskStatus.DONE:
          newStatus = TaskStatus.TODO;
          break;
        default:
          newStatus = TaskStatus.TODO;
      }

      const result = await updateTask(id, { ...task, status: newStatus });
      setTasks(tasks.map(t => t.id === id ? result : t));
      toast.success(`任務狀態已更新為${newStatus === TaskStatus.TODO ? '未開始' : newStatus === TaskStatus.IN_PROGRESS ? '進行中' : '已完成'}`);
    } catch (error) {
      toast.error('更新任務失敗');
    }
  };

  const handleUpdateTask = async (id: number, updates: Partial<Task>) => {
    try {
      const result = await updateTask(id, updates);
      setTasks(tasks.map(task => task.id === id ? result : task));
      toast.success('任務更新成功');
    } catch (error) {
      toast.error('更新任務失敗');
    }
  };

  const handleDeleteTask = async (id: number) => {
    try {
      await deleteTask(id);
      setTasks(tasks.filter(task => task.id !== id));
      toast.success('任務刪除成功');
    } catch (error) {
      toast.error('刪除任務失敗');
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    const taskId = parseInt(draggableId);
    const task = tasks.find(t => t.id === taskId);

    if (!task) return;

    try {
      if (source.droppableId === destination.droppableId) {
        const items = Array.from(tasks);
        const [reorderedItem] = items.splice(source.index, 1);
        items.splice(destination.index, 0, reorderedItem);
        setTasks(items);
      } else {
        const newStatus = destination.droppableId as TaskStatus;
        const result = await updateTask(taskId, { 
          ...task, 
          status: newStatus 
        });

        setTasks(prev => {
          const newTasks = prev.filter(t => t.id !== taskId);
          const insertIndex = destination.index;
          newTasks.splice(insertIndex, 0, result);
          return newTasks;
        });

        toast.success('任務移動成功');
      }
    } catch (error) {
      toast.error('移動任務失敗');
      setTasks([...tasks]);
    }
  };

  const filteredTasks = useMemo(() => tasks.filter(task => {
    if (filter === 'pending' && task.status === TaskStatus.DONE) return false;
    if (filter === 'completed' && task.status !== TaskStatus.DONE) return false;
    return true;
  }), [tasks, filter]);

  const renderMainContent = () => {
    switch (currentView) {
      case 'tasks':
        return (
          <>
            <div className="mb-8">
              <TaskForm onSubmit={handleCreateTask} />
            </div>
            <TaskList
              tasks={filteredTasks}
              onToggleStatus={handleToggleStatus}
              onDelete={handleDeleteTask}
              onUpdateTask={handleUpdateTask}
              onDragEnd={handleDragEnd}
            />
          </>
        );
      case 'kanban':
        return (
          <div className="p-4">
            <div className="mb-8">
              <TaskForm onSubmit={handleCreateTask} />
            </div>
            <KanbanBoard
              tasks={filteredTasks}
              onDragEnd={handleDragEnd}
              onToggleStatus={handleToggleStatus}
              onDelete={handleDeleteTask}
            />
          </div>
        );
      case 'calendar':
        return <div className="text-center py-12 text-gray-500">日曆視圖開發中...</div>;
      case 'analytics':
        return (
          <div className="p-4">
            <Analytics tasks={tasks} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="h-16 bg-white border-b border-gray-200 flex items-center px-6 shadow-sm">
        <div className="flex items-center space-x-3">
          <ClipboardDocumentCheckIcon className="h-8 w-8 text-blue-500" />
          <h1 className="text-2xl font-semibold text-gray-900">Todo Checklist</h1>
        </div>
        <div className="flex-1 flex justify-end">
          <a
            href="/index.html"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors ml-auto"
            title="查看系統文檔"
          >
            <DocumentTextIcon className="h-5 w-5" />
            <span className="text-sm">系統文檔</span>
          </a>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Left Sidebar */}
        <div className="w-48 flex-shrink-0">
          <LeftSidebar onViewChange={setCurrentView} />
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto">
              {renderMainContent()}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-64 flex-shrink-0">
          <RightSidebar tasks={tasks} />
        </div>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;
