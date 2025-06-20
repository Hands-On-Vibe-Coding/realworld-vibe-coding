import { useState, useMemo } from 'react';
import type { ArticleParams } from '@/types';

interface UsePaginationProps {
  initialPage?: number;
  pageSize?: number;
  totalCount?: number;
}

interface UsePaginationReturn {
  currentPage: number;
  offset: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextPage: () => void;
  previousPage: () => void;
  goToPage: (page: number) => void;
  reset: () => void;
  getArticleParams: (additionalParams?: Partial<ArticleParams>) => ArticleParams;
}

export function usePagination({
  initialPage = 1,
  pageSize = 20,
  totalCount = 0,
}: UsePaginationProps = {}): UsePaginationReturn {
  const [currentPage, setCurrentPage] = useState(initialPage);

  const offset = useMemo(() => (currentPage - 1) * pageSize, [currentPage, pageSize]);
  const totalPages = useMemo(() => Math.ceil(totalCount / pageSize), [totalCount, pageSize]);
  const hasNextPage = useMemo(() => currentPage < totalPages, [currentPage, totalPages]);
  const hasPreviousPage = useMemo(() => currentPage > 1, [currentPage]);

  const nextPage = () => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const previousPage = () => {
    if (hasPreviousPage) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const reset = () => {
    setCurrentPage(initialPage);
  };

  const getArticleParams = (additionalParams: Partial<ArticleParams> = {}): ArticleParams => ({
    limit: pageSize,
    offset,
    ...additionalParams,
  });

  return {
    currentPage,
    offset,
    limit: pageSize,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    nextPage,
    previousPage,
    goToPage,
    reset,
    getArticleParams,
  };
}