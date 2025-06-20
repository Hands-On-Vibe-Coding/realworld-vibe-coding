import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

// Query keys for tags
export const tagKeys = {
  all: ['tags'] as const,
  popular: () => [...tagKeys.all, 'popular'] as const,
};

// Hook for getting popular tags
export function useTags() {
  return useQuery({
    queryKey: tagKeys.popular(),
    queryFn: () => api.getTags(),
    staleTime: 1000 * 60 * 30, // 30 minutes (tags don't change frequently)
    retry: 2,
  });
}

// Hook for prefetching tags (useful for optimistic loading)
export function usePrefetchTags() {
  const queryClient = useQueryClient();

  const prefetchTags = () => {
    queryClient.prefetchQuery({
      queryKey: tagKeys.popular(),
      queryFn: () => api.getTags(),
      staleTime: 1000 * 60 * 30,
    });
  };

  return { prefetchTags };
}