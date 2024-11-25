import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import { Task, TaskStatus, TaskCreate } from './types/Task';
import LeftSidebar from './components/LeftSidebar';
import RightSidebar from './components/RightSidebar';
import toast, { Toaster } from 'react-hot-toast';
import { ClipboardDocumentCheckIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import KanbanBoard from './components/KanbanBoard';
import Analytics from './components/Analytics';
import ArticleList from './components/ArticleList';
import ArticleDetail from './components/ArticleDetail';
import ArticleEditor from './components/ArticleEditor';
import { getTasks, createTask, updateTask, deleteTask } from './api/tasks';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filterStatus] = useState<'all' | 'pending' | 'completed'>('all');
  const [currentView, setCurrentView] = useState('tasks');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await getTasks();
        setTasks(data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        toast.error('加載任務失敗');
      }
    };

    fetchTasks();
  }, []);

  const handleCreateTask = async (task: TaskCreate) => {
    try {
      const newTask = await createTask(task);
      setTasks(prevTasks => [...prevTasks, newTask]);
      toast.success('任務已創建');
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('創建任務失敗');
    }
  };

  const handleToggleStatus = async (taskId: number) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      let nextStatus: TaskStatus;
      switch (task.status) {
        case TaskStatus.TODO:
          nextStatus = TaskStatus.IN_PROGRESS;
          break;
        case TaskStatus.IN_PROGRESS:
          nextStatus = TaskStatus.DONE;
          break;
        case TaskStatus.DONE:
          nextStatus = TaskStatus.TODO;
          break;
        default:
          nextStatus = TaskStatus.TODO;
      }

      const updatedTask = await updateTask(taskId, {
        ...task,
        status: nextStatus
      });

      setTasks(prevTasks =>
        prevTasks.map(t => (t.id === taskId ? updatedTask : t))
      );
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('更新任務失敗');
    }
  };

  const handleUpdateTask = async (taskId: number, updates: Partial<Task>) => {
    try {
      const updatedTask = await updateTask(taskId, updates);
      setTasks(prevTasks =>
        prevTasks.map(t => (t.id === taskId ? updatedTask : t))
      );
      toast.success('任務已更新');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('更新任務失敗');
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await deleteTask(taskId);
      setTasks(prevTasks => prevTasks.filter(t => t.id !== taskId));
      toast.success('任務已刪除');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('刪除任務失敗');
    }
  };

  const handleReorderTask = async (result: any) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    const taskId = parseInt(draggableId);
    const task = tasks.find(t => t.id === taskId);
    
    if (!task) return;

    const newTasks = Array.from(tasks);
    const [removed] = newTasks.splice(source.index, 1);
    newTasks.splice(destination.index, 0, removed);

    setTasks(newTasks);

    try {
      // 更新任務順序
      const updates = {
        ...task,
        order: destination.index
      };
      await updateTask(taskId, updates);
    } catch (error) {
      console.error('Error reordering task:', error);
      toast.error('重新排序失敗');
      // 如果更新失敗，恢復原始順序
      setTasks([...tasks]);
    }
  };

  const filteredTasks = useMemo(() => tasks.filter(task => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'pending' && task.status === TaskStatus.DONE) return false;
    if (filterStatus === 'completed' && task.status !== TaskStatus.DONE) return false;
    return true;
  }), [tasks, filterStatus]);

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-6 shadow-sm fixed w-full z-10">
          <div className="flex items-center space-x-3">
            <ClipboardDocumentCheckIcon className="h-8 w-8 text-blue-500" />
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Smart Todo</h1>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex flex-1 pt-16">
          {/* Left Sidebar */}
          <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 fixed h-full">
            <nav className="p-4 space-y-2">
              <div className="mb-8">
                <h2 className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  主要功能
                </h2>
                <div className="mt-2 space-y-1">
                  <Link
                    to="/"
                    className={`flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md ${currentView === 'tasks' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                    onClick={() => setCurrentView('tasks')}
                  >
                    <ClipboardDocumentCheckIcon className="h-5 w-5 mr-2" />
                    待辦事項
                  </Link>
                  <button
                    onClick={() => setCurrentView('kanban')}
                    className={`w-full flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md ${currentView === 'kanban' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                  >
                    <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2" />
                      <line x1="9" y1="3" x2="9" y2="21" strokeWidth="2" />
                      <line x1="15" y1="3" x2="15" y2="21" strokeWidth="2" />
                    </svg>
                    看板
                  </button>
                  <button
                    onClick={() => setCurrentView('calendar')}
                    className={`w-full flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md ${currentView === 'calendar' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                  >
                    <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="2" />
                      <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" />
                      <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" />
                      <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" />
                    </svg>
                    月曆
                  </button>
                  <button
                    onClick={() => setCurrentView('analytics')}
                    className={`w-full flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md ${currentView === 'analytics' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                  >
                    <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M12 20V10" strokeWidth="2" strokeLinecap="round" />
                      <path d="M18 20V4" strokeWidth="2" strokeLinecap="round" />
                      <path d="M6 20V16" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    統計數據
                  </button>
                </div>
              </div>

              <div className="mb-8">
                <h2 className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  其他功能
                </h2>
                <div className="mt-2 space-y-1">
                  <Link
                    to="/articles"
                    className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                  >
                    <DocumentTextIcon className="h-5 w-5 mr-2" />
                    文章
                  </Link>
                </div>
              </div>
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 ml-64 mr-64 p-6 h-[calc(100vh-2rem)] overflow-y-auto">
            <Routes>
              <Route path="/" element={
                <div className="container mx-auto pb-6">
                  {currentView === 'tasks' && (
                    <>
                      <div className="mb-4">
                        <TaskForm onSubmit={handleCreateTask} />
                      </div>
                      <div>
                        <TaskList
                          tasks={filteredTasks}
                          onToggleStatus={handleToggleStatus}
                          onDelete={handleDeleteTask}
                          onUpdate={handleUpdateTask}
                          onReorder={handleReorderTask}
                        />
                      </div>
                    </>
                  )}
                  {currentView === 'kanban' && (
                    <div>
                      <KanbanBoard
                        tasks={tasks}
                        onToggleStatus={handleToggleStatus}
                        onDelete={handleDeleteTask}
                        onUpdate={handleUpdateTask}
                      />
                    </div>
                  )}
                  {currentView === 'calendar' && (
                    <div>
                      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        月曆視圖開發中...
                      </div>
                    </div>
                  )}
                  {currentView === 'analytics' && (
                    <div>
                      <Analytics tasks={tasks} />
                    </div>
                  )}
                </div>
              } />
              <Route path="/articles" element={<ArticleList />} />
              <Route path="/articles/new" element={<ArticleEditor />} />
              <Route path="/articles/:id" element={<ArticleDetail />} />
              <Route path="/articles/:id/edit" element={<ArticleEditor />} />
            </Routes>
          </main>

          {/* Right Sidebar */}
          <aside className="w-64 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 fixed right-0 h-full overflow-y-auto">
            <RightSidebar tasks={tasks} />
          </aside>
        </div>

        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App;
