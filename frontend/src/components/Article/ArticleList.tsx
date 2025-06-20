import React from 'react';
import type { Article } from '../../types/api';
import { ArticlePreview } from './ArticlePreview';

interface ArticleListProps {
  articles: Article[];
  isLoading?: boolean;
  error?: string;
}

export function ArticleList({ articles, isLoading, error }: ArticleListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No articles yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {articles.map((article) => (
        <ArticlePreview key={article.slug} article={article} />
      ))}
    </div>
  );
}