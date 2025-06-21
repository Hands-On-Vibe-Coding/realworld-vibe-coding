import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { articleKeys } from './useArticles';
import type { CreateArticleRequest, UpdateArticleRequest } from '@/types';
import { notifications } from '@mantine/notifications';

// Hook for creating a new article
export function useCreateArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateArticleRequest) => api.createArticle(data),
    onSuccess: (data) => {
      // Invalidate and refetch article lists
      queryClient.invalidateQueries({ queryKey: articleKeys.lists() });
      
      // Add the new article to the cache
      queryClient.setQueryData(
        articleKeys.detail(data.article.slug),
        data
      );

      notifications.show({
        title: 'Success',
        message: 'Article created successfully!',
        color: 'green',
      });
    },
    onError: (error) => {
      notifications.show({
        title: 'Error',
        message: `Failed to create article: ${error.message}`,
        color: 'red',
      });
    },
  });
}

// Hook for updating an existing article
export function useUpdateArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: UpdateArticleRequest }) =>
      api.updateArticle(slug, data),
    onSuccess: (data, variables) => {
      // Update the specific article in cache
      queryClient.setQueryData(
        articleKeys.detail(data.article.slug),
        data
      );

      // If slug changed, remove old cached entry
      if (data.article.slug !== variables.slug) {
        queryClient.removeQueries({ queryKey: articleKeys.detail(variables.slug) });
      }

      // Invalidate article lists to reflect updates
      queryClient.invalidateQueries({ queryKey: articleKeys.lists() });

      notifications.show({
        title: 'Success',
        message: 'Article updated successfully!',
        color: 'green',
      });
    },
    onError: (error) => {
      notifications.show({
        title: 'Error',
        message: `Failed to update article: ${error.message}`,
        color: 'red',
      });
    },
  });
}

// Hook for deleting an article
export function useDeleteArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) => api.deleteArticle(slug),
    onSuccess: (_, slug) => {
      // Remove the article from cache
      queryClient.removeQueries({ queryKey: articleKeys.detail(slug) });

      // Invalidate article lists
      queryClient.invalidateQueries({ queryKey: articleKeys.lists() });
      
      // Invalidate feed as well
      queryClient.invalidateQueries({ queryKey: articleKeys.all });

      notifications.show({
        title: 'Success',
        message: 'Article deleted successfully!',
        color: 'green',
      });
    },
    onError: (error) => {
      notifications.show({
        title: 'Error',
        message: `Failed to delete article: ${error.message}`,
        color: 'red',
      });
    },
  });
}

// Hook for optimistic article updates (for UI responsiveness)
export function useOptimisticArticleUpdate() {
  const queryClient = useQueryClient();

  const updateArticleOptimistically = (slug: string, updates: Partial<{ title: string; description: string; body: string; favorited: boolean; favoritesCount: number }>) => {
    queryClient.setQueryData(
      articleKeys.detail(slug),
      (old: unknown) => {
        if (old && typeof old === 'object' && 'article' in old) {
          const oldTyped = old as { article: Record<string, unknown> };
          return { ...old, article: { ...oldTyped.article, ...updates } };
        }
        return old;
      }
    );
  };

  const revertOptimisticUpdate = (slug: string) => {
    queryClient.invalidateQueries({ queryKey: articleKeys.detail(slug) });
  };

  return {
    updateArticleOptimistically,
    revertOptimisticUpdate,
  };
}