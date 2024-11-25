import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getArticle, deleteArticle } from '../api/articles';
import { Article } from '../types/Article';
import { format } from 'date-fns';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const ArticleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadArticle = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await getArticle(parseInt(id));
        setArticle(data);
        setError(null);
      } catch (err) {
        setError('加載文章失敗');
        console.error('Error loading article:', err);
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
  }, [id]);

  const handleDelete = async () => {
    if (!id || !window.confirm('確定要刪除這篇文章嗎？')) return;

    try {
      await deleteArticle(parseInt(id));
      toast.success('文章已刪除');
      navigate('/articles');
    } catch (err) {
      toast.error('刪除文章失敗');
      console.error('Error deleting article:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-red-500 text-center">{error || '文章不存在'}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {article.title}
            </h1>
            <div className="flex space-x-2">
              <Link
                to={`/articles/${id}/edit`}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                編輯
              </Link>
              <button
                onClick={handleDelete}
                className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 dark:bg-gray-700 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900"
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                刪除
              </button>
            </div>
          </div>

          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-6">
            <span className="mr-4">
              {article.created_at && format(new Date(article.created_at), 'yyyy/MM/dd HH:mm')}
            </span>
            <span className="mr-4">{article.views} 次查看</span>
            {article.category && (
              <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                {article.category}
              </span>
            )}
          </div>

          {article.summary && (
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">摘要</h2>
              <p className="text-gray-600 dark:text-gray-300">{article.summary}</p>
            </div>
          )}

          <div className="prose dark:prose-invert max-w-none">
            <div className="whitespace-pre-wrap">{article.content}</div>
          </div>

          {article.tags && (
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">標籤</h2>
              <div className="flex flex-wrap gap-2">
                {article.tags.split(',').map((tag, index) => (
                  <span
                    key={index}
                    className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded dark:bg-gray-700 dark:text-gray-300"
                  >
                    {tag.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArticleDetail;
