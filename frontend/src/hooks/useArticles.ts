import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import type { ArticleParams, FeedParams, ArticlesResponse } from '@/types';

// Query keys for articles
export const articleKeys = {
  all: ['articles'] as const,
  lists: () => [...articleKeys.all, 'list'] as const,
  list: (params: ArticleParams) => [...articleKeys.lists(), params] as const,
  details: () => [...articleKeys.all, 'detail'] as const,
  detail: (slug: string) => [...articleKeys.details(), slug] as const,
  feed: (params: FeedParams) => [...articleKeys.all, 'feed', params] as const,
};

// Hook for getting articles with optional filtering and pagination
export function useArticles(params?: ArticleParams) {
  return useQuery({
    queryKey: articleKeys.list(params || {}),
    queryFn: () => api.getArticles(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
}

// Hook for getting user's personalized feed
export function useFeed(params?: FeedParams) {
  const { isAuthenticated } = useAuthStore();
  
  return useQuery({
    queryKey: articleKeys.feed(params || {}),
    queryFn: () => api.getFeed(params),
    staleTime: 1000 * 60 * 2, // 2 minutes (more frequent updates for feed)
    retry: 2,
    enabled: isAuthenticated, // Only fetch if user is authenticated
  });
}

// Hook for getting a single article by slug
export function useArticle(slug: string | undefined) {
  return useQuery({
    queryKey: articleKeys.detail(slug || ''),
    queryFn: () => api.getArticle(slug!),
    enabled: !!slug, // Only run query if slug is provided
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: 2,
  });
}

// Hook for infinite scroll articles
export function useInfiniteArticles(baseParams: Omit<ArticleParams, 'offset'> = {}) {
  const pageSize = baseParams.limit || 20;
  
  return useInfiniteQuery<ArticlesResponse, Error, ArticlesResponse[], ['articles', 'infinite', typeof baseParams], number>({
    queryKey: ['articles', 'infinite', baseParams],
    queryFn: async ({ pageParam }: { pageParam: number }) => {
      const params = { ...baseParams, offset: pageParam * pageSize, limit: pageSize };
      return api.getArticles(params);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage: ArticlesResponse, allPages: ArticlesResponse[]) => {
      const totalFetched = allPages.length * pageSize;
      return totalFetched < lastPage.articlesCount ? allPages.length : undefined;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
}