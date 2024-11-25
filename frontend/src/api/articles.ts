import axios from 'axios';
import { Article, ArticleCreate, ArticleUpdate } from '../types/Article';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// 創建 axios 實例
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

// 請求攔截器
axiosInstance.interceptors.request.use(
  (config) => {
    const origin = window.location.origin;
    console.log(`Making request from origin: ${origin}`);
    console.log(`[${import.meta.env.MODE}] Making ${config.method?.toUpperCase()} request to: ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error.message);
    return Promise.reject(error);
  }
);

// 響應攔截器
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Response error:', error.message);
    return Promise.reject(error);
  }
);

// 獲取文章列表
export const getArticles = async (skip: number = 0, limit: number = 10): Promise<Article[]> => {
  try {
    console.log(`Fetching articles with skip=${skip} and limit=${limit}`);
    const response = await axiosInstance.get('/articles', {
      params: {
        skip,
        limit
      }
    });
    console.log('Articles response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching articles:', error);
    throw error;
  }
};

// 獲取單篇文章
export const getArticle = async (id: number): Promise<Article> => {
  try {
    console.log(`Fetching article with id=${id}`);
    const response = await axiosInstance.get(`/articles/${id}`);
    console.log('Article response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching article:', error);
    throw error;
  }
};

// 創建文章
export const createArticle = async (article: ArticleCreate): Promise<Article> => {
  try {
    console.log('Creating article:', article);
    const response = await axiosInstance.post('/articles', article);
    console.log('Create response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating article:', error);
    throw error;
  }
};

// 更新文章
export const updateArticle = async (id: number, article: ArticleUpdate): Promise<Article> => {
  try {
    console.log(`Updating article ${id}:`, article);
    const response = await axiosInstance.put(`/articles/${id}`, article);
    console.log('Update response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating article:', error);
    throw error;
  }
};

// 刪除文章
export const deleteArticle = async (id: number): Promise<void> => {
  try {
    console.log(`Deleting article ${id}`);
    await axiosInstance.delete(`/articles/${id}`);
    console.log('Delete successful');
  } catch (error) {
    console.error('Error deleting article:', error);
    throw error;
  }
};
