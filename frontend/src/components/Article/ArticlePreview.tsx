import React from 'react';
import type { Article } from '../../types/api';
import { useFavoriteArticle, useUnfavoriteArticle } from '../../hooks/useArticles';
import { useAuth } from '../../hooks/useAuth';

interface ArticlePreviewProps {
  article: Article;
}

export function ArticlePreview({ article }: ArticlePreviewProps) {
  const { isAuthenticated } = useAuth();
  const favoriteMutation = useFavoriteArticle();
  const unfavoriteMutation = useUnfavoriteArticle();

  const handleFavoriteClick = () => {
    if (!isAuthenticated) return;
    
    if (article.favorited) {
      unfavoriteMutation.mutate(article.slug);
    } else {
      favoriteMutation.mutate(article.slug);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            {article.author?.image ? (
              <img
                src={article.author.image}
                alt={article.author.username}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <span className="text-gray-600 text-sm font-medium">
                {article.author?.username?.[0]?.toUpperCase() || '?'}
              </span>
            )}
          </div>
          <div>
            <p className="font-medium text-gray-900">{article.author?.username}</p>
            <p className="text-sm text-gray-500">{formatDate(article.createdAt)}</p>
          </div>
        </div>
        
        {isAuthenticated && (
          <button
            onClick={handleFavoriteClick}
            disabled={favoriteMutation.isPending || unfavoriteMutation.isPending}
            className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              article.favorited
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } disabled:opacity-50`}
          >
            <span>{article.favorited ? '❤️' : '🤍'}</span>
            <span>{article.favoritesCount}</span>
          </button>
        )}
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900 mb-2">{article.title}</h2>
        <p className="text-gray-600">{article.description}</p>
      </div>

      <div className="flex justify-between items-center">
        <button className="text-blue-600 hover:text-blue-800 font-medium">
          Read more...
        </button>
        
        {article.tagList && article.tagList.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {article.tagList.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}