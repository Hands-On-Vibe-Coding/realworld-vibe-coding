import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useDeleteComment(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: number) => api.deleteComment(slug, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', slug] });
    },
  });
}