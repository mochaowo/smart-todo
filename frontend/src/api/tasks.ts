import axios, { AxiosError } from 'axios';
import { Task, TaskCreate, TaskUpdate, TaskStatus } from '../types/Task';

// 獲取環境變量
const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  const mode = import.meta.env.MODE;
  
  console.log('Build Mode:', mode);
  console.log('Environment API URL:', envUrl);
  
  if (!envUrl && mode === 'production') {
    console.error('Production API URL is not set!');
    return 'https://smart-todo-2.onrender.com';
  }
  
  return envUrl || 'http://localhost:8000';
};

const API_BASE_URL = getApiUrl();
console.log('Final API URL:', API_BASE_URL);

// 創建 axios 實例
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

// 請求攔截器
api.interceptors.request.use(
  (config) => {
    const origin = window.location.origin;
    console.log(`Making request from origin: ${origin}`);
    console.log(`[${import.meta.env.MODE}] Making ${config.method?.toUpperCase()} request to: ${config.baseURL}${config.url}`);
    return config;
  },
  (error: AxiosError) => {
    console.error('Request error:', error.message);
    return Promise.reject(error);
  }
);

// 響應攔截器
api.interceptors.response.use(
  (response) => {
    // Format single task response
    if (response.data && response.data.id && !Array.isArray(response.data)) {
      response.data = formatTaskDates(response.data);
    }
    // Format array of tasks response
    else if (Array.isArray(response.data)) {
      response.data = response.data.map(task => formatTaskDates(task));
    }
    return response;
  },
  (error: AxiosError) => {
    console.error('Response error:', error.message);
    return Promise.reject(error);
  }
);

// 格式化任務日期
const formatTaskDates = (task: any): Task => {
  return {
    ...task,
    status: task.status as TaskStatus,
    due_date: task.due_date || null,
    created_at: task.created_at,
    updated_at: task.updated_at
  };
};

// 格式化任務數據以發送到服務器
const formatTaskForApi = (task: TaskCreate | TaskUpdate): any => {
  // 創建一個新的對象，只包含需要發送的字段
  const formattedTask: any = {
    title: task.title,
    description: task.description,
    priority: task.priority,
    status: task.status,
    due_date: task.due_date,
    tags: task.tags
  };

  // 格式化日期
  if (formattedTask.due_date) {
    formattedTask.due_date = new Date(formattedTask.due_date).toISOString();
  }

  // 格式化狀態
  if (formattedTask.status) {
    formattedTask.status = formattedTask.status.toString();
  }

  return formattedTask;
};

export const getTasks = async (): Promise<Task[]> => {
  try {
    console.log('Fetching tasks...');
    const response = await api.get<Task[]>('/tasks');
    return response.data;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
};

export const createTask = async (task: TaskCreate): Promise<Task> => {
  try {
    console.log('Creating task:', task);
    const formattedTask = formatTaskForApi(task);
    const response = await api.post<Task>('/tasks', formattedTask);
    return response.data;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

export const updateTask = async (id: number, task: TaskUpdate): Promise<Task> => {
  try {
    console.log('Updating task:', id, task);
    const formattedTask = formatTaskForApi(task);
    const response = await api.put<Task>(`/tasks/${id}`, formattedTask);
    return response.data;
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

export const deleteTask = async (id: number): Promise<void> => {
  try {
    console.log('Deleting task:', id);
    await api.delete(`/tasks/${id}`);
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};

export const reorderTask = async (taskId: number, newPosition: number): Promise<void> => {
  try {
    console.log('Reordering task:', taskId, 'to position:', newPosition);
    await api.post('/tasks/reorder', { task_id: taskId, new_position: newPosition });
  } catch (error) {
    console.error('Error reordering task:', error);
    throw error;
  }
};
