import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import type { CreateArticleRequest, UpdateArticleRequest } from '../types/api';

export function useArticles(params?: {
  tag?: string;
  author?: string;
  favorited?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: ['articles', params],
    queryFn: () => apiClient.getArticles(params),
  });
}

export function useFeed(params?: { limit?: number; offset?: number }) {
  return useQuery({
    queryKey: ['feed', params],
    queryFn: () => apiClient.getFeed(params),
    // Only fetch if user is authenticated
    enabled: apiClient.isAuthenticated(),
  });
}

export function useArticle(slug: string) {
  return useQuery({
    queryKey: ['article', slug],
    queryFn: () => apiClient.getArticle(slug),
    enabled: !!slug,
  });
}

export function useTags() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: () => apiClient.getTags(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateArticle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateArticleRequest) => apiClient.createArticle(data),
    onSuccess: () => {
      // Invalidate articles list
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
}

export function useUpdateArticle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: UpdateArticleRequest }) =>
      apiClient.updateArticle(slug, data),
    onSuccess: (response) => {
      // Update the specific article in cache
      queryClient.setQueryData(['article', response.article.slug], response);
      // Invalidate articles list
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}

export function useDeleteArticle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (slug: string) => apiClient.deleteArticle(slug),
    onSuccess: () => {
      // Invalidate articles list
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}

export function useFavoriteArticle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (slug: string) => apiClient.favoriteArticle(slug),
    onSuccess: (response) => {
      // Update the specific article in cache
      queryClient.setQueryData(['article', response.article.slug], response);
      // Invalidate articles list to update favorite counts
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}

export function useUnfavoriteArticle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (slug: string) => apiClient.unfavoriteArticle(slug),
    onSuccess: (response) => {
      // Update the specific article in cache
      queryClient.setQueryData(['article', response.article.slug], response);
      // Invalidate articles list to update favorite counts
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}