import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { CreateCommentRequest } from '@/types';

export function useCreateComment(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: string) => {
      const data: CreateCommentRequest = {
        comment: { body },
      };
      return api.createComment(slug, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', slug] });
    },
  });
}