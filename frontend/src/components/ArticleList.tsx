import React, { useEffect, useState } from 'react';
import { Article } from '../types/Article';
import { getArticles } from '../api/articles';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const ArticleList: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const data = await getArticles(page);
      if (data.length < 10) {
        setHasMore(false);
      }
      setArticles(prev => (page === 1 ? data : [...prev, ...data]));
      setError(null);
    } catch (err) {
      setError('加載文章失敗');
      console.error('Error loading articles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, [page]);

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  if (error) {
    return <div className="text-red-500 text-center py-4">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {articles.map(article => (
          <Link
            key={article.id}
            to={`/articles/${article.id}`}
            className="block bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
          >
            <article className="p-6">
              <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                {article.title}
              </h2>
              {article.summary && (
                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                  {article.summary}
                </p>
              )}
              <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                <span>
                  {format(new Date(article.created_at), 'yyyy/MM/dd HH:mm')}
                </span>
                <span>{article.views} 次查看</span>
              </div>
              {article.category && (
                <div className="mt-4">
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    {article.category}
                  </span>
                </div>
              )}
            </article>
          </Link>
        ))}
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      )}

      {!loading && hasMore && (
        <div className="text-center mt-8">
          <button
            onClick={handleLoadMore}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md transition-colors duration-300"
          >
            載入更多
          </button>
        </div>
      )}
    </div>
  );
};

export default ArticleList;
