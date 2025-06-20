import React from 'react';
import { useTags } from '../../hooks/useArticles';

interface TagsListProps {
  onTagClick?: (tag: string) => void;
  selectedTag?: string;
}

export function TagsList({ onTagClick, selectedTag }: TagsListProps) {
  const { data: tagsResponse, isLoading, error } = useTags();

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
        <div className="flex flex-wrap gap-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-6 bg-gray-200 rounded w-16"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-600 text-sm">Failed to load tags</div>;
  }

  const tags = tagsResponse?.tags || [];

  if (tags.length === 0) {
    return <div className="text-gray-500 text-sm">No tags yet</div>;
  }

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-900 mb-2">Popular Tags</h3>
      <div className="flex flex-wrap gap-1">
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => onTagClick?.(tag)}
            className={`px-2 py-1 text-xs rounded-full transition-colors ${
              selectedTag === tag
                ? 'bg-blue-100 text-blue-800 border border-blue-300'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}