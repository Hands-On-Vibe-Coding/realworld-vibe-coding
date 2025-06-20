import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import type { CreateCommentRequest } from '../types/api';

export function useComments(slug: string) {
  return useQuery({
    queryKey: ['comments', slug],
    queryFn: () => apiClient.getComments(slug),
    enabled: !!slug,
  });
}

export function useCreateComment(slug: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateCommentRequest) => apiClient.createComment(slug, data),
    onSuccess: () => {
      // Invalidate comments query to refetch
      queryClient.invalidateQueries({ queryKey: ['comments', slug] });
    },
  });
}

export function useDeleteComment(slug: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (commentId: number) => apiClient.deleteComment(slug, commentId),
    onSuccess: () => {
      // Invalidate comments query to refetch
      queryClient.invalidateQueries({ queryKey: ['comments', slug] });
    },
  });
}