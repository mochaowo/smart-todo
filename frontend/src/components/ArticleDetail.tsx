import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Article } from '../types/Article';
import { getArticle, deleteArticle } from '../api/articles';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

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

  const handleEdit = () => {
    if (article) {
      navigate(`/articles/${article.id}/edit`);
    }
  };

  const handleDelete = async () => {
    if (!article || !window.confirm('確定要刪除這篇文章嗎？')) return;

    try {
      await deleteArticle(article.id);
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
      <div className="text-red-500 text-center py-8">
        {error || '文章不存在'}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <article className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {article.title}
          </h1>
          <div className="flex space-x-2">
            <button
              onClick={handleEdit}
              className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <PencilIcon className="h-5 w-5" />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-6">
          <span>
            發布於 {format(new Date(article.created_at), 'yyyy/MM/dd HH:mm')}
          </span>
          <span className="mx-2">•</span>
          <span>{article.views} 次查看</span>
          {article.category && (
            <>
              <span className="mx-2">•</span>
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                {article.category}
              </span>
            </>
          )}
        </div>

        {article.summary && (
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
            <p className="text-gray-600 dark:text-gray-300 italic">
              {article.summary}
            </p>
          </div>
        )}

        <div className="prose dark:prose-invert max-w-none">
          {article.content.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-4">
              {paragraph}
            </p>
          ))}
        </div>

        {article.tags && article.tags.length > 0 && (
          <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm px-3 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
};

export default ArticleDetail;
